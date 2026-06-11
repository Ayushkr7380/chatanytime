import {config} from "dotenv";
congif();

import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    type: 'OAuth2',
    user: process.env.EMAIL_USER,
    clientId: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    refreshToken: process.env.REFRESH_TOKEN,
  },
});

// Verify the connection configuration
transporter.verify((error, success) => {
  if (error) {
    console.error('Error connecting to email server:', error);
  } else {
    console.log('Email server is ready to send messages');
  }
});

// Function to send email
export const sendEmail = async (to, subject, text, html) => {
  try {
    const info = await transporter.sendMail({
      from: `"Chat Anytime " <${process.env.EMAIL_USER}>`, // sender address
      to, // list of receivers
      subject, // Subject line
      text, // plain text body
      html, // html body
    });

    console.log('Message sent: %s', info.messageId);
    console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
  } catch (error) {
    console.error('Error sending email:', error);
  }
};

export const sendPasswordResetEmail = async (to, name, resetLink) => {
    await sendEmail(
        to,
        "Reset your Chat Anytime password",
        `Reset link: ${resetLink}`,
        `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8"/>
            <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
        </head>
        <body style="margin:0;padding:0;background:#f5f4fe;font-family:'Segoe UI',sans-serif">
            <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 16px">
                <tr>
                    <td align="center">
                        <table width="480" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:16px;overflow:hidden;border:1px solid #e8e6fc">

                            <!-- Header -->
                            <tr>
                                <td style="background:linear-gradient(135deg,#7F77DD,#534AB7);padding:32px 40px;text-align:center">
                                    <div style="display:inline-flex;align-items:center;gap:10px">
                                        <div style="width:36px;height:36px;background:rgba(255,255,255,0.2);border-radius:10px;display:inline-block;line-height:36px;text-align:center;font-size:20px">💬</div>
                                        <span style="color:#fff;font-size:20px;font-weight:600;vertical-align:middle">Chat Anytime</span>
                                    </div>
                                </td>
                            </tr>

                            <!-- Lock icon -->
                            <tr>
                                <td style="padding:36px 40px 0;text-align:center">
                                    <div style="width:64px;height:64px;background:#EEEDFE;border-radius:50%;margin:0 auto 20px;line-height:64px;font-size:32px;text-align:center">🔐</div>
                                    <h1 style="margin:0 0 8px;font-size:22px;font-weight:600;color:#1a1a2e">Reset your password</h1>
                                    <p style="margin:0;font-size:14px;color:#6b7280">Hi <strong style="color:#534AB7">${name}</strong>, we received a request to reset your password.</p>
                                </td>
                            </tr>

                            <!-- Body -->
                            <tr>
                                <td style="padding:28px 40px">
                                    <p style="margin:0 0 24px;font-size:14px;color:#4b5563;line-height:1.7">
                                        Click the button below to set a new password. This link is valid for <strong>15 minutes</strong> and can only be used once.
                                    </p>

                                    <!-- CTA Button -->
                                    <table width="100%" cellpadding="0" cellspacing="0">
                                        <tr>
                                            <td align="center">
                                                <a href="${resetLink}"
                                                   style="display:inline-block;padding:14px 40px;background:linear-gradient(135deg,#7F77DD,#534AB7);color:#fff;text-decoration:none;border-radius:12px;font-size:15px;font-weight:600;letter-spacing:0.3px">
                                                    Reset Password →
                                                </a>
                                            </td>
                                        </tr>
                                    </table>

                                    <!-- Divider -->
                                    <div style="margin:28px 0;height:1px;background:#f0effe"></div>

                                    <!-- Fallback link -->
                                    <p style="margin:0 0 8px;font-size:12px;color:#9ca3af">If the button doesn't work, copy and paste this link:</p>
                                    <p style="margin:0;font-size:12px;word-break:break-all">
                                        <a href="${resetLink}" style="color:#7F77DD;text-decoration:none">${resetLink}</a>
                                    </p>
                                </td>
                            </tr>

                            <!-- Warning box -->
                            <tr>
                                <td style="padding:0 40px 28px">
                                    <div style="background:#fefce8;border:1px solid #fde68a;border-radius:10px;padding:12px 16px;font-size:12px;color:#92400e">
                                        ⚠️ If you didn't request a password reset, you can safely ignore this email. Your password will remain unchanged.
                                    </div>
                                </td>
                            </tr>

                            <!-- Footer -->
                            <tr>
                                <td style="background:#f9f8ff;border-top:1px solid #f0effe;padding:20px 40px;text-align:center">
                                    <p style="margin:0;font-size:12px;color:#9ca3af">
                                        © 2025 Chat Anytime &nbsp;·&nbsp;
                                        <span style="color:#7F77DD">This is an automated email, please do not reply.</span>
                                    </p>
                                </td>
                            </tr>

                        </table>
                    </td>
                </tr>
            </table>
        </body>
        </html>
        `
    );
};