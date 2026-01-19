// src/controller/notification/notificationController.js
import mongoose from "mongoose";
import httpResponse from "../../util/httpResponse.js";
import responseMessage from "../../constant/responseMessage.js";
import httpError from "../../util/httpError.js";
import Notification from "../../model/Notification.js";

/**
 * Helper: figure out "who" is making the request.
 * - student routes use authentication middleware => req.authenticatedStudent
 * - admin routes use memberAccess middleware => likely req.authenticatedMember (or similar)
 *
 * This keeps the controller resilient even if your middleware sets a different key.
 */
const getRequester = (req) => {
  // Student middleware (as seen in studentController)
  if (req?.authenticatedStudent?._id) {
    return { id: req.authenticatedStudent._id, kind: "STUDENT" };
  }

  // Admin/Member middleware (guessing common patterns)
  if (req?.authenticatedMember?._id) {
    return { id: req.authenticatedMember._id, kind: "ADMIN" };
  }

  if (req?.authenticatedAdmin?._id) {
    return { id: req.authenticatedAdmin._id, kind: "ADMIN" };
  }

  if (req?.member?._id) {
    return { id: req.member._id, kind: "ADMIN" };
  }

  return { id: null, kind: "UNKNOWN" };
};

const parsePagination = (req) => {
  const page = Math.max(parseInt(req.query.page || "1", 10), 1);
  const limit = Math.min(Math.max(parseInt(req.query.limit || "10", 10), 1), 100);
  const skip = (page - 1) * limit;

  // sortOrder: asc | desc (default: desc/newest first)
  const sortOrder = (req.query.sortOrder || "desc").toLowerCase() === "asc" ? 1 : -1;

  return { page, limit, skip, sortOrder };
};

const buildFilters = (req, recipientId) => {
  const filter = { recipientId };

  // Optional filters
  if (req.query.isRead !== undefined) {
    // supports "true"/"false" strings too
    const val = req.query.isRead;
    filter.isRead = val === true || val === "true";
  }

  if (req.query.type) {
    // TASK | MESSAGE | ALERT | INFO
    filter.type = req.query.type;
  }

  // Optional keyword search in title/message
  if (req.query.q) {
    const q = String(req.query.q).trim();
    if (q.length > 0) {
      filter.$or = [
        { title: { $regex: q, $options: "i" } },
        { message: { $regex: q, $options: "i" } }
      ];
    }
  }

  return filter;
};

export default {
  // =========================
  // STUDENT: GET ALL
  // =========================
  getStudentNotifications: async (req, res, next) => {
    try {
      const { id: recipientId } = getRequester(req);
      if (!recipientId) {
        return httpError(next, new Error(responseMessage.UNAUTHORIZED), req, 401);
      }

      const { page, limit, skip, sortOrder } = parsePagination(req);
      const filter = buildFilters(req, recipientId);

      const [total, notifications] = await Promise.all([
        Notification.countDocuments(filter),
        Notification.find(filter)
          .sort({ createdDate: sortOrder })
          .skip(skip)
          .limit(limit)
          .lean()
      ]);

      const pagination = {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit) || 1,
        hasNextPage: page < (Math.ceil(total / limit) || 1),
        hasPrevPage: page > 1
      };

      httpResponse(req, res, 200, responseMessage.SUCCESS, {
        notifications,
        pagination
      });
    } catch (err) {
      httpError(next, err, req, 500);
    }
  },

  // =========================
  // STUDENT: GET BY ID
  // =========================
  getStudentNotificationById: async (req, res, next) => {
    try {
      const { id: recipientId } = getRequester(req);
      if (!recipientId) {
        return httpError(next, new Error(responseMessage.UNAUTHORIZED), req, 401);
      }

      const { notificationId } = req.params;
      if (!notificationId || !mongoose.Types.ObjectId.isValid(notificationId)) {
        return httpError(
          next,
          new Error(responseMessage.CUSTOM_MESSAGE("Valid notificationId is required")),
          req,
          422
        );
      }

      const notification = await Notification.findOne({
        _id: notificationId,
        recipientId
      }).lean();

      if (!notification) {
        return httpError(next, new Error(responseMessage.NOT_FOUND("Notification")), req, 404);
      }

      httpResponse(req, res, 200, responseMessage.SUCCESS, { notification });
    } catch (err) {
      httpError(next, err, req, 500);
    }
  },

  // =========================
  // ADMIN: GET ALL
  // =========================
  getAdminNotifications: async (req, res, next) => {
    try {
      const { id: recipientId } = getRequester(req);
      if (!recipientId) {
        return httpError(next, new Error(responseMessage.UNAUTHORIZED), req, 401);
      }

      const { page, limit, skip, sortOrder } = parsePagination(req);
      const filter = buildFilters(req, recipientId);

      const [total, notifications] = await Promise.all([
        Notification.countDocuments(filter),
        Notification.find(filter)
          .sort({ createdDate: sortOrder })
          .skip(skip)
          .limit(limit)
          .lean()
      ]);

      const pagination = {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit) || 1,
        hasNextPage: page < (Math.ceil(total / limit) || 1),
        hasPrevPage: page > 1
      };

      httpResponse(req, res, 200, responseMessage.SUCCESS, {
        notifications,
        pagination
      });
    } catch (err) {
      httpError(next, err, req, 500);
    }
  },

  // =========================
  // ADMIN: GET BY ID
  // =========================
  getAdminNotificationById: async (req, res, next) => {
    try {
      const { id: recipientId } = getRequester(req);
      if (!recipientId) {
        return httpError(next, new Error(responseMessage.UNAUTHORIZED), req, 401);
      }

      const { notificationId } = req.params;
      if (!notificationId || !mongoose.Types.ObjectId.isValid(notificationId)) {
        return httpError(
          next,
          new Error(responseMessage.CUSTOM_MESSAGE("Valid notificationId is required")),
          req,
          422
        );
      }

      const notification = await Notification.findOne({
        _id: notificationId,
        recipientId
      }).lean();

      if (!notification) {
        return httpError(next, new Error(responseMessage.NOT_FOUND("Notification")), req, 404);
      }

      httpResponse(req, res, 200, responseMessage.SUCCESS, { notification });
    } catch (err) {
      httpError(next, err, req, 500);
    }
  },

  // =========================
  // MARK AS READ (STUDENT + ADMIN)
  // same handler is used in both routes
  // =========================
  markNotificationAsRead: async (req, res, next) => {
    try {
      const { id: recipientId } = getRequester(req);
      if (!recipientId) {
        return httpError(next, new Error(responseMessage.UNAUTHORIZED), req, 401);
      }

      const { notificationId } = req.params;
      if (!notificationId || !mongoose.Types.ObjectId.isValid(notificationId)) {
        return httpError(
          next,
          new Error(responseMessage.CUSTOM_MESSAGE("Valid notificationId is required")),
          req,
          422
        );
      }

      const updated = await Notification.findOneAndUpdate(
        { _id: notificationId, recipientId },
        { $set: { isRead: true, updatedDate: new Date() } },
        { new: true }
      ).lean();

      if (!updated) {
        return httpError(next, new Error(responseMessage.NOT_FOUND("Notification")), req, 404);
      }

      httpResponse(req, res, 200, responseMessage.SUCCESS, {
        message: "Notification marked as read",
        notification: updated
      });
    } catch (err) {
      httpError(next, err, req, 500);
    }
  }
};
