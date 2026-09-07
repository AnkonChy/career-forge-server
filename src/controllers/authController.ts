import { type Request, type Response } from "express";
import z from "zod";
import bcrypt from "bcrypt";
import User from "../models/User.js";
import {
  generateRefreshToken,
  generateToken,
  verifyRefreshToken,
  verifyToken,
} from "../utils/jwt.js";

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

export const loginSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});
export const signup = async (req: Request, res: Response): Promise<any> => {
  console.log("Signup form data:", req.body);
  const result = signupSchema.safeParse(req.body);

  if (!result.success) {
    const errors: Record<string, string> = {};

    result.error.issues.forEach((err) => {
      console.log(err);
      const field = String(err.path[0]);
      errors[field] = err.message;
    });
    return res
      .status(400)
      .json({ message: "Validation failed", errors: errors });
  }

  const { firstName, lastName, password } = req.body;
  const email = req.body.email.toLowerCase();

  try {
    // 2. Check if email already exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(409).json({ message: "Email already in use" });
    }

    // 3. Hash the password (10 = salt rounds)
    const hashedPassword = await bcrypt.hash(password, 10);

    // 4. Insert new user into DB
    const newUser = await User.create({
      firstName,
      lastName,
      email,
      password: hashedPassword,
    });

    // 5. Return success (never return password)
    return res.status(201).json({
      message: "User registered successfully",
      user: {
        id: newUser.id,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        email: newUser.email,
        created_at: newUser.created_at,
      },
    });
  } catch (err) {
    console.error("Signup error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const login = async (req: Request, res: Response): Promise<any> => {
  try {
    const result = loginSchema.safeParse(req.body);
    const { rememberMe } = req.body;
    console.log(req.body);

    if (!result.success) {
      const errors: Record<string, string> = {};

      result.error.issues.forEach((err) => {
        console.log(err);
        const field = String(err.path[0]);
        errors[field] = err.message;
      });
      return res.status(400).json({ message: "Login failed", errors: errors });
    }

    const { password } = result.data;
    const email = result.data.email.toLowerCase();

    const user = await User.findOne({ where: { email } });

    if (!user) {
      return res.status(400).json({
        message: "Invalid email or password",
      });
    }

    console.log(user.toJSON());

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({
        message: "Invalid email or password",
      });
    }

    const accessToken = generateToken({
      id: user.id,
      email: user.email,
    });

    const refreshToken = generateRefreshToken(
      { id: user.id, email: user.email },
      rememberMe,
    );

    // Hash the refresh token before saving to DB
    const hashedRefreshToken = await bcrypt.hash(refreshToken, 10);
    user.refresh_token = hashedRefreshToken;
    await user.save();

    // Set accessToken in HTTP-only cookie (2 mins)
    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      maxAge: 2 * 60 * 1000, // 2 minutes
    });

    // Set refresh token in HTTP-only cookie
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      maxAge: rememberMe
        ? 5 * 60 * 1000 // 5 minutes (rememberMe)
        : 3 * 60 * 1000, // 3 minutes
    });

    return res.status(200).json({
      message: "Login successfully",
      accessToken,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
      },
    });
  } catch (error: any) {
    console.log(error);
    return res.status(500).json({
      message: "Something went wrong",
      error: error.message,
    });
  }
};

export const logout = async (req: Request, res: Response): Promise<any> => {
  const token = req.cookies?.refreshToken;

  if (token) {
    try {
      const decoded = verifyRefreshToken(token);
      if (decoded && typeof decoded !== "string") {
        const user = await User.findByPk(decoded.id);
        if (user) {
          user.refresh_token = null;
          await user.save();
        }
      }
    } catch (error: any) {
      // If token is invalid or expired, just proceed to clear cookie
      console.log("Logout token verification failed:", error.message);
    }
  }

  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite:
      process.env.NODE_ENV === "production"
        ? ("none" as const)
        : ("lax" as const),
  };

  res.clearCookie("accessToken", cookieOptions);
  res.clearCookie("refreshToken", cookieOptions);
  return res.status(200).json({ message: "Logged out successfully" });
};

export const refreshAccessToken = async (
  req: Request,
  res: Response,
): Promise<any> => {
  const refreshToken = req.cookies?.refreshToken;

  if (!refreshToken) {
    return res.status(401).json({
      message: "No refresh token. Please log in again.",
    });
  }

  try {
    // Verify the refresh token JWT
    const decoded = verifyRefreshToken(refreshToken);

    if (!decoded || typeof decoded === "string") {
      return res.status(401).json({
        message: "Refresh token expired or invalid. Please log in again.",
      });
    }

    // Check if user exists and refresh token matches DB
    const user = await User.findByPk(decoded.id);

    if (!user || !user.refresh_token) {
      return res.status(401).json({
        message: "User not found or session invalidated.",
      });
    }

    // Verify hashed refresh token in DB matches
    const isValid = await bcrypt.compare(refreshToken, user.refresh_token);

    if (!isValid) {
      return res.status(401).json({
        message: "Invalid refresh token. Please log in again.",
      });
    }

    // Generate new access token
    const newAccessToken = generateToken({
      id: user.id,
      email: user.email,
    });

    // Set new accessToken cookie (2 mins)
    res.cookie("accessToken", newAccessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      maxAge: 2 * 60 * 1000, // 2 minutes
    });

    return res.status(200).json({
      message: "Access token refreshed successfully",
      accessToken: newAccessToken,
    });
  } catch (error: any) {
    console.error("Refresh token error:", error);
    return res.status(500).json({
      message: "Something went wrong",
      error: error.message,
    });
  }
};

export const users = async (req: Request, res: Response): Promise<any> => {
  try {
    const allUsers = await User.findAll({
      attributes: { exclude: ["password", "refresh_token"] },
    });

    return res.status(200).json({
      message: "Users fetched successfully",
      users: allUsers,
    });
  } catch (error: any) {
    console.error("Get all users error:", error);
    return res.status(500).json({
      message: "Something went wrong",
      error: error.message,
    });
  }
};
