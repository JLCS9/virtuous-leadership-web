import React, { useState, useMemo, useEffect } from 'react';
import { useT } from './i18n';
import QUESTIONS from './data/questions-children.es.json';
import { applyGender, renderItem } from './lib/childPersonalize';
import ttImg from './assets/tt.png';
import crecerEs from './assets/crecer-es.jpg';
import budleEs  from './assets/budle-es.jpg';

// ───────────────────── paleta y tipografías ─────────────────────
// Mismo lenguaje visual que el test adulto. Mantenemos copias locales en lugar
// de importarlas para que ambos componentes evolucionen independientes.
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

const fontSerif = "'Cormorant Garamond', 'Playfair Display', Georgia, 'Times New Roman', serif";
const fontSans  = "'Inter', 'DM Sans', system-ui, -apple-system, 'Segoe UI', sans-serif";

// ───────────────────── motor de scoring ─────────────────────
// Misma mecánica que el adulto: STAGE1 → TIE si empate → STAGE2 según primario.
// La definición de Stage 2 (adj A/B → eje secundario) es idéntica.

const STAGE2_MAP = {
  COL: { A: 'SAN', B: 'MEL' },
  SAN: { A: 'COL', B: 'FLE' },
  MEL: { A: 'COL', B: 'FLE' },
  FLE: { A: 'SAN', B: 'MEL' },
};

const DIAGONAL = { COL: 'FLE', FLE: 'COL', SAN: 'MEL', MEL: 'SAN' };

// Lookup id → tempera (sólo Stage 1 + Tiebreaker, que es lo que usamos
// para scoring de primario). Construido del dataset.
const TYPE_BY_ID = (() => {
  const m = {};
  for (const t of ['COL', 'SAN', 'MEL', 'FLE']) {
    for (const it of QUESTIONS.stage1[t])     m[it.id] = t;
    for (const it of QUESTIONS.tiebreaker[t]) m[it.id] = t;
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

// Construye el orden de Stage 1: 16 ítems mezclados con la restricción de
// que no haya dos seguidos del mismo temperamento. Mismo algoritmo que el adulto.
function buildStage1Order() {
  const types = ['COL', 'SAN', 'MEL', 'FLE'];
  const slots = {};
  for (const t of types) slots[t] = shuffle([0, 1, 2, 3]);
  const out = [];
  for (let r = 0; r < 4; r++) {
    let round = shuffle([...types]);
    if (r > 0 && out.length && round[0] === out[out.length - 1].type) {
      const swap = 1 + Math.floor(Math.random() * 3);
      [round[0], round[swap]] = [round[swap], round[0]];
    }
    for (const t of round) {
      const item = QUESTIONS.stage1[t][slots[t][r]];
      out.push({ ...item, type: t });
    }
  }
  return out;
}

function buildStage2Order(primario) {
  return shuffle(QUESTIONS.stage2[primario].map(it => ({ ...it })));
}

// Stage1/Tie: SI suma 1 al temperamento del ítem; NO suma 0.5 al diagonal.
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

// Stage 2: SI con adj=A → +1; SI con adj=B → -1; NO → 0.
function computeStage2Score(items, answers) {
  let s = 0;
  for (let i = 0; i < items.length; i++) {
    if (answers[i] !== 'SI') continue;
    s += items[i].adj === 'A' ? 1 : -1;
  }
  return s;
}

// Decide perfil puro vs. mixto a partir del primario y el score de Stage 2.
// Margin alto + score_s2 cerca de 0 → puro. En otro caso, secundario es
// el eje A o B según el signo del score (ambig. → el de mayor score Stage 1).
function decideProfile(primario, scores, score_s2) {
  const { margin } = topAndMargin(scores);
  const cfg = STAGE2_MAP[primario];
  if (margin >= 2.0 && Math.abs(score_s2) <= 1) return { key: primario, isPure: true, margin, score_s2 };
  let secundario;
  if (score_s2 > 0) secundario = cfg.A;
  else if (score_s2 < 0) secundario = cfg.B;
  else secundario = scores[cfg.A] >= scores[cfg.B] ? cfg.A : cfg.B;
  return { key: `${primario}-${secundario}`, isPure: false, margin, score_s2, secundario };
}

// ───────────────────── styles ─────────────────────
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
  buttonGhost: { fontFamily: fontSans, fontSize: 13, color: MUTED, background: 'transparent', border: 'none', padding: '8px 12px', cursor: 'pointer', letterSpacing: '0.05em' },
  progress: { fontSize: 12, color: MUTED, letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 600, fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace' },
  questionText: { fontFamily: fontSerif, fontSize: 22, lineHeight: 1.45, color: NAVY, textAlign: 'center', minHeight: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '36px 0' },
  yesNoRow: { display: 'flex', gap: 16, justifyContent: 'center', marginTop: 24, flexWrap: 'wrap' },
  yesNoBtn: { fontFamily: fontSerif, fontSize: 'clamp(18px, 3.8vw, 22px)', fontWeight: 600, minWidth: 140, padding: '18px 24px', background: PAPER, color: NAVY, border: `1.5px solid ${NAVY}`, borderRadius: 2, cursor: 'pointer', letterSpacing: '0.04em', transition: 'all 160ms ease' },
};

// ───────────────────── helpers UI ─────────────────────
function getSchoolToken() {
  if (typeof window === 'undefined') return null;
  const params = new URLSearchParams(window.location.search);
  // Aceptamos varias variantes para no obligar al colegio a un slug exacto.
  return params.get('colegio') || params.get('school') || params.get('c') || null;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const SEX_OPTIONS = ['M', 'F', 'X'];
const REL_OPTIONS = ['Padre', 'Madre', 'Tutor'];

// ───────────────────── pantallas ─────────────────────

function Welcome({ onStart }) {
  const { t } = useT();
  return (
    <div style={styles.card}>
      <div style={styles.subtitle}>{t('tbp_children.welcome.eyebrow')}</div>
      <h1 style={styles.h1}>{t('tbp_children.welcome.title')}</h1>
      <p style={{ ...styles.para, fontFamily: fontSerif, fontSize: 18, color: NAVY_SOFT, fontStyle: 'italic' }}>
        {t('tbp_children.welcome.byline')}
      </p>
      <p style={styles.para}>{t('tbp_children.welcome.intro')}</p>
      <p style={styles.notice}>{t('tbp_children.welcome.notice')}</p>
      <div style={{ display: 'flex', alignItems: 'center', gap: 24, marginTop: 28, marginBottom: 8, flexWrap: 'wrap' }}>
        <div style={{ fontSize: 13, color: MUTED }}>
          <strong style={{ color: NAVY, display: 'block', fontFamily: fontSerif, fontSize: 16, fontWeight: 600 }}>
            {t('tbp_children.welcome.duration_label')}
          </strong>
          {t('tbp_children.welcome.duration_text')}
        </div>
        <div style={{ flex: 1 }} />
        <button
          style={styles.buttonPrimary}
          onMouseOver={e => (e.currentTarget.style.background = NAVY_SOFT)}
          onMouseOut={e => (e.currentTarget.style.background = NAVY)}
          onClick={onStart}
        >
          {t('tbp_children.welcome.button')}
        </button>
      </div>
    </div>
  );
}

// Gate inicial: nombre del niño + año nacimiento + sexo.
// Edad fuera de rango se muestra como error y bloquea Continuar.
function ChildGate({ onContinue }) {
  const { t } = useT();
  const [firstName, setFirstName] = useState('');
  const [birthYear, setBirthYear] = useState('');
  const [sex, setSex] = useState('');
  const [touched, setTouched] = useState({});
  const currentYear = new Date().getFullYear();

  const ageError = useMemo(() => {
    const y = Number(birthYear);
    if (!Number.isInteger(y) || y < 1900 || y > currentYear) return null; // captured by year_range
    const age = currentYear - y;
    if (age < 6) return t('tbp_children.child_gate.errors.age_too_young');
    if (age > 17) return t('tbp_children.child_gate.errors.age_too_old');
    return null;
  }, [birthYear, currentYear, t]);

  const errors = {
    first_name: firstName.trim().length < 1 ? t('tbp_children.child_gate.errors.first_name') : null,
    birth_year: (() => {
      if (!birthYear) return t('tbp_children.child_gate.errors.year_required');
      const n = Number(birthYear);
      if (!Number.isInteger(n) || n < 1900 || n > currentYear) {
        return t('tbp_children.child_gate.errors.year_range', { max: currentYear });
      }
      return null;
    })(),
    sex: !sex ? t('tbp_children.child_gate.errors.sex') : null,
    age: ageError,
  };
  const isValid = !Object.values(errors).some(Boolean);

  function handleContinue() {
    setTouched({ first_name: 1, birth_year: 1, sex: 1, age: 1 });
    if (!isValid) return;
    const age = currentYear - Number(birthYear);
    const set = age <= 11 ? 'A' : 'B';
    onContinue({
      firstName: firstName.trim(),
      birthYear: Number(birthYear),
      sex,
      age,
      set,
    });
  }

  const inputBase = { width: '100%', fontFamily: fontSans, fontSize: 15, padding: '12px 14px', background: PAPER, color: INK, border: `1px solid ${LINE}`, borderRadius: 2, outline: 'none' };
  const labelStyle = { display: 'block', fontSize: 12, color: NAVY, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 6 };
  const errStyle = { fontSize: 12, color: '#A03434', marginTop: 4, fontStyle: 'italic' };
  const showErr = (k) => touched[k] && errors[k];

  return (
    <div style={styles.card}>
      <div style={styles.subtitle}>{t('tbp_children.child_gate.eyebrow')}</div>
      <h2 style={{ ...styles.h1, fontSize: 28 }}>{t('tbp_children.child_gate.title')}</h2>
      <p style={{ ...styles.para, marginTop: 12 }}>{t('tbp_children.child_gate.intro')}</p>

      <div style={{ marginTop: 24 }}>
        <div style={{ marginBottom: 18 }}>
          <label htmlFor="cg-name" style={labelStyle}>{t('tbp_children.child_gate.fields.first_name')}</label>
          <input
            id="cg-name" type="text" autoComplete="off" maxLength={60}
            placeholder={t('tbp_children.child_gate.fields.first_name_placeholder')}
            value={firstName}
            onChange={e => setFirstName(e.target.value)}
            onBlur={() => setTouched(tt => ({ ...tt, first_name: 1 }))}
            style={{ ...inputBase, borderColor: showErr('first_name') ? '#A03434' : LINE }}
          />
          {showErr('first_name') && <div style={errStyle}>{errors.first_name}</div>}
        </div>

        <div style={{ marginBottom: 18 }}>
          <label htmlFor="cg-year" style={labelStyle}>{t('tbp_children.child_gate.fields.birth_year')}</label>
          <input
            id="cg-year" type="number" inputMode="numeric" min={1900} max={currentYear}
            placeholder={t('tbp_children.child_gate.fields.birth_year_placeholder')}
            value={birthYear}
            onChange={e => setBirthYear(e.target.value.replace(/\D/g, '').slice(0, 4))}
            onBlur={() => setTouched(tt => ({ ...tt, birth_year: 1, age: 1 }))}
            style={{ ...inputBase, width: 140, borderColor: (showErr('birth_year') || showErr('age')) ? '#A03434' : LINE }}
          />
          {showErr('birth_year') && <div style={errStyle}>{errors.birth_year}</div>}
          {!errors.birth_year && showErr('age') && errors.age && <div style={errStyle}>{errors.age}</div>}
        </div>

        <div style={{ marginBottom: 18 }}>
          <span style={labelStyle}>{t('tbp_children.child_gate.fields.sex')}</span>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {SEX_OPTIONS.map(opt => {
              const active = sex === opt;
              const label = t(`tbp_children.child_gate.sex_options.${opt}`);
              return (
                <button
                  key={opt} type="button"
                  onClick={() => { setSex(opt); setTouched(tt => ({ ...tt, sex: 1 })); }}
                  style={{
                    fontFamily: fontSans, fontSize: 14, padding: '10px 18px', borderRadius: 2,
                    border: `1px solid ${active ? NAVY : LINE}`,
                    background: active ? NAVY : PAPER, color: active ? PAPER : NAVY,
                    cursor: 'pointer', fontWeight: active ? 600 : 400, transition: 'all 160ms ease',
                  }}
                >{label}</button>
              );
            })}
          </div>
          {showErr('sex') && <div style={errStyle}>{errors.sex}</div>}
        </div>

        <div style={{ marginTop: 28, display: 'flex', justifyContent: 'flex-end' }}>
          <button
            type="button" onClick={handleContinue}
            style={styles.buttonPrimary}
            onMouseOver={e => (e.currentTarget.style.background = NAVY_SOFT)}
            onMouseOut={e => (e.currentTarget.style.background = NAVY)}
          >{t('tbp_children.child_gate.button')}</button>
        </div>
      </div>
    </div>
  );
}

function Question({ progress, total, text, onAnswer, onBack, canBack }) {
  const { t } = useT();
  return (
    <div style={styles.card} className="vl-test-card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
        <span style={styles.progress}>{t('tbp_children.question.progress', { n: progress, total })}</span>
        <button
          style={{ ...styles.buttonGhost, opacity: canBack ? 1 : 0.3, cursor: canBack ? 'pointer' : 'default' }}
          disabled={!canBack}
          onClick={onBack}
        >{t('tbp_children.question.back')}</button>
      </div>

      <div style={{ height: 3, background: LINE, borderRadius: 2, overflow: 'hidden', marginBottom: 8 }}>
        <div style={{ height: '100%', width: `${(progress / total) * 100}%`, background: GOLD, transition: 'width 240ms ease' }} />
      </div>

      <div style={styles.questionText}>{text}</div>

      <div style={styles.yesNoRow} className="vl-yesno-row">
        <button
          style={styles.yesNoBtn}
          onMouseOver={e => { e.currentTarget.style.background = NAVY; e.currentTarget.style.color = PAPER; }}
          onMouseOut={e => { e.currentTarget.style.background = PAPER; e.currentTarget.style.color = NAVY; }}
          onClick={() => onAnswer('SI')}
        >{t('tbp_children.question.yes')}</button>
        <button
          style={styles.yesNoBtn}
          onMouseOver={e => { e.currentTarget.style.background = NAVY; e.currentTarget.style.color = PAPER; }}
          onMouseOut={e => { e.currentTarget.style.background = PAPER; e.currentTarget.style.color = NAVY; }}
          onClick={() => onAnswer('NO')}
        >{t('tbp_children.question.no')}</button>
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
      <div style={styles.subtitle}>{t('tbp_children.transition.eyebrow')}</div>
      <h2 style={{ ...styles.h2, fontSize: 28 }}>
        {t('tbp_children.transition.title_template')}
        <span style={{ color: tt.color }}>{(tempInfo?.name || primario).toLowerCase()}</span>
        {t('tbp_children.transition.title_template_suffix')}
      </h2>
      <p style={styles.para}>{t('tbp_children.transition.text')}</p>
      <div style={{ marginTop: 28 }}>
        <button
          style={styles.buttonPrimary}
          onMouseOver={e => (e.currentTarget.style.background = NAVY_SOFT)}
          onMouseOut={e => (e.currentTarget.style.background = NAVY)}
          onClick={onContinue}
        >{t('tbp_children.transition.button')}</button>
      </div>
    </div>
  );
}

// Gate del padre/tutor — sólo se muestra DESPUÉS del resultado para no
// gatear el valor del test al sujeto. Nombre + email + relación + consent.
function ParentGate({ child, decision, schoolToken, onSubmitOk }) {
  const { t } = useT();
  const [firstName, setFirstName] = useState('');
  const [email, setEmail] = useState('');
  const [relation, setRelation] = useState('');
  const [consent, setConsent] = useState(false);
  const [touched, setTouched] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  const errors = {
    first_name: firstName.trim().length < 1 ? t('tbp_children.parent_gate.errors.first_name') : null,
    email: !EMAIL_RE.test(email.trim()) ? t('tbp_children.parent_gate.errors.email') : null,
    relation: !relation ? t('tbp_children.parent_gate.errors.relation') : null,
    consent: !consent ? t('tbp_children.parent_gate.errors.consent') : null,
  };
  const isValid = !Object.values(errors).some(Boolean);
  const showErr = (k) => touched[k] && errors[k];

  async function handleSubmit(e) {
    e.preventDefault();
    setTouched({ first_name: 1, email: 1, relation: 1, consent: 1 });
    if (!isValid || submitting) return;
    setSubmitting(true);
    setSubmitError(null);

    const profile = t(`tbp_children.profiles.${decision.key}`);
    const payload = {
      school: schoolToken ? { token: schoolToken } : null,
      child: {
        firstName: child.firstName,
        birthYear: child.birthYear,
        sex: child.sex,
      },
      parent: {
        firstName: firstName.trim(),
        email: email.trim().toLowerCase(),
        relation,
        consent: true,
      },
      result: {
        testSet:     child.set,
        answers:     decision.answers || {},
        primario:    decision.primario,
        secundario:  decision.secundario || null,
        isPure:      decision.isPure,
        margin:      decision.margin,
        scoreS2:     decision.score_s2,
        profileKey:  decision.key,
        profileName: profile?.name || null,
      },
      language: 'es',
    };

    try {
      const url = import.meta.env.VITE_SUBMIT_CHILDREN_URL || '/api/submit-children';
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
      onSubmitOk();
    } catch (err) {
      setSubmitError(t('tbp_children.parent_gate.errors.submit_failed'));
      console.error('submitChildren error:', err);
      setSubmitting(false);
    }
  }

  const inputBase = { width: '100%', fontFamily: fontSans, fontSize: 15, padding: '12px 14px', background: PAPER, color: INK, border: `1px solid ${LINE}`, borderRadius: 2, outline: 'none' };
  const labelStyle = { display: 'block', fontSize: 12, color: NAVY, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 6 };
  const errStyle = { fontSize: 12, color: '#A03434', marginTop: 4, fontStyle: 'italic' };

  return (
    <div style={styles.card}>
      <div style={styles.subtitle}>{t('tbp_children.parent_gate.eyebrow')}</div>
      <h2 style={{ ...styles.h1, fontSize: 28 }}>{t('tbp_children.parent_gate.title')}</h2>
      <p style={{ ...styles.para, marginTop: 12 }}>{t('tbp_children.parent_gate.intro')}</p>

      <form onSubmit={handleSubmit} noValidate style={{ marginTop: 24 }}>
        <div style={{ marginBottom: 18 }}>
          <label htmlFor="pg-name" style={labelStyle}>{t('tbp_children.parent_gate.fields.first_name')}</label>
          <input
            id="pg-name" type="text" autoComplete="given-name" maxLength={80}
            placeholder={t('tbp_children.parent_gate.fields.first_name_placeholder')}
            value={firstName}
            onChange={e => setFirstName(e.target.value)}
            onBlur={() => setTouched(tt => ({ ...tt, first_name: 1 }))}
            style={{ ...inputBase, borderColor: showErr('first_name') ? '#A03434' : LINE }}
          />
          {showErr('first_name') && <div style={errStyle}>{errors.first_name}</div>}
        </div>

        <div style={{ marginBottom: 18 }}>
          <label htmlFor="pg-email" style={labelStyle}>{t('tbp_children.parent_gate.fields.email')}</label>
          <input
            id="pg-email" type="email" autoComplete="email"
            placeholder={t('tbp_children.parent_gate.fields.email_placeholder')}
            value={email}
            onChange={e => setEmail(e.target.value)}
            onBlur={() => setTouched(tt => ({ ...tt, email: 1 }))}
            style={{ ...inputBase, borderColor: showErr('email') ? '#A03434' : LINE }}
          />
          {showErr('email') && <div style={errStyle}>{errors.email}</div>}
        </div>

        <div style={{ marginBottom: 18 }}>
          <span style={labelStyle}>{t('tbp_children.parent_gate.fields.relation')}</span>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {REL_OPTIONS.map(opt => {
              const active = relation === opt;
              return (
                <button
                  key={opt} type="button"
                  onClick={() => { setRelation(opt); setTouched(tt => ({ ...tt, relation: 1 })); }}
                  style={{
                    fontFamily: fontSans, fontSize: 14, padding: '10px 18px', borderRadius: 2,
                    border: `1px solid ${active ? NAVY : LINE}`,
                    background: active ? NAVY : PAPER, color: active ? PAPER : NAVY,
                    cursor: 'pointer', fontWeight: active ? 600 : 400, transition: 'all 160ms ease',
                  }}
                >{t(`tbp_children.parent_gate.relation_options.${opt}`)}</button>
              );
            })}
          </div>
          {showErr('relation') && <div style={errStyle}>{errors.relation}</div>}
        </div>

        <label style={{
          display: 'flex', gap: 12, alignItems: 'flex-start',
          padding: '14px 16px', background: BEIGE,
          border: `1px solid ${showErr('consent') ? '#A03434' : LINE}`,
          borderRadius: 2, cursor: 'pointer', marginTop: 8,
        }}>
          <input
            type="checkbox" checked={consent}
            onChange={e => { setConsent(e.target.checked); setTouched(tt => ({ ...tt, consent: 1 })); }}
            style={{ marginTop: 3, width: 16, height: 16, accentColor: NAVY, cursor: 'pointer', flexShrink: 0 }}
          />
          <span style={{ fontSize: 14, lineHeight: 1.5, color: INK }}>
            <span dangerouslySetInnerHTML={{ __html: t('tbp_children.parent_gate.consent_html') }} />
            <span style={{ display: 'block', marginTop: 8, fontWeight: 600, color: NAVY }}>
              {t('tbp_children.parent_gate.consent_checkbox')}
            </span>
          </span>
        </label>
        {showErr('consent') && <div style={errStyle}>{errors.consent}</div>}

        {submitError && (
          <div style={{ marginTop: 18, padding: '12px 14px', background: '#F8E5E5', border: '1px solid #C97A7A', color: '#7A1F1F', fontSize: 14, borderRadius: 2 }}>
            {submitError}
          </div>
        )}

        <div style={{ marginTop: 28, display: 'flex', justifyContent: 'flex-end' }}>
          <button
            type="submit" disabled={submitting}
            style={{ ...styles.buttonPrimary, background: submitting ? NAVY_SOFT : NAVY, cursor: submitting ? 'wait' : 'pointer', opacity: submitting ? 0.85 : 1 }}
            onMouseOver={e => { if (!submitting) e.currentTarget.style.background = NAVY_SOFT; }}
            onMouseOut={e => { if (!submitting) e.currentTarget.style.background = NAVY; }}
          >{submitting ? t('tbp_children.parent_gate.submitting') : t('tbp_children.parent_gate.submit')}</button>
        </div>
      </form>
    </div>
  );
}

// Resultado: las descripciones de perfil del i18n llevan placeholders
// ({o/a}, etc.) que resolvemos con applyGender antes de pintar.
function ResultScreen({ child, decision, onRestart }) {
  const { t } = useT();
  const profile = t(`tbp_children.profiles.${decision.key}`) || {};
  const isPure = !decision.key.includes('-');
  const primario = decision.primario;
  const tt = TEMP_COLORS[primario];

  const fortaleza = applyGender(profile.fortaleza || '', child.sex);
  const debilidad = applyGender(profile.debilidad || '', child.sex);
  const reto      = applyGender(profile.reto || '',      child.sex);

  return (
    <div style={styles.resultCard}>
      <div style={styles.subtitle}>{t('tbp_children.result.eyebrow_prefix')} {child.firstName}</div>
      <h1 style={{ ...styles.h1, fontSize: 40, lineHeight: 1.1 }}>{profile.name}</h1>
      <p style={{ fontFamily: fontSerif, fontStyle: 'italic', fontSize: 20, color: NAVY_SOFT, margin: '6px 0 4px 0' }}>
        {profile.label}
        {isPure && <span style={{ fontSize: 14, color: MUTED, fontStyle: 'normal', marginLeft: 10 }}>{t('tbp_children.result.pure_note')}</span>}
      </p>
      <p style={{ fontSize: 13, color: MUTED, margin: '0 0 28px 0' }}>
        {t('tbp_children.result.challenge_label')}: <strong style={{ color: NAVY }}>{profile.challenge}</strong>
      </p>

      <div style={{ display: 'flex', gap: 32, alignItems: 'flex-start', flexWrap: 'wrap' }}>
        <div style={{ flex: '1 1 360px', minWidth: 280, display: 'flex', justifyContent: 'center' }}>
          <img src={ttImg} alt="Liderazgo Virtuoso"
               style={{ width: '100%', maxWidth: 380, height: 'auto', display: 'block' }} />
        </div>
      </div>

      <div style={{ marginTop: 36, display: 'grid', gap: 20 }}>
        <section>
          <h3 style={{ ...styles.h2, fontSize: 18, color: tt.color, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            {t('tbp_children.result.fortaleza')}
          </h3>
          <p style={styles.para}>{fortaleza}</p>
        </section>

        <section>
          <h3 style={{ ...styles.h2, fontSize: 18, color: NAVY, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            {t('tbp_children.result.debilidad')}
          </h3>
          <p style={styles.para}>{debilidad}</p>
        </section>

        <section style={{ background: GOLD_SOFT, border: `1px solid ${GOLD}`, padding: '20px 24px', borderRadius: 2 }}>
          <h3 style={{ ...styles.h2, fontSize: 20, color: NAVY, textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 8px 0' }}>
            {t('tbp_children.result.reto')}
          </h3>
          <p style={{ ...styles.para, fontFamily: fontSerif, fontSize: 19, fontStyle: 'italic', color: NAVY, margin: 0 }}>
            {reto}
          </p>
        </section>
      </div>

      <blockquote style={{
        margin: '40px 0 24px 0', padding: '24px 28px', background: BEIGE,
        borderLeft: `3px solid ${NAVY}`, fontFamily: fontSerif, fontSize: 17, lineHeight: 1.5, color: NAVY, fontStyle: 'italic',
      }}>
        {t('tbp_children.result.havard_quote')}
        <footer style={{ fontFamily: fontSans, fontStyle: 'normal', fontSize: 12, color: MUTED, marginTop: 10, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
          {t('tbp_children.result.havard_attribution')}
        </footer>
      </blockquote>

      <section style={{ marginTop: 48, padding: '40px 32px', background: BEIGE, color: INK, border: `1px solid ${LINE}`, borderRadius: 2 }}>
        <div style={{ textAlign: 'center', maxWidth: 640, margin: '0 auto 32px' }}>
          <div style={{ fontFamily: fontSans, fontSize: 12, letterSpacing: '0.18em', textTransform: 'uppercase', color: '#9D8240', fontWeight: 600, marginBottom: 12 }}>
            {t('tbp_children.result.cta_eyebrow')}
          </div>
          <h2 style={{ fontFamily: fontSerif, fontSize: 28, fontWeight: 600, color: NAVY, lineHeight: 1.2, margin: 0 }}>
            {t('tbp_children.result.cta_title')}
          </h2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 20 }} className="test-end-cta">
          <CTACard image={crecerEs} buttonLabel={t('tbp_children.result.cta_ebook_button')}   href={t('tbp_children.result.cta_ebook_url')} />
          <CTACard image={budleEs}  buttonLabel={t('tbp_children.result.cta_courses_button')} href={t('tbp_children.result.cta_courses_url')} />
        </div>
        <style>{`@media (min-width: 700px) { .test-end-cta { grid-template-columns: 1fr 1fr !important; gap: 24px !important; } }`}</style>
      </section>

      <div style={{ textAlign: 'center', marginTop: 32 }}>
        <button
          style={{ ...styles.buttonPrimary, background: 'transparent', color: NAVY }}
          onMouseOver={e => { e.currentTarget.style.background = NAVY; e.currentTarget.style.color = PAPER; }}
          onMouseOut={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = NAVY; }}
          onClick={onRestart}
        >{t('tbp_children.result.repeat_button')}</button>
      </div>
    </div>
  );
}

function CTACard({ image, buttonLabel, href }) {
  return (
    <div style={{ background: PAPER, border: `1px solid ${LINE}`, borderRadius: 2, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
      <a href={href} target="_blank" rel="noopener noreferrer"
         style={{ display: 'block', overflow: 'hidden', background: BEIGE }}>
        <img src={image} alt=""
             style={{ width: '100%', aspectRatio: '4 / 3', objectFit: 'cover', display: 'block', transition: 'transform 300ms ease' }}
             onMouseOver={e => e.currentTarget.style.transform = 'scale(1.03)'}
             onMouseOut={e => e.currentTarget.style.transform = 'scale(1)'} />
      </a>
      <div style={{ padding: '20px 22px', textAlign: 'center' }}>
        <a
          href={href} target="_blank" rel="noopener noreferrer"
          style={{ display: 'inline-block', fontFamily: fontSans, fontSize: 13, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: NAVY, background: GOLD, border: `1px solid ${GOLD}`, padding: '12px 28px', borderRadius: 2, textDecoration: 'none', transition: 'all 160ms ease' }}
          onMouseOver={e => { e.currentTarget.style.background = '#9D8240'; e.currentTarget.style.borderColor = '#9D8240'; e.currentTarget.style.color = '#FBF8F1'; }}
          onMouseOut={e => { e.currentTarget.style.background = GOLD; e.currentTarget.style.borderColor = GOLD; e.currentTarget.style.color = NAVY; }}
        >{buttonLabel} →</a>
      </div>
    </div>
  );
}

// ───────────────────── orquestador ─────────────────────
const PHASE = {
  WELCOME: 'welcome', CHILD_GATE: 'child_gate',
  STAGE1: 'stage1', TIE: 'tie',
  TRANSITION: 'transition', STAGE2: 'stage2',
  PARENT_GATE: 'parent_gate', RESULT: 'result',
};

export default function TestTBPChildren() {
  const [phase, setPhase] = useState(PHASE.WELCOME);
  const [schoolToken, setSchoolToken] = useState(null);
  const [child, setChild] = useState(null);  // { firstName, birthYear, sex, age, set }

  const [s1Order, setS1Order] = useState([]);
  const [s1Answers, setS1Answers] = useState([]);
  const [s1Index, setS1Index] = useState(0);

  const [tieOrder, setTieOrder] = useState([]);
  const [tieAnswers, setTieAnswers] = useState([]);
  const [tieIndex, setTieIndex] = useState(0);

  const [primario, setPrimario] = useState(null);
  const [stage1Scores, setStage1Scores] = useState(null);

  const [s2Order, setS2Order] = useState([]);
  const [s2Answers, setS2Answers] = useState([]);
  const [s2Index, setS2Index] = useState(0);

  const [decision, setDecision] = useState(null);

  useEffect(() => {
    setSchoolToken(getSchoolToken());
  }, []);

  const totalQuestions = useMemo(() => 16 + tieOrder.length + 6, [tieOrder]);
  const globalIndex = useMemo(() => {
    if (phase === PHASE.STAGE1) return s1Index + 1;
    if (phase === PHASE.TIE)    return 16 + tieIndex + 1;
    if (phase === PHASE.STAGE2) return 16 + tieOrder.length + s2Index + 1;
    return 0;
  }, [phase, s1Index, tieIndex, s2Index, tieOrder.length]);

  // Helpers para construir el texto renderizado del ítem actual.
  function textFor(item) {
    return renderItem(item, { set: child.set, sex: child.sex, name: child.firstName });
  }

  function handleStart() { setPhase(PHASE.CHILD_GATE); }

  function handleChildContinue(childData) {
    setChild(childData);
    setS1Order(buildStage1Order());
    setS1Answers([]); setS1Index(0);
    setTieOrder([]); setTieAnswers([]); setTieIndex(0);
    setPrimario(null); setStage1Scores(null);
    setS2Order([]); setS2Answers([]); setS2Index(0);
    setDecision(null);
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
        const items = tiedTypes.flatMap(tk => QUESTIONS.tiebreaker[tk].map(it => ({ ...it, type: tk })));
        setTieOrder(shuffle(items));
        setTieAnswers([]); setTieIndex(0);
        setPhase(PHASE.TIE);
      } else {
        finalizeStage1(scores, null);
      }
    }
  }

  function backStage1() { if (s1Index > 0) setS1Index(s1Index - 1); }

  function answerTie(value) {
    const next = [...tieAnswers]; next[tieIndex] = value;
    setTieAnswers(next);
    if (tieIndex + 1 < tieOrder.length) {
      setTieIndex(tieIndex + 1);
    } else {
      const s1Scores  = applyAnswers(s1Order, s1Answers);
      const tieScores = applyAnswers(tieOrder, next);
      const merged = mergeScores(s1Scores, tieScores);
      let { top, tiedTypes } = topAndMargin(merged);
      if (tiedTypes.length >= 2) {
        // Desempate final: el que tenga más SIes en Stage 1.
        const yesByType = { COL: 0, SAN: 0, MEL: 0, FLE: 0 };
        for (let i = 0; i < s1Order.length; i++) {
          if (s1Answers[i] === 'SI') yesByType[TYPE_BY_ID[s1Order[i].id]] += 1;
        }
        top = tiedTypes.reduce((best, tk) => (yesByType[tk] > yesByType[best] ? tk : best), tiedTypes[0]);
      }
      finalizeStage1(merged, top);
    }
  }

  function backTie() { if (tieIndex > 0) setTieIndex(tieIndex - 1); }

  function finalizeStage1(scoresMerged, forcedPrimario) {
    const top = forcedPrimario || topAndMargin(scoresMerged).top;
    setStage1Scores(scoresMerged);
    setPrimario(top);
    setS2Order(buildStage2Order(top));
    setS2Answers([]); setS2Index(0);
    setPhase(PHASE.TRANSITION);
  }

  function continueToStage2() { setPhase(PHASE.STAGE2); }

  function answerStage2(value) {
    const next = [...s2Answers]; next[s2Index] = value;
    setS2Answers(next);
    if (s2Index + 1 < s2Order.length) {
      setS2Index(s2Index + 1);
    } else {
      const score_s2 = computeStage2Score(s2Order, next);
      const dec = decideProfile(primario, stage1Scores, score_s2);
      // Empaquetamos el dataset de respuestas crudo (id → SI/NO) para guardar en DB.
      const allAnswers = {};
      for (let i = 0; i < s1Order.length;   i++) allAnswers[s1Order[i].id]  = s1Answers[i] || null;
      for (let i = 0; i < tieOrder.length;  i++) allAnswers[tieOrder[i].id] = tieAnswers[i] || null;
      for (let i = 0; i < s2Order.length;   i++) allAnswers[s2Order[i].id]  = next[i] || null;
      setDecision({ ...dec, primario, answers: allAnswers });
      setPhase(PHASE.RESULT); // RESULT primero (acceso al valor), gate después
    }
  }

  function backStage2() { if (s2Index > 0) setS2Index(s2Index - 1); }

  function openParentGate() { setPhase(PHASE.PARENT_GATE); }
  function onParentSubmitOk() { setPhase(PHASE.RESULT); }
  function restart() {
    setChild(null);
    setDecision(null);
    setPhase(PHASE.WELCOME);
  }

  let body;
  if (phase === PHASE.WELCOME) {
    body = <Welcome onStart={handleStart} />;
  } else if (phase === PHASE.CHILD_GATE) {
    body = <ChildGate onContinue={handleChildContinue} />;
  } else if (phase === PHASE.STAGE1) {
    body = <Question progress={globalIndex} total={totalQuestions} text={textFor(s1Order[s1Index])} onAnswer={answerStage1} onBack={backStage1} canBack={s1Index > 0} />;
  } else if (phase === PHASE.TIE) {
    body = <Question progress={globalIndex} total={totalQuestions} text={textFor(tieOrder[tieIndex])} onAnswer={answerTie} onBack={backTie} canBack={tieIndex > 0} />;
  } else if (phase === PHASE.TRANSITION) {
    body = <Transition primario={primario} onContinue={continueToStage2} />;
  } else if (phase === PHASE.STAGE2) {
    body = <Question progress={globalIndex} total={totalQuestions} text={textFor(s2Order[s2Index])} onAnswer={answerStage2} onBack={backStage2} canBack={s2Index > 0} />;
  } else if (phase === PHASE.PARENT_GATE) {
    body = <ParentGate child={child} decision={decision} schoolToken={schoolToken} onSubmitOk={onParentSubmitOk} />;
  } else if (phase === PHASE.RESULT) {
    // RESULT muestra el resultado con un CTA al parent_gate si todavía no se ha enviado.
    body = (
      <>
        <ResultScreen child={child} decision={decision} onRestart={restart} />
        {/* Si todavía no han pasado por el gate, mostramos un banner que invita
            a registrarse para "guardar/recibir el informe". UX suave; el
            resultado ya está a la vista. */}
        <ChildGateNudge onOpen={openParentGate} alreadySubmitted={false} />
      </>
    );
  }

  return (
    <div style={styles.app}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;0,700;1,400&family=Inter:wght@400;500;600;700&display=swap');`}</style>
      {body}
    </div>
  );
}

// Banner CTA bajo el resultado para invitar al gate de padre.
// (Si en el futuro queremos REQUERIR el gate antes de ver el resultado,
// basta con cambiar el orden en answerStage2: setPhase(PHASE.PARENT_GATE)
// y dejar el RESULT después.)
function ChildGateNudge({ onOpen }) {
  const { t } = useT();
  return (
    <div style={{ maxWidth: 980, margin: '20px auto 0', textAlign: 'center' }}>
      <button
        type="button"
        onClick={onOpen}
        style={{ ...styles.buttonPrimary, background: NAVY }}
        onMouseOver={e => (e.currentTarget.style.background = NAVY_SOFT)}
        onMouseOut={e => (e.currentTarget.style.background = NAVY)}
      >{t('tbp_children.parent_gate.submit')}</button>
    </div>
  );
}
