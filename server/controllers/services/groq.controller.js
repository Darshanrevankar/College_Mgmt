import processImage from '../../utils/imageUpload.js';
import uploadImage from '../../config/multer.config.js';
import asyncHandler from 'express-async-handler';
import responseHandler from '../../utils/responseHandler.js';
import { User } from '../../models/user.model.js';
import { Academics } from '../../models/academics.model.js';
import { Scheme } from '../../models/scheme.model.js';
import { Groq } from 'groq-sdk';
import fs from 'fs';
import path from 'path';

const groq = new Groq();

const encodeImage = (imagePath) => {
  return fs.readFileSync(imagePath, { encoding: 'base64' });
};

export const imageUploadGroqController = asyncHandler(async (req, res) => {
    try {
        console.log('imageUploadController initiated');

        if (!req.body) {
            console.log('No body in request:', req.body);
            return responseHandler(res, { success: false, statusCode: 400, msg: 'Some fields are missing' });
        }

        if (!req.file) {
            console.log('No file uploaded:', req.file);
            return responseHandler(res, { success: false, statusCode: 400, msg: 'No file uploaded' });
        }

        const { sem } = req.body;
        const userId = req.user.id;
        const user = await User.findById(userId);

        if (!user) {
            console.log('User not found:', user);
            return responseHandler(res, { success: false, statusCode: 404, msg: 'User not found' });
        }

        const academicDetails = await Academics.findById(user.academics);
        if (!academicDetails) {
            console.log('Academics details not found:', academicDetails);
            return responseHandler(res, { success: false, statusCode: 404, msg: 'Academics details not found' });
        }

        // Convert the image to base64
        const imagePath = path.resolve('../uploads', req.file.filename);
        const base64Image = encodeImage(imagePath);

        // Groq API call to analyze the image
        const chatCompletion = await groq.chat.completions.create({
            messages: [
                {
                    role: 'user',
                    content: [
                        { type: 'text', text: 'What is this image about?' },
                        { type: 'image_url', image_url: { url: `data:image/jpeg;base64,${base64Image}` } }
                    ]
                }
            ],
            model: 'llama-3.2-11b-vision-preview',
        });

        // Extracting academic data from Groq response
        const academicData = JSON.parse(chatCompletion.choices[0].message.content);
        if (!academicData || academicData.length === 0) {
            console.log('No relevant data found in image:', academicData);
            return responseHandler(res, { success: false, statusCode: 400, msg: 'No relevant academic data found in image' });
        }

        // Extract semester and subject details
        const scheme = await Scheme.findOne({
            scheme: user.scheme,
            branches: { $elemMatch: { branchName: user.branch } }
        });

        if (!scheme) {
            console.log('No scheme found for branch:', user.branch);
            return responseHandler(res, { success: false, statusCode: 404, msg: 'Scheme details not found' });
        }

        const branch = scheme.branches.find(b => b.branchName === user.branch);
        const semester = branch.semesters.find(s => s.sem === sem);

        if (!semester) {
            console.log('Semester not found:', sem);
            return responseHandler(res, { success: false, statusCode: 404, msg: 'Semester details not found' });
        }

        // Validate subjects and update the academic data
        const updatedSubjects = academicData.map(subject => {
            const schemeSubject = semester.subjects.find(s => s.subCode.trim() === subject.subCode.trim());
            return {
                subName: subject.subName,
                subCode: subject.subCode,
                subCredits: schemeSubject ? schemeSubject.subCredits : 'Not found',
                internalMarks: subject.internalMarks,
                externalMarks: subject.externalMarks,
                marks: subject.totalMarks,
                result: subject.result
            };
        });

        // Update the user's academic data
        const semesterToUpdate = academicDetails.semesters.find(s => s.sem === sem);
        if (semesterToUpdate) {
            semesterToUpdate.subjects = updatedSubjects;
        } else {
            academicDetails.semesters.push({ sem: sem, subjects: updatedSubjects });
        }

        await academicDetails.save();

        // Clean up uploaded file
        fs.unlinkSync(imagePath);

        return responseHandler(res, {
            success: true,
            statusCode: 200,
            msg: 'Image processed and subjects updated successfully',
            payload: { academicData: updatedSubjects },
        });
    } catch (error) {
        console.error('Error processing image:', error);
        return responseHandler(res, { success: false, statusCode: 500, msg: `Image processing failed: ${error.message}` });
    }
});
