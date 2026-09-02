import dotenv from "dotenv";
import app from "./app.js";
import sequelize from "./config/sequelize.js";

dotenv.config();

const port = process.env.PORT || 7000;

// Test Database Connection and Start Server
sequelize
  .authenticate()
  .then(() => {
    console.log("✅ Database connected successfully via Sequelize.");
    app.listen(port, () => {
      console.log(`🚀 Server running on port ${port}`);
    });
  })
  .catch((err) => {
    console.error("❌ Database connection failed:", err.message);
  });
