const router = require('express').Router();
const { getDB } = require('../lib/db');
const { requireAuth, sanitize, comparePassword } = require('../lib/auth');
const { pingMonitor } = require('../lib/ping');
const wa = require('../lib/whatsapp');
const config = require('../config');

router.use(requireAuth);

router.get('/', async (req, res) => {
  try {
    const db = getDB();
    const monitors = await db.getUserMonitors(req.userId);
    const result = await Promise.all(monitors.map(async m => ({
      ...m, history: await db.getMonitorHistory(m.id, 30)
    })));
    res.json(result);
  } catch { res.status(500).json({ error: 'Failed to load monitors' }); }
});

router.get('/:id', async (req, res) => {
  try {
    const db = getDB();
    const monitor = await db.getMonitor(req.params.id);
    if (!monitor) return res.status(404).json({ error: 'Monitor not found' });
    if (String(monitor.user_id) !== String(req.userId)) return res.status(403).json({ error: 'Forbidden' });
    const history = await db.getMonitorHistory(monitor.id, 60);
    res.json({ ...monitor, history });
  } catch { res.status(500).json({ error: 'Failed to load monitor' }); }
});

router.post('/', async (req, res) => {
  try {
    const db = getDB();
    const user = await db.getUserById(req.userId);
    if (!user) return res.status(404).json({ error: 'User not found' });

    const name = sanitize(req.body.name);
    const url = sanitize(req.body.url);
    const path = req.body.path ? sanitize(req.body.path) : null;
    const method = (sanitize(req.body.method) || 'GET').toUpperCase();
    const body = (method === 'POST' && req.body.body) ? sanitize(req.body.body) : null;
    let intervalMins = parseInt(req.body.intervalMins) || 3;

    if (!name || !url) return res.status(400).json({ error: 'Name and URL are required' });
    if (name.length > 100) return res.status(400).json({ error: 'Monitor name too long (max 100 chars)' });
    if (!url.startsWith('http')) return res.status(400).json({ error: 'URL must start with http:// or https://' });
    if (!['GET', 'HEAD', 'POST'].includes(method)) return res.status(400).json({ error: 'Method must be GET, HEAD, or POST' });
    if (intervalMins < config.MIN_PING_INTERVAL_MINS) return res.status(400).json({ error: `Minimum interval is ${config.MIN_PING_INTERVAL_MINS} minutes` });
    if (intervalMins > 1440) return res.status(400).json({ error: 'Maximum interval is 24 hours' });

    const notifyDown = req.body.notify_down !== false && req.body.notify_down !== 'false';
    const notifyUp   = req.body.notify_up   !== false && req.body.notify_up   !== 'false';

    // Enforce monitor limit for non-admin users
    if (!req.isAdmin && !req.isSuperAdmin) {
      const currentCount = await db.getUserMonitorCount(req.userId);
      const limit = user.monitor_limit ?? 20;
      if (currentCount >= limit) {
        return res.status(403).json({
          error: `Monitor limit reached (${limit}). Contact an administrator to increase your limit.`
        });
      }
    }

    const monitor = await db.createMonitor(req.userId, { name, url, path, method, body, intervalMins, notifyDown, notifyUp });
    const displayUrl = url + (path || '');
    await wa.sendMonitorCreated(user.whatsapp, user.name, name, displayUrl, intervalMins);
    res.json(monitor);
  } catch (err) {
    console.error('Create monitor error:', err.message);
    res.status(500).json({ error: 'Failed to create monitor' });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const db = getDB();
    const monitor = await db.getMonitor(req.params.id);
    if (!monitor) return res.status(404).json({ error: 'Monitor not found' });
    if (String(monitor.user_id) !== String(req.userId)) return res.status(403).json({ error: 'Forbidden' });

    const { name, url, path, method, body, intervalMins, is_active, notify_down, notify_up } = req.body;
    const updates = {};
    if (name !== undefined) updates.name = sanitize(name);
    if (url !== undefined) updates.url = sanitize(url);
    if (path !== undefined) updates.path = path ? sanitize(path) : null;
    if (method !== undefined) {
      updates.method = sanitize(method).toUpperCase();
      if (updates.method !== 'POST') updates.body = null;
    }
    if (body !== undefined && (updates.method || monitor.method) === 'POST') updates.body = sanitize(body) || null;
    if (intervalMins !== undefined) {
      const i = parseInt(intervalMins);
      if (i < config.MIN_PING_INTERVAL_MINS) return res.status(400).json({ error: `Minimum interval is ${config.MIN_PING_INTERVAL_MINS} minutes` });
      if (i > 1440) return res.status(400).json({ error: 'Maximum interval is 24 hours' });
      updates.interval_mins = i;
    }
    if (is_active !== undefined) updates.is_active = is_active;
    if (notify_down !== undefined) updates.notify_down = notify_down !== false && notify_down !== 'false';
    if (notify_up !== undefined) updates.notify_up = notify_up !== false && notify_up !== 'false';

    res.json(await db.updateMonitor(req.params.id, updates));
  } catch { res.status(500).json({ error: 'Failed to update monitor' }); }
});

router.post('/bulk', async (req, res) => {
  try {
    const db = getDB();
    const { action, ids, password } = req.body;
    if (!action || !Array.isArray(ids) || ids.length === 0)
      return res.status(400).json({ error: 'action and ids are required' });

    if (action === 'delete') {
      if (!password) return res.status(400).json({ error: 'Password is required' });
      const user = await db.getUserById(req.userId);
      if (!user || !(await comparePassword(password, user.password_hash)))
        return res.status(400).json({ error: 'Incorrect password' });
    }

    let success = 0, skipped = 0;
    for (const id of ids) {
      try {
        const monitor = await db.getMonitor(String(id));
        if (!monitor || String(monitor.user_id) !== String(req.userId)) { skipped++; continue; }
        if (action === 'pause') {
          await db.updateMonitor(String(id), { is_active: false });
        } else if (action === 'activate') {
          await db.updateMonitor(String(id), { is_active: true });
        } else if (action === 'delete') {
          await db.deleteMonitor(String(id));
        } else { skipped++; continue; }
        success++;
      } catch { skipped++; }
    }
    res.json({ success, skipped });
  } catch { res.status(500).json({ error: 'Bulk action failed' }); }
});

router.delete('/:id', async (req, res) => {
  try {
    const db = getDB();
    const monitor = await db.getMonitor(req.params.id);
    if (!monitor) return res.status(404).json({ error: 'Monitor not found' });
    if (String(monitor.user_id) !== String(req.userId)) return res.status(403).json({ error: 'Forbidden' });

    // Require current password to confirm deletion
    const { password } = req.body || {};
    if (!password) return res.status(400).json({ error: 'Password is required to delete a monitor' });
    const user = await db.getUserById(req.userId);
    if (!user) return res.status(404).json({ error: 'User not found' });
    const valid = await comparePassword(password, user.password_hash);
    if (!valid) return res.status(400).json({ error: 'Incorrect password. Deletion cancelled.' });

    await db.deleteMonitor(req.params.id);
    res.json({ message: 'Monitor deleted' });
  } catch { res.status(500).json({ error: 'Failed to delete monitor' }); }
});

router.post('/:id/ping', async (req, res) => {
  try {
    const db = getDB();
    const monitor = await db.getMonitor(req.params.id);
    if (!monitor) return res.status(404).json({ error: 'Monitor not found' });
    if (String(monitor.user_id) !== String(req.userId)) return res.status(403).json({ error: 'Forbidden' });
    pingMonitor(monitor);
    res.json({ message: 'Ping triggered' });
  } catch { res.status(500).json({ error: 'Failed to trigger ping' }); }
});

module.exports = router;
