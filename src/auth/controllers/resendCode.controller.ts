import { Request, Response } from "express";
import { getUserByEmailService, updateVerificationToken } from "@/auth/auth.service";
import { sendHospitalEmail } from "@/middleware/googleMailer";

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

    const subject = "Your New Verification Code";
    const html = `
      <p>Hello ${user.firstname},</p>
      <p>Your new email verification code is:</p>
      <h2 style="color:blue;">${newCode}</h2>
      <p>This code expires in 10 minutes.</p>
    `;

    await sendHospitalEmail(user.email, user.firstname, subject, html);

    res.status(200).json({
      message: "A new verification code has been sent to your email.",
    });
  } catch (error) {
    console.error("❌ Error in resendVerificationCode:", error);
    res.status(500).json({ error: "Failed to resend verification code. Please try again." });
  }
};
