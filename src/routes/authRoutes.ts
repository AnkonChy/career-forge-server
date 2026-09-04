import { Router } from "express";
import { authLimiter } from "../middleware/rateLimiter.js";
import { signup,login,logout } from "../controllers/authController.js";


const router = Router();

router.post("/signup", authLimiter, signup);
router.post("/login", login);
router.post("/logout", logout);

export default router;