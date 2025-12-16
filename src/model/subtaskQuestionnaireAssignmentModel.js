import mongoose from "mongoose";

const subtaskQuestionnaireAssignmentSchema = new mongoose.Schema({
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
    assignedAt: {
        type: Date,
        default: Date.now
    },
    status: {
        type: String,
        enum: ["PENDING", "IN_PROGRESS", "COMPLETED"],
        default: "PENDING"
    },
}, {
    timestamps: true,
    versionKey: false
});

const SubtaskQuestionnaireAssignment = mongoose.model('SubtaskQuestionnaireAssignment', subtaskQuestionnaireAssignmentSchema);

export default SubtaskQuestionnaireAssignment;