// src/model/notificationModel.js
import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
    message: {
      type: String,
      required: true,
      trim: true,
      maxlength: 2000,
    },
    type: {
      type: String,
      enum: ["TASK", "MESSAGE", "ALERT", "INFO"],
      default: "INFO",
      required: true,
    },

    // ✅ supports both Member + Student
    recipientType: {
      type: String,
      enum: ["Member", "Student"],
      required: true,
      index: true,
    },
    recipientId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      refPath: "recipientType", // 👈 dynamic ref
      index: true,
    },

    isRead: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  {
    timestamps: { createdAt: "createdDate", updatedAt: "updatedDate" },
  }
);

// Helpful compound index for fast inbox queries
notificationSchema.index({ recipientType: 1, recipientId: 1, isRead: 1, createdDate: -1 });

const Notification = mongoose.model("Notification", notificationSchema);

export default Notification;
