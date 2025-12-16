import mongoose from "mongoose";

const studentActivitySchema = new mongoose.Schema({
    studentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Student',
        required: true
    },
    activityType: {
        type: String,
        required: true,

    },
    message: {
        type: String,
        required: true
    },
    status: {
        type: String,
        required: true,

    },
    details: {
        type: mongoose.Schema.Types.Mixed,
        default: {}
    },
    isRead: {
        type: Boolean,
        default: false
    }

}, {
    timestamps: true,
    versionKey: false
});

const StudentActivity = mongoose.model('StudentActivity', studentActivitySchema);
export default StudentActivity;