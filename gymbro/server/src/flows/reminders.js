import cron from 'node-cron';
import { db, getActivities, updateActivity, upsertDailyLog } from '../db.js';
import { chat } from '../ai/claude.js';
import { MORNING_SYSTEM, EVENING_SYSTEM } from '../ai/prompts.js';
import { todayDate, nowInTz, minutesBetween, TZ } from '../lib/time.js';
import { sendText } from '../whatsapp/client.js';

function profileSummary(user) {
  const parts = [
    `Nombre: ${user.name}`,
    user.age ? `Edad: ${user.age}` : null,
    user.sex ? `Sexo: ${user.sex}` : null,
    user.weight_kg ? `Peso: ${user.weight_kg} kg` : null,
    user.goal ? `Objetivo: ${user.goal}` : null,
    user.gym ? `Gimnasio: ${user.gym}` : 'Sin gimnasio',
  ].filter(Boolean);
  return parts.join(' | ');
}

function activeUsers() {
  return db.prepare("SELECT * FROM users WHERE state = 'active'").all();
}

async function sendMorning(user) {
  const today = todayDate();
  const log = db.prepare('SELECT * FROM daily_logs WHERE user_id = ? AND date = ?').get(user.id, today);
  if (log?.morning_msg) return;

  const yesterday = db.prepare(`
    SELECT * FROM daily_logs
    WHERE user_id = ? AND date < ?
    ORDER BY date DESC LIMIT 1
  `).get(user.id, today);

  const todays = getActivities(user.id, { date: today });
  const plannedLine = todays.length
    ? todays.map((a) => `- ${a.scheduled_time || '--'} ${a.description || a.type}`).join('\n')
    : '(no hay actividad planeada todavía)';

  const yesterdayLine = yesterday
    ? `Ayer (${yesterday.date}): ${yesterday.evening_msg || yesterday.summary || 'sin feedback'}`
    : 'Sin datos previos.';

  try {
    const text = await chat({
      system: MORNING_SYSTEM,
      messages: [
        {
          role: 'user',
          content:
            `PERFIL: ${profileSummary(user)}\n` +
            `${yesterdayLine}\n` +
            `PLAN DE HOY:\n${plannedLine}`,
        },
      ],
      maxTokens: 400,
    });

    await sendText(user.jid, text);
    upsertDailyLog(user.id, today, { morning_msg: text });
    db.prepare('INSERT INTO messages (user_id, direction, body) VALUES (?, ?, ?)').run(user.id, 'out', text);
  } catch (err) {
    console.error('[reminders] morning error', user.jid, err.message);
  }
}

async function sendEvening(user) {
  const today = todayDate();
  const log = db.prepare('SELECT * FROM daily_logs WHERE user_id = ? AND date = ?').get(user.id, today);
  if (log?.evening_msg) return;

  const todays = getActivities(user.id, { date: today });
  const summary = todays.length
    ? todays.map((a) => `${a.description || a.type} [${a.status}]`).join('; ')
    : 'sin actividades registradas';

  try {
    const text = await chat({
      system: EVENING_SYSTEM,
      messages: [
        {
          role: 'user',
          content:
            `Perfil: ${profileSummary(user)}\n` +
            `Plan de hoy: ${summary}\n\n` +
            `Genera el mensaje de check-in nocturno preguntando cómo le fue.`,
        },
      ],
      maxTokens: 200,
    });
    await sendText(user.jid, text);
    upsertDailyLog(user.id, today, { evening_msg: text });
    db.prepare('INSERT INTO messages (user_id, direction, body) VALUES (?, ?, ?)').run(user.id, 'out', text);
  } catch (err) {
    console.error('[reminders] evening error', user.jid, err.message);
  }
}

async function sendActivityReminders() {
  const now = nowInTz();
  const items = db.prepare(`
    SELECT a.*, u.jid, u.name
    FROM activities a
    JOIN users u ON u.id = a.user_id
    WHERE a.date = ?
      AND a.scheduled_time IS NOT NULL
      AND a.status = 'planned'
      AND a.reminder_sent = 0
      AND u.state = 'active'
  `).all(now.date);

  for (const a of items) {
    const diff = minutesBetween(now.time, a.scheduled_time);
    if (diff <= 10 && diff >= -2) {
      const msg =
        diff <= 0
          ? `⏰ ${a.name}, toca ahora: ${a.description || a.type}. ¡A por ello!`
          : `⏰ En ${diff} min toca: ${a.description || a.type}. ¡Prepárate!`;
      try {
        await sendText(a.jid, msg);
        updateActivity(a.id, { reminder_sent: 1 });
        db.prepare('INSERT INTO messages (user_id, direction, body) VALUES (?, ?, ?)').run(a.user_id, 'out', msg);
      } catch (err) {
        console.error('[reminders] activity reminder error', a.jid, err.message);
      }
    }
  }
}

let started = false;

export function startCron() {
  if (started) return;
  started = true;

  cron.schedule('0 8 * * *', async () => {
    for (const u of activeUsers()) {
      await sendMorning(u);
    }
  }, { timezone: TZ });

  cron.schedule('0 21 * * *', async () => {
    for (const u of activeUsers()) {
      await sendEvening(u);
    }
  }, { timezone: TZ });

  cron.schedule('* * * * *', () => {
    sendActivityReminders().catch((e) => console.error('[reminders] tick', e));
  }, { timezone: TZ });

  console.log(`[reminders] cron started (TZ=${TZ})`);
}
