import type { Request, Response } from "express";
import bcrypt from "bcrypt";
import {
  getUserByEmailService,
  createUserService,
} from "@/auth/auth.service";
import { sendHospitalEmail } from "@/middleware/googleMailer";
import {
  getDoctorWelcomeEmail,
  getUserWelcomeEmail,
  getAdminWelcomeEmail,
} from "@/emails";
import db from "@/drizzle/db";
import { doctors } from "@/drizzle/schema";

// Allowed Roles
const allowedRoles = ["user", "admin", "doctor"] as const;
type AllowedRole = typeof allowedRoles[number];

// Helper: Send role-specific welcome email (after user verifies email)
export const sendWelcomeEmail = async (
  email: string,
  firstName: string,
  role: AllowedRole,
  password?: string
): Promise<void> => {
  let emailContent;
  switch (role) {
    case "doctor":
      emailContent = getDoctorWelcomeEmail(firstName);
      break;
    case "admin":
      if (!password) {
        throw new Error("Password is required for admin welcome email");
      }
      emailContent = getAdminWelcomeEmail(firstName, password);
      break;
    case "user":
    default:
      emailContent = getUserWelcomeEmail(firstName);
      break;
  }

  await sendHospitalEmail(email, firstName, emailContent.subject, emailContent.body, role);
};

// Controller: Create User (register)
export const createUser = async (req: Request, res: Response): Promise<void> => {
  console.log("▶️ createUser called");
  console.log("📥 Request Body:", req.body);

  try {
    const {
      first_name,
      last_name,
      email,
      password,
      contact_phone,
      address,
      role,
    } = req.body;

    // Validate required fields
    if (!first_name || !last_name || !email || !password) {
      console.warn("⚠️ Missing required fields");
      res.status(400).json({
        error: "Firstname, lastname, email, and password are required.",
      });
      return;
    }

    // Check if user already exists
    const existingUser = await getUserByEmailService(email);
    if (existingUser) {
      console.warn("❌ User already exists with email:", email);
      res.status(400).json({
        error: "A user with this email already exists.",
      });
      return;
    }

    // Hash password
    console.log("🔐 Hashing password...");
    const hashedPassword = await bcrypt.hash(password, 10);

    // Generate verification code and expiry
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Normalize and validate role
    const normalizedRole = role?.toLowerCase?.() as AllowedRole;
    const finalRole: AllowedRole = allowedRoles.includes(normalizedRole)
      ? normalizedRole
      : "user";

    console.log(`👤 Creating user with role: ${finalRole}`);

    // Start DB transaction
    const insertedUser = await db.transaction(async (tx) => {
      console.log("📥 Inserting user...");
      const users = await createUserService({
        first_name,
        last_name,
        email,
        password: hashedPassword,
        contact_phone: contact_phone || null,
        address: address || null,
        role: finalRole,
        is_verified: false,
        verification_token: verificationCode,
        token_expiry: expiry,
        created_at: new Date(),
        updated_at: new Date(),
      });

      const newUser = users;

      if (!newUser?.user_id) {
        throw new Error("❗ Failed to create user.");
      }

      console.log("✅ User inserted with ID:", newUser.user_id);

      // If doctor, insert into doctors table
      if (finalRole === "doctor") {
        console.log("🩺 Role is doctor – inserting into doctors table...");
        await tx.insert(doctors).values({
          user_id: newUser.user_id,
          specialization: "",
          available_days: "",
          payment_per_hour: 0,
          description: "",
          created_at: new Date(),
          updated_at: new Date(),
          available_hours: [],
        });
        console.log("✅ Doctor profile created");
      }

      return newUser;
    });

    // Compose verification email
    const verificationSubject = "🩺 Harmony Health Clinic - Email Verification";
    const verificationBody = `
      <p>Your email verification code is:</p>
      <h2 style="color:#007BFF;">${verificationCode}</h2>
      <p>Please enter this code to verify your account. It expires in <strong>10 minutes</strong>.</p>
    `;

    console.log("📧 Sending verification email to:", email);

    // Send verification email
    await sendHospitalEmail(
      email,
      first_name,
      verificationSubject,
      verificationBody,
      finalRole
    );

    console.log("✅ Verification email sent successfully");

    // Respond
    res.status(201).json({
      message: "Registration successful. A verification email has been sent.",
    });

  } catch (error) {
    console.error("🔥 Error in createUser:", error);
    res.status(500).json({
      error: (error as Error).message || "Failed to register user.",
    });
  }
};
