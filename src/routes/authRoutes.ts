import { Router } from "express";
import { authLimiter } from "../middleware/rateLimiter.js";
import { signup,login,logout,users } from "../controllers/authController.js";


const router = Router();

router.post("/signup", authLimiter, signup);
router.post("/login", login);
router.post("/logout", logout);
router.get("/users", users);

export default router;