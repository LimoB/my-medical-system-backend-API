import type { Request, Response } from "express";
import { getUserByEmailService, saveResetTokenService } from "@/auth/auth.service";
import { sendHospitalEmail } from "@/middleware/googleMailer";
import { getForgotPasswordEmail } from "@/emails";

export const forgotPassword = async (req: Request, res: Response): Promise<void> => {
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

    const token = Math.floor(100000 + Math.random() * 900000).toString();
    const expiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    await saveResetTokenService(user.user_id, token, expiry);

    const { subject, body } = getForgotPasswordEmail(user.first_name, token);

    // Pass user.role as the 5th argument to sendHospitalEmail
    await sendHospitalEmail(user.email, user.first_name, subject, body, user.role);

    res.status(200).json({
      message: "Password reset code sent to your email.",
    });
  } catch (error) {
    console.error("Error in forgotPassword:", error);
    res.status(500).json({ error: "Something went wrong. Please try again later." });
  }
};
