import jwt from 'jsonwebtoken';
import responseHandler from '../utils/responseHandler.js';
import asyncHandler from 'express-async-handler';

const colors = {
    reset: "\x1b[0m",
    red: "\x1b[31m",
};

export const protect = asyncHandler(async (req, res, next) => {
    let token;
    console.log('In Protect')
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(' ')[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            req.user = decoded
            next(); 
        } catch (error) {
            console.log(`${colors.red}middleware/authMiddleware.js : Token verification failed: ${error}${colors.reset}`);
            return responseHandler(res, {
                success: false,
                statusCode: 401,
                msg: 'Token is not valid, authorization denied.',
            });
        }
    }
    if (!token) {
        console.log(`${colors.red}middleware/authMiddleware.js : No token provided${colors.reset}`);
        return responseHandler(res, {
            success: false,
            statusCode: 401,
            msg: 'Not authorized, no token',
        });
    }
});
