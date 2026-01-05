import mongoose from "mongoose";

const documentSchema = new mongoose.Schema({
    documentName: {
        type: String,
        required: true,
        trim: true
    },
    documentURL: {
        type: String,
        trim: true,
        required: true
    },
    priority: {
        type: String,
        enum: ["LOW", "MEDIUM", "HIGH"],
        default: "MEDIUM"
    },
    assignee: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Member',
        required: true
    },
    status: {
        type: String,
        enum: ["DRAFT", "COMPLETED", "IN_REVIEW", "REJECTED"],
        default: "DRAFT"
    },
    isDefault: {
        type: Boolean,
        default: false
    },
    createdDate: {
        type: Date,
        default: Date.now
    },
    student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Student',
        required: true
    }
}, {
    timestamps: true,
    versionKey: false
});

const Document = mongoose.model('DocumentModel', documentSchema);
export default Document;