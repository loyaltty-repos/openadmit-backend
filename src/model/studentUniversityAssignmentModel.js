import mongoose from "mongoose";

const studentUniversityAssignmentSchema = new mongoose.Schema({
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
    assignedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Member',
        required: true
    },
    assignedAt: {
        type: Date,
        default: Date.now
    },
    admissionStatus: {
        type: String,
        trim: true,
        default: null
    },
    admissionComments: {
        type: String,
        trim: true,
        default: null
    },
    universityStatus: {
        type: String,
        trim: true,
        default: null // Will store "Safe", "Achievable", "Ambitious", "Very Ambitious", "Can Try"
    }
}, {
    timestamps: true,
    versionKey: false
});

const StudentUniversityAssignment = mongoose.model('StudentUniversityAssignment', studentUniversityAssignmentSchema);
export default StudentUniversityAssignment;