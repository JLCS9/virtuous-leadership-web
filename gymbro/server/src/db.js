import Database from 'better-sqlite3';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DB_PATH = process.env.DB_PATH || join(__dirname, '..', 'data', 'gymbro.db');

const schemaPath = join(__dirname, 'schema.sql');
const schemaSql = readFileSync(schemaPath, 'utf8');

export const db = new Database(DB_PATH);
db.pragma('journal_mode = WAL');
db.exec(schemaSql);

export function getBotState() {
  return db.prepare('SELECT * FROM bot_state WHERE id = 1').get();
}

export function setBotState(patch) {
  const current = getBotState();
  const next = { ...current, ...patch, updated_at: new Date().toISOString() };
  db.prepare(`
    UPDATE bot_state
    SET status = @status,
        qr = @qr,
        qr_updated_at = @qr_updated_at,
        connected_jid = @connected_jid,
        last_error = @last_error,
        updated_at = @updated_at
    WHERE id = 1
  `).run(next);
  return next;
}

export function findUserByJid(jid) {
  return db.prepare('SELECT * FROM users WHERE jid = ?').get(jid);
}

export function createUser(jid, phone) {
  const info = db.prepare(
    'INSERT INTO users (jid, phone, state) VALUES (?, ?, ?)'
  ).run(jid, phone, 'onboarding_name');
  return db.prepare('SELECT * FROM users WHERE id = ?').get(info.lastInsertRowid);
}

export function updateUser(id, patch) {
  const fields = Object.keys(patch);
  if (fields.length === 0) return;
  const set = fields.map((f) => `${f} = @${f}`).join(', ');
  db.prepare(
    `UPDATE users SET ${set}, updated_at = datetime('now') WHERE id = @id`
  ).run({ ...patch, id });
}

export function listUsers() {
  return db.prepare(`
    SELECT u.*,
           (SELECT COUNT(*) FROM messages m WHERE m.user_id = u.id) AS message_count,
           (SELECT MAX(created_at) FROM messages m WHERE m.user_id = u.id) AS last_message_at
    FROM users u
    WHERE u.state NOT LIKE 'onboarding_%'
       OR u.name IS NOT NULL
    ORDER BY u.created_at DESC
  `).all();
}

export function getUser(id) {
  return db.prepare('SELECT * FROM users WHERE id = ?').get(id);
}

export function getMessages(userId, limit = 50) {
  return db.prepare(
    'SELECT * FROM messages WHERE user_id = ? ORDER BY created_at DESC LIMIT ?'
  ).all(userId, limit);
}

export function logMessage(userId, direction, body) {
  db.prepare(
    'INSERT INTO messages (user_id, direction, body) VALUES (?, ?, ?)'
  ).run(userId, direction, body);
}

export function getActivities(userId, { date, limit = 50 } = {}) {
  if (date) {
    return db.prepare(
      'SELECT * FROM activities WHERE user_id = ? AND date = ? ORDER BY scheduled_time'
    ).all(userId, date);
  }
  return db.prepare(
    'SELECT * FROM activities WHERE user_id = ? ORDER BY date DESC, scheduled_time LIMIT ?'
  ).all(userId, limit);
}

export function createActivity(userId, { date, type, description, scheduled_time }) {
  const info = db.prepare(`
    INSERT INTO activities (user_id, date, type, description, scheduled_time)
    VALUES (?, ?, ?, ?, ?)
  `).run(userId, date, type || null, description || null, scheduled_time || null);
  return db.prepare('SELECT * FROM activities WHERE id = ?').get(info.lastInsertRowid);
}

export function updateActivity(id, patch) {
  const fields = Object.keys(patch);
  if (fields.length === 0) return;
  const set = fields.map((f) => `${f} = @${f}`).join(', ');
  db.prepare(
    `UPDATE activities SET ${set}, updated_at = datetime('now') WHERE id = @id`
  ).run({ ...patch, id });
}

export function pendingReminders(now) {
  return db.prepare(`
    SELECT a.*, u.jid, u.timezone
    FROM activities a
    JOIN users u ON u.id = a.user_id
    WHERE a.date = ?
      AND a.scheduled_time IS NOT NULL
      AND a.status = 'planned'
      AND a.reminder_sent = 0
  `).all(now.date);
}

export function getDailyLog(userId, date) {
  return db.prepare(
    'SELECT * FROM daily_logs WHERE user_id = ? AND date = ?'
  ).get(userId, date);
}

export function upsertDailyLog(userId, date, patch) {
  const existing = getDailyLog(userId, date);
  if (existing) {
    const fields = Object.keys(patch);
    if (fields.length === 0) return existing;
    const set = fields.map((f) => `${f} = @${f}`).join(', ');
    db.prepare(
      `UPDATE daily_logs SET ${set} WHERE user_id = @user_id AND date = @date`
    ).run({ ...patch, user_id: userId, date });
    return getDailyLog(userId, date);
  }
  db.prepare(`
    INSERT INTO daily_logs (user_id, date, morning_msg, evening_msg, summary)
    VALUES (@user_id, @date, @morning_msg, @evening_msg, @summary)
  `).run({
    user_id: userId,
    date,
    morning_msg: patch.morning_msg || null,
    evening_msg: patch.evening_msg || null,
    summary: patch.summary || null,
  });
  return getDailyLog(userId, date);
}
