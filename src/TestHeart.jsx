// TestHeart.jsx — Test del Corazón (modelo "Corazón Libre" de A. Havard,
// 8 enfermedades espirituales).
//
// Calca el patrón de TestCharacter.jsx (Welcome → Questions Likert → Gate
// → Result). La lógica de scoring vive en src/lib/heartScoring.js. Los
// datos y textos largos vienen de src/data/heart-test.json y
// src/data/heart-support-text.json (generados desde el ODS oficial).
//
// Escala de respuestas: enteros 0-4. La UI muestra 5 etiquetas Likert
// traducidas (mismo orden visual descendente que el test de carácter:
// totalmente de acuerdo arriba). El valor NUMÉRICO va 0..4: acuerdo alto =
// alta puntuación de síntoma (todas las preguntas son afirmaciones-síntoma
// en la misma dirección).

import React, { useState, useMemo } from 'react';
import { useT } from './i18n';
import { scoreHeart, toBrevoAttributes, HEART_DISORDER_CODES } from './lib/heartScoring.js';
import HEART_TEST from './data/heart-test.json';
import HEART_SUPPORT from './data/heart-support-text.json';

// ────────────────── paleta y tipografías (sync con TestCharacter) ──────────────────
const NAVY = '#1B2A4A';
const NAVY_SOFT = '#2A3B5F';
const GOLD = '#C5A55A';
const GOLD_SOFT = '#E0C98A';
const BEIGE = '#F4F1EA';
const PAPER = '#FBF8F1';
const INK = '#22262E';
const MUTED = '#6B6B6B';
const LINE = '#D8D2C2';

// Color por trastorno. Rojos/rosas para racionalismos/voluntarismos que
// endurecen (R, VR, VM, VI, VC); azules/violetas para sentimentalismos
// (SV, SI, SC). Iterable después con paleta oficial del libro.
const DISORDER_COLORS = {
  R:  { color: '#9C3A3A', soft: '#E9CFCF' }, // Racionalismo
  VR: { color: '#B04836', soft: '#EBD1CA' }, // Voluntarismo religioso
  VM: { color: '#8B4513', soft: '#DFCEBB' }, // Voluntarismo machista
  VI: { color: '#7C5A2E', soft: '#DAD0BA' }, // Voluntarismo ideológico
  VC: { color: '#6B6339', soft: '#D5D3C4' }, // Voluntarismo conformista
  SV: { color: '#5A3F8B', soft: '#D7CDE6' }, // Sentim. voluptuoso
  SI: { color: '#3F5A8B', soft: '#CDD5E6' }, // Sentim. insano
  SC: { color: '#3F7A8B', soft: '#CDE0E6' }, // Sentim. cobarde
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

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Resuelve un texto multi-idioma con fallback: activo → EN → ES → cualquiera
// no vacío. Cubre los gaps del ODS (linkToBookHeart solo ES, about-heart
// sin EN, etc.).
function resolveMulti(obj, lang) {
  if (!obj) return '';
  return obj[lang] || obj.en || obj.es || obj.fr || obj.ru || obj.pt || '';
}

const SEX_TO_BREVO = { mujer: 'Female', hombre: 'Male' };

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

// ─────────────────────────── subcomponentes ───────────────────────────

function Welcome({ onStart }) {
  const { t, lang } = useT();
  const intro = resolveMulti(HEART_SUPPORT.labels.heartTestIntro, lang);
  return (
    <div style={styles.card}>
      <div style={styles.subtitle}>{t('tbp_heart.welcome.eyebrow')}</div>
      <h1 style={styles.h1}>{t('tbp_heart.welcome.title')}</h1>
      <p style={{ ...styles.para, fontFamily: fontSerif, fontSize: 18, color: NAVY_SOFT, fontStyle: 'italic' }}>
        {t('tbp_heart.welcome.byline')}
      </p>
      {/* Texto de bienvenida del ODS (heartTestIntro) — el "copy real" del
          libro. Los strings i18n contienen sólo labels UI cortos. */}
      <p style={styles.para}>{intro}</p>
      <p style={styles.notice}>{t('tbp_heart.welcome.notice')}</p>

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

// Question — pregunta con Likert 5 (valores 0-4). Orden visual descendente
// (más de acuerdo arriba), consistente con el test de carácter.
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

// DisorderCard — 1 card por trastorno con letra + stage badge + click a expandir.
function DisorderCard({ code, disorderResult, lang }) {
  const { t } = useT();
  const [expanded, setExpanded] = useState(false);
  const c = DISORDER_COLORS[code];
  const name = resolveMulti(HEART_SUPPORT.labels[disorderResult.label_key], lang);
  const html = resolveMulti(HEART_SUPPORT.html[disorderResult.html_key], lang);

  // Frase de estado personalizada según stage.
  const stateLabel = {
    none:   resolveMulti(HEART_SUPPORT.labels.hResultNoDecease, lang),
    stage1: resolveMulti(HEART_SUPPORT.labels.hResultDeceaseStage1, lang),
    stage2: resolveMulti(HEART_SUPPORT.labels.hResultDeceaseStage2, lang),
  }[disorderResult.stage];

  // Badge visual del stage.
  const stageBadge = {
    none:   { text: t('tbp_heart.result.stage_none'),   bg: '#E8EFE9', fg: '#3F7A56' },
    stage1: { text: t('tbp_heart.result.stage_1'),      bg: '#F3E8D0', fg: '#9D8240' },
    stage2: { text: t('tbp_heart.result.stage_2'),      bg: '#E9CFCF', fg: '#9C3A3A' },
  }[disorderResult.stage];

  const emphasize = disorderResult.stage !== 'none';

  return (
    <div style={{
      background: emphasize ? PAPER : '#FBF7EE',
      border: `1px solid ${LINE}`,
      borderLeft: `4px solid ${c.color}`,
      borderRadius: 4,
      marginBottom: 14,
      overflow: 'hidden',
      opacity: emphasize ? 1 : 0.78,
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
        {/* Cuadrado con el código del trastorno */}
        <div style={{
          width: 56, height: 56, borderRadius: 4, background: c.color,
          color: PAPER, fontFamily: fontSerif, fontWeight: 700, fontSize: 22,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          letterSpacing: '0.02em', flexShrink: 0,
        }}>
          {code}
        </div>

        <div style={{ flex: '1 1 220px', minWidth: 200 }}>
          <div style={{ fontFamily: fontSerif, fontSize: 22, fontWeight: 600, color: NAVY, lineHeight: 1.2 }}>
            {name}
          </div>
          <div style={{ fontSize: 13, color: MUTED, marginTop: 4 }}>
            {t('tbp_heart.result.score_label')}: <strong style={{ color: INK }}>{disorderResult.score}/16</strong>
            {' · '}
            {Math.round(disorderResult.pct)}%
          </div>
        </div>

        {/* Stage badge */}
        <div style={{
          fontSize: 12, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase',
          padding: '6px 10px', borderRadius: 2,
          background: stageBadge.bg, color: stageBadge.fg,
        }}>
          {stageBadge.text}
        </div>

        <div style={{ fontSize: 22, color: c.color, marginLeft: 8, transition: 'transform 200ms', transform: expanded ? 'rotate(90deg)' : 'rotate(0deg)' }}>
          ›
        </div>
      </button>

      {expanded && (
        <div style={{ padding: '0 22px 22px 22px', borderTop: `1px solid ${LINE}`, background: BEIGE }}>
          {/* Frase de estado personalizada arriba del HTML de diagnóstico */}
          {stateLabel && (
            <p style={{ fontFamily: fontSerif, fontStyle: 'italic', fontSize: 17, color: NAVY_SOFT, marginTop: 18, marginBottom: 4 }}>
              {stateLabel} <strong style={{ color: c.color }}>{name.toLowerCase()}</strong>.
            </p>
          )}
          <div
            style={{ fontSize: 15, lineHeight: 1.65, color: INK, marginTop: 12 }}
            dangerouslySetInnerHTML={{ __html: html }}
          />
        </div>
      )}
    </div>
  );
}

// ResultScreen — veredicto arriba + 8 disorder cards + CTA libro + acordeón about.
function ResultScreen({ scoreResult, contactName, onRestart }) {
  const { t, lang } = useT();
  const aboutHtml = resolveMulti(HEART_SUPPORT.html['about-heart.html'], lang);
  const bookUrl = resolveMulti(HEART_TEST.link_to_book, lang);

  // Título de veredicto: si balanced → hResultInBalance, si has_stages → título general.
  const balancedText = resolveMulti(HEART_SUPPORT.labels.hResultInBalance, lang);
  const verdictHeadline = scoreResult.verdict === 'balanced'
    ? balancedText
    : t('tbp_heart.result.has_stages_headline');

  return (
    <div style={styles.resultCard}>
      <div style={styles.subtitle}>{t('tbp_heart.result.eyebrow_prefix')} {contactName}</div>
      <h1 style={{ ...styles.h1, fontSize: 32, marginBottom: 12 }}>{t('tbp_heart.result.title')}</h1>

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

      {/* 8 disorder cards */}
      <div style={{ marginTop: 24 }}>
        {HEART_DISORDER_CODES.map(code => (
          <DisorderCard key={code} code={code} disorderResult={scoreResult.disorders[code]} lang={lang} />
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

      {/* Acordeón "¿Qué mide este test?" */}
      {aboutHtml && (
        <details style={{ marginTop: 32, padding: '20px 24px', background: PAPER, border: `1px solid ${LINE}`, borderRadius: 2 }}>
          <summary style={{ cursor: 'pointer', fontFamily: fontSerif, fontSize: 18, fontWeight: 600, color: NAVY }}>
            {t('tbp_heart.result.about_summary')}
          </summary>
          <div
            style={{ marginTop: 16, fontSize: 14, lineHeight: 1.65, color: INK }}
            dangerouslySetInnerHTML={{ __html: aboutHtml }}
          />
        </details>
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

export default function TestHeart() {
  const { lang } = useT();
  const [phase, setPhase] = useState(PHASE.WELCOME);
  const [order, setOrder] = useState([]);
  const [answers, setAnswers] = useState([]);
  const [idx, setIdx] = useState(0);
  const [contact, setContact] = useState(null);

  // Score sólo se calcula al pasar a RESULT.
  const scoreResult = useMemo(() => {
    if (phase !== PHASE.RESULT || answers.length !== order.length) return null;
    // Re-mapear respuestas barajadas → orden canónico (por index en HEART_TEST.questions).
    const canonical = new Array(HEART_TEST.questions.length).fill(0);
    for (let i = 0; i < order.length; i++) {
      canonical[order[i]] = answers[i] ?? 0;
    }
    return scoreHeart(canonical, HEART_TEST);
  }, [phase, answers, order]);

  function handleStart() {
    const N = HEART_TEST.questions.length;
    setOrder(shuffle(Array.from({ length: N }, (_, i) => i)));
    setAnswers([]);
    setIdx(0);
    setPhase(PHASE.QUESTIONS);
  }

  function handleAnswer(value) {
    const next = [...answers];
    next[idx] = value;
    setAnswers(next);
    if (idx + 1 < order.length) {
      setIdx(idx + 1);
    } else {
      setPhase(PHASE.GATE);
    }
  }

  function handleBack() {
    if (idx > 0) setIdx(idx - 1);
  }

  async function handleGateSubmit(contactData) {
    // Score local antes de mandar (mismo cálculo que el memo del RESULT).
    const canonical = new Array(HEART_TEST.questions.length).fill(0);
    for (let i = 0; i < order.length; i++) {
      canonical[order[i]] = answers[i] ?? 0;
    }
    const result = scoreHeart(canonical, HEART_TEST);
    const brevoAttrs = toBrevoAttributes(result);

    const payload = {
      contact: contactData,
      result: {
        scores: result,
        brevo_attributes: brevoAttrs,
      },
      meta: {
        version: 'tbp-heart-v1',
        test_type: 'heart',
        submittedAt: new Date().toISOString(),
        answers_values: canonical,
      },
    };

    // dataLayer push (mismo patrón que otros tests).
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
    setOrder([]);
    setAnswers([]);
    setIdx(0);
    setContact(null);
  }

  let body;
  if (phase === PHASE.WELCOME) {
    body = <Welcome onStart={handleStart} />;
  } else if (phase === PHASE.QUESTIONS) {
    const itemIdx = order[idx];
    const item = HEART_TEST.questions[itemIdx];
    body = (
      <Question
        progress={idx + 1}
        total={order.length}
        item={item}
        lang={lang}
        onAnswer={handleAnswer}
        onBack={handleBack}
        canBack={idx > 0}
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
    </div>
  );
}
