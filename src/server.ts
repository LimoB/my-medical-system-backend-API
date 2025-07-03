import app from "@/app";
import dotenv from "dotenv";
import db from "@/drizzle/db"; // Adjust if needed
import { setupSwagger } from "@/swagger"; // Import Swagger setup

dotenv.config();

console.log("JWT_SECRET:", process.env.JWT_SECRET); // <-- Add this line

const PORT = process.env.PORT || 3030;

// Check DB connection before starting server
async function startServer() {
  try {
    // Test database connection
    await db.execute(`SELECT 1`);
    console.log("Database connected successfully");

    // Setup Swagger docs
    setupSwagger(app);

    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
      console.log(`Swagger docs at http://localhost:${PORT}/api-docs`);
    });
  } catch (error) {
    console.error("Failed to connect to the database:", error);
    process.exit(1);
  }
}

startServer();
