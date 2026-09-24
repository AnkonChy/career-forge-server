import { Router } from "express";
import { courses } from "../controllers/courseController.js";

const router = Router();


router.get("/course", courses);
// router.post("/course", courses);

export default router;
