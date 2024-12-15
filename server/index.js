import dotenv from 'dotenv';
import { app } from "./app.js";
import connectDB from "./database/connectionDB.js";
import colors from "colors"; 
import responseHandler from "./utils/responseHandler.js";

dotenv.config();

const port = process.env.PORT || 5000;

connectDB()
  .then(() => {
    app.listen(port, () => {
      console.log(`Index.js : Server is running on port ${port}`.cyan.bold); 
    });
    app.get('/', (req,res) => {
        responseHandler(res,{
            success: true,
            statusCode: 200,
            msg: 'Server started',
        })
    })
    app.on("error", (err) => {
      console.error(`Index.js: Listening error: ${err}`.red.bold); 
    });
  })
  .catch((err) => {
    console.error(`Index.js : MongoDB connection error: ${err}`.red.bold); 
});
