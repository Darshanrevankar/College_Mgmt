import asyncHandler from "express-async-handler";
import { Academics } from "../../models/academics.model.js";
import responseHandler from "../../utils/responseHandler.js";

const  updateUserAcademics = asyncHandler(async (req, res) => {
    const { userId, sem, subjectUpdate } = req.body;

    // Validate input
    if (!userId || !sem || !subjectUpdate || typeof subjectUpdate !== "object") {
        return responseHandler(res, {
            success: false,
            statusCode: 400,
            msg: "Invalid input. 'userId', 'sem', and 'subjectUpdate' are required.",
        });
    }

    const { subCode, subName, subCredits, internalMarks, externalMarks, marks, result } = subjectUpdate;

    if (!subCode || !subName) {
        return responseHandler(res, {
            success: false,
            statusCode: 400,
            msg: "Invalid input. 'subCode' and 'subName' are required for subject updates.",
        });
    }

    // Find the academic record for the user
    let academics = await Academics.findOne({ userId });

    // If no record exists, create a new one
    if (!academics) {
        academics = new Academics({ userId, semesters: [] });
    }

    // Find or create the semester
    let semester = academics.semesters.find((s) => s.sem === sem);
    if (!semester) {
        semester = { sem, subjects: [] };
        academics.semesters.push(semester);
    }

    // Find or create the subject
    let subject = semester.subjects.find((s) => s.subCode === subCode);
    if (!subject) {
        subject = {
            subCode,
            subName,
            subCredits,
            internalMarks,
            externalMarks,
            marks,
            result,
        };
        semester.subjects.push(subject);
    } else {
        // Update the subject details
        subject.subName = subName || subject.subName;
        subject.subCredits = subCredits || subject.subCredits;
        subject.internalMarks = internalMarks || subject.internalMarks;
        subject.externalMarks = externalMarks || subject.externalMarks;
        subject.marks = marks || subject.marks;
        subject.result = result || subject.result;
    }

    // Save the academic record
    await academics.save();

    return responseHandler(res, {
        success: true,
        statusCode: 200,
        msg: "Subject marks updated successfully.",
        payload: academics,
    });
});

export {  updateUserAcademics };
