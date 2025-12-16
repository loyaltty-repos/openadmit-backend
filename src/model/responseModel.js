import mongoose from "mongoose";

const responseSchema = new mongoose.Schema({
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
        required: true
    },
    questionId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    answer: {
        type: mongoose.Schema.Types.Mixed,
        required: true
    },
    status: {
        type: String,
        enum: ["PENDING", "SUBMITTED", "REVIEWED"],
        default: "PENDING"
    },
    feedback: {
        type: String,
        trim: true,
        default: null
    },
    submittedAt: {
        type: Date,
        default: null
    },
    version: {
        type: Number,
        default: 1
    }
}, {
    timestamps: true,
    versionKey: false
});

responseSchema.index({ studentId: 1, taskId: 1, subtaskId: 1, questionnaireId: 1, questionId: 1 });

const Response = mongoose.model('Response', responseSchema);
export default Response;