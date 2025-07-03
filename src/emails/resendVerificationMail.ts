export const getResendVerificationEmail = (firstName: string, code: string) => {
  return {
    subject: "Your New Verification Code",
    body: `
      <p>Hello ${firstName},</p>
      <p>Your new email verification code is:</p>
      <h2 style="color:blue;">${code}</h2>
      <p>This code expires in 10 minutes.</p>
    `
  };
};
