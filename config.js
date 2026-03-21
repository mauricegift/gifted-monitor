const path = require("path");
require("dotenv").config({ path: path.join(__dirname, ".env") });

module.exports = {
  // ── Server ──────────────────────
  PORT: process.env.PORT || 58420,
  NODE_ENV: process.env.NODE_ENV || "development",

  // ── Database ────────────────────
  DATABASE_URL: process.env.DATABASE_URL || "",

  // ── Auth ────────────────────────
  JWT_SECRET: process.env.JWT_SECRET || "gifted_monitor_jwt_secret_2024",

  // ── WhatsApp -───────────────────
  WHATSAPP_TOKEN: process.env.WHATSAPP_TOKEN || "",
  WHATSAPP_PHONE_ID: process.env.WHATSAPP_PHONE_ID || "",

  // ── WhatsApp Template Names ─────
  WA_TEMPLATE_OTP: process.env.WA_TEMPLATE_OTP || "gifted_monitor_otp",
  WA_TEMPLATE_MONITOR_CREATED:
    process.env.WA_TEMPLATE_MONITOR_CREATED || "gifted_monitor_created",
  WA_TEMPLATE_SITE_DOWN:
    process.env.WA_TEMPLATE_SITE_DOWN || "gifted_monitor_down",
  WA_TEMPLATE_SITE_RECOVERED:
    process.env.WA_TEMPLATE_SITE_RECOVERED || "gifted_monitor_back_online",

  // ── Monitoring Engine ────────────
  PING_CHECK_INTERVAL_SECS: parseInt(
    process.env.PING_CHECK_INTERVAL_SECS || "10",
  ),
  MIN_PING_INTERVAL_MINS: parseInt(process.env.MIN_PING_INTERVAL_MINS || "3"),

  // ── Timezone -────────────────────
  TIMEZONE: process.env.TIMEZONE || "Africa/Nairobi",

  // ── CORS ─────────────────────────
  // Add more, comma separated
  ALLOWED_ORIGINS: (
    process.env.ALLOWED_ORIGINS || "https://monitor.giftedtech.co.ke"
  )
    .split(",")
    .map((o) => o.trim()),
};
