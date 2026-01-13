const nodemailer = require("nodemailer");

function createTransporter() {
  const smtpHost = String(process.env.SMTP_HOST || "").trim();
  const smtpUser = String(process.env.SMTP_USER || "").trim();
  // Gmail app passwords are often written with spaces (e.g. "abcd efgh ...").
  // Normalize to the actual password value.
  const smtpPass = String(process.env.SMTP_PASS || "").replace(/\s+/g, "");

  const hasSmtp = Boolean(smtpHost) && Boolean(smtpUser) && Boolean(smtpPass);

  if (!hasSmtp) {
    // Dev-friendly fallback: don't fail requests if SMTP isn't configured.
    // Emails will be printed as JSON to logs.
    return nodemailer.createTransport({ jsonTransport: true });
  }

  const transporter = nodemailer.createTransport({
    host: smtpHost,
    port: Number(process.env.SMTP_PORT || 587),
    secure: process.env.SMTP_SECURE === "true", 
    auth: {
      user: smtpUser,
      pass: smtpPass,
    },
  });

  // Non-blocking startup verification (helps debug 500 mail errors quickly).
  transporter
    .verify()
    .then(() => console.log("SMTP transporter verified"))
    .catch((err) => console.error("SMTP transporter verify failed:", err?.message || err));

  return transporter;
}

module.exports = createTransporter();
