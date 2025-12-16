import mongoose from "mongoose";

const applicationSchema = new mongoose.Schema({
    studentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Student',
        required: true
    },
    universityId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'University',
        required: true
    },
    status: {
        type: String,
        enum: ["UNDER_REVIEW", "SUBMITTED", "REVIEWED", "APPROVED", "DRAFT", "REJECTED"],
        default: "DRAFT"
    },
    progress: {
        type: Number,
        default: 0
    },
    taskAssignments: [
        {
            taskAssignmentId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'StudentTaskAssignment',
                required: true
            }
        }
    ],
    assignTo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Member',
        required: true
    }
}, {
    timestamps: true,
    versionKey: false
});

const Application = mongoose.model('Application', applicationSchema);
export default Application;