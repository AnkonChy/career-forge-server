import { Router } from "express";
import multer from "multer";
import { uploadAndAnalyzeResume } from "../controllers/resumeController.js";
import { rateLimit } from "express-rate-limit";
import { authenticateToken } from "../middleware/authMiddleware.js";
import path from "path";

const router = Router();

const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
  fileFilter: (_req, file, cb) => {
    const extName = path.extname(file.originalname).toLowerCase() === ".pdf";

    const mimeType =
      file.mimetype === "application/pdf" ||
      file.mimetype === "application/octet-stream";

    if (extName && mimeType) {
      cb(null, true);
    } else {
      // cb(new Error("Only PDF files are allowed."));
      cb(new Error(`Only PDF files are allowed. Received: ${file.mimetype}`));
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
  authenticateToken,
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
