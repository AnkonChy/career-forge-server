import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  console.warn("⚠️  Warning: GEMINI_API_KEY is not defined in the environment variables.");
}

const ai = new GoogleGenAI(apiKey ? { apiKey } : {});

export interface InterviewQuestion {
  question: string;
  type: 'technical' | 'behavioral';
  idealAnswer: string;
}

export interface ResumeAnalysisResult {
  name?: string;
  skills: string[];
  experienceSummary: string;
  suggestions: string[];
  questions: InterviewQuestion[];
}

export const analyzeResume = async (
  fileBuffer: Buffer,
  mimeType: string
): Promise<ResumeAnalysisResult> => {
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not configured.");
  }

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [
        {
          parts: [
            {
              inlineData: {
                data: fileBuffer.toString("base64"),
                mimeType: mimeType,
              },
            },
            {
              text: `You are an expert ATS (Applicant Tracking System) and career coach.
              Analyze the attached resume. 
              1. Extract the candidate's name (if found).
              2. Extract key technical and soft skills.
              3. Provide a brief summary of their work experience.
              4. Provide 3-5 constructive suggestions to improve their resume for career growth.
              5. Generate exactly 5 tailored interview questions (3 technical and 2 behavioral) based on the candidate's skills and experience, along with a short ideal answer for each question.
              
              Provide the output ONLY in valid JSON format matching this exact structure:
              {
                "name": "Candidate Name or empty string",
                "skills": ["skill1", "skill2"],
                "experienceSummary": "brief summary",
                "suggestions": ["suggestion1", "suggestion2"],
                "questions": [
                  {
                    "question": "What is your experience with...?",
                    "type": "technical",
                    "idealAnswer": "An ideal answer would mention..."
                  }
                ]
              }`,
            },
          ],
        },
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
