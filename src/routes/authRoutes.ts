import { Router } from "express";
import { authLimiter } from "../middleware/rateLimiter.js";
import { signup } from "../controllers/authController.js";
import { login } from "../controllers/authController.js";

const router = Router();

router.post("/signup", authLimiter, signup);
router.post("/login", login);

export default router;