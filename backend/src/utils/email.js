// src/utils/email.js — Nodemailer email service with HTML templates
const nodemailer = require('nodemailer');
const { logger } = require('./logger');

let transporter = null;

function getTransporter() {
  if (transporter) return transporter;

  const config = {
    host: process.env.SMTP_HOST || 'smtp.mailtrap.io',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_PORT === '465',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  };

  transporter = nodemailer.createTransport(config);
  return transporter;
}

const FROM = process.env.SMTP_FROM || 'Payro <noreply@payro.io>';
const APP_URL = process.env.APP_URL || 'http://localhost:5173';

// ─── Base HTML wrapper ────────────────────────────────────────────
function baseTemplate(title, body) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${title}</title>
  <style>
    body { margin: 0; padding: 0; background: #09090F; font-family: 'Segoe UI', Arial, sans-serif; }
    .wrapper { max-width: 560px; margin: 40px auto; padding: 0 20px; }
    .card {
      background: #111118;
      border: 1px solid rgba(255,255,255,0.08);
      border-radius: 16px;
      padding: 40px;
    }
    .logo {
      display: flex; align-items: center; gap: 10px; margin-bottom: 32px;
    }
    .logo-icon {
      width: 36px; height: 36px;
      background: linear-gradient(135deg, #7C3AED, #6366F1);
      border-radius: 8px;
      display: inline-flex; align-items: center; justify-content: center;
      font-weight: 700; color: #fff; font-size: 14px;
    }
    .logo-name { font-size: 20px; font-weight: 700; color: #F1F0F7; }
    h1 { font-size: 22px; font-weight: 600; color: #F1F0F7; margin: 0 0 12px; }
    p { font-size: 14px; color: #9B97B8; line-height: 1.7; margin: 0 0 16px; }
    .btn {
      display: inline-block;
      padding: 14px 28px;
      background: linear-gradient(135deg, #7C3AED, #6366F1);
      color: #fff !important;
      text-decoration: none;
      border-radius: 10px;
      font-size: 14px;
      font-weight: 600;
      margin: 8px 0 24px;
    }
    .divider { border: none; border-top: 1px solid rgba(255,255,255,0.07); margin: 24px 0; }
    .link-fallback { font-size: 12px; color: #5C587A; word-break: break-all; }
    .footer { text-align: center; font-size: 12px; color: #5C587A; margin-top: 24px; }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="card">
      <div class="logo">
        <span class="logo-icon">P</span>
        <span class="logo-name">Payro</span>
      </div>
      ${body}
    </div>
    <div class="footer">
      © ${new Date().getFullYear()} Payro. Intelligent Payroll Platform.<br />
      If you didn't request this, you can safely ignore this email.
    </div>
  </div>
</body>
</html>`;
}

// ─── Send helper ──────────────────────────────────────────────────
async function sendMail({ to, subject, html }) {
  if (!process.env.SMTP_USER || process.env.ENABLE_EMAIL_NOTIFICATIONS === 'false') {
    logger.info(`[Email skipped — no SMTP config] To: ${to} | Subject: ${subject}`);
    return;
  }
  try {
    const info = await getTransporter().sendMail({ from: FROM, to, subject, html });
    logger.info(`Email sent to ${to}: ${info.messageId}`);
  } catch (err) {
    logger.error(`Email send failed to ${to}:`, err.message);
    throw err;
  }
}

// ─── Email templates ──────────────────────────────────────────────
async function sendEmailVerification(user, token) {
  const url = `${APP_URL}/verify-email?token=${token}`;
  await sendMail({
    to: user.email,
    subject: 'Verify your Payro account',
    html: baseTemplate('Verify Email', `
      <h1>Verify your email</h1>
      <p>Hi ${user.firstName}, welcome to Payro! Please verify your email address to get started.</p>
      <a href="${url}" class="btn">Verify Email Address</a>
      <hr class="divider" />
      <p class="link-fallback">Or copy this link: ${url}</p>
      <p>This link expires in <strong style="color:#A78BFA">24 hours</strong>.</p>
    `),
  });
}

async function sendPasswordReset(user, token) {
  const url = `${APP_URL}/reset-password?token=${token}`;
  await sendMail({
    to: user.email,
    subject: 'Reset your Payro password',
    html: baseTemplate('Reset Password', `
      <h1>Reset your password</h1>
      <p>Hi ${user.firstName}, we received a request to reset your Payro password.</p>
      <a href="${url}" class="btn">Reset Password</a>
      <hr class="divider" />
      <p class="link-fallback">Or copy this link: ${url}</p>
      <p>This link expires in <strong style="color:#A78BFA">1 hour</strong>. If you didn't request this, no action is needed.</p>
    `),
  });
}

async function sendWelcomeEmail(user) {
  await sendMail({
    to: user.email,
    subject: 'Welcome to Payro 🎉',
    html: baseTemplate('Welcome', `
      <h1>Welcome to Payro, ${user.firstName}!</h1>
      <p>Your account has been created. You can now log in and explore intelligent payroll management.</p>
      <a href="${APP_URL}/login" class="btn">Go to Dashboard</a>
      <p>If you have any questions, just reply to this email.</p>
    `),
  });
}

async function sendPasswordChangedNotice(user) {
  await sendMail({
    to: user.email,
    subject: 'Your Payro password was changed',
    html: baseTemplate('Password Changed', `
      <h1>Password changed</h1>
      <p>Hi ${user.firstName}, your Payro password was successfully changed.</p>
      <p>If you did not make this change, please contact your administrator immediately.</p>
      <a href="${APP_URL}/login" class="btn">Log In</a>
    `),
  });
}

module.exports = {
  sendEmailVerification,
  sendPasswordReset,
  sendWelcomeEmail,
  sendPasswordChangedNotice,
};
