import type { Request, Response, NextFunction } from "express";
import { verifyToken } from "../utils/jwt.js";
import type { JwtPayload } from "jsonwebtoken";
export interface AuthRequest extends Request {
  user?: JwtPayload | { id: number; email: string };
}
export const authenticateToken = (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): any => {
  const authHeader = req.headers["authorization"];
  const tokenFromHeader =
    authHeader && authHeader.startsWith("Bearer ")
      ? authHeader.split(" ")[1]
      : null;

  // Cookie (HttpOnly) অথবা Authorization Bearer হেডার থেকে accessToken নেওয়া
  const token = req.cookies?.accessToken || tokenFromHeader;

  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Access denied. Please log in first.",
    });
  }

  const decoded = verifyToken(token);

  if (!decoded) {
    return res.status(401).json({
      success: false,
      message: "Session expired or invalid token. Please log in again.",
    });
  }

  req.user = decoded as JwtPayload;
  next();
};
