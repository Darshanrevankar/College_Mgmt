import mongoose from "mongoose";

const connectdb = async()=>{
    try{
        const conn = await mongoose.connect(process.env.MONGODB_URL)
        console.log("successfully connected to mongodb")
    }
    catch(error){
        console.log(`Mongodb error : ${error}`)
    }
}

export default connectdb