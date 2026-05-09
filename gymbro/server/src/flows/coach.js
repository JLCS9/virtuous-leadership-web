import { chat, chatJson } from '../ai/claude.js';
import { COACH_SYSTEM, PLANNER_SYSTEM } from '../ai/prompts.js';
import { getMessages, getActivities, createActivity } from '../db.js';
import { todayDate } from '../lib/time.js';

function profileSummary(user) {
  const parts = [
    `Nombre: ${user.name}`,
    user.age ? `Edad: ${user.age}` : null,
    user.sex ? `Sexo: ${user.sex}` : null,
    user.weight_kg ? `Peso: ${user.weight_kg} kg` : null,
    user.goal ? `Objetivo: ${user.goal}` : null,
    user.gym ? `Gimnasio: ${user.gym}` : 'Entrena fuera del gimnasio (casa o calle)',
  ].filter(Boolean);
  return parts.join(' | ');
}

function buildHistory(user, incomingText, lookback = 10) {
  const history = getMessages(user.id, lookback)
    .reverse()
    .map((m) => ({
      role: m.direction === 'in' ? 'user' : 'assistant',
      content: m.body,
    }));

  history.push({ role: 'user', content: incomingText });

  const collapsed = [];
  for (const msg of history) {
    const last = collapsed[collapsed.length - 1];
    if (last && last.role === msg.role) {
      last.content = `${last.content}\n${msg.content}`;
    } else {
      collapsed.push({ ...msg });
    }
  }
  return collapsed;
}

export async function respondAsCoach(user, text) {
  const today = todayDate();
  const todays = getActivities(user.id, { date: today });
  const todayLine = todays.length === 0
    ? 'Hoy no hay actividad registrada todavía.'
    : `Hoy: ${todays.map((a) => `${a.scheduled_time || '--'} ${a.description || a.type} [${a.status}]`).join('; ')}`;

  const system = `${COACH_SYSTEM}\n\nPERFIL DEL USUARIO:\n${profileSummary(user)}\n\nESTADO DE HOY:\n${todayLine}\nFecha actual: ${today}`;

  const messages = buildHistory(user, text);

  const reply = await chat({ system, messages, maxTokens: 600 });

  await maybeExtractActivities(user, text, reply).catch(() => {});

  return reply;
}

async function maybeExtractActivities(user, userText, assistantReply) {
  const lower = (userText + ' ' + assistantReply).toLowerCase();
  const trigger = /(voy a|hago|entren|entrenar|gimnasio|caminar|correr|cardio|pesas|rutina|hoy.*(ejerc|deport)|a las \d)/i;
  if (!trigger.test(lower)) return;

  const today = todayDate();
  const existing = getActivities(user.id, { date: today });
  if (existing.length >= 3) return;

  const planner = await chatJson({
    system: PLANNER_SYSTEM,
    messages: [
      {
        role: 'user',
        content:
          `PERFIL: ${profileSummary(user)}\n` +
          `MENSAJE DEL USUARIO: ${userText}\n` +
          `MI RESPUESTA: ${assistantReply}\n\n` +
          `Extrae actividades para hoy (${today}). Si no hay nada concreto, devuelve activities vacío.`,
      },
    ],
    maxTokens: 400,
  });

  if (!planner || !Array.isArray(planner.activities)) return;

  for (const a of planner.activities.slice(0, 3 - existing.length)) {
    if (!a || (!a.description && !a.type)) continue;
    createActivity(user.id, {
      date: today,
      type: a.type || 'otros',
      description: a.description || null,
      scheduled_time: a.scheduled_time || null,
    });
  }
}
