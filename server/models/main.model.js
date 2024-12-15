import mongoose from "mongoose";

const MainSchema = new mongoose.Schema({
    name : {
        type: String,
        required : true
    },
    id : {
        type : String,
        required : true,
        unique: true
    },
    email : {
        type : String,
        required : true,
        unique: true
    },
    password : {
        type : String,
        required : true
    },
    word : {
        type : String,
        required : true
    }
})
export const User = mongoose.model('Admin', MainSchema)