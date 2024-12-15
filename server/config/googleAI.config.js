import dotenv from 'dotenv';
dotenv.config();

import { GoogleAIFileManager } from "@google/generative-ai/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = process.env.API_KEY;
if (!API_KEY) {
    throw new Error('API_KEY is not defined. Check your .env file and dotenv setup.');
}

const fileManager = new GoogleAIFileManager(API_KEY);
const genAI = new GoogleGenerativeAI(API_KEY);

const model = genAI.getGenerativeModel({
    model: "gemini-1.5-flash",
    generationConfig: {
        responseMimeType: "application/json",
    },
});

export { fileManager, model };
