// «Retos diarios» — reto de la mañana + examen guiado de la noche (método Havard),
// compartido con la app Virtus. Beta privada: solo ES y solo cuentas con
// suscripción activa a Retos (el servidor lo exige también). Toda la lógica vive en
// las Edge Functions retos-*; esta página solo conversa con ellas.
//
// Va SIN Layout (NO_LAYOUT_PAGES), como «Mi panel». SEO: noindex.

import { useEffect, useRef, useState } from 'react';
import { useT, LocalLink as Link } from '../i18n';
import SEO from '../components/SEO';
import { TestShell } from '../TestTBP';
import { useSession } from '../account/useSession';
import { RetosError, retoDeHoy, tieneAccesoRetos, turnoNoche, turnoOnboarding } from '../account/retos';
import { Card, Title, PrimaryButton, Notice, TopBar } from '../account/ui';
import { NAVY, GOLD_DEEP, MUTED, INK, LINE, PAPER, BEIGE, FONT_SERIF, FONT_SANS, styles } from '../theme';

const VIRTUD = {
  prudencia: 'Prudencia',
  fortaleza_audacia: 'Audacia',
  fortaleza_resistencia: 'Resistencia',
  dominio_de_si: 'Dominio de sí',
  justicia: 'Justicia',
  magnanimidad: 'Magnanimidad',
  humildad_fundamental: 'Humildad fundamental',
  humildad_fraternal: 'Humildad fraternal',
};

export default function Retos() {
  const { t } = useT();
  const session = useSession();
  return (
    <>
      <SEO title={`${t('retos.title')} | Virtuous Leadership`} description={t('retos.title')} path="/mi-panel/retos" noindex={true} />
      <TestShell>
        <TopBar><Link to="/mi-panel" style={{ color: NAVY }}>{t('retos.back')}</Link></TopBar>
        {session === undefined ? null : session ? <Puerta /> : (
          <Card><Notice>{t('retos.no_access')}</Notice><Link to="/mi-panel" style={{ color: NAVY }}>{t('retos.back')}</Link></Card>
        )}
      </TestShell>
    </>
  );
}

function Puerta() {
  const { t } = useT();
  const [acceso, setAcceso] = useState(undefined);
  useEffect(() => { tieneAccesoRetos().then(setAcceso).catch(() => setAcceso(false)); }, []);
  if (acceso === undefined) return <p style={{ ...styles.para, textAlign: 'center', color: MUTED }}>{t('retos.loading')}</p>;
  if (!acceso) return <Card><Notice>{t('retos.no_access')}</Notice></Card>;
  return <RetosDelDia />;
}

function mensajeError(t, e) {
  if (e instanceof RetosError && e.code === 'forbidden') return t('retos.no_access'); // suscripción no activa
  const base = t(e instanceof RetosError && e.code === 'unavailable' ? 'retos.unavailable' : 'retos.failed');
  return e instanceof RetosError && e.detalle ? `${base} [${e.detalle}]` : base; // detalle: solo cuentas de prueba
}

function RetosDelDia() {
  const { t } = useT();
  const [vista, setVista] = useState('hoy');
  const [estado, setEstado] = useState({ loading: true });

  function cargar() {
    setEstado({ loading: true });
    retoDeHoy()
      .then((r) => setEstado({ loading: false, ...r }))
      .catch((e) => setEstado({ loading: false, error: mensajeError(t, e) }));
  }
  useEffect(cargar, []);

  if (estado.loading) return <p style={{ ...styles.para, textAlign: 'center', color: MUTED }}>{t('retos.loading')}</p>;
  if (estado.error) return <Card><Notice>{estado.error}</Notice></Card>;
  if (!estado.perfil) return <Onboarding onDone={cargar} />;
  if (vista === 'noche') return <Noche onSalir={() => { setVista('hoy'); cargar(); }} />;

  const r = estado.reto;
  return (
    <Card>
      <Title eyebrow={t('retos.today_eyebrow')}>{VIRTUD[r.virtud] ?? r.virtud}</Title>
      <p style={{ fontFamily: FONT_SERIF, fontSize: 26, lineHeight: 1.3, color: INK, margin: '22px 0 12px' }}>{r.reto}</p>
      <p style={{ ...styles.para, color: MUTED, fontStyle: 'italic', margin: 0 }}>{r.porque}</p>
      {r.respaldo && <p style={{ fontSize: 13, color: MUTED, marginTop: 14 }}>{t('retos.fallback_note')}</p>}
      <div style={{ marginTop: 28 }}>
        <PrimaryButton onClick={() => setVista('noche')}>{t('retos.night_cta')}</PrimaryButton>
      </div>
    </Card>
  );
}

// ── Conversación (onboarding y noche comparten la misma vista de chat) ──────────
function Chat({ mensajes, botones = [], onEnviar, onBoton, ocupado, cerrado, children }) {
  const { t } = useT();
  const [texto, setTexto] = useState('');
  const fin = useRef(null);
  useEffect(() => { fin.current?.scrollIntoView({ behavior: 'smooth', block: 'end' }); }, [mensajes.length, ocupado]);

  function enviar(e) {
    e.preventDefault();
    if (!texto.trim() || ocupado) return;
    onEnviar(texto.trim());
    setTexto('');
  }

  return (
    <>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, margin: '20px 0' }} aria-live="polite">
        {mensajes.map((m, i) => (
          <div key={i} style={{
            alignSelf: m.rol === 'coach' ? 'flex-start' : 'flex-end', maxWidth: '85%',
            background: m.rol === 'coach' ? BEIGE : NAVY, color: m.rol === 'coach' ? INK : PAPER,
            border: m.rol === 'coach' ? `1px solid ${LINE}` : 'none',
            padding: '10px 14px', borderRadius: 4, fontFamily: m.rol === 'coach' ? FONT_SERIF : FONT_SANS,
            fontSize: m.rol === 'coach' ? 19 : 15, lineHeight: 1.4, whiteSpace: 'pre-wrap',
          }}>{m.texto}</div>
        ))}
        {ocupado && <div style={{ alignSelf: 'flex-start', color: MUTED, fontSize: 14 }}>…</div>}
        <div ref={fin} />
      </div>
      {children}
      {!cerrado && (
        <>
          {botones.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 12 }}>
              {botones.map((b) => (
                <button key={b} type="button" disabled={ocupado} onClick={() => onBoton(b)} style={{
                  fontFamily: FONT_SANS, fontSize: 14, padding: '9px 14px', borderRadius: 2, cursor: 'pointer',
                  background: PAPER, color: NAVY, border: `1px solid ${b === 'prisa' ? LINE : NAVY}`,
                }}>{t(`retos.buttons.${b}`)}</button>
              ))}
            </div>
          )}
          <form onSubmit={enviar} style={{ display: 'flex', gap: 8 }}>
            <textarea value={texto} onChange={(e) => setTexto(e.target.value)} rows={2} maxLength={2000}
                      placeholder={t('retos.placeholder')} aria-label={t('retos.placeholder')}
                      onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) enviar(e); }}
                      style={{ flex: 1, fontFamily: FONT_SANS, fontSize: 15, padding: '10px 12px', border: `1px solid ${LINE}`, borderRadius: 2, resize: 'vertical', background: PAPER, color: INK }} />
            <div style={{ width: 110 }}><PrimaryButton type="submit" busy={ocupado}>{t('retos.send')}</PrimaryButton></div>
          </form>
          <p style={{ fontSize: 12, color: MUTED, marginTop: 10 }}>{t('retos.privacy')}</p>
        </>
      )}
    </>
  );
}

function useConversacion(llamar) {
  const { t } = useT();
  const abierta = useRef(false);
  const [s, setS] = useState({ mensajes: [], botones: [], ocupado: true, cerrado: false, error: null, crisis: false });
  async function paso(entrada, etiqueta) {
    setS((x) => ({ ...x, ocupado: true, error: null, mensajes: etiqueta ? [...x.mensajes, { rol: 'usuario', texto: etiqueta }] : x.mensajes }));
    try {
      const r = await llamar(entrada);
      setS((x) => ({
        ...x, ocupado: false, botones: r.botones ?? [], crisis: Boolean(r.crisis),
        cerrado: Boolean(r.cerrada || r.terminado || r.crisis),
        mensajes: [...x.mensajes, { rol: 'coach', texto: r.mensaje }],
      }));
    } catch (e) {
      setS((x) => ({ ...x, ocupado: false, error: mensajeError(t, e) }));
    }
  }
  // Abrir una sola vez (en desarrollo React monta dos veces los efectos).
  function abrir() {
    if (abierta.current) return;
    abierta.current = true;
    paso(null);
  }
  return [s, paso, abrir];
}

function Onboarding({ onDone }) {
  const { t } = useT();
  const [s, paso, abrir] = useConversacion((texto) => turnoOnboarding(texto));
  useEffect(abrir, []);
  return (
    <Card wide>
      <Title eyebrow={t('retos.eyebrow')}>{t('retos.onboarding_title')}</Title>
      <p style={{ ...styles.para, marginTop: 10 }}>{t('retos.onboarding_intro')}</p>
      {s.error && <Notice>{s.error}</Notice>}
      <Chat mensajes={s.mensajes} ocupado={s.ocupado} cerrado={s.cerrado}
            onEnviar={(x) => paso(x, x)} onBoton={() => {}}>
        {s.cerrado && !s.crisis && (
          <>
            <Notice tone="ok">{t('retos.onboarding_done')}</Notice>
            <PrimaryButton onClick={onDone}>{t('retos.back_today')}</PrimaryButton>
          </>
        )}
      </Chat>
    </Card>
  );
}

function Noche({ onSalir }) {
  const { t } = useT();
  const [s, paso, abrir] = useConversacion((entrada) => turnoNoche(entrada));
  useEffect(abrir, []);
  return (
    <Card wide>
      <Title eyebrow={t('retos.eyebrow')}>{t('retos.night_title')}</Title>
      {s.error && <Notice>{s.error}</Notice>}
      <Chat mensajes={s.mensajes} botones={s.botones} ocupado={s.ocupado} cerrado={s.cerrado}
            onEnviar={(x) => paso({ tipo: 'texto', texto: x }, x)}
            onBoton={(b) => paso({ tipo: 'boton', valor: b }, t(`retos.buttons.${b}`))}>
        {s.cerrado && (
          <div style={{ marginTop: 8 }}>
            {!s.crisis && <p style={{ fontFamily: FONT_SERIF, fontSize: 20, color: GOLD_DEEP }}>{t('retos.night_done')}</p>}
            <PrimaryButton onClick={onSalir}>{t('retos.back_today')}</PrimaryButton>
          </div>
        )}
      </Chat>
    </Card>
  );
}
