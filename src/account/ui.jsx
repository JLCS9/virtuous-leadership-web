// Piezas de interfaz compartidas por «Mi panel» y «Restablecer contraseña».
// Mismo lenguaje visual que el formulario final del test (TestTBP.jsx).
import { Link } from 'react-router-dom';
import { useLocalPath } from '../i18n';
import { NAVY, NAVY_SOFT, GOLD, GOLD_SOFT, PAPER, INK, MUTED, LINE, FONT_SERIF, FONT_SANS } from '../theme';
import logoUrl from '../assets/logo-1.png';

export const ERR_RED = '#A03434';

export function Card({ children, wide = false }) {
  return (
    <div style={{
      maxWidth: wide ? 980 : 520,
      margin: '0 auto',
      background: PAPER,
      border: `1px solid ${LINE}`,
      borderRadius: 4,
      boxShadow: '0 1px 2px rgba(27,42,74,0.04), 0 8px 30px rgba(27,42,74,0.06)',
      padding: '40px 36px',
    }} className="vl-test-card">
      {children}
    </div>
  );
}

export function Title({ eyebrow, children }) {
  return (
    <>
      {eyebrow && (
        <div style={{ fontFamily: FONT_SANS, fontSize: 12, letterSpacing: '0.18em', textTransform: 'uppercase', color: '#9D8240', fontWeight: 600, marginBottom: 10 }}>
          {eyebrow}
        </div>
      )}
      <h1 style={{ fontFamily: FONT_SERIF, fontSize: 30, fontWeight: 600, color: NAVY, margin: 0, lineHeight: 1.15 }}>
        {children}
      </h1>
    </>
  );
}

export function Field({ id, label, error, hint, ...inputProps }) {
  return (
    <div style={{ marginBottom: 18 }}>
      <label htmlFor={id} style={{
        display: 'block', fontSize: 12, color: NAVY, fontWeight: 600,
        letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 6,
      }}>{label}</label>
      <input id={id} {...inputProps}
             style={{
               width: '100%', fontFamily: FONT_SANS, fontSize: 15, padding: '12px 14px',
               background: PAPER, color: INK, border: `1px solid ${error ? ERR_RED : LINE}`,
               borderRadius: 2, outline: 'none', boxSizing: 'border-box',
             }}
             onFocus={e => { e.currentTarget.style.borderColor = GOLD; e.currentTarget.style.boxShadow = `0 0 0 2px ${GOLD_SOFT}55`; }}
             onBlur={e => { e.currentTarget.style.borderColor = error ? ERR_RED : LINE; e.currentTarget.style.boxShadow = 'none'; }} />
      {hint && <div style={{ fontSize: 12, color: MUTED, marginTop: 4 }}>{hint}</div>}
      {error && <div style={{ fontSize: 12, color: ERR_RED, marginTop: 4, fontStyle: 'italic' }}>{error}</div>}
    </div>
  );
}

export function PrimaryButton({ busy, children, ...props }) {
  return (
    <button {...props} disabled={busy || props.disabled}
            style={{
              fontFamily: FONT_SANS, fontSize: 14, fontWeight: 600, letterSpacing: '0.04em',
              color: PAPER, background: busy ? NAVY_SOFT : NAVY, border: 'none',
              padding: '14px 28px', borderRadius: 2, cursor: busy ? 'wait' : 'pointer',
              width: '100%',
            }}>
      {children}
    </button>
  );
}

export function LinkButton({ children, ...props }) {
  return (
    <button type="button" {...props}
            style={{ background: 'none', border: 'none', padding: 0, color: NAVY, textDecoration: 'underline', cursor: 'pointer', fontFamily: FONT_SANS, fontSize: 14 }}>
      {children}
    </button>
  );
}

export function Notice({ tone = 'error', children }) {
  const err = tone === 'error';
  return (
    <div role={err ? 'alert' : 'status'} style={{
      margin: '0 0 18px 0', padding: '12px 14px', fontSize: 14, borderRadius: 2,
      background: err ? '#F8E5E5' : '#EEF3E8',
      border: `1px solid ${err ? '#C97A7A' : '#9DB58A'}`,
      color: err ? '#7A1F1F' : '#2F4A22',
    }}>{children}</div>
  );
}

// Barra superior del panel: logo (vuelve a la home) + acciones a la derecha.
export function TopBar({ children }) {
  const lp = useLocalPath();
  return (
    <div style={{ maxWidth: 980, margin: '0 auto 20px', display: 'flex', alignItems: 'center', gap: 12 }}>
      <Link to={lp('/')} aria-label="Virtuous Leadership" style={{ display: 'flex' }}>
        <img src={logoUrl} alt="Virtuous Leadership" width="44" height="44" style={{ display: 'block', borderRadius: '50%' }} />
      </Link>
      <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 14, fontFamily: FONT_SANS, fontSize: 14, color: NAVY }}>
        {children}
      </div>
    </div>
  );
}
