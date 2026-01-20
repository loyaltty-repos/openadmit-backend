// src/controller/notification/notificationController.js
import mongoose from "mongoose";
import httpResponse from "../../util/httpResponse.js";
import responseMessage from "../../constant/responseMessage.js";
import httpError from "../../util/httpError.js";
import Notification from "../../model/Notification.js"; // ✅ use your actual new model file name/path
import mailer from "../../service/email.service.js";
import { emitToUser } from "../../config/socket.js";
import {
  ChatMessageToStudentEmailTemplate,
  ChatMessageToAdminEmailTemplate,
} from "../../service/emailTemplates.js";
import Student from "../../model/studentModel.js"; // :contentReference[oaicite:0]{index=0}
import Member from "../../model/membersModel.js"; // :contentReference[oaicite:1]{index=1}


/**
 * Helper: figure out "who" is making the request.
 * Student middleware => req.authenticatedStudent
 * Admin/member middleware => req.authenticatedMember / req.member / req.authenticatedAdmin (depending on your app)
 *
 * IMPORTANT:
 * recipientType must match schema enum EXACTLY: ["Member", "Student"]
 */
const getRequester = (req) => {
  if (req?.authenticatedStudent?._id) {
    return { recipientId: req.authenticatedStudent._id, recipientType: "Student" };
  }

  if (req?.authenticatedMember?._id) {
    return { recipientId: req.authenticatedMember._id, recipientType: "Member" };
  }

  if (req?.authenticatedAdmin?._id) {
    return { recipientId: req.authenticatedAdmin._id, recipientType: "Member" };
  }

  if (req?.member?._id) {
    return { recipientId: req.member._id, recipientType: "Member" };
  }

  return { recipientId: null, recipientType: null };
};

const parsePagination = (req) => {
  const page = Math.max(parseInt(req.query.page || "1", 10), 1);
  const limit = Math.min(Math.max(parseInt(req.query.limit || "10", 10), 1), 100);
  const skip = (page - 1) * limit;

  // sortOrder: asc | desc (default: desc/newest first)
  const sortOrder = (req.query.sortOrder || "desc").toLowerCase() === "asc" ? 1 : -1;

  return { page, limit, skip, sortOrder };
};

const buildFilters = (req, recipientType, recipientId) => {
  const filter = { recipientType, recipientId };

  // Optional filter: isRead=true/false
  if (req.query.isRead !== undefined) {
    const val = req.query.isRead;
    filter.isRead = val === true || val === "true";
  }

  // Optional filter: type=TASK|MESSAGE|ALERT|INFO
  if (req.query.type) {
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

const validateObjectIdOr422 = (next, req, idValue, label = "notificationId") => {
  if (!idValue || !mongoose.Types.ObjectId.isValid(idValue)) {
    httpError(
      next,
      new Error(responseMessage.CUSTOM_MESSAGE(`Valid ${label} is required`)),
      req,
      422
    );
    return false;
  }
  return true;
};

export default {
  // =========================
  // STUDENT: GET ALL
  // =========================
  getStudentNotifications: async (req, res, next) => {
    try {
      const requester = getRequester(req);

      // Force recipientType for this endpoint
      if (!requester.recipientId || requester.recipientType !== "Student") {
        return httpError(next, new Error(responseMessage.UNAUTHORIZED), req, 401);
      }

      const { page, limit, skip, sortOrder } = parsePagination(req);
      const filter = buildFilters(req, "Student", requester.recipientId);

      const [total, notifications] = await Promise.all([
        Notification.countDocuments(filter),
        Notification.find(filter)
          .sort({ createdDate: sortOrder })
          .skip(skip)
          .limit(limit)
          .lean()
      ]);

      const totalPages = Math.ceil(total / limit) || 1;

      httpResponse(req, res, 200, responseMessage.SUCCESS, {
        notifications,
        pagination: {
          total,
          page,
          limit,
          totalPages,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1
        }
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
      const requester = getRequester(req);

      if (!requester.recipientId || requester.recipientType !== "Student") {
        return httpError(next, new Error(responseMessage.UNAUTHORIZED), req, 401);
      }

      const { notificationId } = req.params;
      if (!validateObjectIdOr422(next, req, notificationId)) return;

      const notification = await Notification.findOne({
        _id: notificationId,
        recipientType: "Student",
        recipientId: requester.recipientId
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
  // ADMIN/MEMBER: GET ALL
  // =========================
  getAdminNotifications: async (req, res, next) => {
    try {
      const requester = getRequester(req);

      // Force recipientType for this endpoint
      if (!requester.recipientId || requester.recipientType !== "Member") {
        return httpError(next, new Error(responseMessage.UNAUTHORIZED), req, 401);
      }

      const { page, limit, skip, sortOrder } = parsePagination(req);
      const filter = buildFilters(req, "Member", requester.recipientId);
      delete filter.recipientId; // Admins can see all Member notifications
      const [total, notifications] = await Promise.all([
        Notification.countDocuments(filter),
        Notification.find(filter)
          .sort({ createdDate: sortOrder })
          .skip(skip)
          .limit(limit)
          .lean()
      ]);

      const totalPages = Math.ceil(total / limit) || 1;

      httpResponse(req, res, 200, responseMessage.SUCCESS, {
        notifications,
        pagination: {
          total,
          page,
          limit,
          totalPages,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1
        }
      });
    } catch (err) {
      httpError(next, err, req, 500);
    }
  },

  // =========================
  // ADMIN/MEMBER: GET BY ID
  // =========================
  getAdminNotificationById: async (req, res, next) => {
    try {
      const requester = getRequester(req);

      if (!requester.recipientId || requester.recipientType !== "Member") {
        return httpError(next, new Error(responseMessage.UNAUTHORIZED), req, 401);
      }

      const { notificationId } = req.params;
      if (!validateObjectIdOr422(next, req, notificationId)) return;

      const notification = await Notification.findOne({
        _id: notificationId,
        recipientType: "Member",
        recipientId: requester.recipientId
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
  // used in both routes; decides recipientType from route
  // =========================
  markNotificationAsRead: async (req, res, next) => {
    try {
      const requester = getRequester(req);
      if (!requester.recipientId || !requester.recipientType) {
        return httpError(next, new Error(responseMessage.UNAUTHORIZED), req, 401);
      }

      // For safety, map route to expected type
      // If URL contains "/student", enforce Student; if "/admin", enforce Member.
      const isStudentRoute = req.originalUrl?.includes("/notifications/student");
      const expectedType = isStudentRoute ? "Student" : "Member";

      if (requester.recipientType !== expectedType) {
        return httpError(next, new Error(responseMessage.UNAUTHORIZED), req, 401);
      }

      const { notificationId } = req.params;
      if (!validateObjectIdOr422(next, req, notificationId)) return;

      const updated = await Notification.findOneAndUpdate(
        {
          _id: notificationId,
          recipientType: expectedType,

        },
        { $set: { isRead: true } }, // timestamps will update updatedDate automatically
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
  },

  // ======================================================
  // STUDENT -> ADMIN (Member): Chat Message Notification
  // POST /notifications/student/chat-messages
  // ======================================================
  // sendChatMessageNotificationToAdmin: async (req, res, next) => {
  //   try {
  //     const { authenticatedStudent } = req;

  //     if (!authenticatedStudent?._id) {
  //       return httpError(next, new Error(responseMessage.UNAUTHORIZED), req, 401);
  //     }

  //     const { adminId, title, message } = req.body;

  //     if (!adminId || !mongoose.Types.ObjectId.isValid(adminId)) {
  //       return httpError(
  //         next,
  //         new Error(responseMessage.CUSTOM_MESSAGE("Valid adminId is required")),
  //         req,
  //         422
  //       );
  //     }

  //     if (!title || String(title).trim().length === 0) {
  //       return httpError(
  //         next,
  //         new Error(responseMessage.CUSTOM_MESSAGE("title is required")),
  //         req,
  //         422
  //       );
  //     }

  //     if (!message || String(message).trim().length === 0) {
  //       return httpError(
  //         next,
  //         new Error(responseMessage.CUSTOM_MESSAGE("message is required")),
  //         req,
  //         422
  //       );
  //     }

  //     const notification = await Notification.create({
  //       title: String(title).trim(),
  //       message: String(message).trim(),
  //       type: "MESSAGE",
  //       recipientType: "Member",
  //       recipientId: adminId,
  //       isRead: false,
  //     });

  //     return httpResponse(req, res, 201, responseMessage.SUCCESS, {
  //       message: "Chat message notification sent to admin",
  //       notification,
  //     });
  //   } catch (err) {
  //     return httpError(next, err, req, 500);
  //   }
  // },

sendChatMessageNotificationToAdmin: async (req, res, next) => {
  try {
    const { authenticatedStudent } = req;

    if (!authenticatedStudent?._id) {
      return httpError(next, new Error(responseMessage.UNAUTHORIZED), req, 401);
    }

    const { title, message } = req.body;

    if (!title || String(title).trim().length === 0) {
      return httpError(
        next,
        new Error(responseMessage.CUSTOM_MESSAGE("title is required")),
        req,
        422
      );
    }

    if (!message || String(message).trim().length === 0) {
      return httpError(
        next,
        new Error(responseMessage.CUSTOM_MESSAGE("message is required")),
        req,
        422
      );
    }

    const cleanTitle = String(title).trim();
    const cleanMessage = String(message).trim();
    const messagePreview =
      cleanMessage.length > 240 ? `${cleanMessage.slice(0, 240)}…` : cleanMessage;

    // ✅ Fetch ALL members/admins
    const members = await Member.find({}).select("_id email firstName lastName").lean();

    if (!members || members.length === 0) {
      // No members to notify; still return success (don’t break flow)
      return httpResponse(req, res, 201, responseMessage.SUCCESS, {
        message: "No members found to notify",
        notification: null,
      });
    }

    // ✅ Create notifications for ALL members in one DB call
    const notificationsPayload = members.map((m) => ({
      title: cleanTitle,
      message: cleanMessage,
      type: "MESSAGE",
      recipientType: "Member",
      recipientId: m._id,
      isRead: false,
    }));

    const createdNotifications = await Notification.insertMany(notificationsPayload, {
      ordered: false,
    });

    // ✅ Socket emit to ALL members (never break API)
    try {
      for (const n of createdNotifications) {
        try {
          emitToUser(String(n.recipientId), "notification:new", {
            notification: n,
            recipientType: "Member",
          });
        } catch (_) {}
      }
    } catch (_) {}

    // ✅ Email to ALL members (never break API)
    try {
      const studentName = authenticatedStudent?.name || "Student";
      const studentEmail = authenticatedStudent?.email || null;

      for (const m of members) {
        try {
          const email = m?.email ? String(m.email).trim() : null;
          if (!email) continue;

          const adminName =
            `${m?.firstName || ""} ${m?.lastName || ""}`.trim() || "Admin";

          const tpl = ChatMessageToAdminEmailTemplate({
            adminName,
            studentName,
            studentEmail,
            messagePreview,
            dashboardUrl:
              process.env.ADMIN_DASHBOARD_URL || "https://admin.openadmit.com",
          });

          await mailer.sendEmail(email, tpl);
        } catch (_) {
          // ignore per-recipient failure
        }
      }
    } catch (_) {}

    // ✅ Response: keep same structure, but include count + sample notification
    return httpResponse(req, res, 201, responseMessage.SUCCESS, {
      message: "Chat message notification sent to all admins/members",
      notification: createdNotifications?.[0] || null,
      meta: { deliveredToMembers: members.length },
    });
  } catch (err) {
    return httpError(next, err, req, 500);
  }
},




  // ======================================================
  // ADMIN (Member) -> STUDENT: Chat Message Notification
  // POST /notifications/admin/chat-messages/:studentId
  // ======================================================
  // sendChatMessageNotificationToStudent: async (req, res, next) => {
  //   try {
  //     const { authenticatedMember } = req;

  //     if (!authenticatedMember?._id) {
  //       return httpError(next, new Error(responseMessage.UNAUTHORIZED), req, 401);
  //     }

  //     const { studentId } = req.params;

  //     if (!studentId || !mongoose.Types.ObjectId.isValid(studentId)) {
  //       return httpError(
  //         next,
  //         new Error(responseMessage.CUSTOM_MESSAGE("Valid studentId is required")),
  //         req,
  //         422
  //       );
  //     }

  //     const { title, message } = req.body;

  //     if (!title || String(title).trim().length === 0) {
  //       return httpError(
  //         next,
  //         new Error(responseMessage.CUSTOM_MESSAGE("title is required")),
  //         req,
  //         422
  //       );
  //     }

  //     if (!message || String(message).trim().length === 0) {
  //       return httpError(
  //         next,
  //         new Error(responseMessage.CUSTOM_MESSAGE("message is required")),
  //         req,
  //         422
  //       );
  //     }

  //     const notification = await Notification.create({
  //       title: String(title).trim(),
  //       message: String(message).trim(),
  //       type: "MESSAGE",
  //       recipientType: "Student",
  //       recipientId: studentId,
  //       isRead: false,
  //     });

  //     return httpResponse(req, res, 201, responseMessage.SUCCESS, {
  //       message: "Chat message notification sent to student",
  //       notification,
  //     });
  //   } catch (err) {
  //     return httpError(next, err, req, 500);
  //   }
  // },

  sendChatMessageNotificationToStudent: async (req, res, next) => {
    try {
      const { authenticatedMember } = req;

      if (!authenticatedMember?._id) {
        return httpError(next, new Error(responseMessage.UNAUTHORIZED), req, 401);
      }

      const { studentId } = req.params;

      if (!studentId || !mongoose.Types.ObjectId.isValid(studentId)) {
        return httpError(
          next,
          new Error(responseMessage.CUSTOM_MESSAGE("Valid studentId is required")),
          req,
          422
        );
      }

      const { title, message } = req.body;

      if (!title || String(title).trim().length === 0) {
        return httpError(
          next,
          new Error(responseMessage.CUSTOM_MESSAGE("title is required")),
          req,
          422
        );
      }

      if (!message || String(message).trim().length === 0) {
        return httpError(
          next,
          new Error(responseMessage.CUSTOM_MESSAGE("message is required")),
          req,
          422
        );
      }

      const cleanTitle = String(title).trim();
      const cleanMessage = String(message).trim();

      // ✅ Notification (unchanged)
      const notification = await Notification.create({
        title: cleanTitle,
        message: cleanMessage,
        type: "MESSAGE",
        recipientType: "Student",
        recipientId: studentId,
        isRead: false,
      });

      // ✅ Socket emit (never breaks API)
      try {
        emitToUser(studentId, "notification:new", {
          notification,
          recipientType: "Student",
        });
      } catch (err) {
        console.error("SOCKET_EMIT_FAILED_STUDENT", err?.message || err);
      }

      // ✅ Email send to student (never breaks API)
      try {
        const student = await Student.findById(studentId).select("email name").lean();
        const studentEmail = student?.email ? String(student.email).trim() : null;

        if (studentEmail) {
          const studentName = student?.name || "Student";
          const adminName = `${authenticatedMember?.firstName || ""} ${authenticatedMember?.lastName || ""}`.trim() || "Open Admit Admin";

          const tpl = ChatMessageToStudentEmailTemplate({
            studentName,
            adminName,
            messagePreview: cleanMessage.length > 240 ? `${cleanMessage.slice(0, 240)}…` : cleanMessage,
            dashboardUrl: process.env.STUDENT_DASHBOARD_URL || "https://openadmit.com/dashboard",
          });

          await mailer.sendEmail(studentEmail, tpl);
        }
      } catch (err) {
        console.error("EMAIL_SEND_FAILED_STUDENT", err?.message || err);
      }

      return httpResponse(req, res, 201, responseMessage.SUCCESS, {
        message: "Chat message notification sent to student",
        notification,
      });
    } catch (err) {
      return httpError(next, err, req, 500);
    }
  },



};
