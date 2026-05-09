import 'dotenv/config';
import express from 'express';
import cookieParser from 'cookie-parser';
import { adminRouter } from './routes/admin.js';
import { startCron } from './flows/reminders.js';
import { getBotState } from './db.js';
import { startBot } from './whatsapp/client.js';

const app = express();

app.use(express.json({ limit: '1mb' }));
app.use(cookieParser());

app.get('/healthz', (req, res) => res.json({ ok: true, bot: getBotState().status }));

app.use('/api/admin', adminRouter);

app.use((err, req, res, next) => {
  console.error('[express] unhandled', err);
  res.status(500).json({ error: 'internal_error' });
});

const PORT = parseInt(process.env.PORT || '3002', 10);

app.listen(PORT, '0.0.0.0', async () => {
  console.log(`[server] gymbro api listening on :${PORT}`);
  startCron();

  if (process.env.AUTOSTART_BOT === 'true' && getBotState().status !== 'connected') {
    console.log('[server] autostart bot enabled, attempting reconnect from saved auth...');
    startBot().catch((err) => console.error('[server] autostart failed', err));
  }
});

process.on('SIGTERM', () => { console.log('[server] SIGTERM'); process.exit(0); });
process.on('SIGINT', () => { console.log('[server] SIGINT'); process.exit(0); });
