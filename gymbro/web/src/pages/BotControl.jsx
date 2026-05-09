import { useEffect, useState } from 'react';
import { api } from '../api.js';

const POLL_MS = 3000;

const STATUS_LABEL = {
  stopped: 'Detenido',
  starting: 'Arrancando…',
  reconnecting: 'Reconectando…',
  qr: 'Esperando escaneo',
  connected: 'Conectado',
};

export default function BotControl() {
  const [state, setState] = useState(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState(null);

  const refresh = async () => {
    try {
      const s = await api.botStatus();
      setState(s);
      setErr(null);
    } catch (e) {
      setErr(e.message);
    }
  };

  useEffect(() => {
    refresh();
    const id = setInterval(refresh, POLL_MS);
    return () => clearInterval(id);
  }, []);

  const start = async () => {
    setBusy(true);
    setErr(null);
    try { await api.startBot(); await refresh(); } catch (e) { setErr(e.message); }
    setBusy(false);
  };

  const stop = async () => {
    if (!confirm('¿Cerrar la sesión de WhatsApp? Tendrás que volver a escanear el QR.')) return;
    setBusy(true);
    setErr(null);
    try { await api.stopBot(); await refresh(); } catch (e) { setErr(e.message); }
    setBusy(false);
  };

  if (!state) return <div className="card">Cargando estado…</div>;

  return (
    <>
      <div className="card">
        <div className="row">
          <div>
            <h2 style={{ margin: 0 }}>Estado del bot</h2>
            <div className="muted" style={{ marginTop: '0.4rem' }}>
              <span className={`status-pill status-${state.status}`}>{STATUS_LABEL[state.status] || state.status}</span>
              {state.connected_jid && <span style={{ marginLeft: '0.75rem' }}>{state.connected_jid}</span>}
            </div>
          </div>
          <div className="spacer" />
          {state.status === 'stopped' && (
            <button className="primary" onClick={start} disabled={busy}>
              {busy ? 'Arrancando…' : 'Iniciar bot'}
            </button>
          )}
          {state.status !== 'stopped' && (
            <button className="danger" onClick={stop} disabled={busy}>Detener bot</button>
          )}
        </div>
        {err && <div className="error" style={{ marginTop: '0.75rem' }}>{err}</div>}
        {state.last_error && (
          <div className="muted" style={{ marginTop: '0.5rem' }}>Último error: {state.last_error}</div>
        )}
      </div>

      {state.status === 'qr' && state.qr && (
        <div className="card">
          <h2>Escanea este QR con WhatsApp</h2>
          <p className="muted">
            Abre WhatsApp → Ajustes → Dispositivos vinculados → Vincular un dispositivo. Apunta el QR.
          </p>
          <div className="qr-box">
            <img src={state.qr} alt="QR de vinculación" />
            <div className="muted">Se actualiza automáticamente cada pocos segundos.</div>
          </div>
        </div>
      )}

      {state.status === 'connected' && (
        <div className="card">
          <h2>Bot operativo</h2>
          <p className="muted">
            Cualquier persona que escriba al número vinculado ({state.connected_jid}) será saludada por gymbro.ai.
            Si es nuevo se le hará el onboarding; si ya tiene perfil, entrará en modo coach.
          </p>
          <ul className="muted">
            <li>Cron de buenos días: 08:00 (zona horaria del servidor)</li>
            <li>Cron de check-in nocturno: 21:00</li>
            <li>Recordatorios 10 min antes de cada actividad programada</li>
          </ul>
        </div>
      )}
    </>
  );
}
