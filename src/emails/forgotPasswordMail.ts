// emails/forgotPasswordMail.ts

export const getForgotPasswordEmail = (firstName: string, token: string) => {
  return {
    subject: "🔑 Reset Your Password - Harmony Health Clinic",
    body: `
      <p>Hello ${firstName},</p>
      <p>Your password reset code is:</p>
      <h2 style="color:red;">${token}</h2>
      <p>This code will expire in <strong>10 minutes</strong>.</p>
      <p>If you did not request a password reset, please ignore this email or contact support.</p>
      <p>Best regards,<br/>🩺 Harmony Health Clinic Team</p>
    `,
  };
};
