import mongoose from 'mongoose';

const loanSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    phoneNumber: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        trim: true
    },
    pinCode: {
        type: String,
        required: true,
        trim: true
    },
    address: {
        type: String,
        required: true,
        trim: true
    },
    admissionTerm: {
        type: String,
        required: true,
        trim: true
    },
    admissionStatus: {
        type: String,
        required: true,
        trim: true
    },
    coBorrower: {
        name: {
            type: String,
            required: true,
            trim: true
        },
        universitiesReceivedAdmitFrom: {
            type: [String],
            required: true
        }
    },
    appliedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Student',
        required: true
    },
    status: {
        type: String,
        enum: ['PENDING', 'APPROVED', 'REJECTED'],
        default: 'PENDING'
    },
    appliedDate: {
        type: Date,
        default: Date.now
    },

}, {
    timestamps: true,
    versionKey: false
});

const Loan = mongoose.model('Loan', loanSchema);
export default Loan;