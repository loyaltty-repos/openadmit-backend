import mongoose from "mongoose";

const taskSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        trim: true
    },
    logo: {
        type: String,
        trim: true,
        default: null
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
    isDefault: {
        type: Boolean,
        default: false
    },
    createdDate: {
        type: Date,
        default: Date.now
    },
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'TaskCategory',
        default: null
    }
}, {
    timestamps: true,
    versionKey: false
});

const Task = mongoose.model('Task', taskSchema);
export default Task;