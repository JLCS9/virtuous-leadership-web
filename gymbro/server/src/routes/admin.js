import { Router } from 'express';
import {
  verifyCredentials,
  issueToken,
  setSessionCookie,
  clearSessionCookie,
  requireAdmin,
} from '../auth.js';
import {
  listUsers,
  getUser,
  getMessages,
  getActivities,
  getBotState,
} from '../db.js';
import { startBot, stopBot } from '../whatsapp/client.js';

export const adminRouter = Router();

adminRouter.post('/login', (req, res) => {
  const { username, password } = req.body || {};
  if (!username || !password) return res.status(400).json({ error: 'missing_credentials' });
  if (!verifyCredentials(username, password)) {
    return res.status(401).json({ error: 'invalid_credentials' });
  }
  const token = issueToken();
  setSessionCookie(res, token);
  res.json({ ok: true });
});

adminRouter.post('/logout', (req, res) => {
  clearSessionCookie(res);
  res.json({ ok: true });
});

adminRouter.get('/me', requireAdmin, (req, res) => {
  res.json({ admin: req.admin });
});

adminRouter.get('/bot/status', requireAdmin, (req, res) => {
  res.json(getBotState());
});

adminRouter.post('/bot/start', requireAdmin, async (req, res) => {
  try {
    await startBot();
    res.json(getBotState());
  } catch (err) {
    console.error('[admin] start bot error', err);
    res.status(500).json({ error: 'start_failed', message: err.message });
  }
});

adminRouter.post('/bot/stop', requireAdmin, async (req, res) => {
  try {
    await stopBot();
    res.json(getBotState());
  } catch (err) {
    console.error('[admin] stop bot error', err);
    res.status(500).json({ error: 'stop_failed', message: err.message });
  }
});

adminRouter.get('/users', requireAdmin, (req, res) => {
  res.json({ users: listUsers() });
});

adminRouter.get('/users/:id', requireAdmin, (req, res) => {
  const id = parseInt(req.params.id, 10);
  const user = getUser(id);
  if (!user) return res.status(404).json({ error: 'not_found' });
  const messages = getMessages(id, 100).reverse();
  const activities = getActivities(id, { limit: 50 });
  res.json({ user, messages, activities });
});
