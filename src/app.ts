import express from "express";
import dotenv from "dotenv";
import pool from "./config/db.js";
import resumeRoutes from "./routes/resumeRoutes.js";
import cors from "cors";

dotenv.config();

const app = express();
app.use(cors());
const port = process.env.PORT || 7000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/api/resume", resumeRoutes);

// Test PostgreSQL Connection
pool.query("SELECT NOW()", (err, res) => {
  if (err) {
    console.error("❌ Database connection failed:", err.message);
  } else {
    console.log("✅ Database connected successfully at:", res.rows[0].now);
  }
});

app.listen(port, () => {
  console.log(`🚀 App listening on port ${port}`);
});
