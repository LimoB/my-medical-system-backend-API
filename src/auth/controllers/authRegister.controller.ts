import { Request, Response } from "express";
import bcrypt from "bcrypt";
import {
  getUserByEmailService,
  createUserService,
} from "@/auth/auth.service";
import { sendHospitalEmail } from "@/middleware/googleMailer";

// ────────────────────────────────
// Allowed Roles
// ────────────────────────────────
const allowedRoles = ["user", "admin", "doctor"] as const;
type AllowedRole = typeof allowedRoles[number];

// ────────────────────────────────
// Controller: Create User
// ────────────────────────────────
export const createUser = async (req: Request, res: Response): Promise<void> => {
  console.log("🚨 createUser called", req.body);

  try {
    const {
      firstname,
      lastname,
      email,
      password,
      contact_phone,
      address,
      role,
    } = req.body;

    // 🔎 Validate required fields
    if (!firstname || !lastname || !email || !password) {
      res.status(400).json({
        error: "Firstname, lastname, email, and password are required.",
      });
      return;
    }

    // 📧 Check if user already exists
    const existingUser = await getUserByEmailService(email);
    if (existingUser) {
      res.status(400).json({
        error: "A user with this email already exists.",
      });
      return;
    }

    // 🔐 Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // 🧾 Generate verification token and expiry
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // 🧑‍⚕️ Normalize and validate role
    const normalizedRole = role?.toLowerCase?.() as AllowedRole;
    const finalRole: AllowedRole = allowedRoles.includes(normalizedRole)
      ? normalizedRole
      : "user";

    // 🧍 Create user in DB
    const newUser = await createUserService({
      firstname,
      lastname,
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

    // 📬 Compose and send verification email
    const emailSubject = "🩺 MediCare Health Center";
    const emailHeading = "🩺 Email Verification";
    const emailBody = `
      <p>Your email verification code is:</p>
      <h2 style="color:#007BFF;">${verificationCode}</h2>
      <p>Please enter this code to verify your account. It expires in <strong>10 minutes</strong>.</p>
    `;

    await sendHospitalEmail(email, firstname, emailSubject, emailBody, emailHeading);

    // ✅ Respond to client
    res.status(201).json({
      message: "✅ Registration successful. A verification email has been sent.",
    });

  } catch (error) {
    console.error("❌ Error in createUser:", error);
    res.status(500).json({
      error: (error as Error).message || "Failed to register user.",
    });
  }
};
