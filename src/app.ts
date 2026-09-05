import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import resumeRoutes from "./routes/resumeRoutes.js";
import authRoutes from "./routes/authRoutes.js";

const app = express();
// Allowed origins list
const allowedOrigins = [
  "http://localhost:3000",
  "https://career-forge-client.vercel.app",
];

// Middleware
app.use(
  cors({
    origin: function (origin, callback) {
      // Postman/curl/server-to-server requests e origin thake na
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS: " + origin));
      }
    },
    credentials: true,
  }),
);
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/api/resume", resumeRoutes);
app.use("/api/auth", authRoutes);

export default app;
