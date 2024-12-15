import { Scheme } from '../../models/scheme.model.js';
import responseHandler from '../../utils/responseHandler.js';

export const getAllSchemes = async (req, res) => {
    try {
        const schemes = await Scheme.find()
            .populate({
                path: 'branches',
                populate: {
                    path: 'semesters',
                    populate: {
                        path: 'subjects'
                    }
                }
            });

        // If no schemes found
        if (!schemes || schemes.length === 0) {
            return responseHandler(res, {
                success: true,
                statusCode: 404,
                msg: 'No schemes found',
                payload: {},
            });
        }

        // Send the fetched data as a response
        return responseHandler(res, {
            success: true,
            statusCode: 200,
            msg: 'Schemes data found',
            payload: { schemes },
        });
    } catch (error) {
        console.error('Error fetching schemes:', error);
        return responseHandler(res, {
            success: false,
            statusCode: 500,
            msg: 'Error fetching schemes',
            payload: { error },
        });
    }
};