import mongoose from 'mongoose';

const categorySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
        unique: true
    },
    description: {
        type: String,
        trim: true,
        default: null
    },

}, {
    timestamps: true,
    versionKey: false
});

const Category = mongoose.model('Category', categorySchema);
export default Category;