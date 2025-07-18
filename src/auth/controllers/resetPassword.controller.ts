import type { Request, Response } from "express";
import bcrypt from "bcrypt";
import {
  getUserByResetTokenService,
  resetUserPasswordService,
  saveResetTokenService,
} from "@/auth/auth.service";
import { sendHospitalEmail } from "@/middleware/googleMailer";
import { getPasswordResetSuccessEmail } from "@/emails";

export const resetPassword = async (req: Request, res: Response): Promise<void> => {
  const { code, newPassword } = req.body;

  if (!code || !newPassword || typeof code !== "string" || typeof newPassword !== "string") {
    res.status(400).json({ error: "Verification code and new password are required." });
    return;
  }

  try {
    const user = await getUserByResetTokenService(code);

    if (!user) {
      res.status(400).json({ error: "Invalid or expired verification code." });
      return;
    }

    if (!user.token_expiry || new Date() > new Date(user.token_expiry)) {
      res.status(400).json({ error: "Verification code has expired." });
      return;
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await resetUserPasswordService(user.user_id, hashedPassword);

    // Invalidate the used token
    await saveResetTokenService(user.user_id, null, null);

    // Send confirmation email
    const { subject, body } = getPasswordResetSuccessEmail(user.first_name);
    await sendHospitalEmail(user.email, user.first_name, subject, body, user.role);

    res.status(200).json({ message: "Password reset successfully. You can now log in." });
  } catch (error) {
    console.error("Error in resetPassword:", error);
    res.status(500).json({ error: "Failed to reset password. Please try again." });
  }
};
