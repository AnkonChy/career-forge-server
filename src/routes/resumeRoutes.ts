import { Router } from "express";
import multer from "multer";
import { uploadAndAnalyzeResume } from "../controllers/resumeController.js";

const router = Router();

// multer কনফিগারেশন: ফাইল মেমোরিতে রাখব (ডিস্কে সেভ করব না)
const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // সর্বোচ্চ ৫ MB ফাইল আপলোড করা যাবে
  },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype === "application/pdf") {
      cb(null, true);
    } else {
      cb(new Error("Only PDF files are allowed."));
    }
  },
});

// POST /api/resume/analyze
// multer error handling wrapper
router.post("/analyze", (req, res, next) => {
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
}, uploadAndAnalyzeResume);

export default router;
