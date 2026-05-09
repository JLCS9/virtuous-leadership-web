import {
  default as makeWASocket,
  useMultiFileAuthState,
  DisconnectReason,
  fetchLatestBaileysVersion,
} from '@whiskeysockets/baileys';
import { Boom } from '@hapi/boom';
import QRCode from 'qrcode';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { mkdirSync, rmSync, existsSync } from 'node:fs';
import { setBotState } from '../db.js';
import { handleIncoming } from './handler.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const AUTH_DIR = process.env.WA_AUTH_DIR || join(__dirname, '..', '..', 'data', 'wa-auth');

let sock = null;
let starting = false;

export function getSocket() {
  return sock;
}

export async function startBot() {
  if (sock || starting) return;
  starting = true;

  if (!existsSync(AUTH_DIR)) mkdirSync(AUTH_DIR, { recursive: true });

  const { state, saveCreds } = await useMultiFileAuthState(AUTH_DIR);
  const { version } = await fetchLatestBaileysVersion();

  setBotState({ status: 'starting', qr: null, qr_updated_at: null, last_error: null });

  sock = makeWASocket({
    version,
    auth: state,
    printQRInTerminal: false,
    syncFullHistory: false,
    markOnlineOnConnect: false,
  });

  sock.ev.on('creds.update', saveCreds);

  sock.ev.on('connection.update', async (update) => {
    const { connection, lastDisconnect, qr } = update;

    if (qr) {
      try {
        const dataUrl = await QRCode.toDataURL(qr, { margin: 1, scale: 6 });
        setBotState({
          status: 'qr',
          qr: dataUrl,
          qr_updated_at: new Date().toISOString(),
        });
        console.log('[wa] QR generated');
      } catch (err) {
        console.error('[wa] qr render error', err);
      }
    }

    if (connection === 'open') {
      const me = sock.user?.id || null;
      setBotState({
        status: 'connected',
        qr: null,
        qr_updated_at: null,
        connected_jid: me,
        last_error: null,
      });
      console.log('[wa] connected as', me);
    }

    if (connection === 'close') {
      const code = new Boom(lastDisconnect?.error)?.output?.statusCode;
      const loggedOut = code === DisconnectReason.loggedOut;
      console.log('[wa] disconnected', { code, loggedOut });

      sock = null;
      starting = false;

      if (loggedOut) {
        setBotState({
          status: 'stopped',
          qr: null,
          qr_updated_at: null,
          connected_jid: null,
          last_error: 'logged_out',
        });
        try { rmSync(AUTH_DIR, { recursive: true, force: true }); } catch {}
      } else {
        setBotState({ status: 'reconnecting', last_error: lastDisconnect?.error?.message || null });
        setTimeout(() => { startBot().catch((e) => console.error('[wa] reconnect error', e)); }, 3000);
      }
    }
  });

  sock.ev.on('messages.upsert', async ({ messages, type }) => {
    if (type !== 'notify') return;
    for (const msg of messages) {
      try {
        if (!msg.message || msg.key.fromMe) continue;
        const jid = msg.key.remoteJid;
        if (!jid || jid.endsWith('@g.us') || jid === 'status@broadcast') continue;

        const text =
          msg.message.conversation ||
          msg.message.extendedTextMessage?.text ||
          msg.message.imageMessage?.caption ||
          msg.message.videoMessage?.caption ||
          '';

        if (!text.trim()) continue;

        const phone = jid.split('@')[0];

        const reply = await handleIncoming({ jid, phone, text });
        if (reply) {
          await sock.sendMessage(jid, { text: reply });
        }
      } catch (err) {
        console.error('[wa] handle error', err);
      }
    }
  });

  starting = false;
}

export async function stopBot() {
  if (!sock) {
    setBotState({ status: 'stopped', qr: null, qr_updated_at: null, connected_jid: null });
    return;
  }
  try {
    await sock.logout();
  } catch (err) {
    console.error('[wa] logout error', err);
  }
  try { sock.end(undefined); } catch {}
  sock = null;
  try { rmSync(AUTH_DIR, { recursive: true, force: true }); } catch {}
  setBotState({ status: 'stopped', qr: null, qr_updated_at: null, connected_jid: null, last_error: null });
}

export async function sendText(jid, text) {
  if (!sock) throw new Error('bot_not_connected');
  await sock.sendMessage(jid, { text });
}
