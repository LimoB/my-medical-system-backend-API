import express, { Application, Request, Response } from "express";
import cors from "cors"; // Add this line
import { logger } from "@/middleware/logger";
import { RateLimiterMiddleware } from "@/middleware/rateLimiter";
import userRouter from "@/users/user.route";
import authRouter from "@/auth/auth.route";
import complaintsRouter from "@/complaints/complaint.route";
import appointmentsRouter from "@/appointments/appointment.route";
import doctorRouter from "@/doctors/doctor.route";
import paymentRouter from "@/payments/payment.route";
import prescriptionRouter from "./prescriptions/prescription.route";
import dashboardRouter from "./dashboard/dashboard.route";




const app: Application = express();

// CORS - for frontend access
app.use(cors({
  origin: "http://localhost:5173", // Allow frontend origin
  credentials: true, // Allow cookies or headers if needed
}));


// JSON & URL Parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


// Logging & Rate Limiting
app.use(logger);
app.use(RateLimiterMiddleware);


// Default route
app.get("/", (req, res: Response) => {
  res.send("Welcome to my-medical-system-backend-API With Drizzle ORM and PostgreSQL");
});


// Routes
app.use("/api", userRouter);
app.use("/api", authRouter);
app.use("/api", complaintsRouter);
app.use("/api", appointmentsRouter);
app.use("/api", doctorRouter);
app.use("/api", paymentRouter);
app.use("/api", prescriptionRouter);
app.use("/api", dashboardRouter);



export default app;
