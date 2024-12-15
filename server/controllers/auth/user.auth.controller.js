import asynchHandler from "express-async-handler";
import bcrypt from "bcryptjs";
import responseHandler from "../../utils/responseHandler.js";
import { User } from "../../models/user.model.js";
import { Scheme } from "../../models/scheme.model.js";
import { Academics } from "../../models/academics.model.js";
import { generateToken } from "../../utils/generateToken.js";

const colors = {
    reset: "\x1b[0m",
    green: "\x1b[32m",
    red: "\x1b[31m",
    yellow: "\x1b[33m",
    blue: "\x1b[34m",
};

export const registerUser = asynchHandler(async (req, res) => {
    try {
        const { name, email, usn, password, branch, scheme } = req.body;

        if (!name || !email || !usn || !password || !scheme || !branch) {
            throw new Error(
                `${colors.red}controllers/auth/user.auth : Please fill in all fields${colors.reset}`
            );
        }

        console.log(`${colors.blue}controllers/auth/user.auth :${colors.reset}`, req.body);

        const existingEmail = await User.findOne({ email });
        const existingUSN = await User.findOne({ usn });

        if (existingEmail || existingUSN) {
            console.log(`${colors.red}controllers/auth/user.auth : Email or USN already exists${colors.reset}`);
            return responseHandler(res, {
                success: false,
                statusCode: 400,
                message: "Email or USN already exists",
                error: "User Already Exists!!!",
            });
        }

        const selectedScheme = await Scheme.findOne({ scheme });
        console.log(
            `${colors.blue}controllers/auth/user.auth : selected scheme ${colors.reset}`,
            selectedScheme ? selectedScheme.scheme : "Not Found"
        );

        if (!selectedScheme) {
            return responseHandler(res, {
                success: false,
                statusCode: 404,
                msg: "No matching scheme or branch found",
            });
        }

        const branchData = selectedScheme.branches.find((b) => b.branchName === branch);
        console.log(
            `${colors.blue}controllers/auth/user.auth : Branch : ${colors.reset}`,
            branchData ? branchData.branchName : "Not Found"
        );

        if (!branchData) {
            return responseHandler(res, {
                success: false,
                statusCode: 404,
                msg: "Branch not found in selected scheme",
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const academicSemesters = branchData.semesters.map((semester) => ({
            sem: semester.sem,
            subjects: semester.subjects.map((subject) => ({
                subName: subject.subName,
                subCode: subject.subCode,
                subCredits: subject.subCredits,
                internalMarks: 0,
                externalMarks: 0,
                marks: 0,
                result: "p", 
            })),
            sgpa: 0, 
        }));

        const newAcademicData = new Academics({
            branchName: branchData.branchName,
            schemeName: selectedScheme.scheme,
            semesters: academicSemesters,
            cgpa: 0, // Default CGPA
        });

        console.log(`${colors.green}controllers/auth/user.auth : Saving new academic data...${colors.reset}`);
        const academicsData = await newAcademicData.save();

        console.log(`${colors.green}controllers/auth/user.auth : Saving new user data...${colors.reset}`);
        const user = new User({
            name,
            email,
            usn,
            password: hashedPassword,
            branch,
            scheme,
            academics: academicsData._id,
        });

        const userData = await user.save();
        const token = generateToken(userData._id);
        console.log(`${colors.green}controllers/auth/user.auth : User created successfully:${colors.reset}`, userData);

        return responseHandler(res, {
            success: true,
            statusCode: 200,
            msg: "User created successfully",
            payload: { userData, academicsData, token },
        });
    } catch (err) {
        console.log(`${colors.red}controllers/auth/user.auth : catch Block : ${err}${colors.reset}`);
        return responseHandler(res, {
            success: false,
            statusCode: 500,
            msg: "Internal Server Error",
            error: err.message,
        });
    }
});


export const loginUser = asynchHandler(async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            console.log(`${colors.red}controllers/auth/user.auth : Missing email or password${colors.reset}`);
            return responseHandler(res, {
                success: false,
                statusCode: 400,
                msg: 'Email and password are required',
            });
        }

        console.log(`${colors.blue}controllers/auth/user.auth : Attempting login for email: ${email}${colors.reset}`);

        const user = await User.findOne({ email });
        if (!user) {
            console.log(`${colors.red}controllers/auth/user.auth : User not found for email: ${email}${colors.reset}`);
            return responseHandler(res, {
                success: false,
                statusCode: 401,
                msg: 'Invalid email or password',
            });
        }

        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) {
            console.log(`${colors.red}controllers/auth/user.auth : Invalid password for email: ${email}${colors.reset}`);
            return responseHandler(res, {
                success: false,
                statusCode: 401,
                msg: 'Invalid email or password',
            });
        }

        const token = generateToken(user._id);
        console.log(`${colors.green}controllers/auth/user.auth : Login successful for email: ${email}${colors.reset}`);

        return responseHandler(res, {
            success: true,
            statusCode: 200,
            msg: 'Login successful',
            payload: { token },
        });

    } catch (err) {
        console.log(`${colors.red}controllers/auth/user.auth : catch Block : ${err}${colors.reset}`);
        responseHandler(res, {
            success: false,
            statusCode: 500,
            msg: 'Internal Server Error',
        });
    }
});

