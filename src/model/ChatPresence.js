import mongoose from "mongoose";

const chatPresenceSchema = new mongoose.Schema(
  {
    userType: {
      type: String,
      enum: ["Member", "Student"],
      required: true,
      index: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      refPath: "userType",
      index: true,
    },
    isOnline: { type: Boolean, default: false, index: true },
    lastActiveAt: { type: Date, default: null },    
  },
  { timestamps: true }
);

const ChatPresence = mongoose.model("ChatPresence", chatPresenceSchema);

export default ChatPresence;