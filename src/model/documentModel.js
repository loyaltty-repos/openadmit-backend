import mongoose from "mongoose";

const documentSchema = new mongoose.Schema({
    studentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Student',
        required: true
    },
    taskId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Task',
        required: true
    },
    subtaskId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Subtask',
        required: true
    },
    uploader: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Member',
        required: true
    },
    fileUrl: {
        type: String,
        required: true
    },
    fileName: {
        type: String,
        required: true,
        trim: true
    },
    fileSize: {
        type: Number,
        default: null
    },
    fileType: {
        type: String,
        required: true,
        trim: true // e.g., "PDF", "DOCX"
    },
    uploadedAt: {
        type: Date,
        default: Date.now
    },
    status: {
        type: String,
        enum: ["PENDING", "VERIFIED", "REJECTED"],
        default: "PENDING"
    }
}, {
    timestamps: true,
    versionKey: false
});

const Document = mongoose.model('Document', documentSchema);
export default Document;