import type { Request, Response, NextFunction } from "express";
import bcrypt from "bcrypt";
import {
  createUserService,
  getUserByEmailService,
} from "@/auth/auth.service";
import { sendHospitalEmail } from "@/middleware/googleMailer";
import { AdminCreateWelcomeEmail } from "@/emails";

// Allowed roles array and type
const allowedRoles = ["user", "admin", "doctor"] as const;
type AllowedRole = typeof allowedRoles[number];

// Admin creates a user (doctor, another admin, or regular user)
export const adminCreateUser = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { first_name, last_name, email, password, role, contact_phone } = req.body;

    // Validate input
    if (!first_name || !last_name || !email || !password || !role) {
      res.status(400).json({ error: "All fields are required." });
      return;
    }

    // Check if user exists
    const existing = await getUserByEmailService(email);
    if (existing) {
      res.status(409).json({ error: "A user with this email already exists." });
      return;
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Validate role and normalize
    const normalizedRole = role.toLowerCase() as AllowedRole;
    const finalRole: AllowedRole = allowedRoles.includes(normalizedRole)
      ? normalizedRole
      : "user";

    // Create user, set is_verified true since admin created them
    const newUser = await createUserService({
      first_name,
      last_name,
      email,
      password: hashedPassword,
      role: finalRole,
      contact_phone: contact_phone || null,
      is_verified: true,
      verification_token: null,
      token_expiry: null,
      created_at: new Date(),
      updated_at: new Date(),
    });

    // Get styled admin welcome email content, passing password as required
    const { subject, body } = AdminCreateWelcomeEmail(newUser.email, newUser.first_name, password);

    // Send welcome email with role argument included
    await sendHospitalEmail(
      newUser.email,
      newUser.first_name,
      subject,
      body,
      finalRole
    );

    res.status(201).json({ message: "User created and welcome email sent." });
  } catch (error) {
    next(error);
  }
};
