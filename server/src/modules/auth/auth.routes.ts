import { Router } from "express";
import { googleSignup } from "./google-auth.controller.js";
import { adminLogin } from "./admin-auth.controller.js";

const router = Router();

router.post("/google", googleSignup);
router.post("/admin/login", adminLogin);

export default router;