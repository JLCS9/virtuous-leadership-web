import { updateUser } from '../db.js';

const STEPS = [
  'onboarding_name',
  'onboarding_age',
  'onboarding_sex',
  'onboarding_weight',
  'onboarding_goal',
  'onboarding_gym',
];

const QUESTIONS = {
  onboarding_name: '¡Hola! Soy gymbro.ai, tu entrenador personal por WhatsApp 💪\n\nAntes de empezar, necesito conocerte un poco. ¿Cómo quieres que te llame?',
  onboarding_age: (u) => `Encantado, ${u.name}. ¿Qué edad tienes?`,
  onboarding_sex: '¿Cuál es tu sexo? (hombre / mujer / otro)',
  onboarding_weight: '¿Cuántos kilos pesas ahora mismo? (aproximado vale)',
  onboarding_goal: '¿Cuál es tu objetivo principal? (perder peso, ganar masa, mantenerme en forma, mejorar resistencia, otro)',
  onboarding_gym: '¿Estás apuntado a algún gimnasio? Si es así dime cuál; si no, dime "no" y entrenaremos en casa o al aire libre.',
};

const COMPLETED = (u) =>
  `Perfecto ${u.name}. Ya tengo tu perfil 🎯\n\n` +
  `Cada mañana te mandaré tu objetivo del día y te recordaré tus entrenos 10 minutos antes. ` +
  `Por la noche te preguntaré qué tal ha ido para ajustar el plan.\n\n` +
  `¿Empezamos hoy? Cuéntame qué te apetece o tienes pensado hacer.`;

export function isOnboarding(user) {
  return STEPS.includes(user.state);
}

function nextStep(state) {
  const i = STEPS.indexOf(state);
  if (i < 0) return null;
  if (i + 1 >= STEPS.length) return 'active';
  return STEPS[i + 1];
}

function parseAge(text) {
  const m = text.match(/\d{1,3}/);
  if (!m) return null;
  const n = parseInt(m[0], 10);
  if (n < 10 || n > 100) return null;
  return n;
}

function parseSex(text) {
  const t = text.trim().toLowerCase();
  if (/^h|hombre|masc|chico|m$/.test(t)) return 'hombre';
  if (/^m|mujer|fem|chica|f$/.test(t)) return 'mujer';
  if (/otro|nb|no.binario/.test(t)) return 'otro';
  return null;
}

function parseWeight(text) {
  const m = text.match(/\d{1,3}(?:[.,]\d+)?/);
  if (!m) return null;
  const n = parseFloat(m[0].replace(',', '.'));
  if (n < 30 || n > 300) return null;
  return n;
}

export function nextQuestion(user) {
  const q = QUESTIONS[user.state];
  return typeof q === 'function' ? q(user) : q;
}

export function handleOnboarding(user, text) {
  const trimmed = text.trim();

  switch (user.state) {
    case 'onboarding_name': {
      const name = trimmed.split(/\s+/).slice(0, 3).join(' ');
      if (!name || name.length < 2 || name.length > 40) {
        return { reply: 'Dime un nombre con el que te pueda llamar (entre 2 y 40 caracteres).' };
      }
      const next = nextStep(user.state);
      updateUser(user.id, { name, state: next });
      return { reply: QUESTIONS.onboarding_age({ name }) };
    }

    case 'onboarding_age': {
      const age = parseAge(trimmed);
      if (!age) return { reply: 'No te he pillado la edad. Dime un número (ej. "32").' };
      const next = nextStep(user.state);
      updateUser(user.id, { age, state: next });
      return { reply: QUESTIONS.onboarding_sex };
    }

    case 'onboarding_sex': {
      const sex = parseSex(trimmed);
      if (!sex) return { reply: 'Dime "hombre", "mujer" u "otro".' };
      const next = nextStep(user.state);
      updateUser(user.id, { sex, state: next });
      return { reply: QUESTIONS.onboarding_weight };
    }

    case 'onboarding_weight': {
      const weight_kg = parseWeight(trimmed);
      if (!weight_kg) return { reply: 'No te he pillado el peso. Dime un número en kg (ej. "78" o "78.5").' };
      const next = nextStep(user.state);
      updateUser(user.id, { weight_kg, state: next });
      return { reply: QUESTIONS.onboarding_goal };
    }

    case 'onboarding_goal': {
      if (trimmed.length < 3 || trimmed.length > 200) {
        return { reply: 'Cuéntame en una frase tu objetivo (ej. "perder 5 kg" o "ganar masa").' };
      }
      const next = nextStep(user.state);
      updateUser(user.id, { goal: trimmed, state: next });
      return { reply: QUESTIONS.onboarding_gym };
    }

    case 'onboarding_gym': {
      const gym = /^(no|nope|ninguno|qu[eé] va)/i.test(trimmed) ? null : trimmed.slice(0, 100);
      updateUser(user.id, { gym, state: 'active' });
      const updated = { ...user, gym, name: user.name };
      return { reply: COMPLETED(updated) };
    }

    default:
      return { reply: null };
  }
}
