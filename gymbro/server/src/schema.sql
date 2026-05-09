PRAGMA journal_mode = WAL;
PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS users (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  jid          TEXT UNIQUE NOT NULL,
  phone        TEXT,
  name         TEXT,
  age          INTEGER,
  sex          TEXT,
  weight_kg    REAL,
  goal         TEXT,
  gym          TEXT,
  timezone     TEXT DEFAULT 'Europe/Madrid',
  state        TEXT NOT NULL DEFAULT 'onboarding_name',
  state_data   TEXT,
  created_at   TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at   TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_users_state ON users(state);

CREATE TABLE IF NOT EXISTS messages (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id    INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  direction  TEXT NOT NULL CHECK (direction IN ('in','out')),
  body       TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_messages_user_created ON messages(user_id, created_at DESC);

CREATE TABLE IF NOT EXISTS activities (
  id              INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id         INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  date            TEXT NOT NULL,
  type            TEXT,
  description     TEXT,
  scheduled_time  TEXT,
  status          TEXT NOT NULL DEFAULT 'planned' CHECK (status IN ('planned','done','skipped')),
  feedback        TEXT,
  reminder_sent   INTEGER NOT NULL DEFAULT 0,
  created_at      TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at      TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_activities_user_date ON activities(user_id, date);
CREATE INDEX IF NOT EXISTS idx_activities_reminder ON activities(date, scheduled_time, reminder_sent);

CREATE TABLE IF NOT EXISTS daily_logs (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id     INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  date        TEXT NOT NULL,
  morning_msg TEXT,
  evening_msg TEXT,
  summary     TEXT,
  created_at  TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE(user_id, date)
);

CREATE TABLE IF NOT EXISTS bot_state (
  id              INTEGER PRIMARY KEY CHECK (id = 1),
  status          TEXT NOT NULL DEFAULT 'stopped',
  qr              TEXT,
  qr_updated_at   TEXT,
  connected_jid   TEXT,
  last_error      TEXT,
  updated_at      TEXT NOT NULL DEFAULT (datetime('now'))
);

INSERT OR IGNORE INTO bot_state (id, status) VALUES (1, 'stopped');
