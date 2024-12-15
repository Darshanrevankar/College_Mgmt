import { fileManager, model } from '../config/googleAI.config.js';
import fs from 'fs';
import path from 'path';

const processImage = async (file, subDetails) => {
    const uploadDir = path.resolve('../uploads');
    if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
    }

    try {
        console.log("Image upload started");

        if (!file) {
            throw new Error('No file provided');
        }
        const validMimeTypes = ['image/jpeg', 'image/png', 'application/pdf'];
        if (!validMimeTypes.includes(file.mimetype)) {
            throw new Error('Invalid file type. Only JPEG, PNG, or PDF files are allowed');
        }

        const uploadResult = await fileManager.uploadFile(file.path, {
            mimeType: file.mimetype,
            displayName: file.originalname,
        });

        const result = await model.generateContent([
            `Analyze the following subDetails : ${subDetails}`,
            "Extract academic data such as subject Name, subject Code, Marks, result from this image and match the subCode and subName from 'subDetails' and return the result in JSON format  academicData: [{subName:'Replace it with extracted Subject name', subCode :'Replace it with the extrcated subject code and compare it with subDetails's subCode', subCredits: 'Decode the subCode from the 'subdetails' and try to match with extracted subject code then update the subCredits from subDetails', internalMarks: '', externalMarks: ''  ,totalMarks: 'Extrated Marks from the image', result : 'if P then pass else if F then fail'}].",
            "If no relevant information is found, return empty JSON as academicData: []",
            {
                fileData: {
                    fileUri: uploadResult.file.uri,
                    mimeType: uploadResult.file.mimeType,
                },
            },
        ]);
        fs.unlinkSync(file.path);

        return result.response.text();

    } catch (error) {
        console.error('Error processing image:', error.message);
        throw new Error(`Image processing failed: ${error.message}`);
    }
};

export default processImage;
