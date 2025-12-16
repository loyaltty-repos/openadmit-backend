import mongoose from 'mongoose';

const faqSchema = new mongoose.Schema({
    question: {
        type: String,
        required: true,
        trim: true
    },
    answer: {
        type: String,
        required: true,
        trim: true
    },
    categoryId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        required: true
    },
}, {
    timestamps: true,
    versionKey: false
});

const Faq = mongoose.model('Faq', faqSchema);
export default Faq;