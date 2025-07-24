import express, { type Application, type Request, type Response } from "express";
import cors from "cors";
import { logger } from "@/middleware/logger";
import { RateLimiterMiddleware } from "@/middleware/rateLimiter";

// Route modules
import userRouter from "@/users/user.route";
import authRouter from "@/auth/auth.route";
import complaintsRouter from "@/complaints/complaint.route";
import appointmentsRouter from "@/appointments/appointment.route";
import doctorRouter from "@/doctors/doctor.route";
import paymentRouter from "@/payments/payment.route";
import prescriptionRouter from "@/prescriptions/prescription.route";
import dashboardRouter from "@/dashboard/dashboard.route";
import consultationsRouter from "@/consultation/consultation.routes";
import meetingRouter from "@/doctors/doctorMeeting.route";

const app: Application = express();

// ✅ CORS setup
app.use(
  cors({
    origin: [
      "http://localhost:5173", // Local dev
      "https://purple-plant-08da99010.2.azurestaticapps.net", // Production frontend
    ],
    credentials: true, // Needed for sending cookies or auth headers
  })
);

// ✅ Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ✅ Logger & rate limiter
app.use(logger);
app.use(RateLimiterMiddleware);

// ✅ Health check / root route
app.get("/", (_req: Request, res: Response) => {
  res.send("Welcome to my-medical-system-backend-API with Drizzle ORM and PostgreSQL");
});

// ✅ API Routes (all prefixed with /api)
app.use("/api", userRouter);
app.use("/api", authRouter);
app.use("/api", complaintsRouter);
app.use("/api", appointmentsRouter);
app.use("/api", doctorRouter);
app.use("/api", paymentRouter);
app.use("/api", prescriptionRouter);
app.use("/api", dashboardRouter);
app.use("/api", consultationsRouter);
app.use("/api", meetingRouter);

export default app;
