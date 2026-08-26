import type { Request, Response } from "express";
import { analyzeResume } from "../services/geminiService.js";

/**
 * Controller: Resume Upload and Analysis
 * POST /api/resume/analyze
 *
 * Receives an uploaded resume file (PDF/DOCX) via multer,
 * passes the buffer to the Gemini service for AI analysis,
 * and returns a structured JSON response.
 */
export const uploadAndAnalyzeResume = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    // multer ফাইলটি req.file তে রাখে
    if (!req.file) {
      res.status(400).json({
        success: false,
        message: "No file uploaded. Please upload a PDF file.",
      });
      return;
    }

    const { buffer, mimetype } = req.file;

    console.log(`📄 Analyzing resume: ${req.file.originalname} (${mimetype})`);

    const analysisResult = await analyzeResume(buffer, mimetype);

    // 🛡️ Guardrail: Check if the uploaded file is a valid resume
    if (!analysisResult.isValidResume) {
      res.status(400).json({
        success: false,
        message:
          analysisResult.rejectionReason ||
          "The uploaded document is not a valid resume/CV. Please upload a professional resume.",
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: "Resume analyzed successfully.",
      data: analysisResult,
    });
  } catch (error) {
    console.error("❌ Resume controller error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to analyze resume. Please try again.",
    });
  }
};
