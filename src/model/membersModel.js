import mongoose from "mongoose";

const membersSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: true,
        trim: true
    },
    lastName: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true
    },
    bio: {
        type: String
    },
    phone: {
        type: String,
        trim: true,
        default: null
    },
    address: {
        type: String,
        trim: true,
        default: null
    },
    role: {
        type: String,
        enum: ['ADMIN', 'EDITOR', 'VIEWER'],
        required: true,
        default: 'VIEWER'
    },
    status: {
        type: String,
        enum: ['ACTIVE', 'INACTIVE', 'INVITED'],
        required: true,
        default: 'INVITED'
    },
    password: {
        type: String,
        required: true
    },
    profilePicture: {
        type: String,
        default: null
    },
    createdDate: {
        type: Date,
        default: Date.now
    },
    updatedDate: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: {
        createdAt: 'createdDate',
        updatedAt: 'updatedDate'
    },
    versionKey: false
});

const Member = mongoose.model('Member', membersSchema);

export default Member;