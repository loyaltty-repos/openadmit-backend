import mongoose from "mongoose";
const paymentSchema = new mongoose.Schema({
    studentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Student',
        required: true
    },
    orderId: {
        type: String,
        required: true
    },
    paymentId: {
        type: String,
    },
    amount: {
        type: Number,
        required: true
    },
    currency: {
        type: String,
        default: 'INR'
    },
    status: {
        type: String,
        enum: ['PENDING', 'SUCCESS', 'FAILED'],
        default: 'PENDING'
    },
    planId: {
        type: String,
        required: true
    },
    planName: {
        type: String,
        required: true
    },
    planCategory: {
        type: String,
        required: true
    },
    planType: {
        type: String,
        required: true
    }
}, {
    timestamps: true,
    versionKey: false
});

const Payment = mongoose.model('Payment', paymentSchema);
export default Payment