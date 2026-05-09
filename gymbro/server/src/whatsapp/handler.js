import { findUserByJid, createUser, logMessage, updateUser } from '../db.js';
import { isOnboarding, handleOnboarding, nextQuestion } from '../flows/onboarding.js';
import { respondAsCoach } from '../flows/coach.js';

export async function handleIncoming({ jid, phone, text }) {
  if (!text || !text.trim()) return null;

  let user = findUserByJid(jid);
  if (!user) {
    user = createUser(jid, phone);
  }

  logMessage(user.id, 'in', text);

  let reply = null;

  if (isOnboarding(user)) {
    if (!user.name && user.state !== 'onboarding_name') {
      const result = handleOnboarding(user, text);
      reply = result.reply;
    } else {
      const result = handleOnboarding(user, text);
      reply = result.reply;
    }
  } else if (user.state === 'active') {
    try {
      reply = await respondAsCoach(user, text);
    } catch (err) {
      console.error('[handler] coach error', err);
      reply = 'Uf, se me ha cruzado un cable. Dame un segundo y vuelve a escribirme 🙏';
    }
  } else {
    user = { ...user, state: 'onboarding_name' };
    updateUser(user.id, { state: 'onboarding_name' });
    reply = nextQuestion(user);
  }

  if (reply) {
    logMessage(user.id, 'out', reply);
  }
  return reply;
}
