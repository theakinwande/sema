const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: Number(process.env.EMAIL_PORT) || 465,
  secure: process.env.EMAIL_SECURE !== 'false', // true for 465, false for 587
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

/**
 * Send a password reset email
 */
async function sendResetEmail(to, username, resetUrl) {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: 'Helvetica Neue', Arial, sans-serif; background: #f5f5f7; padding: 40px 20px; margin: 0; }
        .card { max-width: 460px; margin: 0 auto; background: #ffffff; border-radius: 16px; padding: 40px; }
        .logo { font-size: 24px; font-weight: 700; margin-bottom: 24px; color: #1d1d1f; }
        h1 { font-size: 22px; font-weight: 700; color: #1d1d1f; margin-bottom: 8px; }
        p { font-size: 15px; color: #86868b; line-height: 1.6; margin-bottom: 16px; }
        .btn { display: inline-block; padding: 14px 32px; background: #1d1d1f; color: #ffffff; text-decoration: none; border-radius: 10px; font-size: 15px; font-weight: 600; margin: 8px 0 24px; }
        .link { font-size: 13px; color: #afafb2; word-break: break-all; }
        .footer { margin-top: 32px; padding-top: 20px; border-top: 1px solid #e8e8ed; font-size: 12px; color: #d2d2d7; }
      </style>
    </head>
    <body>
      <div class="card">
        <div class="logo">💬 Sema</div>
        <h1>Reset your password</h1>
        <p>Hi <strong>${username}</strong>, we received a request to reset your password. Click the button below to choose a new one.</p>
        <a href="${resetUrl}" class="btn">Reset password</a>
        <p>This link expires in <strong>1 hour</strong>. If you didn't request this, you can safely ignore this email.</p>
        <p class="link">Or copy this link: ${resetUrl}</p>
        <div class="footer">
          <p style="color: #d2d2d7; margin: 0;">Sema — Anonymous messaging platform</p>
        </div>
      </div>
    </body>
    </html>
  `;

  await transporter.sendMail({
    from: `"Sema" <${process.env.EMAIL_USER}>`,
    to,
    subject: 'Reset your Sema password',
    html,
  });
}

module.exports = { sendResetEmail };
