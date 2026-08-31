import { Router } from "express";
import multer from "multer";
import { uploadAndAnalyzeResume } from "../controllers/resumeController.js";
import { rateLimit } from "express-rate-limit";

const router = Router();

const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype === "application/pdf") {
      cb(null, true);
    } else {
      cb(new Error("Only PDF files are allowed."));
    }
  },
});

const resumeAnalyzerLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: {
    success: false,
    message:
      "Too many resume analysis requests from this IP, please try again after 15 minutes.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

router.post(
  "/analyze",
  resumeAnalyzerLimiter,
  (req, res, next) => {
    upload.single("resume")(req, res, (err: any) => {
      if (err) {
        console.error("❌ Multer error:", err.message);
        return res.status(400).json({
          success: false,
          message: err.message || "File upload failed.",
        });
      }
      next();
    });
  },
  uploadAndAnalyzeResume,
);

export default router;
