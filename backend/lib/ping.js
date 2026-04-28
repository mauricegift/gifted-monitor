const axios = require("axios");
const { getDB } = require("./db");
const mailer = require("./email");
const config = require("../config");

function buildCfg(monitor) {
  const targetUrl = monitor.url + (monitor.path || "");
  const cfg = {
    method: monitor.method.toLowerCase(),
    url: targetUrl,
    timeout: 20000,
    validateStatus: false,
    maxRedirects: 10,
    headers: { "User-Agent": "Mozilla/5.0 (compatible; GiftedMonitor/2.0)", Accept: "*/*" },
  };
  if (monitor.method === "POST") {
    const raw = (monitor.body || "").trim();
    if (raw) {
      try { cfg.data = JSON.parse(raw); cfg.headers["Content-Type"] = "application/json"; }
      catch { cfg.data = raw; cfg.headers["Content-Type"] = "text/plain"; }
    }
  }
  return cfg;
}

async function fetchOnce(monitor) {
  const start = Date.now();
  try {
    const resp = await axios(buildCfg(monitor));
    const responseTime = Date.now() - start;
    const status = resp.status >= 200 && resp.status < 400 ? "up" : "down";
    return { status, responseTime, errorMsg: status === "down" ? `HTTP ${resp.status}` : null };
  } catch (err) {
    return { status: "down", responseTime: Date.now() - start, errorMsg: err.code || err.message };
  }
}

async function pingMonitor(monitor) {
  const db = getDB();
  const targetUrl = monitor.url + (monitor.path || "");
  let result = await fetchOnce(monitor);

  if (result.status === "down") {
    const delays = [8000, 15000, 25000];
    for (let attempt = 0; attempt < 3; attempt++) {
      console.log(`⏳ [RETRY ${attempt + 1}/3] ${targetUrl} — ${result.errorMsg}, retrying in ${delays[attempt] / 1000}s…`);
      await new Promise(r => setTimeout(r, delays[attempt]));
      const retry = await fetchOnce(monitor);
      if (retry.status === "up") {
        console.log(`✅ [UP on retry ${attempt + 1}] ${targetUrl}`);
        result = retry;
        break;
      }
      result = retry;
      console.log(`❌ [DOWN retry ${attempt + 1}/3] ${targetUrl} — ${retry.errorMsg}`);
    }
    if (result.status === "down") {
      console.log(`🔴 [DOWN confirmed after 3 retries] ${targetUrl}`);
    }
  } else {
    console.log(`✅ [UP] ${targetUrl} — ${result.responseTime}ms`);
  }

  const { status, responseTime, errorMsg } = result;
  const prevStatus = monitor.last_status;
  const now = new Date();
  const updates = { last_status: status, last_response_time: responseTime, last_checked: now };

  if (status === "down") {
    if (prevStatus !== "down") {
      // ── First DOWN detection ──────────────────────────────────────────────
      // Record incident start but DO NOT alert yet. Wait for the next check
      // to confirm this isn't a brief blip. last_reminder_at = null signals
      // "incident pending confirmation — no alert sent yet".
      updates.incident_start = now;
      updates.last_reminder_at = null;
      console.log(`🟡 [PENDING] ${targetUrl} — first DOWN, awaiting next check to confirm`);

    } else if (monitor.incident_start && !monitor.last_reminder_at) {
      // ── Second consecutive DOWN — confirmed outage, send alert now ────────
      updates.last_reminder_at = now;
      console.log(`🔴 [CONFIRMED DOWN] ${targetUrl} — sending alert`);
      if (monitor.notify_down !== false) {
        const user = await db.getUserById(monitor.user_id);
        if (user?.notify_down !== false)
          await mailer.sendSiteDown(user.email, user.name, monitor.name, monitor.url, errorMsg || "Unknown", mailer.formatTime(now));
      }

    } else if (monitor.last_reminder_at) {
      // ── Already alerted — send a reminder every 24 h ─────────────────────
      const hoursSince = (Date.now() - new Date(monitor.last_reminder_at)) / (1000 * 60 * 60);
      if (hoursSince >= 24) {
        updates.last_reminder_at = now;
        console.log(`🔴 [24H REMINDER] ${targetUrl}`);
        if (monitor.notify_down !== false) {
          const user = await db.getUserById(monitor.user_id);
          if (user?.notify_down !== false)
            await mailer.sendSiteDown(user.email, user.name, monitor.name, monitor.url, `Still down — ${errorMsg}`, mailer.formatTime(now));
        }
      }
    }

  } else if (status === "up" && prevStatus === "down" && monitor.incident_start) {
    // ── Site recovered ────────────────────────────────────────────────────
    const downtimeMs = Date.now() - new Date(monitor.incident_start);
    updates.incident_start = null;
    updates.last_reminder_at = null;

    // Only send "recovered" if we actually sent a "down" alert first.
    // If last_reminder_at was null the blip resolved before we ever alerted —
    // no need to tell the user about something they never heard about.
    if (monitor.last_reminder_at && monitor.notify_up !== false) {
      console.log(`✅ [RECOVERED] ${targetUrl} — sending recovery alert`);
      const user = await db.getUserById(monitor.user_id);
      if (user?.notify_up !== false)
        await mailer.sendSiteRecovered(user.email, user.name, monitor.name, monitor.url, `${responseTime}ms`, mailer.formatDuration(downtimeMs));
    } else {
      console.log(`✅ [RECOVERED — no alert needed] ${targetUrl} — blip resolved before confirmation`);
    }
  }

  await db.updateMonitor(monitor.id, updates);
  await db.addCheckHistory(monitor.id, status, responseTime, errorMsg);
}

async function runPingCycle() {
  try {
    const db = getDB();
    const monitors = await db.getAllActiveMonitors();
    const now = Date.now();
    const due = monitors.filter(m => !m.last_checked || (now - new Date(m.last_checked)) / 1000 / 60 >= (m.interval_mins || 3));
    if (due.length > 0) {
      console.log(`🔄 Pinging ${due.length}/${monitors.length} due monitors…`);
      await Promise.all(due.map(pingMonitor));
    }
  } catch (err) { console.error("Ping cycle error:", err.message); }
}

function startPingEngine() {
  runPingCycle();
  setInterval(runPingCycle, config.PING_CHECK_INTERVAL_SECS * 1000);
}

module.exports = { pingMonitor, runPingCycle, startPingEngine };
