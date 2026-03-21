const router = require("express").Router();
const { getDB } = require("../lib/db");
const {
  requireAuth,
  requireAdmin,
  sanitize,
  hashPassword,
  comparePassword,
} = require("../lib/auth");
const { pingMonitor } = require("../lib/ping");
const { TIMEZONE } = require("../config");

router.use(requireAuth, requireAdmin);

// ─── Admin Stats ───────
router.get("/stats", async (req, res) => {
  try {
    const db = getDB();
    const [{ users }, { monitors, total: totalMonitors }] = await Promise.all([
      db.getAllUsers({ limit: 99999 }),
      db.getAllMonitors({ limit: 99999 }),
    ]);
    const up = monitors.filter((m) => m.last_status === "up").length;
    const down = monitors.filter((m) => m.last_status === "down").length;
    res.json({
      totalUsers: users.length,
      totalMonitors,
      monitorsUp: up,
      monitorsDown: down,
      timezone: TIMEZONE,
    });
  } catch {
    res.status(500).json({ error: "Failed to load stats" });
  }
});

// ─── Users ────────────────
router.get("/users", async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit) || 10));
    const search = sanitize(req.query.search || "");
    const result = await getDB().getAllUsers({ search, page, limit });
    res.json(result);
  } catch {
    res.status(500).json({ error: "Failed to load users" });
  }
});

// ─── Get monitors for a specific user (admin) ───
router.get("/users/:id/monitors", async (req, res) => {
  try {
    const db = getDB();
    const monitors = await db.getUserMonitors(req.params.id);
    const result = await Promise.all(
      monitors.map(async (m) => ({
        ...m,
        history: await db.getMonitorHistory(m.id, 30),
      })),
    );
    res.json(result);
  } catch {
    res.status(500).json({ error: "Failed to load user monitors" });
  }
});

router.put("/users/:id", async (req, res) => {
  try {
    const db = getDB();
    const targetId = String(req.params.id);
    const selfId = String(req.userId);

    // Fetch target user to check permissions
    const target = await db.getUserById(targetId);
    if (!target) return res.status(404).json({ error: "User not found" });

    const actorIsSuperAdmin = !!req.isSuperAdmin;
    const actorIsAdmin = !!req.isAdmin;

    // Superadmin cannot be edited by anyone except themselves
    if (target.is_superadmin && targetId !== selfId)
      return res
        .status(403)
        .json({ error: "Cannot modify the superadmin account" });

    // Only superadmin can edit admins (other than themselves)
    if (target.is_admin && !target.is_superadmin && !actorIsSuperAdmin)
      return res
        .status(403)
        .json({ error: "Only the superadmin can modify admin accounts" });

    const {
      name,
      email,
      username,
      whatsapp,
      is_verified,
      is_admin,
      is_disabled,
      password,
      monitor_limit,
    } = req.body;
    const updates = {};

    if (name !== undefined) updates.name = sanitize(name);
    if (email !== undefined) updates.email = sanitize(email).toLowerCase();
    if (whatsapp !== undefined) updates.whatsapp = sanitize(whatsapp);
    if (is_verified !== undefined) updates.is_verified = is_verified;

    // Username edit
    if (username !== undefined) {
      const uname = sanitize(username).toLowerCase();
      if (!/^[a-z]{3,30}$/.test(uname))
        return res
          .status(400)
          .json({ error: "Username must be 3–30 lowercase letters only" });
      const existing = await db.getUserByUsername(uname);
      if (existing && String(existing.id) !== targetId)
        return res.status(409).json({ error: `@${uname} is already taken` });
      updates.username = uname;
    }

    // Only superadmin can change admin status
    if (is_admin !== undefined) {
      if (!actorIsSuperAdmin)
        return res
          .status(403)
          .json({ error: "Only the superadmin can change admin status" });
      // Superadmin can't demote themselves
      if (targetId === selfId)
        return res
          .status(400)
          .json({ error: "You cannot change your own admin status" });
      updates.is_admin = is_admin;
    }

    // Disable/enable: only superadmin can affect admins; only superadmin/admin for regular users
    if (is_disabled !== undefined) {
      if (targetId === selfId)
        return res
          .status(400)
          .json({ error: "You cannot disable your own account" });
      if (target.is_superadmin)
        return res
          .status(403)
          .json({ error: "Cannot disable the superadmin account" });
      if (target.is_admin && !actorIsSuperAdmin)
        return res
          .status(403)
          .json({ error: "Only the superadmin can disable admin accounts" });
      updates.is_disabled = is_disabled;
    }

    if (password) {
      if (password.length < 6)
        return res
          .status(400)
          .json({ error: "Password must be at least 6 characters" });
      updates.password_hash = await hashPassword(password);
    }

    if (monitor_limit !== undefined) {
      const lim = parseInt(monitor_limit);
      if (isNaN(lim) || lim < 1 || lim > 10000)
        return res.status(400).json({ error: "Monitor limit must be between 1 and 10,000" });
      updates.monitor_limit = lim;
    }

    const user = await db.updateUser(targetId, updates);
    const { password_hash, ...safe } = user;
    res.json(safe);
  } catch {
    res.status(500).json({ error: "Failed to update user" });
  }
});

// ─── Bulk user actions ─────────────────────────────────────────────
router.post("/users/bulk", async (req, res) => {
  try {
    const db = getDB();
    const { action, ids, password } = req.body;
    if (!action || !Array.isArray(ids) || ids.length === 0)
      return res.status(400).json({ error: "action and ids are required" });

    const selfId = String(req.userId);
    const actorIsSuperAdmin = !!req.isSuperAdmin;

    if (action === "delete") {
      if (!password) return res.status(400).json({ error: "Password is required" });
      const self = await db.getUserById(selfId);
      if (!self || !(await comparePassword(password, self.password_hash)))
        return res.status(400).json({ error: "Incorrect password" });
    }

    let success = 0, skipped = 0;
    for (const id of ids) {
      const sid = String(id);
      if (sid === selfId) { skipped++; continue; }
      try {
        const target = await db.getUserById(sid);
        if (!target || target.is_superadmin) { skipped++; continue; }
        if (target.is_admin && !actorIsSuperAdmin) { skipped++; continue; }
        if (action === "verify") {
          await db.updateUser(sid, { is_verified: true });
        } else if (action === "disable") {
          await db.updateUser(sid, { is_disabled: true });
        } else if (action === "enable") {
          await db.updateUser(sid, { is_disabled: false });
        } else if (action === "delete") {
          await db.deleteUser(sid);
        } else {
          skipped++; continue;
        }
        success++;
      } catch { skipped++; }
    }
    res.json({ success, skipped });
  } catch {
    res.status(500).json({ error: "Bulk action failed" });
  }
});

router.delete("/users/:id", async (req, res) => {
  try {
    const db = getDB();
    const targetId = String(req.params.id);
    const selfId = String(req.userId);

    if (targetId === selfId)
      return res.status(400).json({ error: "Cannot delete your own account" });

    const target = await db.getUserById(targetId);
    if (!target) return res.status(404).json({ error: "User not found" });

    if (target.is_superadmin)
      return res.status(403).json({ error: "Cannot delete the superadmin account" });

    if (target.is_admin && !req.isSuperAdmin)
      return res.status(403).json({ error: "Only the superadmin can delete admin accounts" });

    // Require admin's own password to confirm deletion
    const { password } = req.body || {};
    if (!password) return res.status(400).json({ error: "Password is required to delete a user" });
    const self = await db.getUserById(selfId);
    if (!self || !(await comparePassword(password, self.password_hash)))
      return res.status(400).json({ error: "Incorrect password. Deletion cancelled." });

    await db.deleteUser(targetId);
    res.json({ message: "User deleted" });
  } catch {
    res.status(500).json({ error: "Failed to delete user" });
  }
});

// ─── Monitors ──────────────────
router.get("/monitors", async (req, res) => {
  try {
    const db = getDB();
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 20));
    const search = sanitize(req.query.search || "");
    const { monitors, total } = await db.getAllMonitors({
      search,
      page,
      limit,
    });
    const result = await Promise.all(
      monitors.map(async (m) => ({
        ...m,
        history: await db.getMonitorHistory(m.id, 30),
      })),
    );
    res.json({ monitors: result, total, page, limit });
  } catch {
    res.status(500).json({ error: "Failed to load monitors" });
  }
});

router.get("/monitors/:id", async (req, res) => {
  try {
    const db = getDB();
    const monitor = await db.getMonitor(req.params.id);
    if (!monitor) return res.status(404).json({ error: "Monitor not found" });
    const history = await db.getMonitorHistory(monitor.id, 60);
    res.json({ ...monitor, history });
  } catch {
    res.status(500).json({ error: "Failed to load monitor" });
  }
});

router.put("/monitors/:id", async (req, res) => {
  try {
    const db = getDB();
    const { name, url, path, method, body, intervalMins, is_active, notify_down, notify_up } = req.body;
    const updates = {};
    if (name !== undefined) updates.name = sanitize(name);
    if (url !== undefined) updates.url = sanitize(url);
    if (path !== undefined) updates.path = path ? sanitize(path) : null;
    if (method !== undefined) updates.method = sanitize(method).toUpperCase();
    if (body !== undefined) updates.body = sanitize(body);
    if (intervalMins !== undefined) updates.interval_mins = parseInt(intervalMins);
    if (is_active !== undefined) updates.is_active = is_active;
    if (notify_down !== undefined) updates.notify_down = notify_down !== false && notify_down !== 'false';
    if (notify_up !== undefined) updates.notify_up = notify_up !== false && notify_up !== 'false';
    res.json(await db.updateMonitor(req.params.id, updates));
  } catch {
    res.status(500).json({ error: "Failed to update monitor" });
  }
});

// ─── Bulk monitor actions ───────────────────────────────────────────
router.post("/monitors/bulk", async (req, res) => {
  try {
    const db = getDB();
    const { action, ids, password, intervalMins } = req.body;
    if (!action || !Array.isArray(ids) || ids.length === 0)
      return res.status(400).json({ error: "action and ids are required" });

    if (action === "delete") {
      if (!password) return res.status(400).json({ error: "Password is required" });
      const self = await db.getUserById(req.userId);
      if (!self || !(await comparePassword(password, self.password_hash)))
        return res.status(400).json({ error: "Incorrect password" });
    }

    let success = 0, skipped = 0;
    for (const id of ids) {
      try {
        if (action === "pause") {
          await db.updateMonitor(String(id), { is_active: false });
        } else if (action === "activate") {
          await db.updateMonitor(String(id), { is_active: true });
        } else if (action === "interval") {
          const mins = parseInt(intervalMins);
          if (!mins || mins < 1) { skipped++; continue; }
          await db.updateMonitor(String(id), { interval_mins: mins });
        } else if (action === "delete") {
          await db.deleteMonitor(String(id));
        } else {
          skipped++; continue;
        }
        success++;
      } catch { skipped++; }
    }
    res.json({ success, skipped });
  } catch {
    res.status(500).json({ error: "Bulk action failed" });
  }
});

router.delete("/monitors/:id", async (req, res) => {
  try {
    const db = getDB();
    // Require admin's own password to confirm deletion
    const { password } = req.body || {};
    if (!password) return res.status(400).json({ error: "Password is required to delete a monitor" });
    const self = await db.getUserById(req.userId);
    if (!self || !(await comparePassword(password, self.password_hash)))
      return res.status(400).json({ error: "Incorrect password. Deletion cancelled." });
    await db.deleteMonitor(req.params.id);
    res.json({ message: "Monitor deleted" });
  } catch {
    res.status(500).json({ error: "Failed to delete monitor" });
  }
});

router.post("/monitors/:id/ping", async (req, res) => {
  try {
    const monitor = await getDB().getMonitor(req.params.id);
    if (!monitor) return res.status(404).json({ error: "Monitor not found" });
    pingMonitor(monitor);
    res.json({ message: "Ping triggered" });
  } catch {
    res.status(500).json({ error: "Failed to ping" });
  }
});

router.get("/contact", async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const result = await getDB().getContactMessages({ page, limit: 10 });
    res.json(result);
  } catch {
    res.status(500).json({ error: "Failed to fetch messages" });
  }
});

router.patch("/contact/:id/read", async (req, res) => {
  try {
    await getDB().markContactRead(req.params.id);
    res.json({ ok: true });
  } catch {
    res.status(500).json({ error: "Failed to update message" });
  }
});

router.post("/contact/bulk", async (req, res) => {
  try {
    const db = getDB();
    const { action, ids } = req.body;
    if (!action || !Array.isArray(ids) || ids.length === 0)
      return res.status(400).json({ error: "action and ids are required" });
    let success = 0, skipped = 0;
    for (const id of ids) {
      try {
        if (action === "read") {
          await db.markContactRead(String(id));
        } else if (action === "delete") {
          await db.deleteContactMessage(String(id));
        } else { skipped++; continue; }
        success++;
      } catch { skipped++; }
    }
    res.json({ success, skipped });
  } catch {
    res.status(500).json({ error: "Bulk action failed" });
  }
});

router.delete("/contact/:id", async (req, res) => {
  try {
    await getDB().deleteContactMessage(req.params.id);
    res.json({ ok: true });
  } catch {
    res.status(500).json({ error: "Failed to delete message" });
  }
});

module.exports = router;
