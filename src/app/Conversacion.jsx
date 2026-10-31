// Conversación con el asistente dentro del panel: onboarding (una vez) y examen de la noche.
// Toda la lógica vive en el servidor (Edge Functions retos-onboarding y retos-noche); aquí solo se
// muestran los turnos, los botones de respuesta rápida y la caja de texto.
import { useCallback, useEffect, useRef, useState } from 'react';
import { RetosError, turnoNoche, turnoOnboarding } from '../account/retos';
import { GOLD_DEEP, INK, LINE, MUTED, NAVY, PAPER, FONT_SANS, FONT_SERIF } from '../theme';
import { botonPrimario, botonSobreClaro, eyebrow, tarjeta } from './estilos';

const ETIQUETAS = {
  listo: 'Listo', si: 'Sí', a_medias: 'A medias', no: 'No', reaccion: 'Falló mi primera reacción',
  decision: 'Lo decidí', prisa: 'Tengo prisa', aceptar: 'Así está bien', parar: 'Lo dejamos aquí',
};

export function textoError(e) {
  if (e instanceof RetosError && e.code === 'forbidden') return 'Esta sección todavía no está disponible para tu cuenta.';
  const base = e instanceof RetosError && e.code === 'unavailable'
    ? 'El servicio no está disponible ahora mismo. Inténtalo de nuevo en unos minutos.'
    : 'Algo ha fallado. Inténtalo de nuevo.';
  // El servidor solo manda el detalle técnico a las cuentas de prueba.
  return e instanceof RetosError && e.detalle ? `${base} [${e.detalle}]` : base;
}

function useConversacion(llamar) {
  const llamarRef = useRef(llamar);
  llamarRef.current = llamar;
  const abierta = useRef(false);
  const [s, setS] = useState({ mensajes: [], botones: [], ocupado: true, cerrado: false, error: null, crisis: false });

  const paso = useCallback(async (entrada, etiqueta) => {
    setS((x) => ({ ...x, ocupado: true, error: null, mensajes: etiqueta ? [...x.mensajes, { rol: 'usuario', texto: etiqueta }] : x.mensajes }));
    try {
      const r = await llamarRef.current(entrada);
      setS((x) => ({
        ...x, ocupado: false, botones: r.botones ?? [], crisis: Boolean(r.crisis),
        cerrado: Boolean(r.cerrada || r.terminado || r.crisis),
        mensajes: [...x.mensajes, { rol: 'coach', texto: r.mensaje }],
      }));
    } catch (e) {
      setS((x) => ({ ...x, ocupado: false, error: textoError(e) }));
    }
  }, []);

  // Se abre una sola vez (en desarrollo React monta dos veces los efectos).
  const abrir = useCallback(() => {
    if (abierta.current) return;
    abierta.current = true;
    paso(null);
  }, [paso]);

  return [s, paso, abrir];
}

function Burbuja({ m }) {
  const coach = m.rol === 'coach';
  return (
    <div style={{
      alignSelf: coach ? 'flex-start' : 'flex-end', maxWidth: '88%', whiteSpace: 'pre-wrap',
      padding: coach ? '12px 16px' : '10px 15px', lineHeight: 1.45,
      borderRadius: coach ? '18px 18px 18px 5px' : '18px 18px 5px 18px',
      background: coach ? PAPER : NAVY, color: coach ? INK : PAPER,
      border: coach ? `1px solid ${LINE}` : 'none',
      fontFamily: coach ? FONT_SERIF : FONT_SANS, fontSize: coach ? 19 : 15,
    }}>{m.texto}</div>
  );
}

function Escribiendo() {
  return (
    <div aria-label="El asistente está escribiendo" style={{ alignSelf: 'flex-start', display: 'flex', gap: 5, padding: '10px 14px' }}>
      {[0, 1, 2].map((i) => (
        <span key={i} style={{ width: 7, height: 7, borderRadius: '50%', background: GOLD_DEEP, animation: `vl-puntos 1.2s ${i * 0.18}s infinite ease-in-out` }} />
      ))}
    </div>
  );
}

export default function Conversacion({ modo, onTerminar }) {
  const onboarding = modo === 'onboarding';
  const [s, paso, abrir] = useConversacion(onboarding ? (texto) => turnoOnboarding(texto) : (entrada) => turnoNoche(entrada));
  const [texto, setTexto] = useState('');
  const fin = useRef(null);
  useEffect(abrir, [abrir]);
  useEffect(() => { fin.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' }); }, [s.mensajes.length, s.ocupado]);

  function enviar(e) {
    e?.preventDefault();
    if (!texto.trim() || s.ocupado || s.cerrado) return;
    const limpio = texto.trim();
    setTexto('');
    paso(onboarding ? limpio : { tipo: 'texto', texto: limpio }, limpio);
  }

  return (
    <section style={tarjeta} aria-label={onboarding ? 'Conversación inicial con el asistente' : 'Examen de la noche'}>
      <div style={eyebrow}>{onboarding ? 'Conoce a tu asistente' : 'Examen de la noche'}</div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, margin: '16px 0' }} aria-live="polite">
        {s.mensajes.map((m, i) => <Burbuja key={i} m={m} />)}
        {s.ocupado && <Escribiendo />}
        <div ref={fin} />
      </div>

      {s.error && (
        <p role="alert" style={{ margin: '0 0 12px', padding: '10px 14px', borderRadius: 12, background: '#F8E5E5', border: '1px solid #C97A7A', color: '#7A1F1F', fontFamily: FONT_SANS, fontSize: 14 }}>
          {s.error}
        </p>
      )}

      {s.cerrado ? (
        <div>
          {!s.crisis && !/hasta mañana/i.test(s.mensajes[s.mensajes.length - 1]?.texto ?? '') && (
            <p style={{ fontFamily: FONT_SERIF, fontSize: 21, color: GOLD_DEEP, margin: '0 0 14px' }}>
              {onboarding ? 'Tu asistente está listo. Mañana tendrás tu primer reto.' : 'Hasta mañana.'}
            </p>
          )}
          <button type="button" style={botonSobreClaro} onClick={onTerminar}>Volver</button>
        </div>
      ) : (
        <>
          {s.botones.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 12 }}>
              {s.botones.map((b) => (
                <button key={b} type="button" disabled={s.ocupado} onClick={() => paso({ tipo: 'boton', valor: b }, ETIQUETAS[b] ?? b)} style={{
                  fontFamily: FONT_SANS, fontSize: 14, padding: '9px 16px', borderRadius: 999, cursor: s.ocupado ? 'wait' : 'pointer',
                  background: PAPER, color: NAVY, border: `1px solid ${b === 'prisa' ? LINE : NAVY}`,
                }}>{ETIQUETAS[b] ?? b}</button>
              ))}
            </div>
          )}
          <form onSubmit={enviar} style={{ display: 'flex', gap: 8, alignItems: 'flex-end' }}>
            <textarea value={texto} onChange={(e) => setTexto(e.target.value)} rows={2} maxLength={2000}
                      placeholder="Escribe aquí…" aria-label="Escribe tu respuesta"
                      onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) enviar(e); }}
                      style={{ flex: 1, fontFamily: FONT_SANS, fontSize: 15, padding: '11px 14px', border: `1px solid ${LINE}`, borderRadius: 18, resize: 'none', background: '#fff', color: INK }} />
            <button type="submit" disabled={s.ocupado || !texto.trim()} style={{ ...botonPrimario, opacity: s.ocupado || !texto.trim() ? 0.5 : 1 }}>Enviar</button>
          </form>
          <p style={{ fontFamily: FONT_SANS, fontSize: 12, color: MUTED, margin: '10px 0 0' }}>
            Los nombres que escribas se sustituyen por códigos antes de llegar al asistente.
          </p>
        </>
      )}
    </section>
  );
}
