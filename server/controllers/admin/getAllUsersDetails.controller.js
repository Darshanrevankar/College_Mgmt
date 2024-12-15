import asyncHandler from 'express-async-handler'
import { User } from '../../models/user.model.js'
import { Academics } from '../../models/academics.model.js'
import responseHandler from '../../utils/responseHandler.js';

export const getAllUserDetails = asyncHandler(async(req,res)=>{
    try{
        const students = await User.find()
            .populate({
                path: 'academics',
                populate: {
                    path: 'semesters.subjects',
                },
            })
            .lean();
            if(!students || students.length === 0 ){
                responseHandler(res,{success: true,
                    statusCode: 404,
                    msg: 'No Students data found',
                    payload: {} 
                })
            }
            responseHandler(res,{success: true,
                statusCode: 200,
                msg: 'Students data found',
                payload: {students} 
            })
    }catch(err){
        responseHandler(res,{success: false,
            statusCode: 500,
            msg: 'Error fetching students',
            payload: { err }
        })
    }
})
