import { Router } from "express";
import { signin, signup, googleAuth } from "../controllers/authController.js";
import { authLimiter } from "../middleware/rateLimiter.js";

const router = Router();

router.post("/signin", authLimiter, signin);

export default router;