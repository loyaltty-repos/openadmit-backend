import mongoose from "mongoose";

const subtaskSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        trim: true
    },
    logo:{
        type: String,
        trim: true,
        default: null
    },
    priority: {
        type: String,
        enum: ["LOW", "MEDIUM", "HIGH"],
        default: "LOW"
    },
}, {
    timestamps: true,
    versionKey: false
});

const Subtask = mongoose.model('Subtask', subtaskSchema);
export default Subtask;