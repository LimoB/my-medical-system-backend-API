import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const transporter = nodemailer.createTransport({
  service: 'gmail',
  host: 'smtp.gmail.com',
  port: 465,
  secure: true,
  auth: {
    user: process.env.EMAIL_SENDER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

type UserRole = 'user' | 'doctor' | 'admin';

export const sendHospitalEmail = async (
  recipientEmail: string,
  recipientName: string,
  subject: string,
  messageHtml: string,
  role: UserRole,
  heading?: string
): Promise<string> => {
  try {
    const defaultHeadingMap: Record<UserRole, string> = {
      doctor: '🩺 Harmony Health Clinic - Doctor Services',
      user: '🩺 Harmony Health Clinic - Patient Services',
      admin: '🩺 Harmony Health Clinic - Administration',
    };

    const emailHeading = heading ?? defaultHeadingMap[role] ?? '🩺 Harmony Health Clinic';

    const mailOptions = {
      from: `"Harmony Health Clinic" <${process.env.EMAIL_SENDER}>`,
      to: recipientEmail,
      subject,
      html: `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <title>${subject}</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              background-color: #f8f9fa;
              margin: 0;
              padding: 0;
            }
            .email-wrapper {
              max-width: 600px;
              margin: 30px auto;
              background: #ffffff;
              padding: 20px;
              border-radius: 8px;
              box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
              color: #333;
            }
            .logo {
              text-align: center;
              margin-bottom: 20px;
            }
            .logo img {
              max-width: 150px;
            }
            h2 {
              color: #28a745;
              font-size: 24px;
              text-align: center;
            }
            .footer {
              font-size: 0.85em;
              color: #999;
              margin-top: 30px;
              text-align: center;
            }
          </style>
        </head>
        <body>
          <div class="email-wrapper">
            <h2>${emailHeading}</h2>
            
            ${messageHtml}
            <p style="margin-top: 20px;">Thank you for choosing 🩺 Harmony Health Clinic.</p>
            <div class="footer">
              &copy; ${new Date().getFullYear()} Harmony Health Clinic. All rights reserved.
            </div>
          </div>
        </body>
        </html>
      `,
    };

    console.log(`[sendHospitalEmail] Sending email to ${recipientEmail} with subject "${subject}" and heading "${emailHeading}"`);

    const result = await transporter.sendMail(mailOptions);

    if (result.accepted.length > 0) {
      console.log(`[sendHospitalEmail] Email sent successfully to ${recipientEmail}`);
      return 'Email sent successfully from Harmony Health Clinic';
    } else if (result.rejected.length > 0) {
      console.warn(`[sendHospitalEmail] Email was rejected by the server for ${recipientEmail}`);
      return 'Email was rejected by the server';
    } else {
      console.warn(`[sendHospitalEmail] Unknown email delivery status for ${recipientEmail}`);
      return 'Unknown email delivery status';
    }
  } catch (error) {
    console.error('[sendHospitalEmail] Email sending error:', error);
    return 'Email sending failed due to server error';
  }
};
