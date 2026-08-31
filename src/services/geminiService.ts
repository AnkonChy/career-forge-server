import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  console.warn(
    "⚠️  Warning: GEMINI_API_KEY is not defined in the environment variables.",
  );
}

const ai = new GoogleGenAI(apiKey ? { apiKey } : {});

export interface InterviewQuestion {
  question: string;
  type: "technical" | "behavioral";
  idealAnswer: string;
}

export interface ResumeAnalysisResult {
  isValidResume: boolean;
  rejectionReason?: string;
  name?: string;
  skills?: string[];
  experienceSummary?: string;
  suggestions?: string[];
  questions?: InterviewQuestion[];
}

export const analyzeResume = async (
  fileBuffer: Buffer,
  mimeType: string,
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

STEP 1: Examine the attached document carefully and verify if it is genuinely a Candidate's Resume, CV, or Professional Profile.
A valid resume typically contains elements like: contact information, education, work experience, projects, or professional skills.

If the document is NOT a resume/CV (e.g., it is a medical report/prescription, university assignment/homework, invoice, receipt, book, syllabus, or unrelated document):
Respond strictly with this JSON:
{
  "isValidResume": false,
  "rejectionReason": "The uploaded document is not a valid resume or CV. Please upload a professional resume.",
  "skills": [],
  "experienceSummary": "",
  "suggestions": [],
  "questions": []
}

STEP 2: If the document IS a valid resume/CV:
1. Extract the candidate's name (if found).
2. Extract key technical and soft skills.
3. Provide a brief summary of their work experience.
4. Provide 3-5 constructive suggestions to improve their resume for career growth.
5. Generate exactly 5 tailored interview questions, categorized and ordered precisely as follows.
   IMPORTANT RULE: Keep ALL questions short and concise — ideally one line, maximum two lines. Do NOT write long, multi-clause questions. Be direct and simple. For example, instead of "Can you explain the concept of Promises in JavaScript and how they are used to handle asynchronous operations, especially in the context of Node.js and Express.js applications?", simply ask "What are Promises in JavaScript and how do they work?".

   - Question 1 (Type: "technical"): A short, one-line skill-based concept question on a primary skill from the resume (e.g., "What is a closure in JavaScript?", "What is the virtual DOM in React?", "What are design heuristics in UX?"). If the candidate has very few skills, ask about their most recent education or degree instead.
   - Question 2 (Type: "technical"): Another short, one-line concept question on a different skill from the resume. If not enough distinct skills exist, ask about their educational background or certifications instead.
   - Question 3 (Type: "behavioral"): A brief project challenge question — ask which feature or part of a specific project was the hardest to build and why.
   - Question 4 (Type: "behavioral"): A brief project experience question — ask the candidate to share their key learnings or experience from one of their projects.
   - Question 5 (Type: "technical"): A short, beginner-level problem-solving challenge RELEVANT to the candidate's career field. For developers, give a simple coding problem with a concrete input/output example (e.g., "Write a function that finds the largest number in an array. Input: [3,7,2,9], Output: 9"). For UI/UX designers, give a short design challenge. For non-tech fields, give a domain-relevant practical problem. NEVER ask a coding question to a non-programmer. NEVER repeat "filter even numbers" — always vary the problem.

Respond strictly in valid JSON format matching this exact structure:
{
  "isValidResume": true,
  "name": "Candidate Name or empty string",
  "skills": ["skill1", "skill2"],
  "experienceSummary": "brief summary",
  "suggestions": ["suggestion1", "suggestion2"],
  "questions": [
    {
      "question": "Structured question based on the rules above...",
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
        thinkingConfig: {
          thinkingBudget: 0,
        },
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
