import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  console.warn("⚠️  Warning: GEMINI_API_KEY is not defined in the environment variables.");
}

const ai = new GoogleGenAI(apiKey ? { apiKey } : {});

export interface ResumeAnalysisResult {
  name?: string;
  skills: string[];
  experienceSummary: string;
  suggestions: string[];
}

/**
 * Analyzes resume text using Gemini API and returns a structured analysis.
 * @param resumeText Extracted text from the candidate's resume
 */
export const analyzeResume = async (resumeText: string): Promise<ResumeAnalysisResult> => {
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not configured.");
  }

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [
        `You are an expert ATS (Applicant Tracking System) and career coach.
        Analyze the following resume text. Extract the candidate's name (if found), key technical and soft skills, a brief summary of their work experience, and provide 3-5 constructive suggestions to improve their resume for career growth.
        
        Provide the output in JSON format matching this structure:
        {
          "name": "Candidate Name or empty string",
          "skills": ["skill1", "skill2"],
          "experienceSummary": "brief summary",
          "suggestions": ["suggestion1", "suggestion2"]
        }

        Resume Text:
        ${resumeText}`
      ],
      config: {
        responseMimeType: "application/json",
      },
    });

    const responseText = response.text;
    if (!responseText) {
      throw new Error("Empty response received from Gemini API.");
    }

    return JSON.parse(responseText) as ResumeAnalysisResult;
  } catch (error) {
    console.error("❌ Error analyzing resume with Gemini API:", error);
    throw error;
  }
};
