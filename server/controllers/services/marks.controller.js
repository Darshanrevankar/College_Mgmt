import asyncHandler from 'express-async-handler';
import responseHandler from '../../utils/responseHandler.js';
import { User } from '../../models/user.model.js';
import { Academics } from '../../models/academics.model.js';

export const updateMarksController = asyncHandler(async (req, res) => {
    try {
        console.log('updateMarksController initiated');

        const { usn, sem, updatedSubjects } = req.body;

        // Validate input fields
        if (!usn || !sem || !updatedSubjects || updatedSubjects.length === 0) {
            console.log('\nupdateMarksController: Missing fields in request body');
            return responseHandler(res, {
                success: false,
                statusCode: 400,
                msg: 'USN, semester, or subjects data is missing',
            });
        }

        // Find the user by USN
        const user = await User.findOne({ usn });
        if (!user) {
            console.log('\nupdateMarksController: User not found');
            return responseHandler(res, {
                success: false,
                statusCode: 404,
                msg: 'User not found',
            });
        }

        // Find academic details
        const academicDetails = await Academics.findById(user.academics);
        if (!academicDetails) {
            console.log('\nupdateMarksController: Academics not found');
            return responseHandler(res, {
                success: false,
                statusCode: 404,
                msg: 'Academic details not found',
            });
        }

        // Find semester details
        const semester = academicDetails.semesters.find((s) => s.sem === sem);
        if (!semester) {
            console.log('\nupdateMarksController: Semester not found');
            return responseHandler(res, {
                success: false,
                statusCode: 404,
                msg: 'Semester details not found',
            });
        }

        // Update or add subjects in the semester
        updatedSubjects.forEach((subject) => {
            const existingSubject = semester.subjects.find(
                (s) => s.subCode.trim() === subject.subCode.trim()
            );

            if (existingSubject) {
                // Update existing subject marks
                existingSubject.internalMarks = subject.internalMarks ?? existingSubject.internalMarks;
                existingSubject.externalMarks = subject.externalMarks ?? existingSubject.externalMarks;
                existingSubject.marks = subject.marks ?? existingSubject.marks;
                existingSubject.result = subject.result ?? existingSubject.result;
            } else {
                // Add new subject
                semester.subjects.push({
                    subName: subject.subName,
                    subCode: subject.subCode,
                    subCredits: subject.subCredits || 0,
                    internalMarks: subject.internalMarks || 0,
                    externalMarks: subject.externalMarks || 0,
                    marks: subject.marks || 0,
                    result: subject.result || 'fail',
                });
            }
        });

        // Save the updated academic details
        await academicDetails.save();

        // Respond with success
        return responseHandler(res, {
            success: true,
            statusCode: 200,
            msg: 'Marks updated successfully',
            payload: { updatedSemester: semester },
        });
    } catch (error) {
        console.error(`updateMarksController: Error: ${error}`);
        return responseHandler(res, {
            success: false,
            statusCode: 500,
            msg: `Failed to update marks: ${error.message}`,
        });
    }
});
