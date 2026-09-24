import type { Request, Response } from "express";
import Course from "../models/Course.js";

export const courses = async (req: Request, res: Response): Promise<any> => {
  try {
    const allCourses = await Course.findAll();

    return res.status(200).json({
      message: "Courses fetched successfully",
      courses: allCourses,
    });
  } catch (error: any) {
    console.error("Get all courses error:", error);
    return res.status(500).json({
      message: "Something went wrong",
      error: error.message,
    });
  }
};