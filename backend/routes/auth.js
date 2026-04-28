const router = require("express").Router();
const rateLimit = require("express-rate-limit");
const { getDB } = require("../lib/db");
const {
  generateToken, otpExpiry, signToken, signResetToken, verifyResetToken,
  hashPassword, comparePassword, sanitize, requireAuth,
} = require("../lib/auth");
const { checkIpReputation, getClientIp } = require("../lib/ipcheck");
const mailer = require("../lib/email");
const config = require("../config");

const authLimiter   = rateLimit({ windowMs: 15 * 60 * 1000, max: 10, message: { error: "Too many attempts. Try again in 15 minutes." }, standardHeaders: true, legacyHeaders: false });
const otpLimiter    = rateLimit({ windowMs: 15 * 60 * 1000, max: 5,  message: { error: "Too many requests. Try again in 15 minutes." }, standardHeaders: true, legacyHeaders: false });
const signupLimiter = rateLimit({ windowMs: 60 * 60 * 1000, max: 3,  message: { error: "Too many signup attempts from this IP. Try again in 1 hour." }, standardHeaders: true, legacyHeaders: false });

function validateEmail(email) {
  if (!email) return "Email is required";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) return "Enter a valid email address (e.g. you@example.com)";
  return null;
}
function validatePassword(password) {
  if (!password) return "Password is required";
  if (password.length < 8) return "Password must be at least 8 characters";
  if (password.length > 128) return "Password is too long";
  if (!/[A-Z]/.test(password)) return "Password must include at least one uppercase letter (A-Z)";
  if (!/[a-z]/.test(password)) return "Password must include at least one lowercase letter (a-z)";
  if (!/[0-9]/.test(password)) return "Password must include at least one number (0-9)";
  if (!/[^A-Za-z0-9]/.test(password)) return "Password must include at least one special character (!@#$%^&*...)";
  return null;
}

function makeVerifyLink(email, token, type) {
  return `${config.FRONTEND_URL}/verify?email=${encodeURIComponent(email)}&token=${token}&type=${type}`;
}

// ── Signup ───────────────────────────────────────────────────────────────────
router.post("/signup", signupLimiter, authLimiter, async (req, res) => {
  try {
    const db = getDB();
    const username  = sanitize(req.body.username);
    const name      = sanitize(req.body.name);
    const userEmail = sanitize(req.body.email)?.toLowerCase();
    const password  = req.body.password;

    if (!username || !name || !userEmail || !password)
      return res.status(400).json({ error: "All fields are required" });
    if (!/^[a-z]{3,30}$/.test(username))
      return res.status(400).json({ error: "Username must be 3–30 lowercase letters only" });

    const emailErr = validateEmail(userEmail);
    if (emailErr) return res.status(400).json({ error: emailErr });
    const pwErr = validatePassword(password);
    if (pwErr) return res.status(400).json({ error: pwErr });

    if (await db.getUserByEmail(userEmail))
      return res.status(409).json({ error: "That email is already registered" });
    if (await db.getUserByUsername(username.toLowerCase()))
      return res.status(409).json({ error: "That username is already taken" });

    const userCount = await db.getUserCount();
    const isFirstUser = userCount === 0;

    // ── IP checks (skip for the very first user / platform owner) ───────────
    const clientIp = getClientIp(req);
    if (!isFirstUser && clientIp) {
      // 1. VPN / proxy / datacenter detection
      try {
        const ipInfo = await checkIpReputation(clientIp);
        if (ipInfo.blocked) {
          return res.status(403).json({ error: ipInfo.reason });
        }
      } catch (e) {
        console.warn("ipcheck failed:", e.message);
        // fail-open — don't block on API error
      }

      // 2. One account per IP
      if (db.getUserByRegistrationIp) {
        const existingIpUser = await db.getUserByRegistrationIp(clientIp);
        if (existingIpUser) {
          return res.status(409).json({
            error: "An account has already been created from this IP address. Contact support if you believe this is an error."
          });
        }
      }
    }

    const passwordHash = await hashPassword(password);

    await db.createUser({
      username: username.toLowerCase(), name, email: userEmail,
      whatsapp: "", passwordHash, isAdmin: isFirstUser, isSuperAdmin: isFirstUser,
      registrationIp: clientIp || null
    });

    const token = generateToken();
    await db.createOtp(userEmail, token, "signup", otpExpiry(30));
    const link = makeVerifyLink(userEmail, token, "signup");
    await mailer.sendVerificationLink(userEmail, "signup", link);

    res.json({ message: "Account created! Check your email for a verification link.", email: userEmail, isAdmin: isFirstUser });
  } catch (err) {
    console.error("Signup error:", err.message);
    res.status(500).json({ error: "Signup failed. Please try again." });
  }
});

// ── Verify OTP (handles link-based tokens) ───────────────────────────────────
router.post("/verify-otp", otpLimiter, async (req, res) => {
  try {
    const db = getDB();
    const email = sanitize(req.body.email)?.toLowerCase();
    const code  = sanitize(req.body.code);
    const type  = sanitize(req.body.type);

    if (!email || !code || !type) return res.status(400).json({ error: "Email, code and type are required" });

    const otp = await db.getValidOtp(email, code, type);
    if (!otp) return res.status(400).json({ error: "Invalid or expired link. Please request a new one." });

    await db.markOtpUsed(otp.id);

    if (type === "signup") {
      const user = await db.getUserByEmail(email);
      if (!user) return res.status(404).json({ error: "User not found" });
      await db.updateUser(user.id, { is_verified: true });
      const authToken = signToken(user.id, user.is_admin, user.is_superadmin);
      const { password_hash, ...safe } = { ...user, is_verified: true };
      mailer.sendWelcome(user.email, user.name).catch(() => {});
      return res.json({ token: authToken, user: safe, message: "Account verified successfully! Welcome aboard." });
    }

    if (type === "reset") {
      const resetToken = signResetToken(email);
      return res.json({ resetToken, message: "Verified. You can now reset your password." });
    }

    res.status(400).json({ error: "Unknown verification type" });
  } catch (err) {
    console.error("Verify error:", err.message);
    res.status(500).json({ error: "Verification failed. Please try again." });
  }
});

// ── Resend Verification Link ──────────────────────────────────────────────────
router.post("/resend-otp", otpLimiter, async (req, res) => {
  try {
    const db = getDB();
    const email = sanitize(req.body.email)?.toLowerCase();
    const type  = sanitize(req.body.type);

    if (!email || !type) return res.status(400).json({ error: "Email and type are required" });

    const user = await db.getUserByEmail(email);
    if (!user) return res.status(404).json({ error: "No account found with that email" });

    const token = generateToken();
    await db.createOtp(email, token, type, otpExpiry(30));
    const link = makeVerifyLink(email, token, type);
    await mailer.sendVerificationLink(user.email, type, link);

    const label = type === "reset" ? "password reset" : "verification";
    res.json({ message: `A new ${label} link has been sent to your email.` });
  } catch (err) {
    console.error("Resend error:", err.message);
    res.status(500).json({ error: "Failed to resend. Please try again." });
  }
});

// ── Login ─────────────────────────────────────────────────────────────────────
router.post("/login", authLimiter, async (req, res) => {
  try {
    const db = getDB();
    const emailOrUsername = sanitize(req.body.identifier || req.body.email || req.body.username)?.toLowerCase();
    const password = req.body.password;

    if (!emailOrUsername || !password) return res.status(400).json({ error: "Email and password are required" });

    let user = await db.getUserByEmail(emailOrUsername) || await db.getUserByUsername(emailOrUsername);
    if (!user) return res.status(401).json({ error: "Invalid credentials" });
    if (user.is_disabled) return res.status(403).json({ error: "Your account has been disabled. Contact an administrator." });
    if (!user.is_verified) {
      const token = generateToken();
      await db.createOtp(user.email, token, "signup", otpExpiry(30));
      const link = makeVerifyLink(user.email, token, "signup");
      await mailer.sendVerificationLink(user.email, "signup", link);
      return res.status(403).json({ error: "Account not verified. A new verification link has been sent to your email.", requiresVerification: true, email: user.email });
    }

    const valid = await comparePassword(password, user.password_hash);
    if (!valid) return res.status(401).json({ error: "Invalid credentials" });

    const authToken = signToken(user.id, user.is_admin, user.is_superadmin);
    const { password_hash, ...safe } = user;
    res.json({ token: authToken, user: safe });
  } catch (err) {
    console.error("Login error:", err.message);
    res.status(500).json({ error: "Login failed. Please try again." });
  }
});

// ── Forgot Password ───────────────────────────────────────────────────────────
router.post("/forgot-password", otpLimiter, async (req, res) => {
  try {
    const db = getDB();
    const email = sanitize(req.body.email)?.toLowerCase();
    const emailErr = validateEmail(email || "");
    if (emailErr) return res.status(400).json({ error: emailErr });

    const user = await db.getUserByEmail(email);
    if (!user) return res.status(404).json({ error: "No account found with that email" });

    const token = generateToken();
    await db.createOtp(email, token, "reset", otpExpiry(30));
    const link = makeVerifyLink(email, token, "reset");
    await mailer.sendVerificationLink(user.email, "reset", link);

    res.json({ message: "A password reset link has been sent to your email.", email });
  } catch (err) {
    console.error("Forgot password error:", err.message);
    res.status(500).json({ error: "Failed to send reset link. Please try again." });
  }
});

// ── Reset Password ────────────────────────────────────────────────────────────
router.post("/reset-password", authLimiter, async (req, res) => {
  try {
    const db = getDB();
    const { resetToken, newPassword } = req.body;

    if (!resetToken || !newPassword) return res.status(400).json({ error: "Reset token and new password are required" });

    const pwErr = validatePassword(newPassword);
    if (pwErr) return res.status(400).json({ error: pwErr });

    let payload;
    try { payload = verifyResetToken(resetToken); }
    catch { return res.status(400).json({ error: "Invalid or expired reset link. Please start over." }); }

    const user = await db.getUserByEmail(payload.email);
    if (!user) return res.status(404).json({ error: "User not found" });

    const passwordHash = await hashPassword(newPassword);
    await db.updateUser(user.id, { password_hash: passwordHash });

    res.json({ message: "Password reset successfully. You can now log in." });
  } catch (err) {
    console.error("Reset password error:", err.message);
    res.status(500).json({ error: "Failed to reset password. Please try again." });
  }
});

// ── Get current user ──────────────────────────────────────────────────────────
router.get("/me", requireAuth, async (req, res) => {
  try {
    const user = await getDB().getUserById(req.userId);
    if (!user) return res.status(401).json({ error: "User not found" });
    if (user.is_disabled) return res.status(401).json({ error: "Your account has been disabled." });
    const { password_hash, ...safe } = user;
    res.setHeader("x-refresh-token", signToken(user.id, user.is_admin, user.is_superadmin));
    res.json(safe);
  } catch { res.status(500).json({ error: "Failed to fetch user" }); }
});

// ── Update profile ────────────────────────────────────────────────────────────
router.put("/profile", requireAuth, async (req, res) => {
  try {
    const db = getDB();
    const { name, avatar } = req.body;
    const updates = {};
    if (name !== undefined) updates.name = sanitize(name).slice(0, 100);
    if (avatar !== undefined) updates.avatar = avatar || null;
    if (!Object.keys(updates).length) return res.status(400).json({ error: "No fields provided" });
    const user = await db.updateUser(req.userId, updates);
    const { password_hash, ...safe } = user;
    res.json(safe);
  } catch { res.status(500).json({ error: "Failed to update profile" }); }
});

// ── Change password ───────────────────────────────────────────────────────────
router.post("/change-password", requireAuth, async (req, res) => {
  try {
    const db = getDB();
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) return res.status(400).json({ error: "Current and new password are required" });
    const user = await db.getUserById(req.userId);
    if (!user) return res.status(404).json({ error: "User not found" });
    if (!(await comparePassword(currentPassword, user.password_hash)))
      return res.status(400).json({ error: "Current password is incorrect" });
    const pwErr = validatePassword(newPassword);
    if (pwErr) return res.status(400).json({ error: pwErr });
    const passwordHash = await hashPassword(newPassword);
    await db.updateUser(req.userId, { password_hash: passwordHash });
    res.json({ message: "Password changed successfully" });
  } catch { res.status(500).json({ error: "Failed to change password" }); }
});

// ── Request email change (sends confirmation link to NEW email) ───────────────
router.post("/request-email-change", requireAuth, otpLimiter, async (req, res) => {
  try {
    const db = getDB();
    const newEmail = sanitize(req.body.newEmail)?.toLowerCase();
    const emailErr = validateEmail(newEmail || "");
    if (emailErr) return res.status(400).json({ error: emailErr });

    const current = await db.getUserById(req.userId);
    if (!current) return res.status(404).json({ error: "User not found" });
    if (current.email === newEmail) return res.status(400).json({ error: "That is already your current email address" });

    const exists = await db.getUserByEmail(newEmail);
    if (exists) return res.status(409).json({ error: "That email is already in use by another account" });

    // Store pending email temporarily in DB
    await db.updateUser(req.userId, { pending_email: newEmail });

    const token = generateToken();
    await db.createOtp(newEmail, token, "email_change", otpExpiry(30));
    const link = `${config.FRONTEND_URL}/verify?email=${encodeURIComponent(newEmail)}&token=${token}&type=email_change&uid=${req.userId}`;
    await mailer.sendVerificationLink(newEmail, "email_change", link);

    res.json({ message: `A confirmation link has been sent to ${newEmail}. Click it to complete the change.` });
  } catch (err) {
    console.error("Email change request error:", err.message);
    res.status(500).json({ error: "Failed to send confirmation. Please try again." });
  }
});

// ── Confirm email change (called when link is clicked) ────────────────────────
router.post("/confirm-email-change", otpLimiter, async (req, res) => {
  try {
    const db = getDB();
    const newEmail = sanitize(req.body.email)?.toLowerCase();
    const token    = sanitize(req.body.token);
    const uid      = req.body.uid;
    if (!newEmail || !token || !uid) return res.status(400).json({ error: "Invalid confirmation link" });

    const otp = await db.getValidOtp(newEmail, token, "email_change");
    if (!otp) return res.status(400).json({ error: "Invalid or expired confirmation link. Please request a new one." });
    await db.markOtpUsed(otp.id);

    const user = await db.getUserById(uid);
    if (!user) return res.status(404).json({ error: "User not found" });
    if (user.pending_email !== newEmail) return res.status(400).json({ error: "This link does not match your pending email change." });

    // Check no one else grabbed that email while waiting
    const conflict = await db.getUserByEmail(newEmail);
    if (conflict && String(conflict.id) !== String(uid)) return res.status(409).json({ error: "That email is already in use." });

    await db.updateUser(uid, { email: newEmail, pending_email: null });
    const updated = await db.getUserById(uid);
    const { password_hash, ...safe } = updated;
    const newToken = require("../lib/auth").signToken(updated.id, updated.is_admin, updated.is_superadmin);
    res.json({ message: "Email address updated successfully!", token: newToken, user: safe });
  } catch (err) {
    console.error("Email change confirm error:", err.message);
    res.status(500).json({ error: "Failed to confirm email change. Please try again." });
  }
});

// ── Notification preferences ──────────────────────────────────────────────────
router.post("/notification-prefs", requireAuth, async (req, res) => {
  try {
    const db = getDB();
    const { notify_down, notify_up } = req.body;
    const updates = {};
    if (notify_down !== undefined) updates.notify_down = notify_down !== false && notify_down !== "false";
    if (notify_up   !== undefined) updates.notify_up   = notify_up   !== false && notify_up   !== "false";
    if (!Object.keys(updates).length) return res.status(400).json({ error: "No fields provided" });
    const user = await db.updateUser(req.userId, updates);
    const { password_hash, ...safe } = user;
    res.json(safe);
  } catch { res.status(500).json({ error: "Failed to update notification preferences" }); }
});

module.exports = router;
