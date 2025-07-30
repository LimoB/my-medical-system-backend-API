export const getDoctorWelcomeEmail = (name: string) => {
  return {
    subject: "Welcome to 🩺 Harmony Health Clinic!",
    body: `
      <p>Dear Dr. ${name},</p>
      <p>Thank you for joining Harmony Health Clinic as a valued doctor.</p>
      <p>We appreciate your dedication to treating patients with care and professionalism.</p>
      <p>You can now log in and manage your appointments, track patients, and update your availability.</p>
      <p>We look forward to your positive impact on our community’s health.</p>
    `,
  };
};
