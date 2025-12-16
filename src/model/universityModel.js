import mongoose from 'mongoose';

const universitySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    logo: {
        type: String,
        trim: true,
        default: null
    },
    banner: {
        type: String,
        trim: true,
        default: null
    },
    description: {
        type: String,
        trim: true,
        default: null
    },
    website_url: {
        type: String,
        trim: true,
        default: null
    },
    location: {
        type: String,
        trim: true,
        default: null
    },
    university_type: {
        type: String,
        trim: true,
        default: null
    },
    address: {
        type: String,
        trim: true,
        default: null
    },
    program: {
        type: String,
        required: true,
        trim: true
    },
    university_category: {
        type: String,
        trim: true,
        default: null
    },
    ranking: {
        international: {
            type: Number,
            default: null
        },
        national: {
            type: Number,
            default: null
        }
    },
    acceptance_rate: {
        type: Number,
        min: 0,
        max: 100,
        default: null
    },
    living_cost_per_year: {
        type: Number,
        min: 0,
        default: null
    },
    tuition_fees_per_year: {
        type: Number,
        min: 0,
        default: null
    },
    application_fee: {
        type: Number,
        min: 0,
        default: null
    },
    application_deadline: {
        type: Date,
        default: null
    }
}, {
    timestamps: true,
    versionKey: false
});

const University = mongoose.model('University', universitySchema);
export default University;