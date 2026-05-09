const path = require("path");
require("dotenv").config({ path: path.join(__dirname, ".env") });

module.exports = {
  PORT: process.env.PORT || 58420,
  NODE_ENV: process.env.NODE_ENV || "development",
  DATABASE_URL: process.env.DATABASE_URL || "",
  JWT_SECRET: process.env.JWT_SECRET || "gifted_monitor_jwt_secret_dev_only",
  // Resend — up to 5 domains; minimum 1 required; tried in round-robin order, exhausting all before returning error
  RESEND1_API_KEY: process.env.RESEND1_API_KEY || "",
  RESEND1_DOMAIN:  process.env.RESEND1_DOMAIN  || "monitor-alerts.gifted.co.ke",
  RESEND2_API_KEY: process.env.RESEND2_API_KEY || "",
  RESEND2_DOMAIN:  process.env.RESEND2_DOMAIN  || "monitoring-alerts.gifted.co.ke",
  RESEND3_API_KEY: process.env.RESEND3_API_KEY || "",
  RESEND3_DOMAIN:  process.env.RESEND3_DOMAIN  || "monitoring-alert.gifted.co.ke",
  RESEND4_API_KEY: process.env.RESEND4_API_KEY || "",
  RESEND4_DOMAIN:  process.env.RESEND4_DOMAIN  || "",
  RESEND5_API_KEY: process.env.RESEND5_API_KEY || "",
  RESEND5_DOMAIN:  process.env.RESEND5_DOMAIN  || "",
  EMAIL_FROM_NAME: process.env.EMAIL_FROM_NAME || "Gifted Monitor",
  FRONTEND_URL: process.env.FRONTEND_URL || "https://monitor.gifted.co.ke",
  PING_CHECK_INTERVAL_SECS: parseInt(process.env.PING_CHECK_INTERVAL_SECS || "10"),
  MIN_PING_INTERVAL_MINS: 0.5,
  TIMEZONE: process.env.TIMEZONE || "Africa/Nairobi",
  ALLOWED_ORIGINS: (process.env.ALLOWED_ORIGINS || "http://localhost:3000")
    .split(",").map((o) => o.trim()),
};
