import { Request, Response, NextFunction } from "express";
import bcrypt from "bcrypt";
import {
  createUserService,
  getUserByEmailService,
} from "@/auth/auth.service";
import { sendHospitalEmail } from "@/middleware/googleMailer";

// Admin creates a user (doctor, another admin, or regular user)
export const adminCreateUser = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { firstname, lastname, email, password, role, contact_phone } = req.body;

    // Validate input
    if (!firstname || !lastname || !email || !password || !role) {
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

    // Validate role
    const allowedRoles = ["user", "admin", "doctor"] as const;
    type AllowedRole = typeof allowedRoles[number];
    const finalRole: AllowedRole = allowedRoles.includes(role.toLowerCase() as AllowedRole)
      ? (role.toLowerCase() as AllowedRole)
      : "user";

    // Create user
    const newUser = await createUserService({
      firstname,
      lastname,
      email,
      password: hashedPassword,
      role: finalRole,
      contact_phone,
      is_verified: true,
      verification_token: null,
      token_expiry: null,
      created_at: new Date(),
      updated_at: new Date(),
    });

    // 📧 Styled welcome email
    const html = `
      <h2>👩‍⚕️ Welcome to Medicare, ${newUser.firstname}!</h2>
      <p>Your account has been created by an administrator.</p>
      <p><strong>Login Credentials:</strong></p>
      <ul>
        <li>Email: <strong>${newUser.email}</strong></li>
        <li>Password: <strong>${password}</strong></li>
      </ul>
      <p>You can login here: <a href="http://localhost:5173/login">Medicare Login</a></p>
      <p>If you have any questions, our support team is happy to help.</p>
      <p style="margin-top: 24px;">Best regards,<br/>🩺 The Medicare Team</p>
    `;

    await sendHospitalEmail(
      newUser.email,
      newUser.firstname,
      "🎉 Welcome to Medicare!",
      html
    );

    res.status(201).json({ message: "User created and welcome email sent." });
  } catch (error) {
    next(error);
  }
};
