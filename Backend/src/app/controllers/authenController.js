const bcrypt = require("bcrypt");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const EmailOtp = require("../models/EmailOtp");

function signToken(user) {
  const secret = process.env.JWT_SECRET || "dev-jwt-secret-change-me";
  const expiresIn = process.env.JWT_EXPIRES_IN || "14d";

  return jwt.sign(
    {
      sub: String(user._id),
      email: user.email,
      role: user.role,
    },
    secret,
    { expiresIn }
  );
}

function normalizeEmail(email) {
  return String(email || "").trim().toLowerCase();
}

function generateOtp6() {
  return String(crypto.randomInt(0, 1_000_000)).padStart(6, "0");
}

function isOtpConsumed(record) {
  return Boolean(record?.consumedAt);
}

function validatePasswordStandard(password) {
  const value = String(password || "");
  if (value.length < 8) {
    return { ok: false, message: "Password must be at least 8 characters" };
  }

  // bcrypt only uses first 72 bytes of a string; avoid surprising truncation.
  if (value.length > 72) {
    return { ok: false, message: "Password must be at most 72 characters" };
  }

  if (!/[a-z]/.test(value)) {
    return { ok: false, message: "Password must include a lowercase letter" };
  }
  if (!/[A-Z]/.test(value)) {
    return { ok: false, message: "Password must include an uppercase letter" };
  }
  if (!/[0-9]/.test(value)) {
    return { ok: false, message: "Password must include a number" };
  }

  return { ok: true, message: "" };
}

function publicUser(user) {
  return {
    id: String(user._id),
    email: user.email,
    fullName: user.fullName,
    avatarUrl: user.avatarUrl,
    gender: user.gender,
    tall: user.tall,
    weight: user.weight,
    experiencePoints: user.experiencePoints,
    regularity: user.regularity,
    goal: user.goal,
    trainingRunning: user.trainingRunning,
    onboardingCompleted: user.onboardingCompleted,
  };
}

const authenController = {
  // ================= EMAIL OTP =================
  // POST /api/auth/email/request-otp
  async requestEmailOtp(req, res) {
    try {
      const flow = String(req.body.flow || "").trim(); // signup | login
      const email = normalizeEmail(req.body.email);
      const password = String(req.body.password || "");

      if (!["signup", "login"].includes(flow)) {
        return res.status(400).json({ message: "Invalid flow" });
      }
      if (!email) return res.status(400).json({ message: "Email is required" });
      if (!password) return res.status(400).json({ message: "Password is required" });

      const existing = await User.findOne({ email });

      if (flow === "signup") {
        if (existing) return res.status(400).json({ message: "Email already exists" });

        const check = validatePasswordStandard(password);
        if (!check.ok) return res.status(400).json({ message: check.message });
      }

      if (flow === "login") {
        if (!existing || !existing.passWorldHash) {
          return res.status(400).json({ message: "Invalid credentials" });
        }
        const ok = await bcrypt.compare(password, existing.passWorldHash);
        if (!ok) return res.status(400).json({ message: "Invalid credentials" });
      }

      const otp = generateOtp6();
      const otpHash = await bcrypt.hash(otp, 10);

      const record = await EmailOtp.create({
        email,
        purpose: flow,
        otpHash,
        expiresAt: new Date(Date.now() + 10 * 60 * 1000),
        passwordHashForSignup: flow === "signup" ? await bcrypt.hash(password, 10) : null,
      });

      const transporter = req.app.get("transporter");
      await transporter.sendMail({
        to: email,
        from: process.env.SMTP_FROM || process.env.SMTP_USER || "no-reply@walkingapp.local",
        subject: "Your verification code",
        text: `Your verification code is: ${otp}. It expires in 10 minutes.`,
      });

      return res.status(200).json({
        verificationId: String(record._id),
        expiresAt: record.expiresAt,
      });
    } catch (e) {
      console.error("requestEmailOtp error:", e);
      return res.status(500).json({ message: "Internal server error" });
    }
  },

  // POST /api/auth/email/verify-otp
  async verifyEmailOtp(req, res) {
    try {
      const verificationId = String(req.body.verificationId || "").trim();
      const code = String(req.body.code || "").trim();

      if (!verificationId) return res.status(400).json({ message: "verificationId is required" });
      if (!/^[0-9]{6}$/.test(code)) return res.status(400).json({ message: "OTP must be 6 digits" });

      const record = await EmailOtp.findById(verificationId);
      if (!record) return res.status(400).json({ message: "Invalid OTP" });

      if (isOtpConsumed(record)) {
        return res.status(400).json({ message: "OTP already used" });
      }

      if (record.expiresAt.getTime() < Date.now()) {
        return res.status(400).json({ message: "OTP expired" });
      }

      const ok = await bcrypt.compare(code, record.otpHash);
      if (!ok) {
        record.attempts = Number(record.attempts || 0) + 1;
        await record.save();
        return res.status(400).json({ message: "Invalid OTP" });
      }

      let user = await User.findOne({ email: record.email });

      if (record.purpose === "signup") {
        if (user) return res.status(400).json({ message: "Email already exists" });

        user = await User.create({
          email: record.email,
          passWorldHash: record.passwordHashForSignup,
          active: true,
          onboardingCompleted: false,
        });
      } else {
        // login
        if (!user) return res.status(400).json({ message: "User not found" });
      }

      record.consumedAt = new Date();
      await record.save();

      const token = signToken(user);
      return res.status(200).json({ token, user: publicUser(user) });
    } catch (e) {
      return res.status(500).json({ message: "Internal server error" });
    }
  },

  // ================= FORGOT PASSWORD (EMAIL OTP) =================
  // POST /api/auth/email/forgot-password
  async requestPasswordResetOtp(req, res) {
    try {
      const email = normalizeEmail(req.body.email);
      if (!email) return res.status(400).json({ message: "Email is required" });

      const user = await User.findOne({ email });
      if (!user) return res.status(400).json({ message: "Email not found" });

      const otp = generateOtp6();
      const otpHash = await bcrypt.hash(otp, 10);

      const record = await EmailOtp.create({
        email,
        purpose: "reset",
        otpHash,
        expiresAt: new Date(Date.now() + 10 * 60 * 1000),
      });

      const transporter = req.app.get("transporter");
      await transporter.sendMail({
        to: email,
        from: process.env.SMTP_FROM || process.env.SMTP_USER || "no-reply@walkingapp.local",
        subject: "Reset your password",
        text: `Your password reset code is: ${otp}. It expires in 10 minutes.`,
      });

      return res.status(200).json({
        verificationId: String(record._id),
        expiresAt: record.expiresAt,
      });
    } catch (e) {
      console.error("requestPasswordResetOtp error:", e);
      return res.status(500).json({ message: "Internal server error" });
    }
  },

  // POST /api/auth/email/reset-password
  async resetPasswordWithOtp(req, res) {
    try {
      const verificationId = String(req.body.verificationId || "").trim();
      const code = String(req.body.code || "").trim();
      const newPassword = String(req.body.newPassword || "");

      if (!verificationId) return res.status(400).json({ message: "verificationId is required" });
      if (!/^[0-9]{6}$/.test(code)) return res.status(400).json({ message: "OTP must be 6 digits" });
      if (!newPassword) return res.status(400).json({ message: "New password is required" });

      const check = validatePasswordStandard(newPassword);
      if (!check.ok) return res.status(400).json({ message: check.message });

      const record = await EmailOtp.findById(verificationId);
      if (!record || record.purpose !== "reset") return res.status(400).json({ message: "Invalid OTP" });
      if (isOtpConsumed(record)) return res.status(400).json({ message: "OTP already used" });

      if (record.expiresAt.getTime() < Date.now()) {
        return res.status(400).json({ message: "OTP expired" });
      }

      if (Number(record.attempts || 0) >= 5) {
        return res.status(400).json({ message: "Too many attempts. Please request a new code." });
      }

      const ok = await bcrypt.compare(code, record.otpHash);
      if (!ok) {
        record.attempts = Number(record.attempts || 0) + 1;
        await record.save();
        return res.status(400).json({ message: "Invalid OTP" });
      }

      const user = await User.findOne({ email: record.email });
      if (!user) return res.status(400).json({ message: "User not found" });

      user.passWorldHash = await bcrypt.hash(newPassword, 10);
      await user.save();

      record.consumedAt = new Date();
      await record.save();

      return res.status(200).json({ message: "Password updated" });
    } catch (e) {
      return res.status(500).json({ message: "Internal server error" });
    }
  },

  // ================= EMAIL PASSWORD LOGIN (NO OTP) =================
  // POST /api/auth/email/login
  async loginWithEmailPassword(req, res) {
    try {
      const email = normalizeEmail(req.body.email);
      const password = String(req.body.password || "");

      if (!email) return res.status(400).json({ message: "Email is required" });
      if (!password) return res.status(400).json({ message: "Password is required" });

      const user = await User.findOne({ email });
      if (!user || !user.passWorldHash) {
        return res.status(400).json({ message: "Invalid credentials" });
      }

      const ok = await bcrypt.compare(password, user.passWorldHash);
      if (!ok) return res.status(400).json({ message: "Invalid credentials" });

      const token = signToken(user);
      return res.status(200).json({ token, user: publicUser(user) });
    } catch (e) {
      return res.status(500).json({ message: "Internal server error" });
    }
  },


  async getMe(req, res) {
    return res.status(200).json({ user: publicUser(req.user) });
  },

  // PUT /api/me/onboarding
  async submitOnboarding(req, res) {
    try {
      const {
        fullName,
        gender,
        tall,
        weight,
        experiencePoints,
        regularity,
        goal,
        trainingRunning,
      } = req.body;

      req.user.fullName = String(fullName || "").trim();
      req.user.gender = gender; 
      req.user.tall = tall;
      req.user.weight = weight;
      req.user.experiencePoints = experiencePoints;
      req.user.regularity = regularity;
      req.user.goal = goal;
      req.user.trainingRunning = trainingRunning;
      req.user.onboardingCompleted = true;

      await req.user.save();
      return res.status(200).json({ user: publicUser(req.user) });
    } catch (e) {
      return res.status(500).json({ message: "Internal server error" });
    }
  },


  async googleCallback(req, res) {
    try {
      if (!req.user) return res.status(401).json({ message: "Google authentication failed" });

      const token = signToken(req.user);
      const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";

      return res.redirect(`${frontendUrl}/auth/callback?token=${encodeURIComponent(token)}`);
    } catch (e) {
      const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
      return res.redirect(`${frontendUrl}${ROUTE_PATH?.SIGNIN || "/signin"}`);
    }
  },
};

module.exports = authenController;
