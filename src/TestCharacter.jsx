// TestCharacter.jsx — Test de Carácter (modelo de las 6 virtudes de Havard).
//
// Calca el patrón de TestTBP.jsx (test de temperamento adulto):
//   Welcome → Questions (68 ítems Likert 5 puntos) → Gate (form contacto)
//   → Result (6 cards de virtud expandibles + pirámide).
//
// La lógica de scoring vive en src/lib/characterScoring.js (puro, testeable).
// Los datos vienen de src/data/character-test.json (banco generado del Excel
// oficial via scripts/extract-character-xlsx.py). Los textos largos de cada
// virtud y las claves chResult* vienen de src/data/character-support-text.json
// — fuera de i18n.js para no inflar el bundle de strings UI.

import React, { useState, useMemo } from 'react';
import { useT } from './i18n';
import { scoreCharacter, toBrevoAttributes } from './lib/characterScoring.js';
import CHARACTER_TEST from './data/character-test.json';
import CHARACTER_SUPPORT from './data/character-support-text.json';

// Pirámide de las 6 virtudes (asset por idioma — el texto va embebido).
import pyramidEs from './assets/piramida ES.png';
import pyramidEn from './assets/Pyramid Eng.png';
import pyramidFr from './assets/Pyramide FR.png';
import pyramidRu from './assets/Pyramid Ruso.png';
const PYRAMID = { es: pyramidEs, en: pyramidEn, fr: pyramidFr, ru: pyramidRu };

// Caritas / retratos por virtud (mismo asset para los 4 idiomas — no
// llevan texto embebido). Usadas en:
//   1. MilestoneModal — al terminar el bloque de cada virtud durante el test.
//   2. Header de cada VirtueCard en el Result (círculo a la izquierda).
// Mapeo dictado por el briefing:
//   Prudencia → Pastorelle, Courage → Courage, Self-mastery → Judith,
//   Justice → Judith, Magnanimity → Paul, Humility → Jean.
// (Judith aparece 2× a propósito — figura común a autodominio y justicia
// por su discernimiento y su acción para el bien del pueblo.)
import faceP from './assets/Pastorelle.jpg.jpeg'; // Prudencia
import faceC from './assets/Courage.jpg.jpeg';   // Fortaleza
import faceS from './assets/Judith.jpg.jpeg';    // Dominio de sí
import faceJ from './assets/Judith.jpg.jpeg';    // Justicia (mismo Judith)
import faceM from './assets/Paul.jpg.jpeg';      // Magnanimidad
import faceH from './assets/Jean.jpg.jpeg';      // Humildad
const VIRTUE_FACES = { P: faceP, C: faceC, S: faceS, J: faceJ, M: faceM, H: faceH };

// ────────────────── paleta y tipografías (sync con TestTBP) ──────────────────
const NAVY = '#1B2A4A';
const NAVY_SOFT = '#2A3B5F';
const GOLD = '#C5A55A';
const GOLD_SOFT = '#E0C98A';
const BEIGE = '#F4F1EA';
const PAPER = '#FBF8F1';
const INK = '#22262E';
const MUTED = '#6B6B6B';
const LINE = '#D8D2C2';

// Color por virtud — paleta consistente con el branding del temperamento.
const VIRTUE_COLORS = {
  P: { color: '#5A3F8B', soft: '#D7CDE6' }, // prudencia — violeta
  C: { color: '#9C3A3A', soft: '#E9CFCF' }, // fortaleza — rojo
  S: { color: '#3F7A56', soft: '#CADDD0' }, // dominio sí — verde
  J: { color: '#1B2A4A', soft: '#D5DAE3' }, // justicia — navy
  M: { color: '#C5A55A', soft: '#F0E5C8' }, // magnanimidad — oro
  H: { color: '#6B6B6B', soft: '#E0E0E0' }, // humildad — neutro
};

const fontSerif = "'Cormorant Garamond', 'Playfair Display', Georgia, 'Times New Roman', serif";
const fontSans  = "'Inter', 'DM Sans', system-ui, -apple-system, 'Segoe UI', sans-serif";

const styles = {
  app: { minHeight: '100vh', background: BEIGE, color: INK, fontFamily: fontSans, padding: '32px 16px', boxSizing: 'border-box' },
  card: { maxWidth: 720, margin: '0 auto', background: PAPER, border: `1px solid ${LINE}`, borderRadius: 4, boxShadow: '0 1px 2px rgba(27,42,74,0.04), 0 8px 30px rgba(27,42,74,0.06)', padding: '40px 36px' },
  resultCard: { maxWidth: 980, margin: '0 auto', background: PAPER, border: `1px solid ${LINE}`, borderRadius: 4, boxShadow: '0 1px 2px rgba(27,42,74,0.04), 0 8px 30px rgba(27,42,74,0.06)', padding: '40px 36px' },
  h1: { fontFamily: fontSerif, fontSize: 36, fontWeight: 600, color: NAVY, margin: 0, letterSpacing: '-0.01em' },
  h2: { fontFamily: fontSerif, fontSize: 22, fontWeight: 600, color: NAVY, margin: '0 0 8px 0' },
  subtitle: { fontSize: 14, color: MUTED, margin: '4px 0 24px 0', letterSpacing: '0.04em', textTransform: 'uppercase' },
  para: { fontSize: 16, lineHeight: 1.6, color: INK, margin: '14px 0' },
  notice: { fontSize: 13, color: MUTED, fontStyle: 'italic', borderLeft: `2px solid ${GOLD}`, paddingLeft: 12, margin: '20px 0' },
  buttonPrimary: { fontFamily: fontSans, fontSize: 15, letterSpacing: '0.06em', textTransform: 'uppercase', fontWeight: 600, color: PAPER, background: NAVY, border: `1px solid ${NAVY}`, padding: '14px 28px', borderRadius: 2, cursor: 'pointer', transition: 'all 160ms ease' },
  buttonGhost: { fontFamily: fontSans, fontSize: 13, color: MUTED, background: 'transparent', border: 'none', padding: '8px 12px', cursor: 'pointer' },
  progress: { fontSize: 13, color: MUTED, letterSpacing: '0.04em', textTransform: 'uppercase' },
  questionText: { fontFamily: fontSerif, fontSize: 22, fontWeight: 500, color: NAVY, margin: '24px 0 28px 0', lineHeight: 1.45 },
};

// ─────────────────────────── utilidades ───────────────────────────

// shuffle() — SIN USO tras migrar a orden CANÓNICO. Se conserva porque
// puede ser útil si algún día se reintroduce shuffle (p.ej. modo A/B).
// eslint-disable-next-line no-unused-vars
function shuffleUnused(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// Orden CANÓNICO de las 68 preguntas — sin shuffle. Las preguntas de cada
// virtud van consecutivas (P → C → S → J → M → H) para que el
// MilestoneModal, que aparece al terminar el bloque de cada virtud, muestre
// un score parcial coherente ("acabas de completar Prudencia: 62%").
//
// El grupo de una pregunta se identifica por la primera letra de su código
// (P1..P8, C1..C10, S1..S9, J1..J9, M1..M17, H1..H15 en el JSON extraído
// del Excel oficial — ver scripts/extract-character-xlsx.py).
const VIRTUE_ORDER = ['P', 'C', 'S', 'J', 'M', 'H'];

function buildCanonicalOrderChar() {
  const groups = Object.fromEntries(VIRTUE_ORDER.map(v => [v, []]));
  CHARACTER_TEST.questions.forEach((q, i) => {
    const v = q.code && q.code[0];
    if (groups[v]) groups[v].push(i);
    else groups[VIRTUE_ORDER[0]].push(i); // fallback defensivo (nunca se da)
  });
  const order = [];
  for (const v of VIRTUE_ORDER) order.push(...groups[v]);
  return { order, groups };
}
const { order: CANONICAL_ORDER, groups: VIRTUE_GROUPS } = buildCanonicalOrderChar();

// Índices ACUMULATIVOS de fin de bloque: [8, 18, 27, 36, 53, 68] con los
// tamaños actuales del Excel. Se recalcula al arranque por si el banco
// cambia. Usados para saber cuándo mostrar el modal milestone.
const VIRTUE_CUMULATIVE = (() => {
  const cum = [];
  let acc = 0;
  for (const v of VIRTUE_ORDER) {
    acc += VIRTUE_GROUPS[v].length;
    cum.push(acc);
  }
  return cum;
})();

// Construye un texto legible con el resultado completo del test de carácter,
// para meterlo en el atributo Brevo TEXT `RESULTADOS_CARACTER`. Formato
// (una línea por virtud), pensado para que el equipo pueda leerlo de un
// vistazo desde la interfaz de Brevo:
//
//   Prudencia: 62% · pasivo 58% (Deliberación) · activo 65% (Decisión)
//   Fortaleza: 71% · pasivo 68% (Constancia)   · activo 74% (Audacia)
//   ...
//
// Nombres y aspectos en el idioma del usuario. Se llama en handleGateSubmit,
// justo antes de mandar al backend. Se limita a ~1500 chars — el atributo
// TEXT de Brevo admite más, pero conviene ser conservador.
function buildResultadosCaracter(scoreResult, lang, passiveLabel, activeLabel) {
  const labels = CHARACTER_SUPPORT.labels;
  const lines = ['P', 'C', 'S', 'J', 'M', 'H'].map(code => {
    const s = scoreResult?.[code];
    if (!s) return '';
    const virtueName = resolveSupport(labels, s.virtue_label_key, lang);
    const passiveName = resolveSupport(labels, s.passive_facet_key, lang);
    const activeName  = resolveSupport(labels, s.active_facet_key, lang);
    const g = Math.round(s.global ?? 0);
    const p = Math.round(s.passive ?? 0);
    const a = Math.round(s.active ?? 0);
    return `${virtueName}: ${g}% · ${passiveLabel.toLowerCase()} ${p}% (${passiveName}) · ${activeLabel.toLowerCase()} ${a}% (${activeName})`;
  }).filter(Boolean);
  return lines.join('\n').slice(0, 1500);
}

// Calcula el % global parcial de una virtud dada el vector de respuestas
// canónico hasta el momento. Reutiliza scoreCharacter (que ya rellena con 0
// las preguntas no contestadas), luego coge el .global de la virtud pedida.
function partialVirtueGlobal(canonicalAnswers, virtueCode) {
  const res = scoreCharacter(canonicalAnswers, CHARACTER_TEST);
  return res?.[virtueCode]?.global ?? 0;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Resuelve una clave de support_text en el idioma activo. Fallback: ES → EN.
function resolveSupport(supportObj, key, lang) {
  const entry = supportObj?.[key];
  if (!entry) return '';
  return entry[lang] || entry.es || entry.en || '';
}

// Mapa sex code → string que enviamos a backend/Brevo (Female/Male igual que
// el test adulto para consistencia en Brevo).
const SEX_TO_BREVO = { mujer: 'Female', hombre: 'Male' };

// Submit a la API. Mismo patrón que TestTBP: si no hay VITE_SUBMIT_CHARACTER_URL
// (modo desarrollo), hace un stub y devuelve ok. En producción manda el payload.
async function submitCharacterContact(payload) {
  const url = import.meta.env.VITE_SUBMIT_CHARACTER_URL;
  if (!url) {
    console.log('[stub submitCharacterContact] payload:', payload);
    await new Promise(r => setTimeout(r, 600));
    return { ok: true, mocked: true };
  }
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    let detail = '';
    try { detail = (await res.json()).error || ''; } catch {}
    throw new Error(`HTTP ${res.status}${detail ? ' — ' + detail : ''}`);
  }
  return res.json();
}

// ─────────────────────────── subcomponentes ───────────────────────────

function Welcome({ onStart }) {
  const { t, lang } = useT();
  const pyramidSrc = PYRAMID[lang] || PYRAMID.es;
  return (
    <div style={styles.card}>
      <div style={styles.subtitle}>{t('tbp_character.welcome.eyebrow')}</div>
      {/* h1 sólo si el i18n define título. En prod el título va vacío
          (el eyebrow ya nombra el test — evitar duplicación). */}
      {t('tbp_character.welcome.title') && (
        <h1 style={styles.h1}>{t('tbp_character.welcome.title')}</h1>
      )}
      <p style={{ ...styles.para, fontFamily: fontSerif, fontSize: 18, color: NAVY_SOFT, fontStyle: 'italic' }}>
        {t('tbp_character.welcome.byline')}
      </p>

      {/* Imagen destacada del test — pirámide de las 6 virtudes (misma que /tests y Result).
          mixBlendMode: multiply hace que el fondo blanco del PNG se
          camuflee con BEIGE (blanco × BEIGE = BEIGE), sin editar el asset. */}
      <div style={{ display: 'flex', justifyContent: 'center', margin: '20px 0 24px' }}>
        <img src={pyramidSrc} alt={t('tbp_character.result.pyramid_alt')}
             style={{ width: '100%', maxWidth: 320, height: 'auto', display: 'block', mixBlendMode: 'multiply' }} />
      </div>

      <p style={styles.para}>{t('tbp_character.welcome.intro_line1')}</p>
      <p style={styles.para}>{t('tbp_character.welcome.intro_line2')}</p>
      {/* notice ("Responde con honestidad...") eliminada — pedía el usuario:
          menos ruido antes de arrancar; la duración+CTA ya bastan. */}

      <div style={{ display: 'flex', alignItems: 'center', gap: 24, marginTop: 28, marginBottom: 28, flexWrap: 'wrap' }}>
        <div style={{ fontSize: 13, color: MUTED }}>
          <strong style={{ color: NAVY, display: 'block', fontFamily: fontSerif, fontSize: 16, fontWeight: 600 }}>
            {t('tbp_character.welcome.duration_label')}
          </strong>
          {t('tbp_character.welcome.duration_text')}
        </div>
        <div style={{ flex: 1 }} />
        <button
          data-gtm="comenzar-test-caracter"
          style={styles.buttonPrimary}
          onMouseOver={e => (e.currentTarget.style.background = NAVY_SOFT)}
          onMouseOut={e => (e.currentTarget.style.background = NAVY)}
          onClick={onStart}
        >
          {t('tbp_character.welcome.button')}
        </button>
      </div>
    </div>
  );
}

// Question — pregunta única con escala Likert de 5 botones.
function Question({ progress, total, item, lang, onAnswer, onBack, canBack }) {
  const { t } = useT();
  const text = item.text[lang] || item.text.en || '';
  const labels = t('tbp_character.question.likert'); // { strongly_disagree, disagree, neutral, agree, strongly_agree }
  // Orden de presentación: descendente — totalmente de acuerdo arriba,
  // totalmente en desacuerdo abajo. Los valores numéricos asociados no
  // cambian (siguen siendo -1...+1); sólo el orden visual.
  const options = [
    { key: 'strongly_agree',    value: 1,    label: labels.strongly_agree },
    { key: 'agree',             value: 0.5,  label: labels.agree },
    { key: 'neutral',           value: 0,    label: labels.neutral },
    { key: 'disagree',          value: -0.5, label: labels.disagree },
    { key: 'strongly_disagree', value: -1,   label: labels.strongly_disagree },
  ];

  return (
    <div style={styles.card} className="vl-test-card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
        <span style={styles.progress}>{t('tbp_character.question.progress', { n: progress, total })}</span>
        <button
          style={{ ...styles.buttonGhost, opacity: canBack ? 1 : 0.3, cursor: canBack ? 'pointer' : 'default' }}
          disabled={!canBack}
          onClick={onBack}
        >
          {t('tbp_character.question.back')}
        </button>
      </div>

      <div style={{ height: 3, background: LINE, borderRadius: 2, overflow: 'hidden', marginBottom: 8 }}>
        <div style={{ height: '100%', width: `${(progress / total) * 100}%`, background: GOLD, transition: 'width 240ms ease' }} />
      </div>

      <div style={styles.questionText}>{text}</div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 20 }}>
        {options.map(opt => (
          <button
            key={opt.key}
            style={{
              fontFamily: fontSans,
              fontSize: 15,
              padding: '14px 18px',
              border: `1px solid ${LINE}`,
              background: PAPER,
              color: NAVY,
              borderRadius: 2,
              cursor: 'pointer',
              textAlign: 'left',
              transition: 'all 160ms ease',
            }}
            onMouseOver={e => { e.currentTarget.style.background = NAVY; e.currentTarget.style.color = PAPER; e.currentTarget.style.borderColor = NAVY; }}
            onMouseOut={e => { e.currentTarget.style.background = PAPER; e.currentTarget.style.color = NAVY; e.currentTarget.style.borderColor = LINE; }}
            onClick={() => onAnswer(opt.value)}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
}

// MilestoneModal — modal bloqueante que aparece tras completar el bloque
// de preguntas de una virtud. Muestra la carita + nombre + % + botón
// "Continuar". Calcado del MilestoneModal de TestHeart (mismo patrón visual).
function MilestoneModal({ virtueCode, pct, lang, onContinue }) {
  const { t } = useT();
  const labels = CHARACTER_SUPPORT.labels;
  const face = VIRTUE_FACES[virtueCode];
  const c = VIRTUE_COLORS[virtueCode];
  // Resuelve el label i18n de la virtud desde support_text. La key es
  // chResultP/chResultC/... — sigue el patrón que ya usa VirtueCard.
  const virtueName = resolveSupport(labels, `chResult${virtueCode}`, lang);

  return (
    <div
      role="dialog" aria-modal="true"
      style={{
        position: 'fixed', inset: 0, zIndex: 1000,
        background: 'rgba(27, 42, 74, 0.55)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 16,
      }}
    >
      <div style={{
        background: PAPER,
        maxWidth: 440, width: '100%',
        borderRadius: 4,
        borderTop: `4px solid ${c.color}`,
        boxShadow: '0 20px 60px rgba(0,0,0,0.25)',
        padding: '32px 28px', textAlign: 'center',
        fontFamily: fontSans,
      }}>
        <div style={styles.subtitle}>{t('tbp_character.milestone.eyebrow')}</div>

        {/* Carita de la virtud recién completada */}
        <div style={{
          margin: '4px auto 20px',
          width: 120, height: 120, borderRadius: '50%',
          border: `3px solid ${c.color}`, overflow: 'hidden',
          background: BEIGE,
        }}>
          <img src={face} alt={virtueName}
               style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        </div>

        <h3 style={{
          fontFamily: fontSerif, fontSize: 24, fontWeight: 600,
          color: NAVY, margin: '0 0 8px', lineHeight: 1.2,
        }}>
          {virtueName}
        </h3>

        <div style={{
          fontFamily: fontSerif, fontSize: 48, fontWeight: 600,
          color: c.color, lineHeight: 1, margin: '12px 0 20px',
        }}>
          {Math.round(pct)}%
        </div>

        <p style={{ fontSize: 14, color: MUTED, lineHeight: 1.5, margin: '0 0 24px' }}>
          {t('tbp_character.milestone.note')}
        </p>

        <button
          onClick={onContinue}
          style={{ ...styles.buttonPrimary, width: '100%' }}
          onMouseOver={e => (e.currentTarget.style.background = NAVY_SOFT)}
          onMouseOut={e => (e.currentTarget.style.background = NAVY)}
        >
          {t('tbp_character.milestone.continue')}
        </button>
      </div>
    </div>
  );
}

// GateForm — datos demográficos + consentimiento, ANTES de mostrar resultados.
function GateForm({ onSubmitOk, onError }) {
  const { t, lang } = useT();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [birthYear, setBirthYear] = useState('');
  const [sex, setSex] = useState('');
  const [consent, setConsent] = useState(false);
  const [touched, setTouched] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  const currentYear = new Date().getFullYear();
  const sexOpts = t('tbp_character.gate.sex_options');

  const errors = {
    name: name.trim().length < 2 ? t('tbp_character.gate.errors.name') : null,
    email: !EMAIL_RE.test(email.trim()) ? t('tbp_character.gate.errors.email') : null,
    birthYear: (() => {
      if (!birthYear) return t('tbp_character.gate.errors.year_required');
      const n = Number(birthYear);
      if (!Number.isInteger(n) || n < 1900 || n > currentYear) return t('tbp_character.gate.errors.year_range', { max: currentYear });
      return null;
    })(),
    sex: !sex ? t('tbp_character.gate.errors.sex') : null,
    consent: !consent ? t('tbp_character.gate.errors.consent') : null,
  };
  const isValid = !Object.values(errors).some(Boolean);

  async function handleSubmit(e) {
    e.preventDefault();
    setTouched({ name: 1, email: 1, birthYear: 1, sex: 1, consent: 1 });
    if (!isValid || submitting) return;
    setSubmitting(true);
    setSubmitError(null);
    onSubmitOk({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      birthYear: Number(birthYear),
      sex,
      sexBrevo: SEX_TO_BREVO[sex],
      language: lang,
      consent: true,
      consentTimestamp: new Date().toISOString(),
    }).catch(err => {
      setSubmitError(t('tbp_character.gate.errors.submit_failed'));
      console.error('submitCharacter error:', err);
      setSubmitting(false);
      if (onError) onError(err);
    });
  }

  const showErr = (k) => touched[k] && errors[k];
  const inputBase = { width: '100%', fontFamily: fontSans, fontSize: 15, padding: '12px 14px', background: PAPER, color: INK, border: `1px solid ${LINE}`, borderRadius: 2, outline: 'none', transition: 'border-color 160ms ease, box-shadow 160ms ease' };
  const labelStyle = { display: 'block', fontSize: 12, color: NAVY, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 6 };
  const errStyle = { fontSize: 12, color: '#A03434', marginTop: 4, fontStyle: 'italic' };

  function focus(e) { e.currentTarget.style.borderColor = GOLD; e.currentTarget.style.boxShadow = `0 0 0 2px ${GOLD_SOFT}55`; }
  function blur(e, k) { e.currentTarget.style.borderColor = showErr(k) ? '#A03434' : LINE; e.currentTarget.style.boxShadow = 'none'; setTouched(tt => ({ ...tt, [k]: 1 })); }

  return (
    <div style={styles.card}>
      <div style={styles.subtitle}>{t('tbp_character.gate.eyebrow')}</div>
      <h2 style={{ ...styles.h1, fontSize: 28 }}>{t('tbp_character.gate.title')}</h2>
      <p style={{ ...styles.para, marginTop: 12 }}>{t('tbp_character.gate.intro')}</p>

      <form onSubmit={handleSubmit} noValidate style={{ marginTop: 24 }}>
        <div style={{ marginBottom: 18 }}>
          <label htmlFor="char-gate-name" style={labelStyle}>{t('tbp_character.gate.fields.name')}</label>
          <input id="char-gate-name" type="text" autoComplete="given-name" value={name}
                 onChange={e => setName(e.target.value)} onFocus={focus} onBlur={e => blur(e, 'name')}
                 style={{ ...inputBase, borderColor: showErr('name') ? '#A03434' : LINE }} />
          {showErr('name') && <div style={errStyle}>{errors.name}</div>}
        </div>

        <div style={{ marginBottom: 18 }}>
          <label htmlFor="char-gate-email" style={labelStyle}>{t('tbp_character.gate.fields.email')}</label>
          <input id="char-gate-email" type="email" autoComplete="email" value={email}
                 onChange={e => setEmail(e.target.value)} onFocus={focus} onBlur={e => blur(e, 'email')}
                 style={{ ...inputBase, borderColor: showErr('email') ? '#A03434' : LINE }} />
          {showErr('email') && <div style={errStyle}>{errors.email}</div>}
        </div>

        <div style={{ marginBottom: 18 }}>
          <label htmlFor="char-gate-year" style={labelStyle}>{t('tbp_character.gate.fields.birth_year')}</label>
          <input id="char-gate-year" type="number" inputMode="numeric" min="1900" max={currentYear} placeholder="1985"
                 value={birthYear} onChange={e => setBirthYear(e.target.value)}
                 onFocus={focus} onBlur={e => blur(e, 'birthYear')}
                 style={{ ...inputBase, width: 140, borderColor: showErr('birthYear') ? '#A03434' : LINE }} />
          {showErr('birthYear') && <div style={errStyle}>{errors.birthYear}</div>}
        </div>

        <div style={{ marginBottom: 18 }}>
          <span style={labelStyle}>{t('tbp_character.gate.fields.sex')}</span>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {['mujer', 'hombre'].map(v => {
              const active = sex === v;
              return (
                <button key={v} type="button"
                        style={{
                          fontFamily: fontSans, fontSize: 14, padding: '10px 18px',
                          borderRadius: 2, border: `1px solid ${active ? NAVY : LINE}`,
                          background: active ? NAVY : PAPER,
                          color: active ? PAPER : NAVY,
                          cursor: 'pointer', transition: '160ms',
                          fontWeight: active ? 600 : 400,
                        }}
                        onClick={() => { setSex(v); setTouched(tt => ({ ...tt, sex: 1 })); }}>
                  {sexOpts[v]}
                </button>
              );
            })}
          </div>
          {showErr('sex') && <div style={errStyle}>{errors.sex}</div>}
        </div>

        <label style={{ display: 'flex', gap: 12, alignItems: 'flex-start', padding: '14px 16px', background: BEIGE, border: `1px solid ${LINE}`, borderRadius: 2, cursor: 'pointer', marginTop: 8 }}>
          <input type="checkbox" checked={consent}
                 onChange={e => { setConsent(e.target.checked); setTouched(tt => ({ ...tt, consent: 1 })); }}
                 style={{ marginTop: 3, width: 16, height: 16, accentColor: NAVY, cursor: 'pointer', flexShrink: 0 }} />
          <span style={{ fontSize: 14, lineHeight: 1.5, color: INK }}
                dangerouslySetInnerHTML={{ __html: t('tbp_character.gate.consent_html') }} />
        </label>
        {showErr('consent') && <div style={errStyle}>{errors.consent}</div>}

        {submitError && <div style={{ ...errStyle, marginTop: 16, fontSize: 14 }}>{submitError}</div>}

        <div style={{ marginTop: 28, display: 'flex', justifyContent: 'flex-end' }}>
          <button type="submit" disabled={submitting}
                  data-gtm="fin-test-caracter"
                  style={{ ...styles.buttonPrimary, opacity: submitting ? 0.6 : 1, cursor: submitting ? 'wait' : 'pointer' }}
                  onMouseOver={e => !submitting && (e.currentTarget.style.background = NAVY_SOFT)}
                  onMouseOut={e => !submitting && (e.currentTarget.style.background = NAVY)}>
            {submitting ? t('tbp_character.gate.submitting') : t('tbp_character.gate.submit')}
          </button>
        </div>
      </form>
    </div>
  );
}

// VirtueCard — un card por virtud, clicable para expandir el HTML largo.
// Layout (v2, tras rediseño del Result):
//   ┌──────────────────────────────────────────────────────────┐
//   │  ●face  Prudencia                          62% ›         │  ← header
//   │─────────────────────────────────────────────────────────│
//   │   Aspecto pasivo (nombre)     Aspecto activo (nombre)    │  ← siempre visible
//   │        58%                          65%                  │
//   │─────────────────────────────────────────────────────────│
//   │   [HTML expandido — deliberación / decisión...]          │  ← si expanded
//   └──────────────────────────────────────────────────────────┘
// Se quitó la línea "poseer un nivel bajo/medio/alto de prudencia" que
// duplicaba el nombre de la virtud debajo.
function VirtueCard({ code, scores, lang }) {
  const { t } = useT();
  const [expanded, setExpanded] = useState(false);
  const c = VIRTUE_COLORS[code];
  const face = VIRTUE_FACES[code];
  const labels = CHARACTER_SUPPORT.labels;
  const htmls  = CHARACTER_SUPPORT.html;

  const virtueName  = resolveSupport(labels, scores.virtue_label_key, lang);
  const passiveName = resolveSupport(labels, scores.passive_facet_key, lang);
  const activeName  = resolveSupport(labels, scores.active_facet_key, lang);
  const longHtml    = resolveSupport(htmls,  scores.virtue_html_key, lang);
  const passiveAspect = t('tbp_character.result.passive_label');
  const activeAspect  = t('tbp_character.result.active_label');

  return (
    <div style={{
      background: PAPER,
      border: `1px solid ${LINE}`,
      borderLeft: `4px solid ${c.color}`,
      borderRadius: 4,
      marginBottom: 16,
      overflow: 'hidden',
    }}>
      <button
        onClick={() => setExpanded(v => !v)}
        aria-expanded={expanded}
        style={{
          width: '100%', textAlign: 'left',
          background: 'transparent', border: 'none',
          padding: 0, cursor: 'pointer',
          fontFamily: fontSans,
          color: 'inherit',
        }}
      >
        {/* Header: carita + nombre + % overall + chevron. Todo en una fila.
            En mobile hace wrap: la carita+nombre bajan a una línea y el
            % + chevron a otra. */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap',
          padding: '18px 22px',
        }}>
          {/* Carita circular a la izquierda */}
          <div style={{
            width: 56, height: 56, borderRadius: '50%',
            overflow: 'hidden', flexShrink: 0,
            border: `2px solid ${c.color}`, background: BEIGE,
          }}>
            <img src={face} alt={virtueName}
                 style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
          </div>
          {/* Nombre de la virtud */}
          <div style={{ flex: '1 1 200px', minWidth: 160 }}>
            <div style={{ fontFamily: fontSerif, fontSize: 26, fontWeight: 600, color: NAVY, lineHeight: 1.15 }}>
              {virtueName}
            </div>
          </div>
          {/* % global — grande, color de la virtud, alineado al final */}
          <div style={{
            fontFamily: fontSerif, fontSize: 30, fontWeight: 600,
            color: c.color, lineHeight: 1,
          }}>
            {scores.global == null ? '—' : `${Math.round(scores.global)}%`}
          </div>
          {/* Chevron indicador de expand/collapse */}
          <div style={{
            fontSize: 22, color: c.color,
            transition: 'transform 200ms',
            transform: expanded ? 'rotate(90deg)' : 'rotate(0deg)',
          }}>
            ›
          </div>
        </div>

        {/* Fila propia con pasivo/activo bien alineados — siempre visible
            (aunque el card esté colapsado). Grid 2 columnas iguales para
            que los % queden a la misma línea vertical. */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: 4,
          borderTop: `1px solid ${LINE}`,
          background: '#F9F5EA',
        }}>
          <VirtueFacetBlock
            label={passiveAspect}
            facetName={passiveName}
            value={scores.passive}
            color={c.color}
          />
          <VirtueFacetBlock
            label={activeAspect}
            facetName={activeName}
            value={scores.active}
            color={c.color}
          />
        </div>
      </button>

      {expanded && (
        <div
          style={{
            padding: '20px 24px 24px 24px',
            fontSize: 15,
            lineHeight: 1.65,
            color: INK,
            borderTop: `1px solid ${LINE}`,
            background: BEIGE,
          }}
          dangerouslySetInnerHTML={{ __html: longHtml }}
        />
      )}
    </div>
  );
}

// Bloque compacto con "Aspecto pasivo / nombre-faceta" y su % — usado
// dentro de VirtueCard como fila fija (siempre visible).
function VirtueFacetBlock({ label, facetName, value, color }) {
  return (
    <div style={{ padding: '14px 20px' }}>
      <div style={{
        fontSize: 11, color: MUTED, textTransform: 'uppercase',
        letterSpacing: '0.06em', fontWeight: 600, marginBottom: 4,
      }}>
        {label}
      </div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, flexWrap: 'wrap' }}>
        <div style={{ fontFamily: fontSerif, fontSize: 22, fontWeight: 600, color, lineHeight: 1 }}>
          {value == null ? '—' : `${Math.round(value)}%`}
        </div>
        <div style={{ fontSize: 14, color: NAVY, fontWeight: 500 }}>
          {facetName}
        </div>
      </div>
    </div>
  );
}

// SummaryCard — vista compacta: pirámide pequeña + grid 3×2 de virtudes con
// su % global. Va antes del desglose detallado para que el usuario tenga el
// "resumen ejecutivo" antes de profundizar.
function SummaryCard({ scoreResult, pyramidSrc, pyramidAlt, lang }) {
  const labels = CHARACTER_SUPPORT.labels;
  return (
    <div style={{
      ...styles.card,
      maxWidth: 980,
      padding: '40px 36px',
      marginBottom: 24,
    }}>
      {/* Pirámide pequeña, fondo transparente, centrada arriba.
          mixBlendMode: multiply → blanco del PNG se funde con BEIGE. */}
      <div style={{ textAlign: 'center', marginBottom: 28 }}>
        <img src={pyramidSrc} alt={pyramidAlt}
             style={{ width: '100%', maxWidth: 320, height: 'auto', display: 'block', margin: '0 auto', mixBlendMode: 'multiply' }} />
      </div>

      {/* Grid de 6 virtudes con su % global. Cada celda usa el color de la
          virtud como acento (borde superior). En desktop son 3 columnas
          (2 filas); en mobile se apila vertical. */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
        gap: 12,
      }}>
        {['P', 'C', 'S', 'J', 'M', 'H'].map(code => {
          const s = scoreResult[code];
          const c = VIRTUE_COLORS[code];
          const virtueName = resolveSupport(labels, s.virtue_label_key, lang);
          return (
            <div key={code} style={{
              background: PAPER,
              border: `1px solid ${LINE}`,
              borderTop: `3px solid ${c.color}`,
              padding: '18px 14px',
              borderRadius: 2,
              textAlign: 'center',
            }}>
              <div style={{ fontFamily: fontSerif, fontSize: 32, fontWeight: 600, color: c.color, lineHeight: 1 }}>
                {Math.round(s.global ?? 0)}%
              </div>
              <div style={{ fontSize: 11, color: NAVY, textTransform: 'uppercase', letterSpacing: '0.08em', marginTop: 8, fontWeight: 600 }}>
                {virtueName}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ResultScreen — pirámide+resumen arriba, luego 6 cards expandibles con detalle.
function ResultScreen({ scoreResult, contactName, onRestart }) {
  const { t, lang } = useT();
  const pyramidSrc = PYRAMID[lang] || PYRAMID.es;
  const pyramidAlt = t('tbp_character.result.pyramid_alt');

  return (
    <div>
      {/* Cabecera fuera de card, sin caja, alineada con el resto del flow.
          Se quitó la frase "Aquí tienes un resumen de tu nivel..." — la
          pirámide + los % globales del SummaryCard son ya el resumen. */}
      <div style={{ maxWidth: 980, margin: '0 auto 24px', padding: '0 36px' }}>
        <div style={styles.subtitle}>{t('tbp_character.result.eyebrow_prefix')} {contactName}</div>
        <h1 style={{ ...styles.h1, fontSize: 36, marginBottom: 12 }}>{t('tbp_character.result.title')}</h1>
      </div>

      {/* Resumen ejecutivo: pirámide + 6 % globales. */}
      <SummaryCard scoreResult={scoreResult} pyramidSrc={pyramidSrc} pyramidAlt={pyramidAlt} lang={lang} />

      {/* Desglose detallado: 6 cards expandibles, una por virtud. */}
      <div style={{ ...styles.resultCard, paddingTop: 32 }}>
        <h2 style={{ ...styles.h2, fontSize: 22, marginBottom: 18 }}>
          {t('tbp_character.result.detail_title')}
        </h2>
        <p style={{ ...styles.para, marginTop: 0, marginBottom: 24, color: MUTED, fontSize: 14 }}>
          {t('tbp_character.result.detail_intro')}
        </p>
        {['P', 'C', 'S', 'J', 'M', 'H'].map(code => (
          <VirtueCard key={code} code={code} scores={scoreResult[code]} lang={lang} />
        ))}

        {/* Bloque "¿Qué mide este test?" eliminado — el usuario lo pidió
            fuera para reducir texto en el Result. El HTML sigue en
            character-support-text.json por si se reintroduce. */}

        <div style={{ textAlign: 'center', marginTop: 32 }}>
          <button
            style={{ ...styles.buttonPrimary, background: 'transparent', color: NAVY }}
            onMouseOver={e => { e.currentTarget.style.background = NAVY; e.currentTarget.style.color = PAPER; }}
            onMouseOut={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = NAVY; }}
            onClick={onRestart}
          >
            {t('tbp_character.result.repeat_button')}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────── orquestador ───────────────────────────

const PHASE = { WELCOME: 'welcome', QUESTIONS: 'questions', GATE: 'gate', RESULT: 'result' };

export default function TestCharacter() {
  const { t, lang } = useT();
  const [phase, setPhase] = useState(PHASE.WELCOME);
  // Orden CANÓNICO de las 68 preguntas — fijo, sin shuffle. Los bloques por
  // virtud van consecutivos (P → C → S → J → M → H) para que el
  // MilestoneModal cada cierre-de-bloque sea coherente. Se mantiene como
  // estado por compatibilidad con el resto de la lógica (aunque nunca
  // cambia), y también por si en el futuro se reintroduce shuffle.
  const [order, setOrder] = useState([]);
  const [answers, setAnswers] = useState([]);  // misma longitud que order
  const [idx, setIdx] = useState(0);
  const [contact, setContact] = useState(null);
  // Modal milestone tras completar el bloque de una virtud.
  // { virtueCode, pct } | null.
  const [milestone, setMilestone] = useState(null);

  // Score sólo se calcula una vez al pasar a RESULT.
  const scoreResult = useMemo(() => {
    if (phase !== PHASE.RESULT || answers.length !== order.length) return null;
    // Re-mapear respuestas barajadas → orden canónico (índice en CHARACTER_TEST.questions).
    const canonical = new Array(CHARACTER_TEST.questions.length).fill(0);
    for (let i = 0; i < order.length; i++) {
      canonical[order[i]] = answers[i] ?? 0;
    }
    return scoreCharacter(canonical, CHARACTER_TEST);
  }, [phase, answers, order]);

  function handleStart() {
    setOrder(CANONICAL_ORDER); // orden fijo por virtud, no shuffle
    setAnswers([]);
    setIdx(0);
    setMilestone(null);
    setPhase(PHASE.QUESTIONS);
  }

  function handleAnswer(value) {
    const next = [...answers];
    next[idx] = value;
    setAnswers(next);

    const total = order.length;
    const nextIdx = idx + 1;

    // ¿Acabamos de completar el bloque de una virtud (que NO sea la última)?
    // VIRTUE_CUMULATIVE marca los índices de fin de bloque. La última virtud
    // (H) no dispara modal — va directa al gate para evitar doble
    // interrupción justo antes del formulario.
    const cutoffIdx = VIRTUE_CUMULATIVE.indexOf(nextIdx);
    if (cutoffIdx >= 0 && cutoffIdx < VIRTUE_CUMULATIVE.length - 1) {
      const virtueCode = VIRTUE_ORDER[cutoffIdx];
      // Vector canónico parcial (índice pregunta = pos en CHARACTER_TEST.questions).
      const canonical = new Array(CHARACTER_TEST.questions.length).fill(0);
      for (let i = 0; i < next.length; i++) {
        canonical[order[i]] = next[i] ?? 0;
      }
      const pct = partialVirtueGlobal(canonical, virtueCode);
      setMilestone({ virtueCode, pct });
      return; // NO avanzo idx — el modal lo hace al pulsar Continuar.
    }

    if (nextIdx < total) {
      setIdx(nextIdx);
    } else {
      setPhase(PHASE.GATE);
    }
  }

  function handleMilestoneContinue() {
    setMilestone(null);
    setIdx(idx + 1);
  }

  function handleBack() {
    if (idx > 0 && !milestone) setIdx(idx - 1);
  }

  async function handleGateSubmit(contactData) {
    // Score local antes de mandar (para incluir attrs y validar coherencia).
    const canonical = new Array(CHARACTER_TEST.questions.length).fill(0);
    for (let i = 0; i < order.length; i++) {
      canonical[order[i]] = answers[i] ?? 0;
    }
    const result = scoreCharacter(canonical, CHARACTER_TEST);
    const brevoAttrs = toBrevoAttributes(result);
    // Volcado legible del resultado completo → atributo TEXT en Brevo.
    // Se genera aquí para que backend no tenga que reimplementar el i18n
    // ni el mapeo de facetas.
    brevoAttrs.RESULTADOS_CARACTER = buildResultadosCaracter(
      result, lang,
      t('tbp_character.result.passive_label'),
      t('tbp_character.result.active_label'),
    );

    const payload = {
      contact: contactData,
      result: {
        // Mismos datos que el JS local pero serializados — fuente única para
        // el backend. Brevo los necesita aplanados (brevoAttrs); el detalle
        // completo (passive/active facet keys) se guarda en otra tabla si
        // hace falta auditoría.
        scores: result,
        brevo_attributes: brevoAttrs,
      },
      meta: {
        version: 'tbp-char-v1',
        test_type: 'character',
        submittedAt: new Date().toISOString(),
        answers_values: canonical, // por si auditas / reproduces
      },
    };

    // Push al dataLayer ANTES del envío (mismo patrón que test temperamento).
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({
      event: 'fin_test_caracter',
      test_nombre: contactData.name,
      test_email: contactData.email,
      test_anio: contactData.birthYear,
      test_sexo: contactData.sex,
    });

    setContact(contactData);
    try {
      await submitCharacterContact(payload);
      setPhase(PHASE.RESULT);
    } catch (err) {
      // Re-lanza para que GateForm muestre el error en su UI.
      throw err;
    }
  }

  function handleRestart() {
    setPhase(PHASE.WELCOME);
    setOrder([]);
    setAnswers([]);
    setIdx(0);
    setMilestone(null);
    setContact(null);
  }

  let body;
  if (phase === PHASE.WELCOME) {
    body = <Welcome onStart={handleStart} />;
  } else if (phase === PHASE.QUESTIONS) {
    const itemIdx = order[idx];
    const item = CHARACTER_TEST.questions[itemIdx];
    body = (
      <Question
        progress={idx + 1}
        total={order.length}
        item={item}
        lang={lang}
        onAnswer={handleAnswer}
        onBack={handleBack}
        canBack={idx > 0 && !milestone}
      />
    );
  } else if (phase === PHASE.GATE) {
    body = <GateForm onSubmitOk={handleGateSubmit} />;
  } else if (phase === PHASE.RESULT && scoreResult) {
    body = (
      <ResultScreen
        scoreResult={scoreResult}
        contactName={contact?.name || ''}
        onRestart={handleRestart}
      />
    );
  }

  return (
    <div style={styles.app}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;0,700;1,400&family=Inter:wght@400;500;600;700&display=swap');
        * { box-sizing: border-box; }
        button:focus-visible { outline: 2px solid ${GOLD}; outline-offset: 2px; }
        @media (max-width: 480px) {
          .vl-test-card { padding: 28px 20px !important; }
        }`}</style>
      {body}
      {milestone && (
        <MilestoneModal
          virtueCode={milestone.virtueCode}
          pct={milestone.pct}
          lang={lang}
          onContinue={handleMilestoneContinue}
        />
      )}
    </div>
  );
}
