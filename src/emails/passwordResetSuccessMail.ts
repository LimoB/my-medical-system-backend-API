export const getPasswordResetSuccessEmail = (name: string) => {
  return {
    subject: "Your Password Has Been Reset",
    body: `
      <p>Hello ${name},</p>
      <p>This is a confirmation that your password was successfully changed.</p>
      <p>If you did not perform this action, please contact our support team immediately.</p>
      <p>— Harmony Health Clinic Security Team</p>
    `,
  };
};
