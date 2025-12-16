import quicker from '../util/quicker.js';
import config from '../config/config.js';
import responseMessage from '../constant/responseMessage.js';
import Student from '../model/studentModel.js';
import httpError from '../util/httpError.js';
import httpResponse from '../util/httpResponse.js';

export default async (req, _res, next) => {
    try {
        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "");

        if (token) {
            const decoded = quicker.verifyToken(token, config.ACCESS_TOKEN.SECRET);

            const student = await Student.findById(decoded.studentId).select('-password');

            if (!student) {
                return httpError(next, new Error(responseMessage.UNAUTHORIZED), req, 401);
            }

            // if (!student.isFeePaid) {
            //     return httpError(next, new Error(responseMessage.CUSTOM_MESSAGE("Please Paid The Fee")), req, 401);
            // }

            if (!student.isVerified) {
                return httpError(next, new Error(responseMessage.CUSTOM_MESSAGE("Your Not Verified To Perform This Action")), req, 401);
            }

            req.authenticatedStudent = student;
            return next();
        }

        return httpError(next, new Error(responseMessage.UNAUTHORIZED), req, 401);
    } catch (err) {
        return httpError(next, err?.message ? new Error(err.message) : new Error(responseMessage.UNAUTHORIZED), req, 401);
    }
};

export const paymentMiddleWare = async (req, _res, next) => {
    try {
        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "");

        if (token) {
            const decoded = quicker.verifyToken(token, config.ACCESS_TOKEN.SECRET);

            const student = await Student.findById(decoded.studentId).select('-password');

            if (student.isFeePaid) {
                return httpResponse(req, _res, 200, "Already Fee Paid")
            }

            if (student) {
                req.authenticatedStudent = student;
                return next();
            }
        }

        return httpError(next, new Error(responseMessage.UNAUTHORIZED), req, 401);
    } catch (err) {
        return httpError(next, err?.message ? new Error(err.message) : new Error(responseMessage.UNAUTHORIZED), req, 401);
    }
};

export const paymentMiddleWareForLLM = async (req, _res, next) => {
    try {
        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "");

        if (token) {
            const decoded = quicker.verifyToken(token, config.ACCESS_TOKEN.SECRET);

            const student = await Student.findById(decoded.studentId).select('-password');

            // if (student.isFeePaid) {
            //     return httpResponse(req, _res, 200, "Already Fee Paid")
            // }

            if (student) {
                req.authenticatedStudent = student;
                return next();
            }
        }

        return httpError(next, new Error(responseMessage.UNAUTHORIZED), req, 401);
    } catch (err) {
        return httpError(next, err?.message ? new Error(err.message) : new Error(responseMessage.UNAUTHORIZED), req, 401);
    }
};