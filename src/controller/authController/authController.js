import httpResponse from '../../util/httpResponse.js';
import responseMessage from '../../constant/responseMessage.js';
import httpError from '../../util/httpError.js';
import quicker from '../../util/quicker.js';
import { validateJoiSchema, ValidateLogin, ValidateSignup, validateEmailOtp, ValidateResetPassword, ValidateVerifyOtp } from '../../service/validationService.js';
import config from '../../config/config.js';
import Student from '../../model/studentModel.js';
import StudentActivity from '../../model/studentActivitySchema.js';
import { ACTIVITY_STATUSES, ACTIVITY_TYPES } from '../../constant/application.js';
import crypto from 'crypto';
import EmailOtp from '../../model/EmailOtp.js'; // adjust path
import mailer from '../../service/email.service.js';
import { OtpEmailTemplate, WelcomeEmailTemplate } from '../../service/emailTemplates.js';
import { OAuth2Client } from "google-auth-library";


const googleClient = new OAuth2Client(config.GOOGLE_CLIENT_ID);


const OTP_TTL_SECONDS = 300;      // 5 minutes
const RESEND_COOLDOWN_SECONDS = 60; // 1 minute

const generateOtp = () =>
    String(crypto.randomInt(0, 1_000_000)).padStart(6, '0');

export default {
    // login: async (req, res, next) => {
    //     try {
    //         const { body } = req;

    //         const { value, error } = validateJoiSchema(ValidateLogin, { ...body });


    //         if (error) {
    //             return httpError(next, error, req, 422);
    //         }

    //         const { email, password } = value;

    //         const student = await Student.findOne({ email });
    //         console.log("Student", student)
    //         if(!student || !student.password){
    //             return httpResponse(req, res, 401, responseMessage.CUSTOM_MESSAGE("Your Password is not set"));
    //         }
    //         if (!student || !await quicker.comparePassword(password, student.password )) {
    //             return httpResponse(req, res, 401, responseMessage.CUSTOM_MESSAGE("Invalid Credentials"));
    //         }

    //         // if (!student.isFeePaid) {
    //         //     return httpResponse(req, res, 403, responseMessage.SOMETHING_WENT_WRONG + ' - Fee payment pending');
    //         // }

    //         const accessToken = quicker.generateToken(
    //             { email: student.email, studentId: student._id },
    //             config.ACCESS_TOKEN.SECRET,
    //             config.ACCESS_TOKEN.EXPIRY
    //         );


    //         res.cookie('accessToken', accessToken, {
    //             httpOnly: true,
    //             secure: process.env.NODE_ENV === 'production',
    //             maxAge: 24 * 60 * 60 * 1000, // 24 hours in milliseconds
    //             path: '/',
    //             sameSite: 'strict'
    //         });

    //         const userData = { ...student.toObject(), password: undefined };
    //         // const activity = new StudentActivity({
    //         //     studentId: student._id,
    //         //     activityType: ACTIVITY_TYPES.LOGIN,
    //         //     message: `Student ${student.email} logged in`,
    //         //     status: ACTIVITY_STATUSES.COMPLETED
    //         // });
    //         // await activity.save();
    //         httpResponse(req, res, 200, responseMessage.SUCCESS, { accessToken, user: userData });
    //     } catch (err) {
    //         console.log("ERROR", err)
    //         httpError(next, err, req, 500);
    //     }
    // },

    // at the top of the file (once, not inside the function):
    // import { OAuth2Client } from 'google-auth-library';
    // const googleClient = new OAuth2Client(config.GOOGLE_CLIENT_ID);

    login: async (req, res, next) => {
        try {
            const { body } = req;

            // --------------------------------------------------
            // 1) GOOGLE OAUTH BRANCH (when google_credential sent)
            // --------------------------------------------------
            if (body.google_credential) {
                try {
                    // Verify Google ID token
                    const ticket = await googleClient.verifyIdToken({
                        idToken: body.google_credential,
                        audience: config.GOOGLE_CLIENT_ID,
                    });

                    const payload = ticket.getPayload();
                    if (!payload || !payload.email) {
                        return httpResponse(
                            req,
                            res,
                            400,
                            responseMessage.CUSTOM_MESSAGE("Google credential is missing email")
                        );
                    }

                    const email = payload.email;

                    // Try to find existing student by email
                    let student = await Student.findOne({ email });

                    // If no student exists, optionally create one
                    if (!student) {
                        // Adjust fields here to match your Student schema
                        student = await Student.create({
                            email: email,
                            // Example fields – only keep ones that actually exist in your schema:
                            // firstName: payload.given_name || payload.name || "",
                            // lastName: payload.family_name || "",
                            // avatar: payload.picture || "",
                            password: null, // Google user = no local password
                        });
                    }

                    // Optional: if you want to prevent login for inactive students,
                    // check something like: if (!student.isActive) { ... }

                    const accessToken = quicker.generateToken(
                        { email: student.email, studentId: student._id },
                        config.ACCESS_TOKEN.SECRET,
                        config.ACCESS_TOKEN.EXPIRY
                    );

                    res.cookie("accessToken", accessToken, {
                        httpOnly: true,
                        secure: process.env.NODE_ENV === "production",
                        maxAge: 24 * 60 * 60 * 1000, // 24h
                        path: "/",
                        sameSite: "strict",
                    });

                    const userData = { ...student.toObject(), password: undefined };

                    return httpResponse(
                        req,
                        res,
                        200,
                        responseMessage.SUCCESS,
                        { accessToken, user: userData }
                    );
                } catch (err) {
                    console.log("Google login error", err);
                    return httpResponse(
                        req,
                        res,
                        401,
                        responseMessage.CUSTOM_MESSAGE("Invalid Google credential")
                    );
                }
            }

            // --------------------------------------------------
            // 2) EXISTING EMAIL + PASSWORD BRANCH (unchanged)
            // --------------------------------------------------

            const { value, error } = validateJoiSchema(ValidateLogin, { ...body });

            if (error) {
                return httpError(next, error, req, 422);
            }

            const { email, password } = value;

            const student = await Student.findOne({ email });
            console.log("Student", student);

            if (!student) {
                return httpResponse(
                    req,
                    res,
                    401,
                    responseMessage.CUSTOM_MESSAGE("This email is not registered")
                );
            }

            if (!student || !student.password) {
                return httpResponse(
                    req,
                    res,
                    401,
                    responseMessage.CUSTOM_MESSAGE("Your Password is not set")
                );
            }

            if (
                !student ||
                !(await quicker.comparePassword(password, student.password))
            ) {
                return httpResponse(
                    req,
                    res,
                    401,
                    responseMessage.CUSTOM_MESSAGE("Invalid Credentials")
                );
            }

            // if (!student.isFeePaid) {
            //     return httpResponse(
            //         req,
            //         res,
            //         403,
            //         responseMessage.SOMETHING_WENT_WRONG + " - Fee payment pending"
            //     );
            // }

            const accessToken = quicker.generateToken(
                { email: student.email, studentId: student._id },
                config.ACCESS_TOKEN.SECRET,
                config.ACCESS_TOKEN.EXPIRY
            );

            res.cookie("accessToken", accessToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                maxAge: 24 * 60 * 60 * 1000, // 24 hours in milliseconds
                path: "/",
                sameSite: "strict",
            });

            const userData = { ...student.toObject(), password: undefined };

            // const activity = new StudentActivity({
            //     studentId: student._id,
            //     activityType: ACTIVITY_TYPES.LOGIN,
            //     message: `Student ${student.email} logged in`,
            //     status: ACTIVITY_STATUSES.COMPLETED
            // });
            // await activity.save();

            return httpResponse(
                req,
                res,
                200,
                responseMessage.SUCCESS,
                { accessToken, user: userData }
            );
        } catch (err) {
            console.log("ERROR", err);
            httpError(next, err, req, 500);
        }
    },


    forgotPassword: async (req, res, next) => {
        try {
            const { body } = req;

            const { value, error } = validateJoiSchema(validateEmailOtp, { ...body });
            if (error) return httpError(next, error, req, 422);

            const { email } = value;

            // 1) Block if email already taken
            const existingStudent = await Student.findOne({ email }).lean();
            if (!existingStudent) {
                return httpResponse(
                    req,
                    res,
                    409,
                    responseMessage.SOMETHING_WENT_WRONG + ' - No User found with this email, Please create an account'
                );
            }

            // 2) Respect resend cooldown (don’t spam)
            const recent = await EmailOtp.findOne({
                email,
                isUsed: false,
                createdAt: { $gt: new Date(Date.now() - RESEND_COOLDOWN_SECONDS * 1000) },
                expiresAt: { $gt: new Date() },
            }).lean();

            if (recent) {
                return httpResponse(req, res, 429, 'Please wait before requesting another OTP.');
            }

            // 3) Generate and upsert OTP (invalidate older active ones)
            const otp = generateOtp();

            await EmailOtp.updateMany(
                { email, isUsed: false },
                { $set: { isUsed: true } }
            );

            const expiresAt = new Date(Date.now() + OTP_TTL_SECONDS * 1000);
            await EmailOtp.create({
                email,          // If your schema uses studentId, swap to that once a Student exists.
                otp,            // For production, consider storing a hash instead of raw OTP.
                isUsed: false,
                expiresAt,
            });

            // 4) Send the email
            const subject = 'Your verification code';
            const text = `Your verification code is ${otp}. It expires in 5 minutes.`;
            const html = `
        <div style="font-family:system-ui, -apple-system, Segoe UI, Roboto, Arial; line-height:1.6;">
          <h2>Verify your email</h2>
          <p>Use the code below to verify your email. It expires in <strong>5 minutes</strong>.</p>
          <div style="font-size:28px; letter-spacing:4px; font-weight:700; padding:12px 16px; border:1px solid #eee; display:inline-block; border-radius:8px;">
            ${otp}
          </div>
          <p style="color:#666; font-size:12px; margin-top:16px;">If you didn’t request this, you can ignore this message.</p>
        </div>
      `;

            await mailer.sendEmail(email, { subject, text, html }); // uses your transporter

            // 5) Respond (do not reveal OTP)
            const userData = {
                emailMasked: email.replace(/(^.).*(@.*$)/, (_, a, b) => a + '*****' + b),
                expiresIn: OTP_TTL_SECONDS,
                cooldown: RESEND_COOLDOWN_SECONDS,
            };

            return httpResponse(req, res, 201, responseMessage.SUCCESS, { user: userData });
        } catch (error) {
            console.error(error);
            return httpError(next, error, req, 500);
        }
    },


    verifyOtp: async (req, res, next) => {
        try {
            const { body } = req;

            const { value, error } = validateJoiSchema(ValidateVerifyOtp, { ...body });
            if (error) return httpError(next, error, req, 422);

            let { email, otp } = value;
            email = email.trim().toLowerCase();

            // Look up an active (unused + unexpired) OTP — do NOT consume it yet
            const otpDoc = await EmailOtp.findOne({
                email,
                otp,
                isUsed: false,
                expiresAt: { $gt: new Date() },
            }).lean();

            if (!otpDoc) {
                return httpResponse(req, res, 400, 'Invalid or expired OTP');
            }

            const expiresIn = Math.max(
                0,
                Math.floor((new Date(otpDoc.expiresAt).getTime() - Date.now()) / 1000)
            );

            const payload = {
                emailMasked: email.replace(/(^.).*(@.*$)/, (_, a, b) => a + '*****' + b),
                verified: true,
                expiresIn, // seconds remaining
            };

            return httpResponse(req, res, 200, responseMessage.SUCCESS, payload);
        } catch (err) {
            console.error(err);
            return httpError(next, err, req, 500);
        }
    },




    resetPassword: async (req, res, next) => {
        try {
            const { body } = req;

            // Validate input
            const { value, error } = validateJoiSchema(ValidateResetPassword, { ...body });
            if (error) return httpError(next, error, req, 422);

            let { email, password, otp } = value;
            email = email.trim().toLowerCase();

            // 1) Ensure the user exists
            const student = await Student.findOne({ email });
            if (!student) {
                return httpResponse(req, res, 404, 'Account not found');
            }

            // 2) Verify OTP is valid and not expired, then consume it now
            const otpDoc = await EmailOtp.findOneAndUpdate(
                {
                    email,
                    otp,
                    isUsed: false,
                    expiresAt: { $gt: new Date() },
                },
                { $set: { isUsed: true } },
                { new: true }
            ).lean();

            if (!otpDoc) {
                return httpResponse(req, res, 400, 'Invalid or expired OTP');
            }

            // 3) Hash and set the new password
            const hashedPassword = await quicker.hashPassword(password);
            student.password = hashedPassword;
            await student.save();

            // 4) (Optional) Invalidate any other active OTPs for this email
            await EmailOtp.updateMany(
                { email, isUsed: false },
                { $set: { isUsed: true } }
            );

            // 5) Issue access token + cookie
            const accessToken = quicker.generateToken(
                { email: student.email, studentId: student._id },
                config.ACCESS_TOKEN.SECRET,
                config.ACCESS_TOKEN.EXPIRY
            );

            res.cookie('accessToken', accessToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                maxAge: 24 * 60 * 60 * 1000, // 24h
                path: '/',
                sameSite: 'strict',
            });

            // 6) Respond with safe user object (no password/hash)
            const userData = { ...student.toObject(), password: undefined };
            return httpResponse(req, res, 200, responseMessage.SUCCESS, { accessToken, user: userData });
        } catch (err) {
            console.error(err);
            return httpError(next, err, req, 500);
        }
    },

    sendEmailOtp: async (req, res, next) => {
        try {
            const { body } = req;

            const { value, error } = validateJoiSchema(validateEmailOtp, { ...body });
            if (error) return httpError(next, error, req, 422);

            const { email } = value;

            // 1) Find student by email
            const existingStudent = await Student.findOne({ email }).lean();

            // 2) If student exists and is already verified → BLOCK
            if (existingStudent && existingStudent.isVerified) {
                return httpResponse(
                    req,
                    res,
                    409,
                    responseMessage.SOMETHING_WENT_WRONG + ' - Email already in use and verified. Please login.'
                );
            }

            // 3) Resend cooldown check (even for unverified accounts)
            const recent = await EmailOtp.findOne({
                email,
                isUsed: false,
                createdAt: { $gt: new Date(Date.now() - RESEND_COOLDOWN_SECONDS * 1000) },
                expiresAt: { $gt: new Date() },
            }).lean();

            if (recent) {
                return httpResponse(req, res, 429, 'Please wait before requesting another OTP.');
            }

            // 4) Invalidate any old unused OTPs for this email
            await EmailOtp.updateMany(
                { email, isUsed: false },
                { $set: { isUsed: true } }
            );

            // 5) Generate new OTP
            const otp = generateOtp();
            const expiresAt = new Date(Date.now() + OTP_TTL_SECONDS * 1000);

            await EmailOtp.create({
                email,
                otp,
                isUsed: false,
                expiresAt,
            });

            // 6) Send email
            await mailer.sendEmail(email, OtpEmailTemplate(otp));

            // 7) Response — same format
            const userData = {
                emailMasked: email.replace(/(^.).*(@.*$)/, (_, a, b) => a + '*****' + b),
                expiresIn: OTP_TTL_SECONDS,
                cooldown: RESEND_COOLDOWN_SECONDS,
            };

            return httpResponse(req, res, 201, responseMessage.SUCCESS, { user: userData });

        } catch (error) {
            console.error("sendEmailOtp error:", error);
            return httpError(next, error, req, 500);
        }
    },

    // signup: async (req, res, next) => {
    //     try {
    //         const { body } = req;

    //         const { value, error } = validateJoiSchema(ValidateSignup, { ...body });
    //         if (error) return httpError(next, error, req, 422);

    //         let { email, password, otp } = value;
    //         email = email.trim().toLowerCase();

    //         // 1) Fail fast if the email is already taken
    //         const existingStudent = await Student.findOne({ email }).lean();
    //         if (existingStudent) {
    //             return httpResponse(
    //                 req,
    //                 res,
    //                 409,
    //                 responseMessage.SOMETHING_WENT_WRONG + ' - Email already in use'
    //             );
    //         }

    //         // 2) Verify & consume OTP atomically (no session)
    //         if (process.env.ENV === 'development' && otp === '000000') {
    //             // bypass OTP in development for testing

    //         } else {
    //             const otpDoc = await EmailOtp.findOneAndUpdate(
    //                 {
    //                     email,
    //                     otp,
    //                     isUsed: false,
    //                     expiresAt: { $gt: new Date() },
    //                 },
    //                 { $set: { isUsed: true } },
    //                 { new: true }
    //             ).lean();

    //             if (!otpDoc) {
    //                 return httpResponse(req, res, 400, 'Invalid or expired OTP');
    //             }


    //         }

    //         // 3) Hash password & create student
    //         const hashedPassword = await quicker.hashPassword(password);

    //         const student = await Student.create({
    //             email,
    //             password: hashedPassword,
    //             isVerified: true,
    //             lastLogin: Date.now()
    //         });

    //         // 4) (Optional) Invalidate any other active OTPs for this email
    //         await EmailOtp.updateMany(
    //             { email, isUsed: false },
    //             { $set: { isUsed: true } }
    //         );

    //         const accessToken = quicker.generateToken(
    //             { email: student.email, studentId: student._id },
    //             config.ACCESS_TOKEN.SECRET,
    //             config.ACCESS_TOKEN.EXPIRY
    //         );

    //         const activity = new StudentActivity({
    //             studentId: student._id,
    //             activityType: ACTIVITY_TYPES.SIGNUP,
    //             message: `Student ${student.email} signed up`,
    //             status: ACTIVITY_STATUSES.COMPLETED
    //         });
    //         try {
    //             await activity.save();
    //             console.log("Activity saved successfully");
    //         } catch (err) {
    //             console.error("Activity save failed:", err);
    //         }

    //         res.cookie('accessToken', accessToken, {
    //             httpOnly: true,
    //             secure: process.env.ENV === 'production',
    //             maxAge: 24 * 60 * 60 * 1000, // 24 hours in milliseconds
    //             path: '/',
    //             sameSite: 'strict'
    //         });
    //         // 5) Respond (never return password/hash)
    //         const userData = { ...student.toObject(), password: undefined };
    //         await mailer.sendEmail(email, WelcomeEmailTemplate(student.name));
    //         return httpResponse(req, res, 201, responseMessage.SUCCESS, { accessToken, user: userData });

    //     } catch (err) {
    //         console.error(err);
    //         return httpError(next, err, req, 500);
    //     }
    // },

    signup: async (req, res, next) => {
        try {
            const { body } = req;

            // --------------------------------------------------
            // 0) GOOGLE OAUTH SIGNUP / SIGNUP+LOGIN BRANCH
            // --------------------------------------------------
            if (body.google_credential) {
                try {
                    const ticket = await googleClient.verifyIdToken({
                        idToken: body.google_credential,
                        audience: config.GOOGLE_CLIENT_ID,
                    });

                    const payload = ticket.getPayload();
                    if (!payload || !payload.email) {
                        return httpResponse(
                            req,
                            res,
                            400,
                            responseMessage.CUSTOM_MESSAGE("Google credential is missing email")
                        );
                    }

                    let email = payload.email.trim().toLowerCase();

                    // Try to find existing student by email
                    let student = await Student.findOne({ email });
                    const isNewStudent = !student;

                    if (!student) {
                        // Create a new Google-based student
                        student = await Student.create({
                            email,
                            password: null,          // Google user: no local password
                            isVerified: true,        // Google verified email
                            lastLogin: Date.now(),
                            // Optional: if your schema has name fields, you can map them:
                            // name: payload.name || "",
                            // firstName: payload.given_name || "",
                            // lastName: payload.family_name || "",
                            // avatar: payload.picture || "",
                        });
                    } else {
                        // Existing user: treat as login + mark verified
                        let changed = false;

                        if (!student.isVerified) {
                            student.isVerified = true;
                            changed = true;
                        }

                        student.lastLogin = Date.now();
                        changed = true;

                        if (changed) {
                            await student.save();
                        }
                    }

                    const accessToken = quicker.generateToken(
                        { email: student.email, studentId: student._id },
                        config.ACCESS_TOKEN.SECRET,
                        config.ACCESS_TOKEN.EXPIRY
                    );

                    // Activity only for *new* signups
                    if (isNewStudent) {
                        const activity = new StudentActivity({
                            studentId: student._id,
                            activityType: ACTIVITY_TYPES.SIGNUP,
                            message: `Student ${student.email} signed up with Google`,
                            status: ACTIVITY_STATUSES.COMPLETED,
                        });
                        try {
                            await activity.save();
                            console.log("Activity (Google signup) saved successfully");
                        } catch (err) {
                            console.error("Activity (Google signup) save failed:", err);
                        }
                    }

                    res.cookie("accessToken", accessToken, {
                        httpOnly: true,
                        secure: process.env.ENV === "production",
                        maxAge: 24 * 60 * 60 * 1000,
                        path: "/",
                        sameSite: "strict",
                    });

                    const userData = { ...student.toObject(), password: undefined };

                    // Optional: send welcome email for new Google users
                    try {
                        await mailer.sendEmail(email, WelcomeEmailTemplate(student.name));
                    } catch (err) {
                        console.error("Welcome email (Google) failed:", err);
                    }

                    return httpResponse(
                        req,
                        res,
                        201,
                        responseMessage.SUCCESS,
                        { accessToken, user: userData }
                    );
                } catch (err) {
                    console.error("Google signup error:", err);
                    return httpResponse(
                        req,
                        res,
                        401,
                        responseMessage.CUSTOM_MESSAGE("Invalid Google credential")
                    );
                }
            }

            // --------------------------------------------------
            // 1) TRADITIONAL EMAIL + PASSWORD + OTP SIGNUP
            // --------------------------------------------------

            const { value, error } = validateJoiSchema(ValidateSignup, { ...body });
            if (error) return httpError(next, error, req, 422);

            let { email, password, otp } = value;
            email = email.trim().toLowerCase();

            // 1) Fail fast if the email is already taken
            const existingStudent = await Student.findOne({ email }).lean();
            if (existingStudent) {
                return httpResponse(
                    req,
                    res,
                    409,
                    responseMessage.SOMETHING_WENT_WRONG + " - Email already in use"
                );
            }

            // 2) Verify & consume OTP atomically (no session)
            if (process.env.ENV === "development" && otp === "000000") {
                // bypass OTP in development for testing
            } else {
                const otpDoc = await EmailOtp.findOneAndUpdate(
                    {
                        email,
                        otp,
                        isUsed: false,
                        expiresAt: { $gt: new Date() },
                    },
                    { $set: { isUsed: true } },
                    { new: true }
                ).lean();

                if (!otpDoc) {
                    return httpResponse(req, res, 400, "Invalid or expired OTP");
                }
            }

            // 3) Hash password & create student
            const hashedPassword = await quicker.hashPassword(password);

            const student = await Student.create({
                email,
                password: hashedPassword,
                isVerified: true,
                lastLogin: Date.now(),
            });

            // 4) Invalidate any other active OTPs for this email
            await EmailOtp.updateMany(
                { email, isUsed: false },
                { $set: { isUsed: true } }
            );

            const accessToken = quicker.generateToken(
                { email: student.email, studentId: student._id },
                config.ACCESS_TOKEN.SECRET,
                config.ACCESS_TOKEN.EXPIRY
            );

            const activity = new StudentActivity({
                studentId: student._id,
                activityType: ACTIVITY_TYPES.SIGNUP,
                message: `Student ${student.email} signed up`,
                status: ACTIVITY_STATUSES.COMPLETED,
            });
            try {
                await activity.save();
                console.log("Activity saved successfully");
            } catch (err) {
                console.error("Activity save failed:", err);
            }

            res.cookie("accessToken", accessToken, {
                httpOnly: true,
                secure: process.env.ENV === "production",
                maxAge: 24 * 60 * 60 * 1000, // 24 hours in milliseconds
                path: "/",
                sameSite: "strict",
            });

            // 5) Respond (never return password/hash)
            const userData = { ...student.toObject(), password: undefined };
            try {
                await mailer.sendEmail(email, WelcomeEmailTemplate(student.name));
            } catch (err) {
                console.error("Welcome email failed:", err);
            }

            return httpResponse(
                req,
                res,
                201,
                responseMessage.SUCCESS,
                { accessToken, user: userData }
            );
        } catch (err) {
            console.error(err);
            return httpError(next, err, req, 500);
        }
    },


    oauthSuccess: async (req, res, next) => {
        try {

            console.log("Success triggered")

            const user = req.user;

            if (!user) {
                return httpError(next, new Error('OAuth authentication failed'), req, 401);
            }

            const accessToken = quicker.generateToken(
                { email: user.email, studentId: user._id },
                config.ACCESS_TOKEN.SECRET,
                config.ACCESS_TOKEN.EXPIRY
            );

            res.cookie('accessToken', accessToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                maxAge: 24 * 60 * 60 * 1000, // 24 hours in milliseconds
                path: '/',
                sameSite: 'strict'
            });

            const userData = { ...user.toObject(), password: undefined };

            // Log activity
            // const activity = new StudentActivity({
            //     studentId: user._id,
            //     activityType: ACTIVITY_TYPES.LOGIN,
            //     message: `Student ${user.email} logged in via ${user.provider}`,
            //     status: ACTIVITY_STATUSES.COMPLETED
            // });
            // await activity.save();

            const userObject = user.toObject();
            delete userObject.password;

            const isNewUser = !user.isFeePaid;
            const redirectUrl = isNewUser
                ? `${config.FRONTEND_URL || 'http://localhost:3000'}/auth/callback?accesstoken=${accessToken}&user=${encodeURIComponent(JSON.stringify(userObject))}&redirectTo=/pricing`
                : `${config.FRONTEND_URL || 'http://localhost:3000'}/auth/callback?accesstoken=${accessToken}&user=${encodeURIComponent(JSON.stringify(userObject))}&redirectTo=/dashboard`;



            return res.redirect(redirectUrl)

            // httpResponse(req, res, 200, responseMessage.SUCCESS, {
            //     accessToken,
            //     user: userData,
            //     requiresPayment: !user.isFeePaid,
            //     message: isNewUser ? 'Registration successful. Payment required to access dashboard.' : 'Login successful',
            //     redirectUrl,
            // });

        } catch (err) {
            const errorRedirectUrl = `${config.FRONTEND_URL || 'http://localhost:3000'}/signin?error${encodeURIComponent(err?.message || err)}`
            return res.redirect(errorRedirectUrl)

        }
    },

    //     try {
    //         const user = req.user;

    //         if (!user) {
    //             return httpError(next, new Error('OAuth authentication failed'), req, 401);
    //         }

    //         // Generate access token
    //         const accessToken = quicker.generateToken(
    //             { email: user.email, studentId: user._id },
    //             config.ACCESS_TOKEN.SECRET,
    //             config.ACCESS_TOKEN.EXPIRY
    //         );

    //         // Attach cookie
    //         res.cookie('accessToken', accessToken, {
    //             httpOnly: true,
    //             secure: process.env.NODE_ENV === 'production',
    //             maxAge: 24 * 60 * 60 * 1000, // 24 hrs
    //             path: '/',
    //             sameSite: 'strict',
    //         });

    //         // Sanitize user data
    //         const userData = user.toObject();
    //         delete userData.password;

    //         // Determine if user needs to pay
    //         const requiresPayment = !user.isFeePaid;

    //         // Return to original page (from OAuth "state")
    //         const redirectUrl =
    //             req.query.state || `${config.FRONTEND_URL || 'http://localhost:3000'}`;

    //         // Send JSON response
    //         return httpResponse(req, res, 200, responseMessage.SUCCESS, {
    //             accessToken,
    //             user: userData,
    //             requiresPayment,
    //             message: requiresPayment
    //                 ? 'Registration successful. Payment required to access dashboard.'
    //                 : 'Login successful',
    //             redirectUrl,
    //         });
    //     } catch (err) {
    //         const errorRedirectUrl = `${config.FRONTEND_URL || 'http://localhost:3000'}/signin?error=${encodeURIComponent(err?.message || err)}`;
    //         return res.redirect(errorRedirectUrl);
    //     }
    // },

    oauthFailure: (req, res, next) => {
        try {
            console.log("Failure triggered")
            if (req.accepts('html')) {
                const errorMessage = req.flash('error') || 'Authentication failed';
                const redirectUrl = `${config.FRONTEND_URL || 'http://localhost:3000'}/signin?error=${encodeURIComponent(errorMessage)}`;
                return res.redirect(redirectUrl);
            }

            httpResponse(req, res, 400, 'Authentication failed', {
                status: false,
                message: "Failed Authentication"
            });
        } catch (err) {
            httpError(next, err, req, 500);
        }
    },

};