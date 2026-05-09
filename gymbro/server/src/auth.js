import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

const JWT_SECRET = process.env.JWT_SECRET || 'change-me-please';
const ADMIN_USER = process.env.ADMIN_USER || 'admin';
const ADMIN_PASSWORD_HASH = process.env.ADMIN_PASSWORD_HASH || '';
const ADMIN_PASSWORD_PLAIN = process.env.ADMIN_PASSWORD || '';

const TOKEN_TTL = '7d';
const COOKIE_NAME = 'gymbro_session';

export function verifyCredentials(username, password) {
  if (username !== ADMIN_USER) return false;
  if (ADMIN_PASSWORD_HASH) {
    try {
      return bcrypt.compareSync(password, ADMIN_PASSWORD_HASH);
    } catch {
      return false;
    }
  }
  if (ADMIN_PASSWORD_PLAIN) {
    return password === ADMIN_PASSWORD_PLAIN;
  }
  return false;
}

export function issueToken() {
  return jwt.sign({ sub: ADMIN_USER, role: 'admin' }, JWT_SECRET, { expiresIn: TOKEN_TTL });
}

export function setSessionCookie(res, token) {
  const isProd = process.env.NODE_ENV === 'production';
  res.cookie(COOKIE_NAME, token, {
    httpOnly: true,
    secure: isProd,
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000,
    path: '/',
  });
}

export function clearSessionCookie(res) {
  res.clearCookie(COOKIE_NAME, { path: '/' });
}

export function requireAdmin(req, res, next) {
  const token = req.cookies?.[COOKIE_NAME];
  if (!token) return res.status(401).json({ error: 'unauthorized' });
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    if (payload.role !== 'admin') return res.status(403).json({ error: 'forbidden' });
    req.admin = payload;
    return next();
  } catch {
    return res.status(401).json({ error: 'invalid_token' });
  }
}
