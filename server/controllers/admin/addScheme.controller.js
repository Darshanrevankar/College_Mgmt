import { Scheme } from '../../models/scheme.model.js';
import responseHandler from '../../utils/responseHandler.js';

export const addScheme = async (req, res) => {
    try {
        const { scheme, branches } = req.body;

        if (!scheme || !branches) {
            return responseHandler(res, {
                success: false,
                statusCode: 400,
                msg: 'Please provide scheme and branches',
            });
        }

        const existingScheme = await Scheme.findOne({ scheme });
        if (existingScheme) {
            return responseHandler(res, {
                success: false,
                statusCode: 400,
                msg: 'Scheme already exists',
            });
        }

        const newScheme = new Scheme({
            scheme,
            branches
        });

        await newScheme.save();

        return responseHandler(res, {
            success: true,
            statusCode: 201,
            msg: 'Scheme added successfully',
            payload: newScheme
        });

    } catch (error) {
        console.error('Error adding scheme:', error);
        return responseHandler(res, {
            success: false,
            statusCode: 500,
            msg: 'Server error',
            error: error.message
        });
    }
};
