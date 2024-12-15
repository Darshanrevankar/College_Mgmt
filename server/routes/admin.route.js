import { Router } from "express";
import { addScheme } from "../controllers/admin/addScheme.controller.js";
import { updateScheme } from "../controllers/admin/updateSchema.controller.js";
import { getAllUserDetails } from "../controllers/admin/getAllUsersDetails.controller.js";
import { updateUserAcademics } from "../controllers/admin/addStudentMarks.controller.js";
import { getAllSchemes } from "../controllers/admin/getSchema.controller.js";


const router = Router();

router.route('/addScheme').post(addScheme);
router.route('/updateScheme').put(updateScheme);
router.route('/updateScheme').patch(updateScheme);
router.route('/getAllStudentsDetails').get(getAllUserDetails)
router.route('/updateStudentMarks').patch(updateUserAcademics)
router.route('/getScheme').get(getAllSchemes)
export default router;