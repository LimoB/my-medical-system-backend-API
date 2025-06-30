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

export const sendHospitalEmail = async (
  recipientEmail: string,
  patientName: string,
  subject: string,        // Email subject in header
  messageHtml: string,    // Message body (HTML)
  heading?: string        // Optional body heading
): Promise<string> => {
  try {
    const emailHeading = heading ?? '🩺 MediCare Services';
    const mailOptions = {
      from: `"MediCare Services " <${process.env.EMAIL_SENDER}>`,
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
            <p>Dear ${patientName},</p>
            ${messageHtml}
            <p style="margin-top: 20px;">Thank you for choosing 🩺 MediCare Health Center.</p>
            <div class="footer">
              &copy; ${new Date().getFullYear()} MediCare Health Center. All rights reserved.
            </div>
          </div>
        </body>
        </html>
      `,
    };

    const result = await transporter.sendMail(mailOptions);

    if (result.accepted.length > 0) {
      return 'Email sent successfully from MediCare Health Center';
    } else if (result.rejected.length > 0) {
      return 'Email was rejected by the server';
    } else {
      return 'Unknown email delivery status';
    }
  } catch (error) {
    console.error('📧 Email sending error:', error);
    return 'Email sending failed due to server error';
  }
};
