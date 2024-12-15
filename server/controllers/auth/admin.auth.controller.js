import bcrypt from "bcryptjs";
import responseHandler from "../../utils/responseHandler.js";
import { User } from "../../models/main.model.js";
import { generateToken } from "../../utils/generateToken.js";

export const createUser = async (req, res) => {
    try {
        const { name, id, email, password, word } = req.body;

        if (!name || !id || !email || !password || !word) {
            return responseHandler(res, {
                success: false,
                statusCode: 400,
                msg: "All fields are required",
            });
        }

        const existingEmail = await User.findOne({ email });
        const existingId = await User.findOne({ id });

        if (existingEmail || existingId) {
            return responseHandler(res, {
                success: false,
                statusCode: 400,
                msg: "Email or ID already exists",
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const hashedWord = await bcrypt.hash(word, 10);

        const newUser = new User({
            name,
            id,
            email,
            password: hashedPassword,
            word: hashedWord,
        });

        await newUser.save();

        const token = generateToken(newUser._id); 
        return responseHandler(res, {
            success: true,
            statusCode: 201,
            msg: "User created successfully",
            payload: { newUser, token },
        });
    } catch (err) {
        console.log("Error creating user:", err);
        return responseHandler(res, {
            success: false,
            statusCode: 500,
            msg: "Internal Server Error",
            error: err.message,
        });
    }
};

export const loginMainUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return responseHandler(res, {
                success: false,
                statusCode: 400,
                msg: "Email and password are required",
            });
        }

        const user = await User.findOne({ email });
        if (!user) {
            return responseHandler(res, {
                success: false,
                statusCode: 401,
                msg: "Invalid email or password",
            });
        }

        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) {
            return responseHandler(res, {
                success: false,
                statusCode: 401,
                msg: "Invalid email or password",
            });
        }

        const token = generateToken(user._id); 

        return responseHandler(res, {
            success: true,
            statusCode: 200,
            msg: "Login successful",
            payload: { token },
        });
    } catch (err) {
        console.log("Error logging in user:", err);
        return responseHandler(res, {
            success: false,
            statusCode: 500,
            msg: "Internal Server Error",
            error: err.message,
        });
    }
};

export const changePassword = async (req, res) => {
    try {
        const { email, word, newPassword } = req.body;

        if (!email || !word || !newPassword) {
            return responseHandler(res, {
                success: false,
                statusCode: 400,
                msg: "Email, word, and new password are required",
            });
        }

        const user = await User.findOne({ email });
        if (!user) {
            return responseHandler(res, {
                success: false,
                statusCode: 404,
                msg: "User not found",
            });
        }

        const isValidWord = await bcrypt.compare(word, user.word);
        

        if (!isValidWord) {
            return responseHandler(res, {
                success: false,
                statusCode: 400,
                msg: "The entered word is incorrect",
            });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);

        user.password = hashedPassword;
        await user.save();

        return responseHandler(res, {
            success: true,
            statusCode: 200,
            msg: "Password updated successfully",
        });
    } catch (err) {
        console.log("Error changing password:", err);
        return responseHandler(res, {
            success: false,
            statusCode: 500,
            msg: "Internal Server Error",
            error: err.message,
        });
    }
};

