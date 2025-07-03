export const getAdminWelcomeEmail = (name: string, password: any) => {
  return {
    subject: "Welcome to 🩺 Harmony Health Clinic Administration!",
    body: `
      <p>Dear ${name},</p>
      <p>Welcome to the Harmony Health Clinic administrative team.</p>
      <p>You now have access to manage users, doctors, appointments, and oversee the smooth operation of our platform.</p>
      <p>Thank you for helping us deliver excellent healthcare services.</p>
    `,
  };
};


export const AdminCreateWelcomeEmail = (email: string, firstName: string, plainPassword: string) => {
  return {
    subject: "🎉 Harmony Health Clinic!",
    body: `
      <h2>👩‍⚕️ Harmony Health Clinic, ${firstName}!</h2>
      <p>Your account has been created by an administrator.</p>
      <p><strong>Login Credentials:</strong></p>
      <ul>
        <li>Email: <strong>${email}</strong></li>
        <li>Password: <strong>${plainPassword}</strong></li>
      </ul>
      <p>You can login here: <a href="http://localhost:5173/login">Harmony Health Clinic Login</a></p>
      <p>If you have any questions, our support team is happy to help.</p>
      <p style="margin-top: 24px;">Best regards,<br/>🩺 The Medicare Team</p>
    `,
  };
};
