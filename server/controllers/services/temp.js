import expressAsyncHandler from 'express-async-handler';

import Tesseract from 'tesseract.js';
import fs from 'fs'
import path from 'path';

async function extractTextFromImage(imagePath) {
    const { data: { text } } = await Tesseract.recognize(imagePath, 'eng', {
    logger: (m) => console.log(m), // Optional: track progress
  });
  return text;
}

function parseTableData(text) {
    const rows = text.split('\n');
    const tableData = [];
  
    // Define a regular expression to capture relevant data
    const rowRegex = /(\d{2}[A-Z]{2}\d{2,})\s+([A-Z\s]+)\s+(\d+)\s+(\d+)\s+(\d+)\s+([A-Z])\s+(\d{4}-\d{2}-\d{2})/;
  
    rows.forEach(row => {
      const match = rowRegex.exec(row);
      if (match) {
        const [_, subjectCode, subjectName, internalMarks, externalMarks, totalMarks, result] = match;
        tableData.push({
          subjectCode: subjectCode.trim(),
          subjectName: subjectName.trim(),
          marks: totalMarks.trim(),
          result: result.trim(),
        });
      }
    });
  
    return tableData;
  }

  async function extractDataFromImage(imagePath) {
    try {
      const text = await extractTextFromImage(imagePath);
      const tableData = parseTableData(text);
      return tableData;
    } catch (error) {
      console.error("Error extracting data:", error);
    }
}

export {extractDataFromImage}



