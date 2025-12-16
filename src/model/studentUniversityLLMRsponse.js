import mongoose from "mongoose";
const { Schema, model} = mongoose;

const studentUniversityLLMRsponseSchema = new Schema(
    {
        studentId: {
            type: Schema.Types.ObjectId,
            ref: 'Student',
            required: true,
            index: true,
        },
        universityName: {
            type: String,
            
        },
        program : {
            type: String,
        },
        tier:{
            type: String,
        },
        lengthOfProgram:{
            type: String,
        },
        probabilityOfAcceptance:{
            type: String,
        },
        ranking:{
            type: String,
        },
        location:{
            type: String,
        },
        annualTuitionFees:{
            type: String,
        },
        livingExpenses:{
            type: String,
        },
        applicationDeadlines:{
            type: String,
        },
        description:{
            type: String,
        },
        
    },
    { timestamps: true }
);

const StudentUniversityLLMResponse = model('StudentUniversityLLMResponse', studentUniversityLLMRsponseSchema);

export default StudentUniversityLLMResponse;