async function request(path, opts = {}) {
  const res = await fetch(path, {
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', ...(opts.headers || {}) },
    ...opts,
  });
  if (res.status === 401) {
    const err = new Error('unauthorized');
    err.status = 401;
    throw err;
  }
  let body = null;
  try { body = await res.json(); } catch { body = null; }
  if (!res.ok) {
    const err = new Error(body?.error || `http_${res.status}`);
    err.status = res.status;
    err.body = body;
    throw err;
  }
  return body;
}

export const api = {
  login: (username, password) => request('/api/admin/login', {
    method: 'POST',
    body: JSON.stringify({ username, password }),
  }),
  logout: () => request('/api/admin/logout', { method: 'POST' }),
  me: () => request('/api/admin/me'),
  botStatus: () => request('/api/admin/bot/status'),
  startBot: () => request('/api/admin/bot/start', { method: 'POST' }),
  stopBot: () => request('/api/admin/bot/stop', { method: 'POST' }),
  listUsers: () => request('/api/admin/users'),
  getUser: (id) => request(`/api/admin/users/${id}`),
};
