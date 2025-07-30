export const getUserWelcomeEmail = (name: string) => {
  return {
    subject: "Welcome to 🩺 Harmony Health Clinic!",
    body: `
      <p>Dear ${name},</p>
      <p>Thank you for registering with Harmony Health Clinic.</p>
      <p>You can now log in to book appointments, view your medical records, and communicate with your doctors.</p>
      <p>Your health and well-being are our top priorities.</p>
      <p>We’re excited to support your healthcare journey.</p>
    `,
  };
};
