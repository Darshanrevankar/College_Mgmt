import uploadImage from '../../config/multer.config.js';
import asyncHandler from 'express-async-handler';
import responseHandler from '../../utils/responseHandler.js';
import { User } from '../../models/user.model.js';
import { Academics } from '../../models/academics.model.js';
import { Scheme } from '../../models/scheme.model.js';
import processImage from '../../utils/imageUpload.js';

export const imageUploadController = asyncHandler(async (req, res) => {
    try {
        console.log('imageUploadController initiated');

        if (!req.body) {
            console.log('\ncontrollers/imageUploadController : no {req.body} : ', req.body);
            return responseHandler(res, {
                success: false,
                statusCode: 400,
                msg: 'Some fields are missing',
                error: 'Something went wrong',
            });
        }

        if (!req.file) {
            console.log('\ncontrollers/imageUploadController : no {req.file} : ', req.file);
            return responseHandler(res, {
                success: false,
                statusCode: 400,
                msg: 'No file uploaded',
            });
        }

        const { sem, usn } = req.body;
        const user = await User.findOne({ usn: usn });

        if (!user) {
            console.log('\ncontrollers/imageUploadController : no {req.user} found : ', req.user);
            return responseHandler(res, {
                success: false,
                statusCode: 404,
                msg: 'User not found',
                error: '404 No user found',
            });
        }

        const academicDetails = await Academics.findById(user.academics);
        if (!academicDetails) {
            console.log('\ncontrollers/imageUploadController : no {user.academics} : ', user.academics);
            return responseHandler(res, {
                success: false,
                statusCode: 404,
                msg: 'Academics details not found',
                error: '404 No Academics details found',
            });
        }

        const processedData = await processImage(req.file);
        if (!processedData) {
            console.log('\ncontrollers/imageUploadController : error in processing image {processedData} : ', processedData);
            return responseHandler(res, {
                success: false,
                statusCode: 500,
                msg: 'Error processing image',
                error: 'Something went wrong',
            });
        }

        console.log('\ncontrollers/imageUploadController processed image {processedData} : ', processedData);
        const { academicData } = JSON.parse(processedData);
        console.log(academicData);

        const scheme = await Scheme.findOne({
            scheme: user.scheme,
            branches: { $elemMatch: { branchName: user.branch } },
        });

        if (!scheme) {
            console.log('\ncontrollers/imageUploadController : no scheme found for branch : ', user.branch);
            return responseHandler(res, {
                success: false,
                statusCode: 404,
                msg: 'Scheme details not found',
                error: '404 No scheme details found',
            });
        }

        const branch = scheme.branches.find((b) => b.branchName === user.branch);
        const semester = branch.semesters.find((s) => s.sem === sem);

        if (!semester) {
            console.log('\ncontrollers/imageUploadController : no semester found : ', sem);
            return responseHandler(res, {
                success: false,
                statusCode: 404,
                msg: 'Semester details not found',
                error: '404 No semester details found',
            });
        }

        // Validate subjects before proceeding
        const missingSubjects = academicData.filter((subject) => {
            const schemeSubject = semester.subjects.find((s) => {
                const isExactMatch = s.subCode.trim() === subject.subCode.trim();
                const isPartialMatch =
                    s.subCode.trim().substring(0, 2) === subject.subCode.trim().substring(0, 2) &&
                    s.subCode.trim().slice(-2) === subject.subCode.trim().slice(-2);
                return isExactMatch || isPartialMatch;
            });

            const schemeSubName = semester.subjects.find((s) => s.subName.toLowerCase() === subject.subName.toLowerCase());
            return !schemeSubject && !schemeSubName;
        });

        if (missingSubjects.length > 0) {
            console.log(`Subjects not found in scheme: ${missingSubjects.map((s) => s.subCode).join(', ')}`);
            return responseHandler(res, {
                success: false,
                statusCode: 400,
                msg: `Some subjects not found in scheme: ${missingSubjects.map((s) => s.subCode).join(', ')}`,
            });
        }

        const updatedSubjects = academicData.map((subject) => {
            const schemeSubject = semester.subjects.find((s) => {
                const isExactMatch = s.subCode.trim() === subject.subCode.trim();
                const isPartialMatch =
                    s.subCode.trim().substring(0, 2) === subject.subCode.trim().substring(0, 2) &&
                    s.subCode.trim().slice(-2) === subject.subCode.trim().slice(-2);
                return isExactMatch || isPartialMatch;
            });

            const schemeSubName = semester.subjects.find((s) => s.subName.toLowerCase() === subject.subName.toLowerCase());

            return {
                subName: subject.subName,
                subCode: subject.subCode,
                subCredits: schemeSubject ? schemeSubject.subCredits : schemeSubName?.subCredits || 0,
                internalMarks: subject.internalMarks,
                externalMarks: subject.externalMarks,
                marks: subject.totalMarks,
                result: subject.result,
            };
        });

        const semesterToUpdate = academicDetails.semesters.find((s) => s.sem === sem);
        if (semesterToUpdate) {
            semesterToUpdate.subjects = updatedSubjects;
        } else {
            academicDetails.semesters.push({
                sem: sem,
                subjects: updatedSubjects,
            });
        }

        await academicDetails.save();

        return responseHandler(res, {
            success: true,
            statusCode: 200,
            msg: 'Image processed and subjects updated successfully',
            payload: { academicData: updatedSubjects },
        });
    } catch (error) {
        console.error(`controllers/imageController.js: Error: ${error}`);
        return responseHandler(res, {
            success: false,
            statusCode: 500,
            msg: `Image processing failed: ${error.message}`,
        });
    }
});

export { uploadImage };
