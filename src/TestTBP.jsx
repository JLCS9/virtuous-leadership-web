import React, { useState, useMemo } from 'react';
import { useT } from './i18n';
// Imagen "tt" (sello del test) localizada por idioma. Cada variante lleva
// el texto traducido en la propia imagen.
import ttEs from './assets/tt.png';
import ttEn from './assets/tt-en.png';
import ttFr from './assets/tt-fr.png';
import ttRu from './assets/tt-ru.png';
const TT = { es: ttEs, en: ttEn, fr: ttFr, ru: ttRu };
// Imagenes por idioma para los CTAs del final del test:
import crecerEs  from './assets/crecer-es.jpg';
import crecerEn  from './assets/crecer-en.png';
import crecerFr  from './assets/crecer-fr.png';
import crecerRu  from './assets/crecer-rus.png';
import budleEs   from './assets/budle-es.jpg';
import budleEn   from './assets/budle-en.jpg';
import budleFr   from './assets/budle-fr.jpg';
import budleRu   from './assets/budle-rus.png';
const CRECER = { es: crecerEs, en: crecerEn, fr: crecerFr, ru: crecerRu };
const BUDLE  = { es: budleEs,  en: budleEn,  fr: budleFr,  ru: budleRu };

const NAVY = '#1B2A4A';
const NAVY_SOFT = '#2A3B5F';
const GOLD = '#C5A55A';
const GOLD_SOFT = '#E0C98A';
const BEIGE = '#F4F1EA';
const PAPER = '#FBF8F1';
const INK = '#22262E';
const MUTED = '#6B6B6B';
const LINE = '#D8D2C2';

const TEMP_COLORS = {
  COL: { color: '#9C3A3A', soft: '#E9CFCF', letter: 'C' },
  MEL: { color: '#5A3F8B', soft: '#D7CDE6', letter: 'M' },
  SAN: { color: '#D67A2C', soft: '#F0D8BA', letter: 'S' },
  FLE: { color: '#3F7A56', soft: '#CADDD0', letter: 'P' },
};

// Estructura ID-only — el texto viene de t('test.items.<id>').
const STAGE1_IDS = {
  COL: ['COL1', 'COL2', 'COL3', 'COL4'],
  SAN: ['SAN1', 'SAN2', 'SAN3', 'SAN4'],
  MEL: ['MEL1', 'MEL2', 'MEL3', 'MEL4'],
  FLE: ['FLE1', 'FLE2', 'FLE3', 'FLE4'],
};

const TIE_IDS = {
  COL: ['TCOL1', 'TCOL2'],
  SAN: ['TSAN1', 'TSAN2'],
  MEL: ['TMEL1', 'TMEL2'],
  FLE: ['TFLE1', 'TFLE2'],
};

// Stage 2 — adj 'A' suma +1; adj 'B' resta 1.
const STAGE2 = {
  COL: { A: 'SAN', B: 'MEL', items: [
    { id: 'S2_C1', adj: 'A' }, { id: 'S2_C2', adj: 'A' }, { id: 'S2_C3', adj: 'A' },
    { id: 'S2_C4', adj: 'B' }, { id: 'S2_C5', adj: 'B' }, { id: 'S2_C6', adj: 'B' },
  ] },
  SAN: { A: 'COL', B: 'FLE', items: [
    { id: 'S2_S1', adj: 'A' }, { id: 'S2_S2', adj: 'A' }, { id: 'S2_S3', adj: 'A' },
    { id: 'S2_S4', adj: 'B' }, { id: 'S2_S5', adj: 'B' }, { id: 'S2_S6', adj: 'B' },
  ] },
  MEL: { A: 'COL', B: 'FLE', items: [
    { id: 'S2_M1', adj: 'A' }, { id: 'S2_M2', adj: 'A' }, { id: 'S2_M3', adj: 'A' },
    { id: 'S2_M4', adj: 'B' }, { id: 'S2_M5', adj: 'B' }, { id: 'S2_M6', adj: 'B' },
  ] },
  FLE: { A: 'SAN', B: 'MEL', items: [
    { id: 'S2_F1', adj: 'A' }, { id: 'S2_F2', adj: 'A' }, { id: 'S2_F3', adj: 'A' },
    { id: 'S2_F4', adj: 'B' }, { id: 'S2_F5', adj: 'B' }, { id: 'S2_F6', adj: 'B' },
  ] },
};

const DIAGONAL = { COL: 'FLE', FLE: 'COL', SAN: 'MEL', MEL: 'SAN' };

const TYPE_BY_ID = (() => {
  const m = {};
  for (const t of ['COL', 'SAN', 'MEL', 'FLE']) {
    for (const id of STAGE1_IDS[t]) m[id] = t;
    for (const id of TIE_IDS[t])    m[id] = t;
  }
  return m;
})();

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function buildStage1Order() {
  const types = ['COL', 'SAN', 'MEL', 'FLE'];
  const itemSlots = {};
  for (const t of types) itemSlots[t] = shuffle([0, 1, 2, 3]);
  const out = [];
  for (let r = 0; r < 4; r++) {
    let round = shuffle([...types]);
    if (r > 0 && out.length && round[0] === out[out.length - 1].type) {
      const swap = 1 + Math.floor(Math.random() * 3);
      [round[0], round[swap]] = [round[swap], round[0]];
    }
    for (const t of round) out.push({ id: STAGE1_IDS[t][itemSlots[t][r]], type: t });
  }
  return out;
}

function buildStage2Order(primario) {
  return shuffle(STAGE2[primario].items);
}

function applyAnswers(items, answers) {
  const scores = { COL: 0, SAN: 0, MEL: 0, FLE: 0 };
  for (let i = 0; i < items.length; i++) {
    const ans = answers[i];
    if (!ans) continue;
    const tt = TYPE_BY_ID[items[i].id];
    if (ans === 'SI') scores[tt] += 1;
    else if (ans === 'NO') scores[DIAGONAL[tt]] += 0.5;
  }
  return scores;
}

function mergeScores(a, b) {
  return { COL: a.COL + b.COL, SAN: a.SAN + b.SAN, MEL: a.MEL + b.MEL, FLE: a.FLE + b.FLE };
}

function topAndMargin(scores) {
  const entries = Object.entries(scores).sort((a, b) => b[1] - a[1]);
  const tied = entries.filter(([, v]) => v === entries[0][1]).map(([k]) => k);
  return { top: entries[0][0], topScore: entries[0][1], second: entries[1][0], secondScore: entries[1][1], margin: entries[0][1] - entries[1][1], tiedTypes: tied };
}

function computeStage2Score(items, answers) {
  let s = 0;
  for (let i = 0; i < items.length; i++) {
    if (answers[i] !== 'SI') continue;
    s += items[i].adj === 'A' ? 1 : -1;
  }
  return s;
}

function decideProfile(primario, scores, score_s2) {
  const { margin } = topAndMargin(scores);
  const cfg = STAGE2[primario];
  if (margin >= 2.0 && Math.abs(score_s2) <= 1) return { key: primario, isPure: true, margin, score_s2 };
  let secundario;
  if (score_s2 > 0) secundario = cfg.A;
  else if (score_s2 < 0) secundario = cfg.B;
  else secundario = scores[cfg.A] >= scores[cfg.B] ? cfg.A : cfg.B;
  return { key: `${primario}-${secundario}`, isPure: false, margin, score_s2, secundario };
}

const fontSerif = "'Cormorant Garamond', 'Playfair Display', Georgia, 'Times New Roman', serif";
const fontSans  = "'Inter', 'DM Sans', system-ui, -apple-system, 'Segoe UI', sans-serif";

const styles = {
  app: {
    minHeight: '100vh',
    background: BEIGE,
    color: INK,
    fontFamily: fontSans,
    padding: '32px 16px',
    boxSizing: 'border-box',
  },
  card: {
    maxWidth: 720,
    margin: '0 auto',
    background: PAPER,
    border: `1px solid ${LINE}`,
    borderRadius: 4,
    boxShadow: '0 1px 2px rgba(27,42,74,0.04), 0 8px 30px rgba(27,42,74,0.06)',
    padding: '40px 36px',
  },
  resultCard: {
    maxWidth: 980,
    margin: '0 auto',
    background: PAPER,
    border: `1px solid ${LINE}`,
    borderRadius: 4,
    boxShadow: '0 1px 2px rgba(27,42,74,0.04), 0 8px 30px rgba(27,42,74,0.06)',
    padding: '40px 36px',
  },
  h1: {
    fontFamily: fontSerif,
    fontSize: 36,
    fontWeight: 600,
    color: NAVY,
    margin: 0,
    letterSpacing: '-0.01em',
  },
  h2: {
    fontFamily: fontSerif,
    fontSize: 22,
    fontWeight: 600,
    color: NAVY,
    margin: '0 0 8px 0',
  },
  subtitle: {
    fontSize: 14,
    color: MUTED,
    margin: '4px 0 24px 0',
    letterSpacing: '0.04em',
    textTransform: 'uppercase',
  },
  para: {
    fontSize: 16,
    lineHeight: 1.6,
    color: INK,
    margin: '14px 0',
  },
  notice: {
    fontSize: 13,
    color: MUTED,
    fontStyle: 'italic',
    borderLeft: `2px solid ${GOLD}`,
    paddingLeft: 12,
    margin: '20px 0',
  },
  buttonPrimary: {
    fontFamily: fontSans,
    fontSize: 15,
    letterSpacing: '0.06em',
    textTransform: 'uppercase',
    fontWeight: 600,
    color: PAPER,
    background: NAVY,
    border: `1px solid ${NAVY}`,
    padding: '14px 28px',
    borderRadius: 2,
    cursor: 'pointer',
    transition: 'all 160ms ease',
  },
  buttonGhost: {
    fontFamily: fontSans,
    fontSize: 13,
    color: MUTED,
    background: 'transparent',
    border: 'none',
    padding: '8px 12px',
    cursor: 'pointer',
    letterSpacing: '0.05em',
  },
  progress: {
    fontSize: 12,
    color: MUTED,
    letterSpacing: '0.1em',
    textTransform: 'uppercase',
    fontWeight: 600,
    fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
  },
  questionText: {
    fontFamily: fontSerif,
    fontSize: 22,
    lineHeight: 1.45,
    color: NAVY,
    textAlign: 'center',
    minHeight: 100,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '36px 0',
  },
  yesNoRow: {
    display: 'flex',
    gap: 16,
    justifyContent: 'center',
    marginTop: 24,
    flexWrap: 'wrap',
  },
  yesNoBtn: {
    fontFamily: fontSerif,
    fontSize: 'clamp(18px, 3.8vw, 22px)',
    fontWeight: 600,
    minWidth: 140,
    padding: '18px 24px',
    background: PAPER,
    color: NAVY,
    border: `1.5px solid ${NAVY}`,
    borderRadius: 2,
    cursor: 'pointer',
    letterSpacing: '0.04em',
    transition: 'all 160ms ease',
  },
};

function Welcome({ onStart }) {
  const { t } = useT();
  return (
    <div style={styles.card}>
      <div style={styles.subtitle}>{t('test.welcome.eyebrow')}</div>
      {t('test.welcome.title') && <h1 style={styles.h1}>{t('test.welcome.title')}</h1>}
      <p style={{ ...styles.para, fontFamily: fontSerif, fontSize: 18, color: NAVY_SOFT, fontStyle: 'italic' }}>
        {t('test.welcome.byline')}
      </p>

      <p style={styles.para}>{t('test.welcome.intro')}</p>
      <p style={styles.notice}>{t('test.welcome.notice')}</p>

      <div style={{ display: 'flex', alignItems: 'center', gap: 24, marginTop: 28, marginBottom: 28, flexWrap: 'wrap' }}>
        <div style={{ fontSize: 13, color: MUTED }}>
          <strong style={{ color: NAVY, display: 'block', fontFamily: fontSerif, fontSize: 16, fontWeight: 600 }}>
            {t('test.welcome.duration_label')}
          </strong>
          {t('test.welcome.duration_text')}
        </div>
        <div style={{ flex: 1 }} />
        <button
          style={styles.buttonPrimary}
          onMouseOver={e => (e.currentTarget.style.background = NAVY_SOFT)}
          onMouseOut={e => (e.currentTarget.style.background = NAVY)}
          onClick={onStart}
        >
          {t('test.welcome.button')}
        </button>
      </div>
    </div>
  );
}

function Question({ progress, total, item, onAnswer, onBack, canBack }) {
  const { t } = useT();
  return (
    <div style={styles.card} className="vl-test-card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
        <span style={styles.progress}>{t('test.question.progress', { n: progress, total })}</span>
        <button
          style={{ ...styles.buttonGhost, opacity: canBack ? 1 : 0.3, cursor: canBack ? 'pointer' : 'default' }}
          disabled={!canBack}
          onClick={onBack}
        >
          {t('test.question.back')}
        </button>
      </div>

      <div style={{ height: 3, background: LINE, borderRadius: 2, overflow: 'hidden', marginBottom: 8 }}>
        <div style={{ height: '100%', width: `${(progress / total) * 100}%`, background: GOLD, transition: 'width 240ms ease' }} />
      </div>

      <div style={styles.questionText}>{t('test.items.' + item.id)}</div>

      <div style={styles.yesNoRow} className="vl-yesno-row">
        <button
          style={styles.yesNoBtn}
          onMouseOver={e => { e.currentTarget.style.background = NAVY; e.currentTarget.style.color = PAPER; }}
          onMouseOut={e => { e.currentTarget.style.background = PAPER; e.currentTarget.style.color = NAVY; }}
          onClick={() => onAnswer('SI')}
        >{t('test.question.yes')}</button>
        <button
          style={styles.yesNoBtn}
          onMouseOver={e => { e.currentTarget.style.background = NAVY; e.currentTarget.style.color = PAPER; }}
          onMouseOut={e => { e.currentTarget.style.background = PAPER; e.currentTarget.style.color = NAVY; }}
          onClick={() => onAnswer('NO')}
        >{t('test.question.no')}</button>
      </div>
    </div>
  );
}

function Transition({ primario, onContinue }) {
  const { t } = useT();
  const tempInfo = t(`temperaments.${primario}`);
  const tt = TEMP_COLORS[primario];
  return (
    <div style={styles.card}>
      <div style={styles.subtitle}>{t('test.transition.eyebrow')}</div>
      <h2 style={{ ...styles.h2, fontSize: 28 }}>
        {t('test.transition.title_template')}
        <span style={{ color: tt.color }}>{(tempInfo?.name || primario).toLowerCase()}</span>
        {t('test.transition.title_template_suffix')}
      </h2>
      <p style={styles.para}>{t('test.transition.text')}</p>

      <div style={{ marginTop: 28 }}>
        <button
          style={styles.buttonPrimary}
          onMouseOver={e => (e.currentTarget.style.background = NAVY_SOFT)}
          onMouseOut={e => (e.currentTarget.style.background = NAVY)}
          onClick={onContinue}
        >
          {t('test.transition.button')}
        </button>
      </div>
    </div>
  );
}

function VirtuesPanel({ activeTemp }) {
  const { t } = useT();
  const virtues = t('result.virtues');
  return (
    <div style={{ background: BEIGE, border: `1px solid ${LINE}`, padding: '20px 22px', borderRadius: 2 }}>
      <div style={{ ...styles.subtitle, margin: '0 0 14px 0' }}>{t('result.virtues_panel_title')}</div>
      {['COL', 'MEL', 'SAN', 'FLE'].map(tk => {
        const v = virtues[tk];
        const tempInfo = t(`temperaments.${tk}`);
        const active = tk === activeTemp;
        return (
          <div key={tk} style={{
            padding: '12px 14px',
            margin: '6px -14px',
            background: active ? GOLD_SOFT : 'transparent',
            borderLeft: `3px solid ${active ? GOLD : 'transparent'}`,
          }}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
              <span style={{ fontFamily: fontSerif, fontSize: 17, fontWeight: 600, color: NAVY }}>{v.name}</span>
              <span style={{ fontSize: 12, color: MUTED }}>· {(tempInfo?.name || tk).toLowerCase()}</span>
            </div>
            <div style={{ fontSize: 13, color: MUTED, marginTop: 2, lineHeight: 1.45 }}>{v.detail}</div>
          </div>
        );
      })}
    </div>
  );
}

function CTACard({ image, buttonLabel, href }) {
  return (
    <div style={{
      background: PAPER,
      border: `1px solid ${LINE}`,
      borderRadius: 2,
      overflow: 'hidden',
      display: 'flex', flexDirection: 'column',
    }}>
      <a href={href} target="_blank" rel="noopener noreferrer"
         style={{ display: 'block', overflow: 'hidden', background: BEIGE }}>
        <img src={image} alt=""
             style={{
               width: '100%',
               aspectRatio: '4 / 3',
               objectFit: 'cover',
               display: 'block',
               transition: 'transform 300ms ease',
             }}
             onMouseOver={e => e.currentTarget.style.transform = 'scale(1.03)'}
             onMouseOut={e => e.currentTarget.style.transform = 'scale(1)'} />
      </a>
      <div style={{ padding: '20px 22px', textAlign: 'center' }}>
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: 'inline-block',
            fontFamily: fontSans, fontSize: 13, fontWeight: 600,
            letterSpacing: '0.08em', textTransform: 'uppercase',
            color: NAVY,
            background: GOLD,
            border: `1px solid ${GOLD}`,
            padding: '12px 28px',
            borderRadius: 2,
            textDecoration: 'none',
            transition: 'all 160ms ease',
          }}
          onMouseOver={e => { e.currentTarget.style.background = '#9D8240'; e.currentTarget.style.borderColor = '#9D8240'; e.currentTarget.style.color = '#FBF8F1'; }}
          onMouseOut={e => { e.currentTarget.style.background = GOLD; e.currentTarget.style.borderColor = GOLD; e.currentTarget.style.color = NAVY; }}
        >
          {buttonLabel} →
        </a>
      </div>
    </div>
  );
}

function ResultScreen({ profileKey, primario, secondaryStrength, onRestart }) {
  const { t, lang } = useT();
  const profile = t(`result.profiles.${profileKey}`);
  const tempInfo = t(`temperaments.${primario}`);
  const isPure = !profileKey.includes('-');
  const crecerImg = CRECER[lang] || CRECER.es;
  const bundleImg = BUDLE[lang]  || BUDLE.es;
  const ttImg     = TT[lang]     || TT.es;

  return (
    <div style={styles.resultCard}>
      <div style={styles.subtitle}>{t('result.subtitle')}</div>
      <h1 style={{ ...styles.h1, fontSize: 40, lineHeight: 1.1 }}>{profile.name}</h1>
      <p style={{ fontFamily: fontSerif, fontStyle: 'italic', fontSize: 20, color: NAVY_SOFT, margin: '6px 0 4px 0' }}>
        {profile.label}
        {isPure && <span style={{ fontSize: 14, color: MUTED, fontStyle: 'normal', marginLeft: 10 }}>{t('result.pure_note')}</span>}
      </p>
      <p style={{ fontSize: 13, color: MUTED, margin: '0 0 28px 0' }}>
        {t('result.challenge_label')}: <strong style={{ color: NAVY }}>{profile.challenge}</strong>
        {!isPure && secondaryStrength != null && (
          <span style={{ marginLeft: 14 }}>· {t('result.intensity_label')}: <strong style={{ color: NAVY }}>{secondaryStrength === 3 ? t('result.intensity_marked') : t('result.intensity_light')}</strong></span>
        )}
      </p>

      <div style={{ display: 'flex', gap: 32, alignItems: 'flex-start', flexWrap: 'wrap' }}>
        <div style={{ flex: '1 1 360px', minWidth: 280, display: 'flex', justifyContent: 'center' }}>
          <img src={ttImg} alt="Liderazgo Virtuoso"
               style={{ width: '100%', maxWidth: 380, height: 'auto', display: 'block' }} />
        </div>

        <div style={{ flex: '1 1 320px', minWidth: 280 }}>
          <VirtuesPanel activeTemp={primario} />
        </div>
      </div>

      <div style={{ marginTop: 36, display: 'grid', gap: 20 }}>
        <section>
          <h3 style={{ ...styles.h2, fontSize: 18, color: TEMP_COLORS[primario].color, textTransform: 'uppercase', letterSpacing: '0.08em' }}>{t('result.fortaleza')}</h3>
          <p style={styles.para}>{profile.fortaleza}</p>
        </section>

        <section>
          <h3 style={{ ...styles.h2, fontSize: 18, color: NAVY, textTransform: 'uppercase', letterSpacing: '0.08em' }}>{t('result.debilidad')}</h3>
          <p style={styles.para}>{profile.debilidad}</p>
        </section>

        <section style={{
          background: GOLD_SOFT,
          border: `1px solid ${GOLD}`,
          padding: '20px 24px',
          borderRadius: 2,
        }}>
          <h3 style={{ ...styles.h2, fontSize: 20, color: NAVY, textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 8px 0' }}>{t('result.reto')}</h3>
          <p style={{ ...styles.para, fontFamily: fontSerif, fontSize: 19, fontStyle: 'italic', color: NAVY, margin: 0 }}>
            {profile.reto}
          </p>
        </section>
      </div>

      <blockquote style={{
        margin: '40px 0 24px 0',
        padding: '24px 28px',
        background: BEIGE,
        borderLeft: `3px solid ${NAVY}`,
        fontFamily: fontSerif,
        fontSize: 17,
        lineHeight: 1.5,
        color: NAVY,
        fontStyle: 'italic',
      }}>
        {t('result.havard_quote')}
        <footer style={{ fontFamily: fontSans, fontStyle: 'normal', fontSize: 12, color: MUTED, marginTop: 10, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
          {t('result.havard_attribution')}
        </footer>
      </blockquote>

      {/* CTA — empezar el camino */}
      <section style={{
        marginTop: 48,
        padding: '40px 32px',
        background: BEIGE,
        color: INK,
        border: `1px solid ${LINE}`,
        borderRadius: 2,
      }}>
        <div style={{ textAlign: 'center', maxWidth: 640, margin: '0 auto 32px' }}>
          <div style={{ fontFamily: fontSans, fontSize: 12, letterSpacing: '0.18em', textTransform: 'uppercase', color: '#9D8240', fontWeight: 600, marginBottom: 12 }}>
            {t('result.cta_eyebrow')}
          </div>
          <h2 style={{ fontFamily: fontSerif, fontSize: 28, fontWeight: 600, color: NAVY, lineHeight: 1.2, margin: 0 }}>
            {t('result.cta_title')}
          </h2>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 20 }} className="test-end-cta">
          <CTACard image={crecerImg} buttonLabel={t('result.cta_ebook_button')}   href={t('result.cta_ebook_url')} />
          <CTACard image={bundleImg} buttonLabel={t('result.cta_courses_button')} href={t('result.cta_courses_url')} />
        </div>
        <style>{`
          @media (min-width: 700px) { .test-end-cta { grid-template-columns: 1fr 1fr !important; gap: 24px !important; } }
        `}</style>
      </section>

      <div style={{ textAlign: 'center', marginTop: 32 }}>
        <button
          style={{ ...styles.buttonPrimary, background: 'transparent', color: NAVY }}
          onMouseOver={e => { e.currentTarget.style.background = NAVY; e.currentTarget.style.color = PAPER; }}
          onMouseOut={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = NAVY; }}
          onClick={onRestart}
        >
          {t('result.repeat_button')}
        </button>
      </div>
    </div>
  );
}

// ───────── Submit (Brevo proxy) ─────────

async function submitContact(payload) {
  const url = import.meta.env.VITE_SUBMIT_URL;
  if (!url) {
    console.log('[stub submitContact] payload:', payload);
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

// ───────── Gate form ─────────

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function GateForm({ profileKey, primario, decision, onSubmitOk }) {
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
  const sexOpts = t('gate.sex_options');
  const SEX_OPTIONS = [
    { value: 'mujer',  label: sexOpts.mujer },
    { value: 'hombre', label: sexOpts.hombre },
  ];

  const errors = {
    name: name.trim().length < 2 ? t('gate.errors.name') : null,
    email: !EMAIL_RE.test(email.trim()) ? t('gate.errors.email') : null,
    birthYear: (() => {
      if (!birthYear) return t('gate.errors.year_required');
      const n = Number(birthYear);
      if (!Number.isInteger(n) || n < 1900 || n > currentYear) return t('gate.errors.year_range', { max: currentYear });
      return null;
    })(),
    sex: !sex ? t('gate.errors.sex') : null,
    consent: !consent ? t('gate.errors.consent') : null,
  };

  const isValid = !Object.values(errors).some(Boolean);

  async function handleSubmit(e) {
    e.preventDefault();
    setTouched({ name: 1, email: 1, birthYear: 1, sex: 1, consent: 1 });
    if (!isValid || submitting) return;
    setSubmitting(true);
    setSubmitError(null);
    const profile = t(`result.profiles.${profileKey}`);
    const tempInfo = t(`temperaments.${primario}`);
    const payload = {
      contact: {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        birthYear: Number(birthYear),
        sex,
        consent: true,
        consentTimestamp: new Date().toISOString(),
        language: lang,
      },
      result: {
        profileKey,
        profileName: profile.name,
        profileLabel: profile.label,
        primario,
        primarioName: tempInfo.name,
        challenge: profile.challenge,
        isPure: decision.isPure,
        margin: decision.margin,
        scoreS2: decision.score_s2,
        secundario: decision.secundario || null,
      },
      meta: {
        version: 'tbp-v1',
        submittedAt: new Date().toISOString(),
      },
    };
    try {
      await submitContact(payload);
      onSubmitOk();
    } catch (err) {
      setSubmitError(t('gate.errors.submit_failed'));
      console.error('submitContact error:', err);
      setSubmitting(false);
    }
  }

  const showErr = (k) => touched[k] && errors[k];

  const inputBase = {
    width: '100%',
    fontFamily: fontSans,
    fontSize: 15,
    padding: '12px 14px',
    background: PAPER,
    color: INK,
    border: `1px solid ${LINE}`,
    borderRadius: 2,
    outline: 'none',
    transition: 'border-color 160ms ease, box-shadow 160ms ease',
  };

  const labelStyle = {
    display: 'block',
    fontSize: 12,
    color: NAVY,
    fontWeight: 600,
    letterSpacing: '0.06em',
    textTransform: 'uppercase',
    marginBottom: 6,
  };

  const errStyle = { fontSize: 12, color: '#A03434', marginTop: 4, fontStyle: 'italic' };

  function focus(e) {
    e.currentTarget.style.borderColor = GOLD;
    e.currentTarget.style.boxShadow = `0 0 0 2px ${GOLD_SOFT}55`;
  }
  function blur(e, k) {
    e.currentTarget.style.borderColor = showErr(k) ? '#A03434' : LINE;
    e.currentTarget.style.boxShadow = 'none';
    setTouched(tt => ({ ...tt, [k]: 1 }));
  }

  return (
    <div style={styles.card}>
      <div style={styles.subtitle}>{t('gate.eyebrow')}</div>
      <h2 style={{ ...styles.h1, fontSize: 28 }}>{t('gate.title')}</h2>
      <p style={{ ...styles.para, marginTop: 12 }}>{t('gate.intro')}</p>

      <form onSubmit={handleSubmit} noValidate style={{ marginTop: 24 }}>
        <div style={{ marginBottom: 18 }}>
          <label htmlFor="gate-name" style={labelStyle}>{t('gate.fields.name')}</label>
          <input id="gate-name" type="text" autoComplete="given-name" value={name}
                 onChange={e => setName(e.target.value)} onFocus={focus} onBlur={e => blur(e, 'name')}
                 style={{ ...inputBase, borderColor: showErr('name') ? '#A03434' : LINE }} />
          {showErr('name') && <div style={errStyle}>{errors.name}</div>}
        </div>

        <div style={{ marginBottom: 18 }}>
          <label htmlFor="gate-email" style={labelStyle}>{t('gate.fields.email')}</label>
          <input id="gate-email" type="email" autoComplete="email" value={email}
                 onChange={e => setEmail(e.target.value)} onFocus={focus} onBlur={e => blur(e, 'email')}
                 style={{ ...inputBase, borderColor: showErr('email') ? '#A03434' : LINE }} />
          {showErr('email') && <div style={errStyle}>{errors.email}</div>}
        </div>

        <div style={{ marginBottom: 18 }}>
          <label htmlFor="gate-year" style={labelStyle}>{t('gate.fields.year')}</label>
          <input id="gate-year" type="number" inputMode="numeric" min={1900} max={currentYear}
                 placeholder="1985" value={birthYear}
                 onChange={e => setBirthYear(e.target.value.replace(/\D/g, '').slice(0, 4))}
                 onFocus={focus} onBlur={e => blur(e, 'birthYear')}
                 style={{ ...inputBase, width: 140, borderColor: showErr('birthYear') ? '#A03434' : LINE }} />
          {showErr('birthYear') && <div style={errStyle}>{errors.birthYear}</div>}
        </div>

        <div style={{ marginBottom: 18 }}>
          <span style={labelStyle}>{t('gate.fields.sex')}</span>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {SEX_OPTIONS.map(opt => {
              const active = sex === opt.value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => { setSex(opt.value); setTouched(tt => ({ ...tt, sex: 1 })); }}
                  style={{
                    fontFamily: fontSans,
                    fontSize: 14,
                    padding: '10px 18px',
                    borderRadius: 2,
                    border: `1px solid ${active ? NAVY : LINE}`,
                    background: active ? NAVY : PAPER,
                    color: active ? PAPER : NAVY,
                    cursor: 'pointer',
                    transition: 'all 160ms ease',
                    fontWeight: active ? 600 : 400,
                  }}
                  onMouseOver={e => { if (!active) e.currentTarget.style.borderColor = NAVY; }}
                  onMouseOut={e => { if (!active) e.currentTarget.style.borderColor = LINE; }}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>
          {showErr('sex') && <div style={errStyle}>{errors.sex}</div>}
        </div>

        <label style={{
          display: 'flex',
          gap: 12,
          alignItems: 'flex-start',
          padding: '14px 16px',
          background: BEIGE,
          border: `1px solid ${showErr('consent') ? '#A03434' : LINE}`,
          borderRadius: 2,
          cursor: 'pointer',
          marginTop: 8,
        }}>
          <input type="checkbox" checked={consent}
                 onChange={e => { setConsent(e.target.checked); setTouched(tt => ({ ...tt, consent: 1 })); }}
                 style={{ marginTop: 3, width: 16, height: 16, accentColor: NAVY, cursor: 'pointer', flexShrink: 0 }} />
          <span style={{ fontSize: 14, lineHeight: 1.5, color: INK }}>
            {t('gate.consent')}
            <span
              style={{ display: 'block', marginTop: 6, fontSize: 12, color: MUTED }}
              dangerouslySetInnerHTML={{ __html: t('gate.privacy') }}
            />
          </span>
        </label>
        {showErr('consent') && <div style={errStyle}>{errors.consent}</div>}

        {submitError && (
          <div style={{
            marginTop: 18,
            padding: '12px 14px',
            background: '#F8E5E5',
            border: '1px solid #C97A7A',
            color: '#7A1F1F',
            fontSize: 14,
            borderRadius: 2,
          }}>
            {submitError}
          </div>
        )}

        <div style={{ marginTop: 28, display: 'flex', justifyContent: 'flex-end' }}>
          <button
            type="submit"
            disabled={submitting}
            style={{
              ...styles.buttonPrimary,
              background: submitting ? NAVY_SOFT : NAVY,
              cursor: submitting ? 'wait' : 'pointer',
              opacity: submitting ? 0.85 : 1,
            }}
            onMouseOver={e => { if (!submitting) e.currentTarget.style.background = NAVY_SOFT; }}
            onMouseOut={e => { if (!submitting) e.currentTarget.style.background = NAVY; }}
          >
            {submitting ? t('gate.submitting') : t('gate.submit')}
          </button>
        </div>
      </form>
    </div>
  );
}

// ───────── Main ─────────

const PHASE = { WELCOME: 'welcome', STAGE1: 'stage1', TIE: 'tie', TRANSITION: 'transition', STAGE2: 'stage2', GATE: 'gate', RESULT: 'result' };

export default function TestTBP() {
  const [phase, setPhase] = useState(PHASE.WELCOME);

  const [s1Order, setS1Order] = useState([]);
  const [s1Answers, setS1Answers] = useState([]);
  const [s1Index, setS1Index] = useState(0);

  const [tieTypes, setTieTypes] = useState([]);
  const [tieOrder, setTieOrder] = useState([]);
  const [tieAnswers, setTieAnswers] = useState([]);
  const [tieIndex, setTieIndex] = useState(0);

  const [primario, setPrimario] = useState(null);
  const [stage1Scores, setStage1Scores] = useState(null);

  const [s2Order, setS2Order] = useState([]);
  const [s2Answers, setS2Answers] = useState([]);
  const [s2Index, setS2Index] = useState(0);

  const [result, setResult] = useState(null);

  const totalQuestions = useMemo(() => 16 + tieOrder.length + 6, [tieOrder]);

  const globalIndex = useMemo(() => {
    if (phase === PHASE.STAGE1) return s1Index + 1;
    if (phase === PHASE.TIE) return 16 + tieIndex + 1;
    if (phase === PHASE.STAGE2) return 16 + tieOrder.length + s2Index + 1;
    return 0;
  }, [phase, s1Index, tieIndex, s2Index, tieOrder.length]);

  function start() {
    setS1Order(buildStage1Order());
    setS1Answers([]);
    setS1Index(0);
    setTieTypes([]); setTieOrder([]); setTieAnswers([]); setTieIndex(0);
    setPrimario(null); setStage1Scores(null);
    setS2Order([]); setS2Answers([]); setS2Index(0);
    setResult(null);
    setPhase(PHASE.STAGE1);
  }

  function answerStage1(value) {
    const next = [...s1Answers]; next[s1Index] = value;
    setS1Answers(next);
    if (s1Index + 1 < s1Order.length) {
      setS1Index(s1Index + 1);
    } else {
      const scores = applyAnswers(s1Order, next);
      const { tiedTypes } = topAndMargin(scores);
      if (tiedTypes.length >= 2) {
        const items = tiedTypes.flatMap(tk => TIE_IDS[tk].map(id => ({ id, type: tk })));
        const ordered = shuffle(items);
        setTieTypes(tiedTypes);
        setTieOrder(ordered);
        setTieAnswers([]);
        setTieIndex(0);
        setPhase(PHASE.TIE);
      } else {
        finalizeStage1(scores, [], []);
      }
    }
  }

  function backStage1() {
    if (s1Index === 0) return;
    setS1Index(s1Index - 1);
  }

  function answerTie(value) {
    const next = [...tieAnswers]; next[tieIndex] = value;
    setTieAnswers(next);
    if (tieIndex + 1 < tieOrder.length) {
      setTieIndex(tieIndex + 1);
    } else {
      const s1Scores = applyAnswers(s1Order, s1Answers);
      const tieScores = applyAnswers(tieOrder, next);
      const merged = mergeScores(s1Scores, tieScores);
      let { top, tiedTypes } = topAndMargin(merged);
      if (tiedTypes.length >= 2) {
        const yesByType = { COL: 0, SAN: 0, MEL: 0, FLE: 0 };
        for (let i = 0; i < s1Order.length; i++) {
          if (s1Answers[i] === 'SI') yesByType[TYPE_BY_ID[s1Order[i].id]] += 1;
        }
        top = tiedTypes.reduce((best, tk) => (yesByType[tk] > yesByType[best] ? tk : best), tiedTypes[0]);
      }
      finalizeStage1(merged, tieOrder, next, top);
    }
  }

  function backTie() {
    if (tieIndex === 0) return;
    setTieIndex(tieIndex - 1);
  }

  function finalizeStage1(scoresMerged, _tieO, _tieA, forcedPrimario) {
    const top = forcedPrimario || topAndMargin(scoresMerged).top;
    setStage1Scores(scoresMerged);
    setPrimario(top);
    setS2Order(buildStage2Order(top));
    setS2Answers([]);
    setS2Index(0);
    setPhase(PHASE.TRANSITION);
  }

  function continueToStage2() {
    setPhase(PHASE.STAGE2);
  }

  function answerStage2(value) {
    const next = [...s2Answers]; next[s2Index] = value;
    setS2Answers(next);
    if (s2Index + 1 < s2Order.length) {
      setS2Index(s2Index + 1);
    } else {
      const score_s2 = computeStage2Score(s2Order, next);
      const decision = decideProfile(primario, stage1Scores, score_s2);
      setResult(decision);
      setPhase(PHASE.GATE);
    }
  }

  function backStage2() {
    if (s2Index === 0) return;
    setS2Index(s2Index - 1);
  }

  function onGateOk() { setPhase(PHASE.RESULT); }

  function restart() {
    setPhase(PHASE.WELCOME);
  }

  let body;
  if (phase === PHASE.WELCOME) {
    body = <Welcome onStart={start} />;
  } else if (phase === PHASE.STAGE1) {
    body = <Question progress={globalIndex} total={totalQuestions} item={s1Order[s1Index]} onAnswer={answerStage1} onBack={backStage1} canBack={s1Index > 0} />;
  } else if (phase === PHASE.TIE) {
    body = <Question progress={globalIndex} total={totalQuestions} item={tieOrder[tieIndex]} onAnswer={answerTie} onBack={backTie} canBack={tieIndex > 0} />;
  } else if (phase === PHASE.TRANSITION) {
    body = <Transition primario={primario} onContinue={continueToStage2} />;
  } else if (phase === PHASE.STAGE2) {
    body = <Question progress={globalIndex} total={totalQuestions} item={s2Order[s2Index]} onAnswer={answerStage2} onBack={backStage2} canBack={s2Index > 0} />;
  } else if (phase === PHASE.GATE) {
    body = <GateForm profileKey={result.key} primario={primario} decision={result} onSubmitOk={onGateOk} />;
  } else if (phase === PHASE.RESULT) {
    body = <ResultScreen profileKey={result.key} primario={primario} secondaryStrength={result.isPure ? null : Math.abs(result.score_s2)} onRestart={restart} />;
  }

  return (
    <div style={styles.app}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;0,700;1,400&family=Inter:wght@400;500;600;700&display=swap');
        * { box-sizing: border-box; }
        button:focus-visible { outline: 2px solid ${GOLD}; outline-offset: 2px; }
        @media (max-width: 480px) {
          .vl-test-card { padding: 28px 20px !important; }
          .vl-yesno-row > button { flex: 1 1 100%; min-width: 0 !important; }
        }
      `}</style>
      {body}
    </div>
  );
}
