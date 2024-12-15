import mongoose from "mongoose";

const subjectSchema = new mongoose.Schema({
    subName: { type: String, required: true },
    subCode: { type: String, required: true },
    subCredits: { type: Number, required: true },
    internalMarks: {
        type: Number,
    },
    externalMarks: { type: Number, min: 0, max: 100, default: 0 },
    marks: { type: Number, min: 0, max: 100, default: 0 },
    result: { type: String, enum: ["pass", "fail", "p", "f"], lowercase: true },
});

const semesterSchema = new mongoose.Schema({
    sem: { type: String },
    subjects: [subjectSchema],
    sgpa: { type: Number, min: 0, max: 10, default: 0 },
});

const academicSchema = new mongoose.Schema({
    branchName: { type: String, required: true },
    semesters: [semesterSchema],
    cgpa: { type: Number, min: 0, max: 10, default: 0 },
});

// Pre-save hook to calculate SGPA and CGPA
academicSchema.pre("save", function (next) {
    if (!this.semesters || this.semesters.length === 0) {
        this.cgpa = 0;
        return next();
    }

    let totalCredits = 0;
    let totalWeightedPoints = 0;

    this.semesters.forEach((semester) => {
        if (!semester.subjects || semester.subjects.length === 0) {
            semester.sgpa = 0; // Ensure SGPA is set even if no subjects
            return;
        }

        let semTotalCredits = 0;
        let semWeightedPoints = 0;

        semester.subjects.forEach((subject) => {
            // Skip subjects with zero marks
            if (subject.marks && subject.subCredits && subject.marks > 0) {
                const gradePoint = calculateGradePoint(subject.marks);
                semWeightedPoints += gradePoint * subject.subCredits;
                semTotalCredits += subject.subCredits;
            }
        });

        // Calculate SGPA for the semester
        semester.sgpa = semTotalCredits > 0 ? semWeightedPoints / semTotalCredits : 0;

        // Only include semesters with non-zero SGPA in CGPA calculation
        if (semester.sgpa > 0) {
            totalCredits += semTotalCredits;
            totalWeightedPoints += semWeightedPoints;
        }
    });

    // Calculate CGPA considering only valid semesters
    this.cgpa = totalCredits > 0 ? totalWeightedPoints / totalCredits : 0;

    next();
});

function calculateGradePoint(marks) {
    if (marks >= 90) return 10;
    if (marks >= 80) return 9;
    if (marks >= 70) return 8;
    if (marks >= 60) return 7;
    if (marks >= 50) return 6;
    if (marks >= 40) return 5;
    return 0; // Fail
}

export const Academics = mongoose.model("Academics", academicSchema);
