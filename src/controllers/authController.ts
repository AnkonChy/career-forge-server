import { type Request, type Response } from "express";
import z from "zod";
import bcrypt from "bcrypt";
import User from "../models/User.js";

export const signupSchema = z.object({
  firstName: z.string().min(2, "First name must be at least 2 characters"),
  lastName: z.string().min(2, "Last name must be at least 2 characters"),
  email: z.string().email("Invalid email format"),
  password: z
    .string()
    .min(6, "Password must be at least 6 characters")
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).+$/,
      "Password must contain uppercase, lowercase, number and special character",
    ),
});
export const signup = async (req: Request, res: Response): Promise<any> => {
  console.log("Signup form data:", req.body);
  //   const result = signupSchema.safeParse(req.body);

  //   if (!result.success) {
  //     const errors: Record<string, string> = {};

  //     result.error.issues.forEach((err) => {
  //       console.log(err);
  //       const field = String(err.path[0]);
  //       errors[field] = err.message;
  //     });
  //     return res
  //       .status(400)
  //       .json({ message: "Validation failed", errors: errors });
  //   }

  //   const { firstName, lastName, password } = req.body;
  //   const email = req.body.email.toLowerCase();

  //   try {
  //     // 2. Check if email already exists
  //     const existingUser = await User.findOne({ where: { email } });
  //     if (existingUser) {
  //       return res.status(409).json({ message: "Email already in use" });
  //     }

  //     // 3. Hash the password (10 = salt rounds)
  //     const hashedPassword = await bcrypt.hash(password, 10);

  //     // 4. Insert new user into DB
  //     const newUser = await User.create({
  //       firstName,
  //       lastName,
  //       email,
  //       password: hashedPassword,
  //     });

  //     // 5. Return success (never return password)
  //     return res.status(201).json({
  //       message: "User registered successfully",
  //       user: {
  //         id: newUser.id,
  //         firstName: newUser.firstName,
  //         lastName: newUser.lastName,
  //         email: newUser.email,
  //         created_at: newUser.created_at,
  //       },
  //     });
  //   } catch (err) {
  //     console.error("Signup error:", err);
  //     return res.status(500).json({ message: "Internal server error" });
  //   }
};
