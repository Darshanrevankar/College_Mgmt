import { Router } from "express";
import { protect } from "../middleware/auth.middleware.js";
import { getSemesterSubjects, getUserDetails, updateSemesterMarks } from "../controllers/services/academics.controllers.js";
import { imageUploadController, uploadImage} from "../controllers/services/imageUpload.controller.js";
import { updateMarksController } from "../controllers/services/marks.controller.js";
// import { imageUploadGroqController } from "../controllers/services/groq.controller.js";

const router = Router();

router.route('/academics').get(protect,getUserDetails);
router.route('/academics/updateMarks').post(protect,updateSemesterMarks)
router.route('/academics/getSubjects').post(protect,getSemesterSubjects)
router.route('/upload-image').post(uploadImage,imageUploadController);
router.route('/academics/addMarks').post(updateMarksController);
// router.route('/upload-groq').post(protect,uploadImage,imageUploadGroqController)
export default router;