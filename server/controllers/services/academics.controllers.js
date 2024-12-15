import asyncHandler from 'express-async-handler';
import responseHandler from '../../utils/responseHandler.js';
import {User}  from '../../models/user.model.js';
import { Academics } from '../../models/academics.model.js';
import { Scheme } from '../../models/scheme.model.js';

export const getUserDetails = asyncHandler(async (req, res) => {
    try {
        const userId = req.user.id; 
        const user = await User.findById(userId).select('-password'); 

        if (!user) {
            return responseHandler(res, {
                success: false,
                statusCode: 404,
                msg: 'User not found',
            });
        }
        const academicDetails = await Academics.findById(user.academics)
        console.log(academicDetails)
        if (!academicDetails) {
            return responseHandler(res, {
                success: false,
                statusCode: 404,
                msg: 'Academic details not found',
            });
        }
        console.log(user,academicDetails)
        return responseHandler(res, {
            success: true,
            statusCode: 200,
            msg: 'User details retrieved successfully',
            payload: {user, academicDetails}, 
        });
    } catch (error) {
        console.log(`controllers/userController.js/getUserDetails : Error fetching user details: ${error}`);
        return responseHandler(res, {
            success: false,
            statusCode: 500,
            msg: 'Internal Server Error',
        });
    }
});

export const updateSemesterMarks = asyncHandler(async (req, res) => {
    try {
        const { sem, updatedMarks } = req.body;
        console.log(req.body)
        if (!sem || !updatedMarks || !Array.isArray(updatedMarks)) {
            return responseHandler(res, {
                success: false,
                statusCode: 400,
                msg: 'Invalid input. Please provide sem and updatedMarks as an array.',
            });
        }

        const userId = req.user.id;
        const user = await User.findById(userId).populate('academics');
        if (!user || !user.academics) {
            return responseHandler(res, {
                success: false,
                statusCode: 404,
                msg: 'User not found',
            });
        }

        const semester = user.academics.semesters.find((s) => s.sem === sem);
        if (!semester) {
            return responseHandler(res, {
                success: false,
                statusCode: 404,
                msg: `Semester ${sem} not found`,
            });
        }

        updatedMarks.forEach((updatedSubject) => {
            const subject = semester.subjects.id(updatedSubject._id);
            if (subject) {
                subject.subName = updatedSubject.subName || subject.subName;
                subject.subCode = updatedSubject.subCode || subject.subCode;
                subject.subCredits =
                    updatedSubject.subCredits !== undefined
                        ? updatedSubject.subCredits
                        : subject.subCredits;
                subject.internalMarks =
                    updatedSubject.internalMarks !== undefined
                        ? updatedSubject.internalMarks
                        : subject.internalMarks;
                subject.externalMarks =
                    updatedSubject.externalMarks !== undefined
                        ? updatedSubject.externalMarks
                        : subject.externalMarks;
                subject.marks =
                    updatedSubject.marks !== undefined
                        ? updatedSubject.marks
                        : subject.marks;
                subject.result = updatedSubject.result || subject.result;
            }
        });

        await user.academics.save();
        return responseHandler(res, {
            success: true,
            statusCode: 200,
            msg: 'Semester marks updated successfully',
            payload: { semester },
        });
    } catch (error) {
        console.error(
            `controllers/userController.js/updateSemesterMarks : ${error}`
        );
        return responseHandler(res, {
            success: false,
            statusCode: 500,
            msg: 'Internal Server Error',
        });
    }
});




export const getSemesterSubjects = asyncHandler(async (req, res) => {
    
    try {
        const { sem } = req.body;
        const userId = req.user.id; 
        
        const user = await User.findById(userId);
        if (!user) {
            return responseHandler(res, {
                success: false,
                statusCode: 404,
                msg: 'User not found'
            });
        }

        const scheme = await Scheme.findOne(
            { scheme: user.scheme, "branches.branchName": user.branch },
            { "branches.$": 1 }  
        );
        
        if (!scheme || !scheme.branches.length) {
            return responseHandler(res, {
                success: false,
                statusCode: 404,
                msg: 'Scheme or branch not found'
            });
        }

        const branch = scheme.branches[0];
        const semester = branch.semesters.find(s => s.sem === sem);
        
        if (!semester) {
            return responseHandler(res, {
                success: false,
                statusCode: 404,
                msg: `Semester ${sem} not found in the specified branch`
            });
        }
        return responseHandler(res, {
            msg: 'Subjects retrieved successfully',
            payload: semester.subjects
        });
    } catch (error) {
        console.log(`controllers/userController.js/getSemesterSubjects : ${error}`)
        return responseHandler(res, {
            success: false,
            statusCode: 500,
            msg: 'An error occurred while retrieving subjects',
            error: error.message
        });
    }
});

