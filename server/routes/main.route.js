import { Router } from "express";
import { changePassword, createUser, loginMainUser } from "../controllers/auth/admin.auth.controller.js";

const router = Router();

router.route('/admin-register').post(createUser);
router.route('/admin-login').post(loginMainUser);
router.route('/changepassword').post(changePassword);

export default router;