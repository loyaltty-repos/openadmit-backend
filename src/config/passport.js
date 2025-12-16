import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { Strategy as FacebookStrategy } from 'passport-facebook';
import config from './config.js';
import { EAuthProvider } from '../constant/application.js';
import Student from '../model/studentModel.js';

// Serialize user for session
passport.serializeUser((user, done) => {
    done(null, user._id);
});

// Deserialize user from session
passport.deserializeUser(async (id, done) => {
    try {
        const user = await Student.findById(id);
        done(null, user);
    } catch (error) {
        done(error, null);
    }
});

// Local Strategy
passport.use(new LocalStrategy(
    {
        usernameField: 'email',
        passwordField: 'password'
    },
    async (email, password, done) => {
        try {
            const user = await Student.findByEmail(email);

            if (!user) {
                return done(null, false, { message: 'Invalid credentials' });
            }

            if (user.provider !== EAuthProvider.LOCAL) {
                return done(null, false, {
                    message: `Account exists with ${user.provider} provider. Please use ${user.provider} login.`
                });
            }

            const isPasswordValid = await user.comparePassword(password);
            if (!isPasswordValid) {
                return done(null, false, { message: 'Invalid credentials' });
            }

            if (!user.isAccountConfirmed()) {
                return done(null, false, { message: 'Please verify your email address' });
            }

            if (!user.isActive) {
                return done(null, false, { message: 'Account is inactive' });
            }


            user.lastLogin = new Date();
            await user.save();

            return done(null, user);
        } catch (error) {
            return done(error);
        }
    }
));

// Google Strategy
passport.use(new GoogleStrategy(
    {
        clientID: config.auth.google.clientId,
        clientSecret: config.auth.google.clientSecret,
        callbackURL: config.auth.google.callbackURL
    },
    async (accessToken, refreshToken, profile, done) => {
        try {
            // Check if user already exists with Google ID
            let user = await Student.findByGoogleId(profile.id);

            if (user) {
                // Update last login
                user.lastLogin = new Date();
                await user.save();
                return done(null, user);
            }

            // Check if user exists with same email but different provider
            user = await Student.findByEmail(profile.emails[0].value);

            if (user && user.provider !== EAuthProvider.GOOGLE) {
                return done(null, false, {
                    message: `Account exists with ${user.provider} provider. Please use ${user.provider} login.`
                });
            }

            if (user) {
                user.googleId = profile.id;
                user.provider = EAuthProvider.GOOGLE;
                user.lastLogin = new Date();
                await user.save();
                return done(null, user);
            }

            // Create new user
            const newUser = new Student({
                name: profile.displayName,
                email: profile.emails[0].value,
                profilePicture: profile.photos[0]?.value,
                googleId: profile.id,
                provider: EAuthProvider.GOOGLE,
                role: "STUDENT",
                lastLogin: new Date()
            });

            await newUser.save();
            return done(null, newUser);
        } catch (error) {
            return done(error);
        }
    }
));

// Facebook Strategy
passport.use(new FacebookStrategy(
    {
        clientID: config.auth.facebook.appId,
        clientSecret: config.auth.facebook.appSecret,
        callbackURL: config.auth.facebook.callbackURL,
        profileFields: ['id', 'displayName', 'emails', 'photos']
    },
    async (accessToken, refreshToken, profile, done) => {
        try {
            // Check if user already exists with Facebook ID
            let user = await Student.findByFacebookId(profile.id);

            if (user) {
                user.lastLogin = new Date();
                await user.save();
                return done(null, user);
            }

            const email = profile.emails?.[0]?.value;
            if (email) {
                user = await Student.findByEmail(email);

                if (user && user.provider !== EAuthProvider.FACEBOOK) {
                    return done(null, false, {
                        message: `Account exists with ${user.provider} provider. Please use ${user.provider} login.`
                    });
                }

                if (user) {
                    user.facebookId = profile.id;
                    user.provider = EAuthProvider.FACEBOOK;
                    user.lastLogin = new Date();
                    await user.save();
                    return done(null, user);
                }
            }

            // Create new user
            const newUser = new Student({
                name: profile.displayName,
                email: email,
                profilePicture: profile.photos?.[0]?.value,
                facebookId: profile.id,
                provider: EAuthProvider.FACEBOOK,
                role: "STUDENT",
                lastLogin: new Date()
            });

            await newUser.save();
            return done(null, newUser);
        } catch (error) {
            return done(error);
        }
    }
));

export default passport;