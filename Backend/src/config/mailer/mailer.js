const nodemailer = require('nodemailer');

function createTransporter() {
  const {
    SMTP_HOST,
    SMTP_PORT,
    SMTP_USER,
    SMTP_PASS,
    SMTP_SECURE,
  } = process.env;

  if (!SMTP_HOST) {
    // Dev-friendly fallback so the app can boot without SMTP.
    console.warn('[mailer] SMTP_HOST missing; using jsonTransport (dev only)');
    return nodemailer.createTransport({ jsonTransport: true });
  }

  return nodemailer.createTransport({
    host: SMTP_HOST,
    port: SMTP_PORT ? Number(SMTP_PORT) : 587,
    secure: String(SMTP_SECURE).toLowerCase() === 'true',
    auth: SMTP_USER
      ? {
          user: SMTP_USER,
          pass: SMTP_PASS,
        }
      : undefined,
  });
}

module.exports = createTransporter();
