import app from "@/app";
import dotenv from "dotenv";
import db  from "@/drizzle/db"; // adjust path if your DB instance is elsewhere

dotenv.config();

const PORT = process.env.PORT || 3030;

// Check DB connection before starting server
async function startServer() {
  try {
    // Simple DB query to confirm connection
    await db.execute(`SELECT 1`);
    console.log("✅ Database connected successfully");

    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("❌ Failed to connect to the database:", error);
    process.exit(1);
  }
}

startServer();
