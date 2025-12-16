import httpError from '../util/httpError.js';
import responseMessage from '../constant/responseMessage.js';
import quicker from '../util/quicker.js';
import config from '../config/config.js';
import Member from '../model/membersModel.js';

const rbacMiddleware = (requiredRoles = []) => {
    return async (req, res, next) => {
        try {
            const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "");

            if (!token) {
                return httpError(next, new Error(responseMessage.UNAUTHORIZED), req, 401);
            }

            const decoded = quicker.verifyToken(token, config.ACCESS_TOKEN.SECRET);
            const member = await Member.findById(decoded.id).select("-password")
            console.log("HELLO", member);

            if (!member) {
                return httpError(next, new Error(responseMessage.UNAUTHORIZED), req, 401);
            }

            if (member.status !== 'ACTIVE') {
                return httpError(next, new Error(responseMessage.UNAUTHORIZED), req, 403);
            }

            if (requiredRoles.length > 0 && !requiredRoles.includes(member.role)) {
                return httpError(next, new Error(responseMessage.UNAUTHORIZED), req, 403);
            }

            req.authenticatedMember = member;
            console.log("user authorised")
            next();         
        } catch (err) {
            httpError(next, err?.message ? new Error(err.message) : new Error(responseMessage.UNAUTHORIZED), req, 401);
        }
    };
};


export default rbacMiddleware;
export const adminOnly = rbacMiddleware(['ADMIN']);
export const adminEditorOnly = rbacMiddleware(['ADMIN', 'EDITOR']);
export const memberAccess = rbacMiddleware(['ADMIN', 'EDITOR', 'VIEWER']); // Allows all active members