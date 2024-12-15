import { Scheme } from '../../models/scheme.model.js';
import responseHandler from '../../utils/responseHandler.js';

const colors = {
    reset: "\x1b[0m",
    green: "\x1b[32m",
    red: "\x1b[31m",
    yellow: "\x1b[33m",
    blue: "\x1b[34m",
};

export const updateScheme = async (req, res) => {
    try {
        const { scheme, branches } = req.body;

        console.log(`${colors.blue}controllers/schemeController.js : Request to update scheme received${colors.reset}`);
        console.log(`${colors.yellow}controllers/schemeController.js : scheme:${colors.reset} ${scheme}, ${colors.yellow}branches:${colors.reset}`, branches);

        if (!scheme || !branches) {
            console.log(`${colors.red}controllers/schemeController.js : Missing scheme or branches in request body${colors.reset}`);
            return responseHandler(res, {
                success: false,
                statusCode: 400,
                msg: 'Please provide scheme and branches',
            });
        }

        const existingScheme = await Scheme.findOne({ scheme });

        if (!existingScheme) {
            console.log(`${colors.red}controllers/schemeController.js : Scheme not found${colors.reset}`);
            return responseHandler(res, {
                success: false,
                statusCode: 404,
                msg: 'Scheme not found',
            });
        }

        console.log(`${colors.blue}controllers/schemeController.js : Current scheme data before update:${colors.reset}`, existingScheme);

        existingScheme.branches = branches;

        console.log(`${colors.green}controllers/schemeController.js : Updating scheme branches...${colors.reset}`);

        const updatedScheme = await existingScheme.save();

        console.log(`${colors.green}controllers/schemeController.js : Scheme updated successfully${colors.reset}`);
        console.log(`${colors.blue}controllers/schemeController.js : Updated scheme data:${colors.reset}`, updatedScheme);

        return responseHandler(res, {
            success: true,
            statusCode: 200,
            msg: 'Scheme updated successfully',
            payload: updatedScheme
        });

    } catch (error) {
        
        console.log(`${colors.red}controllers/schemeController.js : Error updating scheme: ${error.message}${colors.reset}`);
        return responseHandler(res, {
            success: false,
            statusCode: 500,
            msg: 'Server error',
            error: error.message
        });
    }
};
