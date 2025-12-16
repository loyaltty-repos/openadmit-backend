import mongoose from "mongoose";

const studentTaskAssignmentSchema = new mongoose.Schema({
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
    questionnaireId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Questionnaire',
        required: false
    },
    documentURL: {
        type: String,
        default: null
    },
    documentStatus: {
        type: String,
        enum: ["NOT_UPLOADED", "UPLOADED", "UNDER_REVIEW", "APPROVED", "REJECTED"],
        default: "NOT_UPLOADED"
    },
    assignedAt: {
        type: Date,
        default: Date.now
    },
    status: {
        type: String,
        enum: ["PENDING", "IN_PROGRESS", "COMPLETED", "REJECTED"],
        default: "PENDING"
    },
    isLocked: {
        type: Boolean,
        default: false
    },
    dueDate: {
        type: Date,
        default: null
    },

}, {
    timestamps: true,
    versionKey: false
});

const StudentTaskAssignment = mongoose.model('StudentTaskAssignment', studentTaskAssignmentSchema);
export default StudentTaskAssignment;