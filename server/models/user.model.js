import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
    name : {
        type: String,
        required : true
    },
    email : {
        type : String,
        required : true,
        unique: true
    },
    usn : {
        type : String,
        required : true,
        unique: true
    },
    password : {
        type : String,
        required : true
    },
    branch : {
        type : String,
        required : true
    },
    scheme : {
        type : String,
        required : true
    },
    academics : {
        type : mongoose.Schema.Types.ObjectId,
        ref : 'Academics',
    }
})
export const User = mongoose.model('User', UserSchema)