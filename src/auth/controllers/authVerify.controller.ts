import type { Request, Response } from "express";
import { verifyUserEmail } from "@/auth/auth.service";
import { sendWelcomeEmail } from "@/auth/controllers/authRegister.controller"; // or wherever you put the helper

export const verifyEmail = async (req: Request, res: Response): Promise<void> => {
  const code = req.body.verificationCode || req.body.code || req.query.code;
  const email = req.body.email || req.query.email;

  if (!code || !email || typeof code !== "string" || typeof email !== "string") {
    res.status(400).json({ error: "Email and verification code are required." });
    return;
  }

  try {
    const { user, token } = await verifyUserEmail(email, code);

    // Send welcome email based on role
    await sendWelcomeEmail(user.email, user.first_name, user.role);

    res.status(200).json({
      message: "Email verified successfully.",
      token,
      user: {
        id: user.user_id,
        firstname: user.first_name,
        lastname: user.last_name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    const message = (error as Error).message;

    // Custom error responses
    if (message === "Invalid verification code.") {
      res.status(400).json({ error: "Verification code is incorrect or already used." });
      return;
    }

    if (message === "Verification code has expired.") {
      res.status(400).json({ error: "Verification code has expired." });
      return;
    }

    if (message === "User already verified.") {
      res.status(400).json({ error: "This account is already verified." });
      return;
    }

    if (message === "User not found.") {
      res.status(404).json({ error: "No user found with this email." });
      return;
    }

    console.error("Error in verifyEmail:", error);
    res.status(500).json({ error: "Verification failed. Please try again." });
  }
};
