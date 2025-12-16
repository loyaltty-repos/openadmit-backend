import mongoose from "mongoose";

const taskCategorySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
        unique: true
    },
    description: {
        type: String,
        trim: true
    }
}, {
    timestamps: true,
    versionKey: false
});

const TaskCategory = mongoose.model('TaskCategory', taskCategorySchema);
export default TaskCategory;