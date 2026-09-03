import { Router } from "express";
import { authLimiter } from "../middleware/rateLimiter.js";
import { signup } from "../controllers/authController.js";

const router = Router();

router.post("/signup", authLimiter, signup);

export default router;