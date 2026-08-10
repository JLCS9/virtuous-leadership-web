// TestHeart.jsx — Test del Corazón (modelo "Corazón Libre" de A. Havard,
// 8 enfermedades espirituales).
//
// Fases del componente:
//   Welcome → Questions Likert (32 en orden fijo = 8 bloques × 4 preguntas
//             del mismo trastorno) → milestone modal cada 4 preguntas
//             → Gate → Result.
//
// La lógica de scoring vive en src/lib/heartScoring.js. Los datos y textos
// largos vienen de src/data/heart-test.json y heart-support-text.json
// (generados desde el ODS oficial).
//
// Cambios recientes (v2):
//   - Sin shuffle: las 4 preguntas de cada trastorno van juntas para que
//     el modal milestone (cada 4) muestre un resumen coherente.
//   - Imagen HRW (por idioma) en Welcome y Result como imagen destacada.
//   - 8 caritas (heart-disorder-*.jpeg) reemplazan los emblemas de código.
//   - En Welcome, grid 4×2 con las 8 enfermedades visibles antes del test.
//   - En cards del Result: sólo % (sin X/16 y sin badge de nivel).
//   - Título del Result: "Tus resultados" (antes "Tu chequeo espiritual").
//   - Diagnóstico dividido en 2 párrafos con subtítulo "Remedio" antes del 2º.
//   - Sin acordeón "¿Qué mide este test?" al final.

import React, { useState, useMemo, useEffect } from 'react';
import { useT } from './i18n';
import { scoreHeart, toBrevoAttributes, HEART_DISORDER_CODES } from './lib/heartScoring.js';
import HEART_TEST from './data/heart-test.json';
import HEART_SUPPORT from './data/heart-support-text.json';

// Imagen destacada del test — por idioma (texto embebido).
import hrwEs from './assets/HRW-es.png';
import hrwEn from './assets/HRW-en.png';
import hrwFr from './assets/HRW-fr.png';
import hrwRu from './assets/HRW-ru.png';
const HRW_BY_LANG = { es: hrwEs, en: hrwEn, fr: hrwFr, ru: hrwRu };

// Caritas / retratos por trastorno (mismo asset para los 4 idiomas — no
// llevan texto embebido). Uno por cada uno de los 8 trastornos.
import faceR   from './assets/heart-disorder-R.jpeg';   // Kant
import faceVR  from './assets/heart-disorder-VR.jpeg';  // Rivers (Jane Eyre)
import faceVM  from './assets/heart-disorder-VM.jpeg';  // Clint Eastwood
import faceVI  from './assets/heart-disorder-VI.jpeg';  // Freedom
import faceVC  from './assets/heart-disorder-VC.jpeg';  // Pharisee
import faceSV  from './assets/heart-disorder-SV.jpeg';  // Unknown (Kramskoj)
import faceSI  from './assets/heart-disorder-SI.jpeg';  // Rousseau (Руссо)
import faceSC  from './assets/heart-disorder-SC.jpeg';  // Rudin
const DISORDER_FACES = {
  R: faceR, VR: faceVR, VM: faceVM, VI: faceVI,
  VC: faceVC, SV: faceSV, SI: faceSI, SC: faceSC,
};

// ────────────────── paleta y tipografías (sync con otros tests) ──────────────────
const NAVY = '#1B2A4A';
const NAVY_SOFT = '#2A3B5F';
const GOLD = '#C5A55A';
const GOLD_SOFT = '#E0C98A';
const BEIGE = '#F4F1EA';
const PAPER = '#FBF8F1';
const INK = '#22262E';
const MUTED = '#6B6B6B';
const LINE = '#D8D2C2';

const DISORDER_COLORS = {
  R:  { color: '#9C3A3A', soft: '#E9CFCF' },
  VR: { color: '#B04836', soft: '#EBD1CA' },
  VM: { color: '#8B4513', soft: '#DFCEBB' },
  VI: { color: '#7C5A2E', soft: '#DAD0BA' },
  VC: { color: '#6B6339', soft: '#D5D3C4' },
  SV: { color: '#5A3F8B', soft: '#D7CDE6' },
  SI: { color: '#3F5A8B', soft: '#CDD5E6' },
  SC: { color: '#3F7A8B', soft: '#CDE0E6' },
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
  buttonPrimary: { fontFamily: fontSans, fontSize: 15, letterSpacing: '0.06em', textTransform: 'uppercase', fontWeight: 600, color: PAPER, background: NAVY, border: `1px solid ${NAVY}`, padding: '14px 28px', borderRadius: 2, cursor: 'pointer', transition: 'all 160ms ease' },
  buttonGhost: { fontFamily: fontSans, fontSize: 13, color: MUTED, background: 'transparent', border: 'none', padding: '8px 12px', cursor: 'pointer' },
  progress: { fontSize: 13, color: MUTED, letterSpacing: '0.04em', textTransform: 'uppercase' },
  questionText: { fontFamily: fontSerif, fontSize: 22, fontWeight: 500, color: NAVY, margin: '24px 0 28px 0', lineHeight: 1.45 },
};

// ─────────────────────────── utilidades ───────────────────────────

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Resuelve un texto multi-idioma con fallback silencioso: activo → EN → ES.
function resolveMulti(obj, lang) {
  if (!obj) return '';
  return obj[lang] || obj.en || obj.es || obj.fr || obj.ru || obj.pt || '';
}

const SEX_TO_BREVO = { mujer: 'Female', hombre: 'Male' };

// Convierte el texto plano del ODS a HTML con párrafos separados + un
// subtítulo "Remedio" antes del 2º párrafo. El ODS trae el texto en 2
// bloques (diagnóstico + remedio) unidos por \n o por "puntoMayúscula"
// pegado sin espacio (patrón exacto entre las 2 partes).
//
// Estrategia:
//   1. Si trae <p>, respetar tal cual.
//   2. Split por \n+ (líneas vacías).
//   3. Si sale un solo chunk, split por "punto o » seguido de mayúscula
//      sin espacio" (patrón del ODS).
//   4. Envuelve el PRIMER chunk como diagnóstico (<p>).
//      Antes del SEGUNDO chunk (si existe) inserta un <h4>Remedio</h4>
//      con la traducción del idioma activo.
//   5. Cualquier chunk adicional va como <p> normal después del remedio.
function formatDiagnosisHtml(raw, remedyLabel, diagnosisLabel) {
  if (!raw) return '';
  if (/<p[\s>]/i.test(raw)) return raw;

  const lines = raw.split(/\n+/).map(s => s.trim()).filter(Boolean);
  let chunks;
  if (lines.length > 1) {
    chunks = lines;
  } else {
    // Split por punto/interrogación/exclamación, OPCIONALMENTE seguidos de un
    // cierre de comillas (»/"/"/'/"), y a continuación una MAYÚSCULA sin
    // espacio. Cubre los patrones del ODS entre diagnóstico y remedio:
    //   • "imperative."When   ← ASCII quote (falla en EN si no se contempla)
    //   • "categorical."Duty  ← smart quote
    //   • "guilloché."Prends
    //   • ...alma.Guillermo   ← sin comilla intermedia (típico ES/FR)
    const withSep = raw.replace(
      /([\.!?])(["""'»])?([A-ZÁÉÍÓÚÑÀ-ÖØ-Þ«А-ЯЁ])/g,
      '$1$2<PARA_SEP>$3'
    );
    chunks = withSep.split('<PARA_SEP>').map(s => s.trim()).filter(Boolean);
  }

  // 1er chunk = diagnóstico; el resto = remedio (habitualmente 1 chunk más).
  // Estructura visual:
  //   <h4>DIAGNÓSTICO</h4>       ← siempre (paralelo al de REMEDIO)
  //   <p>chunk 0</p>
  //   <h4>REMEDIO</h4>           ← sólo si hay ≥ 2 chunks
  //   <p>chunk 1</p>[...chunks.slice(2)]
  const diagHead = diagnosisLabel
    ? `<h4 class="heart-remedy-heading">${diagnosisLabel}</h4>`
    : '';
  if (chunks.length <= 1) {
    // Edge case: sólo un chunk (típicamente sólo diagnóstico). Aún así
    // pinta el subtítulo Diagnóstico si viene, para uniformidad visual.
    return `${diagHead}<p>${chunks[0] || raw}</p>`;
  }
  const out = [
    diagHead,
    `<p>${chunks[0]}</p>`,
    `<h4 class="heart-remedy-heading">${remedyLabel}</h4>`,
    ...chunks.slice(1).map(c => `<p>${c}</p>`),
  ];
  return out.join('');
}

async function submitHeartContact(payload) {
  const url = import.meta.env.VITE_SUBMIT_HEART_URL;
  if (!url) {
    console.log('[stub submitHeartContact] payload:', payload);
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

// Construye un texto legible con el resultado completo del test del
// corazón, para el atributo Brevo TEXT `RESULTADOS_CORAZON`. Formato
// (una línea por trastorno), pensado para lectura humana en la UI de
// Brevo:
//
//   Racionalismo: 12% · sin inclinación
//   Voluntarismo religioso: 75% · nivel 2
//   ...
//
// Nombres y stage labels en el idioma del usuario. Se llama en
// handleGateSubmit, justo antes de mandar al backend. Se limita a ~1200
// chars — 8 líneas ~ 40-80 chars → holgura de sobra.
function buildResultadosCorazon(scoreResult, lang, stageLabels) {
  const labels = HEART_SUPPORT.labels;
  const lines = HEART_DISORDER_CODES.map(code => {
    const d = scoreResult?.disorders?.[code];
    if (!d) return '';
    const name = resolveMulti(labels[d.label_key], lang);
    const pct = Math.round(d.pct);
    const stageLbl = stageLabels[d.stage] || d.stage;
    return `${name}: ${pct}% · ${stageLbl}`;
  }).filter(Boolean);
  return lines.join('\n').slice(0, 1200);
}

// Score parcial de un trastorno concreto a partir del vector de respuestas
// canónico (índice = pos en HEART_TEST.questions, valor 0-4).
// Usado por el modal cada 4 para mostrar el score inmediato del trastorno
// que acaba de completar el usuario.
function partialDisorderStats(answersCanonical, disorderCode) {
  const disorder = HEART_TEST.disorders.find(d => d.code === disorderCode);
  if (!disorder) return { score: 0, pct: 0, stage: 'none' };
  const qIdxByCode = Object.fromEntries(HEART_TEST.questions.map((q, i) => [q.code, i]));
  let score = 0;
  for (const qc of disorder.question_codes) {
    const idx = qIdxByCode[qc];
    if (idx != null) score += answersCanonical[idx] || 0;
  }
  const pct = Math.round((score / 16) * 100);
  const stage = pct < 33 ? 'none' : pct < 66 ? 'stage1' : 'stage2';
  return { score, pct, stage };
}

// ─────────────────────────── subcomponentes ───────────────────────────

function Welcome({ onStart }) {
  const { t, lang } = useT();
  const intro = resolveMulti(HEART_SUPPORT.labels.heartTestIntro, lang);
  const hrwSrc = HRW_BY_LANG[lang] || HRW_BY_LANG.es;

  return (
    <div style={styles.card}>
      <div style={styles.subtitle}>{t('tbp_heart.welcome.eyebrow')}</div>
      {/* h1 sólo si hay title. En prod title = '' — el eyebrow ya funciona
          como cabecera, no queremos duplicar el nombre del test. */}
      {t('tbp_heart.welcome.title') && (
        <h1 style={styles.h1}>{t('tbp_heart.welcome.title')}</h1>
      )}

      {/* Imagen destacada del test — misma que se ve en /tests y en el Result. */}
      <div style={{ display: 'flex', justifyContent: 'center', margin: '20px 0 24px' }}>
        <img src={hrwSrc} alt={t('tbp_heart.welcome.title')}
             style={{ width: '100%', maxWidth: 320, height: 'auto', display: 'block' }} />
      </div>

      {/* Texto de bienvenida del ODS (heartTestIntro) — copy real del libro.
          Ya menciona "las 8 enfermedades espirituales descritas a continuación",
          así que no hace falta el grid con caritas antes de empezar
          (eliminado a petición: menos ruido visual antes del test). */}
      <p style={styles.para}>{intro}</p>

      <div style={{ display: 'flex', alignItems: 'center', gap: 24, marginTop: 28, marginBottom: 28, flexWrap: 'wrap' }}>
        <div style={{ fontSize: 13, color: MUTED }}>
          <strong style={{ color: NAVY, display: 'block', fontFamily: fontSerif, fontSize: 16, fontWeight: 600 }}>
            {t('tbp_heart.welcome.duration_label')}
          </strong>
          {t('tbp_heart.welcome.duration_text')}
        </div>
        <div style={{ flex: 1 }} />
        <button
          data-gtm="comenzar-test-corazon"
          style={styles.buttonPrimary}
          onMouseOver={e => (e.currentTarget.style.background = NAVY_SOFT)}
          onMouseOut={e => (e.currentTarget.style.background = NAVY)}
          onClick={onStart}
        >
          {t('tbp_heart.welcome.button')}
        </button>
      </div>
    </div>
  );
}

// Question — pregunta con Likert 5 botones (valores 0-4).
function Question({ progress, total, item, lang, onAnswer, onBack, canBack }) {
  const { t } = useT();
  const text = resolveMulti(item.text, lang);
  const labels = t('tbp_heart.question.likert');
  const options = [
    { key: 'strongly_agree',    value: 4, label: labels.strongly_agree },
    { key: 'agree',             value: 3, label: labels.agree },
    { key: 'neutral',           value: 2, label: labels.neutral },
    { key: 'disagree',          value: 1, label: labels.disagree },
    { key: 'strongly_disagree', value: 0, label: labels.strongly_disagree },
  ];

  return (
    <div style={styles.card} className="vl-test-card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
        <span style={styles.progress}>{t('tbp_heart.question.progress', { n: progress, total })}</span>
        <button
          style={{ ...styles.buttonGhost, opacity: canBack ? 1 : 0.3, cursor: canBack ? 'pointer' : 'default' }}
          disabled={!canBack}
          onClick={onBack}
        >
          {t('tbp_heart.question.back')}
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
              fontFamily: fontSans, fontSize: 15, padding: '14px 18px',
              border: `1px solid ${LINE}`, background: PAPER, color: NAVY,
              borderRadius: 2, cursor: 'pointer', textAlign: 'left',
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

// MilestoneModal — modal bloqueante que aparece tras completar las 4 preguntas
// de un trastorno. Muestra la carita + nombre + % + botón "Continuar".
// (El badge de nivel se quitó a petición — el % lleva toda la info que
// necesita ver el usuario en un paso intermedio; el nivel formal queda
// implícito en el color y se verá luego en el Result final.)
function MilestoneModal({ disorderCode, partial, lang, onContinue }) {
  const { t } = useT();
  const d = HEART_TEST.disorders.find(x => x.code === disorderCode);
  const name = resolveMulti(HEART_SUPPORT.labels[d.label_key], lang);
  const face = DISORDER_FACES[disorderCode];
  const c = DISORDER_COLORS[disorderCode];

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
        <div style={styles.subtitle}>{t('tbp_heart.milestone.eyebrow')}</div>

        {/* Carita del trastorno recién completado */}
        <div style={{
          margin: '4px auto 20px',
          width: 120, height: 120, borderRadius: '50%',
          border: `3px solid ${c.color}`, overflow: 'hidden',
          background: BEIGE,
        }}>
          <img src={face} alt={name}
               style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        </div>

        <h3 style={{
          fontFamily: fontSerif, fontSize: 24, fontWeight: 600,
          color: NAVY, margin: '0 0 8px', lineHeight: 1.2,
        }}>
          {name}
        </h3>

        <div style={{
          fontFamily: fontSerif, fontSize: 48, fontWeight: 600,
          color: c.color, lineHeight: 1, margin: '12px 0 20px',
        }}>
          {partial.pct}%
        </div>

        <p style={{ fontSize: 14, color: MUTED, lineHeight: 1.5, margin: '0 0 24px' }}>
          {t('tbp_heart.milestone.note')}
        </p>

        <button
          onClick={onContinue}
          style={{ ...styles.buttonPrimary, width: '100%' }}
          onMouseOver={e => (e.currentTarget.style.background = NAVY_SOFT)}
          onMouseOut={e => (e.currentTarget.style.background = NAVY)}
        >
          {t('tbp_heart.milestone.continue')}
        </button>
      </div>
    </div>
  );
}

// GateForm — datos demográficos + consent antes de resultados.
function GateForm({ onSubmitOk }) {
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
  const sexOpts = t('tbp_heart.gate.sex_options');

  const errors = {
    name: name.trim().length < 2 ? t('tbp_heart.gate.errors.name') : null,
    email: !EMAIL_RE.test(email.trim()) ? t('tbp_heart.gate.errors.email') : null,
    birthYear: (() => {
      if (!birthYear) return t('tbp_heart.gate.errors.year_required');
      const n = Number(birthYear);
      if (!Number.isInteger(n) || n < 1900 || n > currentYear) return t('tbp_heart.gate.errors.year_range', { max: currentYear });
      return null;
    })(),
    sex: !sex ? t('tbp_heart.gate.errors.sex') : null,
    consent: !consent ? t('tbp_heart.gate.errors.consent') : null,
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
      setSubmitError(t('tbp_heart.gate.errors.submit_failed'));
      console.error('submitHeart error:', err);
      setSubmitting(false);
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
      <div style={styles.subtitle}>{t('tbp_heart.gate.eyebrow')}</div>
      <h2 style={{ ...styles.h1, fontSize: 28 }}>{t('tbp_heart.gate.title')}</h2>
      <p style={{ ...styles.para, marginTop: 12 }}>{t('tbp_heart.gate.intro')}</p>

      <form onSubmit={handleSubmit} noValidate style={{ marginTop: 24 }}>
        <div style={{ marginBottom: 18 }}>
          <label htmlFor="heart-gate-name" style={labelStyle}>{t('tbp_heart.gate.fields.name')}</label>
          <input id="heart-gate-name" type="text" autoComplete="given-name" value={name}
                 onChange={e => setName(e.target.value)} onFocus={focus} onBlur={e => blur(e, 'name')}
                 style={{ ...inputBase, borderColor: showErr('name') ? '#A03434' : LINE }} />
          {showErr('name') && <div style={errStyle}>{errors.name}</div>}
        </div>

        <div style={{ marginBottom: 18 }}>
          <label htmlFor="heart-gate-email" style={labelStyle}>{t('tbp_heart.gate.fields.email')}</label>
          <input id="heart-gate-email" type="email" autoComplete="email" value={email}
                 onChange={e => setEmail(e.target.value)} onFocus={focus} onBlur={e => blur(e, 'email')}
                 style={{ ...inputBase, borderColor: showErr('email') ? '#A03434' : LINE }} />
          {showErr('email') && <div style={errStyle}>{errors.email}</div>}
        </div>

        <div style={{ marginBottom: 18 }}>
          <label htmlFor="heart-gate-year" style={labelStyle}>{t('tbp_heart.gate.fields.birth_year')}</label>
          <input id="heart-gate-year" type="number" inputMode="numeric" min="1900" max={currentYear} placeholder="1985"
                 value={birthYear} onChange={e => setBirthYear(e.target.value)}
                 onFocus={focus} onBlur={e => blur(e, 'birthYear')}
                 style={{ ...inputBase, width: 140, borderColor: showErr('birthYear') ? '#A03434' : LINE }} />
          {showErr('birthYear') && <div style={errStyle}>{errors.birthYear}</div>}
        </div>

        <div style={{ marginBottom: 18 }}>
          <span style={labelStyle}>{t('tbp_heart.gate.fields.sex')}</span>
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
                dangerouslySetInnerHTML={{ __html: t('tbp_heart.gate.consent_html') }} />
        </label>
        {showErr('consent') && <div style={errStyle}>{errors.consent}</div>}

        {submitError && <div style={{ ...errStyle, marginTop: 16, fontSize: 14 }}>{submitError}</div>}

        <div style={{ marginTop: 28, display: 'flex', justifyContent: 'flex-end' }}>
          <button type="submit" disabled={submitting}
                  data-gtm="fin-test-corazon"
                  style={{ ...styles.buttonPrimary, opacity: submitting ? 0.6 : 1, cursor: submitting ? 'wait' : 'pointer' }}
                  onMouseOver={e => !submitting && (e.currentTarget.style.background = NAVY_SOFT)}
                  onMouseOut={e => !submitting && (e.currentTarget.style.background = NAVY)}>
            {submitting ? t('tbp_heart.gate.submitting') : t('tbp_heart.gate.submit')}
          </button>
        </div>
      </form>
    </div>
  );
}

// DisorderCard — card por trastorno en el Result.
//
// Reglas de UI (v3):
//   - TODOS los trastornos son expandibles, aunque estén en 'none'. El
//     usuario ha de poder leer el diagnóstico + remedio de las 8
//     enfermedades independientemente de si tiene inclinación o no
//     (peticion del usuario 2026-08-06: "aunque tenga un nivel bajo de la
//     enfermedad, se tiene que poder ver el contenido").
//   - Los 'none' se muestran con opacidad reducida y fondo levemente
//     distinto para señalar visualmente que no hay tendencia — pero
//     siguen siendo clicables y muestran el mismo contenido.
//   - En el expandido, sólo se pinta el "Aparentemente posees una etapa
//     X de..." si el stage lo justifica (stage1 / stage2); en 'none' se
//     omite ese titular italic para no contradecir al usuario.
function DisorderCard({ code, disorderResult, lang, remedyLabel, diagnosisLabel, notInclinedPattern }) {
  const [expanded, setExpanded] = useState(false);
  const c = DISORDER_COLORS[code];
  const face = DISORDER_FACES[code];
  const name = resolveMulti(HEART_SUPPORT.labels[disorderResult.label_key], lang);
  const html = resolveMulti(HEART_SUPPORT.html[disorderResult.html_key], lang);
  const isAffected = disorderResult.stage !== 'none';

  const stateLabel = {
    stage1: resolveMulti(HEART_SUPPORT.labels.hResultDeceaseStage1, lang),
    stage2: resolveMulti(HEART_SUPPORT.labels.hResultDeceaseStage2, lang),
  }[disorderResult.stage];

  return (
    <div style={{
      background: isAffected ? PAPER : '#FBF7EE',
      border: `1px solid ${LINE}`,
      borderLeft: `4px solid ${c.color}`,
      borderRadius: 4,
      marginBottom: 14,
      overflow: 'hidden',
      opacity: isAffected ? 1 : 0.72,
    }}>
      <button
        onClick={() => setExpanded(v => !v)}
        aria-expanded={expanded}
        style={{
          width: '100%', textAlign: 'left', background: 'transparent',
          border: 'none', padding: '18px 22px', cursor: 'pointer',
          display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap',
          fontFamily: fontSans,
        }}
      >
        {/* Carita del trastorno — reemplaza al emblema con letra. */}
        <div style={{
          width: 56, height: 56, borderRadius: '50%',
          overflow: 'hidden', flexShrink: 0,
          border: `2px solid ${c.color}`, background: BEIGE,
        }}>
          <img src={face} alt={name}
               style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
        </div>
        <div style={{ flex: '1 1 220px', minWidth: 200 }}>
          <div style={{ fontFamily: fontSerif, fontSize: 22, fontWeight: 600, color: NAVY, lineHeight: 1.2 }}>
            {name}
          </div>
        </div>
        {/* Sólo % — sin X/16 y sin badge de nivel. */}
        <div style={{
          fontFamily: fontSerif, fontSize: 26, fontWeight: 600,
          color: c.color, lineHeight: 1,
        }}>
          {Math.round(disorderResult.pct)}%
        </div>
        <div style={{ fontSize: 22, color: c.color, marginLeft: 8, transition: 'transform 200ms', transform: expanded ? 'rotate(90deg)' : 'rotate(0deg)' }}>
          ›
        </div>
      </button>

      {expanded && (
        <div style={{ padding: '0 22px 22px 22px', borderTop: `1px solid ${LINE}`, background: BEIGE }}>
          {/* Titular italic — SIEMPRE, aunque no haya inclinación.
              - stage1/stage2: "Al parecer posees una etapa X de..."
              - none:          "Parece que no estás inclinado al X."
              Antes en 'none' se omitía; el usuario pidió que aparezca
              siempre y que se explicite explícitamente cuando no hay
              inclinación (2026-08-10). */}
          <p style={{ fontFamily: fontSerif, fontStyle: 'italic', fontSize: 17, color: NAVY_SOFT, marginTop: 18, marginBottom: 4 }}>
            {isAffected
              ? (<>{stateLabel} <strong style={{ color: c.color }}>{name.toLowerCase()}</strong>.</>)
              : (() => {
                  // Split "no_inclined_pattern" en el placeholder {name}
                  // para poder pintar el nombre con estilo (color+bold).
                  const parts = (notInclinedPattern || '{name}').split('{name}');
                  return (<>{parts[0]}<strong style={{ color: c.color }}>{name.toLowerCase()}</strong>{parts[1] || ''}</>);
                })()}
          </p>
          <div
            className="heart-disorder-html"
            style={{ fontSize: 15, lineHeight: 1.65, color: INK, marginTop: 12 }}
            dangerouslySetInnerHTML={{ __html: formatDiagnosisHtml(html, remedyLabel, diagnosisLabel) }}
          />
        </div>
      )}
    </div>
  );
}

// ResultScreen — imagen HRW arriba, veredicto, 8 cards ordenadas, CTA libro.
// (Sin acordeón "¿Qué mide este test?" — quitado a petición.)
function ResultScreen({ scoreResult, contactName, onRestart }) {
  const { t, lang } = useT();
  const bookUrl = resolveMulti(HEART_TEST.link_to_book, lang);
  const hrwSrc = HRW_BY_LANG[lang] || HRW_BY_LANG.es;
  const remedyLabel = t('tbp_heart.result.remedy_heading');
  const diagnosisLabel = t('tbp_heart.result.diagnosis_heading');
  const notInclinedPattern = t('tbp_heart.result.not_inclined_pattern');

  // Orden CANÓNICO del test: R (racionalismo) → 4 voluntarismos (VR/VM/VI/VC)
  // → 3 sentimentalismos (SV/SI/SC). Antes reordenábamos por stage (stage2
  // arriba, stage1, none abajo) pero eso mezclaba voluntarismos con
  // sentimentalismos y rompía la agrupación temática. Ahora respetamos el
  // orden del libro: se ve el mapa completo del corazón en el mismo orden
  // en que se responden las preguntas.
  const orderedCodes = HEART_DISORDER_CODES;

  const balancedText = resolveMulti(HEART_SUPPORT.labels.hResultInBalance, lang);
  const affectedNames = useMemo(() => {
    const codes = [...scoreResult.stage2_codes, ...scoreResult.stage1_codes];
    return codes.map(code => {
      const d = scoreResult.disorders[code];
      return resolveMulti(HEART_SUPPORT.labels[d.label_key], lang).toLowerCase();
    });
  }, [scoreResult, lang]);
  const affectedList = useMemo(() => {
    if (affectedNames.length === 0) return '';
    try {
      return new Intl.ListFormat(lang, { style: 'long', type: 'conjunction' }).format(affectedNames);
    } catch {
      return affectedNames.join(', ');
    }
  }, [affectedNames, lang]);
  const verdictHeadline = scoreResult.verdict === 'balanced'
    ? balancedText
    : t('tbp_heart.result.has_stages_pattern', { list: affectedList });

  return (
    <div style={styles.resultCard}>
      <div style={styles.subtitle}>{t('tbp_heart.result.eyebrow_prefix')} {contactName}</div>
      <h1 style={{ ...styles.h1, fontSize: 32, marginBottom: 12 }}>{t('tbp_heart.result.title')}</h1>

      {/* Imagen destacada del test — misma que Welcome y /tests. */}
      <div style={{ display: 'flex', justifyContent: 'center', margin: '16px 0 24px' }}>
        <img src={hrwSrc} alt={t('tbp_heart.result.title')}
             style={{ width: '100%', maxWidth: 320, height: 'auto', display: 'block' }} />
      </div>

      {/* Veredicto global */}
      <div style={{
        padding: '20px 24px',
        background: scoreResult.verdict === 'balanced' ? '#EFF6F1' : BEIGE,
        border: `1px solid ${scoreResult.verdict === 'balanced' ? '#B8D5C0' : LINE}`,
        borderLeft: `4px solid ${scoreResult.verdict === 'balanced' ? '#3F7A56' : GOLD}`,
        borderRadius: 2, margin: '20px 0 8px 0',
      }}>
        <p style={{ fontFamily: fontSerif, fontSize: 20, color: NAVY, margin: 0, lineHeight: 1.4 }}>
          {verdictHeadline}
        </p>
      </div>

      <p style={{ ...styles.para, color: MUTED, fontSize: 14, marginTop: 12 }}>
        {t('tbp_heart.result.intro')}
      </p>

      {/* 8 disorder cards ordenadas: primero stage2, luego stage1, luego none. */}
      <div style={{ marginTop: 24 }}>
        {orderedCodes.map(code => (
          <DisorderCard key={code} code={code}
                        disorderResult={scoreResult.disorders[code]}
                        lang={lang}
                        remedyLabel={remedyLabel}
                        diagnosisLabel={diagnosisLabel}
                        notInclinedPattern={notInclinedPattern} />
        ))}
      </div>

      {/* CTA libro (si hay URL para el idioma o fallback) */}
      {bookUrl && (
        <div style={{
          marginTop: 32, padding: '24px', background: PAPER,
          border: `1px solid ${GOLD}`, borderLeft: `4px solid ${GOLD}`, borderRadius: 2,
          textAlign: 'center',
        }}>
          <div style={{ fontSize: 11, color: '#9D8240', letterSpacing: '0.18em', textTransform: 'uppercase', fontWeight: 600, marginBottom: 12 }}>
            {t('tbp_heart.result.cta_eyebrow')}
          </div>
          <h3 style={{ ...styles.h2, fontSize: 22, margin: 0 }}>
            {t('tbp_heart.result.cta_title')}
          </h3>
          <a
            href={bookUrl} target="_blank" rel="noopener noreferrer"
            data-gtm="cta-libro-corazon"
            style={{
              display: 'inline-block', marginTop: 18,
              fontFamily: fontSans, fontSize: 13, fontWeight: 600,
              letterSpacing: '0.08em', textTransform: 'uppercase',
              color: NAVY, background: GOLD, border: `1px solid ${GOLD}`,
              padding: '12px 28px', borderRadius: 2, textDecoration: 'none',
              transition: 'all 160ms ease',
            }}
            onMouseOver={e => { e.currentTarget.style.background = '#9D8240'; e.currentTarget.style.borderColor = '#9D8240'; e.currentTarget.style.color = PAPER; }}
            onMouseOut={e => { e.currentTarget.style.background = GOLD; e.currentTarget.style.borderColor = GOLD; e.currentTarget.style.color = NAVY; }}
          >
            {t('tbp_heart.result.cta_button')} →
          </a>
        </div>
      )}

      <div style={{ textAlign: 'center', marginTop: 32 }}>
        <button
          style={{ ...styles.buttonPrimary, background: 'transparent', color: NAVY }}
          onMouseOver={e => { e.currentTarget.style.background = NAVY; e.currentTarget.style.color = PAPER; }}
          onMouseOut={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = NAVY; }}
          onClick={onRestart}
        >
          {t('tbp_heart.result.repeat_button')}
        </button>
      </div>
    </div>
  );
}

// ─────────────────────────── orquestador ───────────────────────────

const PHASE = { WELCOME: 'welcome', QUESTIONS: 'questions', GATE: 'gate', RESULT: 'result' };

// Orden CANÓNICO de preguntas — sin shuffle. Las 4 preguntas de cada
// trastorno van consecutivas para que el modal milestone cada 4 muestre
// un resumen coherente de la enfermedad que acaba de completar el usuario.
// El orden se calcula UNA VEZ al arranque del módulo — usa el orden de
// HEART_TEST.disorders (R, VR, VM, VI, VC, SV, SI, SC) y las 4 preguntas
// por trastorno del ODS.
function buildCanonicalOrder() {
  const qIdxByCode = Object.fromEntries(HEART_TEST.questions.map((q, i) => [q.code, i]));
  const order = [];
  for (const d of HEART_TEST.disorders) {
    for (const qc of d.question_codes) {
      if (qc in qIdxByCode) order.push(qIdxByCode[qc]);
    }
  }
  return order;
}
const CANONICAL_ORDER = buildCanonicalOrder();

export default function TestHeart() {
  const { t, lang } = useT();
  const [phase, setPhase] = useState(PHASE.WELCOME);
  const [answers, setAnswers] = useState([]);
  const [idx, setIdx] = useState(0);
  const [contact, setContact] = useState(null);
  // Modal milestone que aparece al terminar las 4 preguntas de un trastorno.
  // Guarda el código del trastorno recién completado; null = no visible.
  const [milestone, setMilestone] = useState(null);

  const scoreResult = useMemo(() => {
    if (phase !== PHASE.RESULT || answers.length !== CANONICAL_ORDER.length) return null;
    const canonical = new Array(HEART_TEST.questions.length).fill(0);
    for (let i = 0; i < CANONICAL_ORDER.length; i++) {
      canonical[CANONICAL_ORDER[i]] = answers[i] ?? 0;
    }
    return scoreHeart(canonical, HEART_TEST);
  }, [phase, answers]);

  function handleStart() {
    setAnswers([]);
    setIdx(0);
    setMilestone(null);
    setPhase(PHASE.QUESTIONS);
  }

  function handleAnswer(value) {
    const next = [...answers];
    next[idx] = value;
    setAnswers(next);

    const total = CANONICAL_ORDER.length;
    const nextIdx = idx + 1;

    // ¿Acabamos de completar las 4 preguntas de un trastorno?
    // El bloque de trastorno t (0-indexed) va de idx 4t..4t+3.
    // Trigger milestone si nextIdx es múltiplo de 4, PERO NO en la última
    // pregunta (nextIdx === total) — ahí ya pasamos al gate directamente
    // sin milestone (evita doble interrupción antes del gate).
    if (nextIdx % 4 === 0 && nextIdx < total) {
      const disorderIdx = Math.floor((nextIdx - 1) / 4); // 0..7
      const disorderCode = HEART_TEST.disorders[disorderIdx].code;
      // Construir el vector canónico parcial con las respuestas hasta ahora.
      const canonical = new Array(HEART_TEST.questions.length).fill(0);
      for (let i = 0; i < next.length; i++) {
        canonical[CANONICAL_ORDER[i]] = next[i] ?? 0;
      }
      const partial = partialDisorderStats(canonical, disorderCode);
      setMilestone({ disorderCode, partial });
      return; // no avanzo idx todavía — el modal ha de dar Continuar
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
    if (idx > 0) setIdx(idx - 1);
  }

  async function handleGateSubmit(contactData) {
    const canonical = new Array(HEART_TEST.questions.length).fill(0);
    for (let i = 0; i < CANONICAL_ORDER.length; i++) {
      canonical[CANONICAL_ORDER[i]] = answers[i] ?? 0;
    }
    const result = scoreHeart(canonical, HEART_TEST);
    const brevoAttrs = toBrevoAttributes(result);
    // Volcado legible del resultado completo → atributo TEXT en Brevo.
    brevoAttrs.RESULTADOS_CORAZON = buildResultadosCorazon(result, lang, {
      none:   t('tbp_heart.result.brevo_no_inclination'),
      stage1: t('tbp_heart.result.brevo_stage1'),
      stage2: t('tbp_heart.result.brevo_stage2'),
    });

    const payload = {
      contact: contactData,
      result: { scores: result, brevo_attributes: brevoAttrs },
      meta: {
        version: 'tbp-heart-v2',
        test_type: 'heart',
        submittedAt: new Date().toISOString(),
        answers_values: canonical,
      },
    };

    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({
      event: 'fin_test_corazon',
      test_nombre: contactData.name,
      test_email: contactData.email,
      test_anio: contactData.birthYear,
      test_sexo: contactData.sex,
      test_corazon_balanced: result.verdict === 'balanced',
      test_corazon_top: result.stage2_codes.join(','),
    });

    setContact(contactData);
    try {
      await submitHeartContact(payload);
      setPhase(PHASE.RESULT);
    } catch (err) {
      throw err;
    }
  }

  function handleRestart() {
    setPhase(PHASE.WELCOME);
    setAnswers([]);
    setIdx(0);
    setMilestone(null);
    setContact(null);
  }

  let body;
  if (phase === PHASE.WELCOME) {
    body = <Welcome onStart={handleStart} />;
  } else if (phase === PHASE.QUESTIONS) {
    const itemIdx = CANONICAL_ORDER[idx];
    const item = HEART_TEST.questions[itemIdx];
    body = (
      <Question
        progress={idx + 1}
        total={CANONICAL_ORDER.length}
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
          .vl-heart-welcome-grid { grid-template-columns: repeat(2, 1fr) !important; }
        }
        /* Formato para el HTML de diagnóstico+remedio que viene del ODS. */
        .heart-disorder-html p { margin: 0 0 14px 0; line-height: 1.65; }
        .heart-disorder-html p:last-child { margin-bottom: 0; }
        .heart-disorder-html strong { color: ${NAVY}; font-weight: 600; }
        .heart-disorder-html em { font-style: italic; color: ${NAVY_SOFT}; }
        .heart-disorder-html .heart-remedy-heading {
          font-family: ${fontSerif};
          font-size: 17px;
          font-weight: 600;
          color: ${GOLD};
          text-transform: uppercase;
          letter-spacing: 0.08em;
          margin: 18px 0 10px 0;
          padding-top: 12px;
          border-top: 1px solid ${LINE};
        }
      `}</style>
      {body}
      {milestone && (
        <MilestoneModal
          disorderCode={milestone.disorderCode}
          partial={milestone.partial}
          lang={lang}
          onContinue={handleMilestoneContinue}
        />
      )}
    </div>
  );
}
