import mongoose from "mongoose";

const questionSchema = new mongoose.Schema({
    question: {
        type: String,
        required: true,
        trim: true
    },
    ansType: {
        type: String,
        enum: ["TEXT", "MULTIPLE_CHOICE", "FILE", "DATE", "CHECKBOX", "PARAGRAPH"],
        required: true
    },
    options: {
        type: [String],
        default: []
    },

});

const questionnaireSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        trim: true
    },
    status: {
        type: String,
        enum: ["ACTIVE", "DRAFT", "ARCHIVED"],
        default: "DRAFT"
    },
    questions: [questionSchema],
}, {
    timestamps: true,
    versionKey: false
});

const Questionnaire = mongoose.model('Questionnaire', questionnaireSchema);
export default Questionnaire;