import type { Request, Response } from "express";
import { analyzeResume } from "../services/geminiService.js";
import { fileTypeFromBuffer } from "file-type";

export const uploadAndAnalyzeResume = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    if (!req.file) {
      res.status(400).json({
        success: false,
        message: "No file uploaded. Please upload a PDF file.",
      });
      return;
    }

    const { buffer, mimetype } = req.file;
    const detectedType = await fileTypeFromBuffer(buffer);

    if (!detectedType || detectedType.mime !== "application/pdf") {
      res.status(400).json({
        success: false,
        message:
          "Fake or corrupted file detected. Only genuine PDF files are allowed.",
      });
      return;
    }

    // const analysisResult = await analyzeResume(buffer, mimetype);
    const analysisResult = await analyzeResume(buffer, detectedType.mime);

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
