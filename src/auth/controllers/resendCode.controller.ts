import type { Request, Response } from "express";
import { getUserByEmailService, updateVerificationToken } from "@/auth/auth.service";
import { sendHospitalEmail } from "@/middleware/googleMailer";
import { getResendVerificationEmail } from "@/emails";

export const resendVerificationCode = async (req: Request, res: Response): Promise<void> => {
  const { email } = req.body;

  if (!email || typeof email !== "string") {
    res.status(400).json({ error: "A valid email is required." });
    return;
  }

  try {
    const user = await getUserByEmailService(email);

    if (!user) {
      res.status(404).json({ error: "No user found with this email." });
      return;
    }

    if (user.is_verified) {
      res.status(400).json({ error: "This account is already verified." });
      return;
    }

    const newCode = Math.floor(100000 + Math.random() * 900000).toString();
    const newExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    await updateVerificationToken(user.email, newCode, newExpiry);

    const { subject, body } = getResendVerificationEmail(user.first_name, newCode);

    // Pass role as 5th argument
    await sendHospitalEmail(user.email, user.first_name, subject, body, user.role);

    res.status(200).json({
      message: "A new verification code has been sent to your email.",
    });
  } catch (error) {
    console.error("Error in resendVerificationCode:", error);
    res.status(500).json({ error: "Failed to resend verification code. Please try again." });
  }
};
