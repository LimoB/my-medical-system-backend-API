import dotenv from "dotenv";
import express from "express";
import app from "@/app";
import db from "@/drizzle/db";
import { setupSwagger } from "@/swagger";

// Load environment variables
dotenv.config();

const {
  PORT = "3030",
  JWT_SECRET,
  DATABASE_URL,
  NODE_ENV,
  FRONTEND_URL,
} = process.env;

console.log("✅ Loaded environment variables:");
console.table({ PORT, JWT_SECRET, DATABASE_URL, NODE_ENV, FRONTEND_URL });

async function startServer() {
  try {
    console.log("🔌 Connecting to the database...");
    await db.execute("SELECT 1");
    console.log("✅ Database connected successfully");

    console.log("📚 Setting up Swagger...");
    setupSwagger(app);

    const port = parseInt(PORT, 10);
    app.listen(port, () => {
      console.log(`🚀 Server is running at http://localhost:${port}`);
      console.log(`📘 Swagger docs available at http://localhost:${port}/api-docs`);
    });
  } catch (error: unknown) {
    console.error("❌ Database connection failed:", error);
    process.exit(1);
  }
}

// Handle unhandled promise rejections
process.on("unhandledRejection", (reason) => {
  console.error("❌ Unhandled Rejection:", reason);
  process.exit(1);
});

startServer();
