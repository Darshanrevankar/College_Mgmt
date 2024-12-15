import mongoose from "mongoose";

const subjectSchema = new mongoose.Schema({
    subName : {
        type : String,
        required : true
    },
    subCode : {
        type : String,
        required : true
    },
    subCredits : {
        type : Number,
        required : true
    }
})

const semesterSchema = new mongoose.Schema({
    sem: {
        type:String,
    },
    subjects: [{
        type: subjectSchema
    }]
})

const branchSchema = new mongoose.Schema({
        branchName: {
            type: String,
            required: true,
        },
        semesters : [{
            type: semesterSchema
        }]
})
const schemeSchema = new mongoose.Schema({
    scheme : {
        type: String,
        required : true
    },
    branches : [{
        type: branchSchema
    }]
})

export const Scheme = mongoose.model('Scheme', schemeSchema)