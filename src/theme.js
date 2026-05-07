// Sistema de diseño compartido entre todas las páginas.
// Si cambias un token aquí, cambia en todo el sitio.

export const NAVY      = '#1B2A4A';
export const NAVY_SOFT = '#2A3B5F';
export const NAVY_DEEP = '#0F1D38';
export const GOLD      = '#C5A55A';
export const GOLD_SOFT = '#E0C98A';
export const GOLD_DEEP = '#9D8240';
export const BEIGE     = '#F4F1EA';
export const PAPER     = '#FBF8F1';
export const INK       = '#22262E';
export const MUTED     = '#6B6B6B';
export const LINE      = '#D8D2C2';

export const FONT_SERIF = "'Cormorant Garamond', 'Playfair Display', Georgia, 'Times New Roman', serif";
export const FONT_SANS  = "'Inter', 'DM Sans', system-ui, -apple-system, 'Segoe UI', sans-serif";
export const FONT_MONO  = "ui-monospace, SFMono-Regular, Menlo, monospace";

export const MAX_WIDTH = 1100;

// Etiquetas de los 4 temperamentos (compartidas con el test).
export const TEMP_COLORS = {
  COL: '#9C3A3A',
  MEL: '#5A3F8B',
  SAN: '#D67A2C',
  FLE: '#3F7A56',
};

// Clases reusables de estilo. Usadas vía `style={{...}}` o desestructurando.
export const styles = {
  container: {
    maxWidth: MAX_WIDTH,
    margin: '0 auto',
    padding: '0 24px',
  },
  h1: {
    fontFamily: FONT_SERIF,
    fontSize: 'clamp(34px, 5vw, 52px)',
    fontWeight: 600,
    color: NAVY,
    letterSpacing: '-0.01em',
    lineHeight: 1.1,
    margin: 0,
  },
  h2: {
    fontFamily: FONT_SERIF,
    fontSize: 'clamp(26px, 3.4vw, 36px)',
    fontWeight: 600,
    color: NAVY,
    letterSpacing: '-0.005em',
    lineHeight: 1.2,
    margin: 0,
  },
  h3: {
    fontFamily: FONT_SERIF,
    fontSize: 22,
    fontWeight: 600,
    color: NAVY,
    margin: 0,
  },
  eyebrow: {
    fontFamily: FONT_SANS,
    fontSize: 12,
    color: GOLD_DEEP,
    letterSpacing: '0.18em',
    textTransform: 'uppercase',
    fontWeight: 600,
    marginBottom: 12,
  },
  para: {
    fontFamily: FONT_SANS,
    fontSize: 16,
    lineHeight: 1.65,
    color: INK,
    margin: '12px 0',
  },
  paraLarge: {
    fontFamily: FONT_SERIF,
    fontStyle: 'italic',
    fontSize: 'clamp(18px, 2vw, 22px)',
    lineHeight: 1.5,
    color: NAVY_SOFT,
    margin: '12px 0 24px 0',
  },
  buttonPrimary: {
    display: 'inline-block',
    fontFamily: FONT_SANS,
    fontSize: 14,
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
    fontWeight: 600,
    color: PAPER,
    background: NAVY,
    border: `1px solid ${NAVY}`,
    padding: '14px 28px',
    borderRadius: 2,
    cursor: 'pointer',
    textDecoration: 'none',
    transition: 'all 160ms ease',
  },
  buttonSecondary: {
    display: 'inline-block',
    fontFamily: FONT_SANS,
    fontSize: 14,
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
    fontWeight: 600,
    color: NAVY,
    background: 'transparent',
    border: `1px solid ${NAVY}`,
    padding: '14px 28px',
    borderRadius: 2,
    cursor: 'pointer',
    textDecoration: 'none',
    transition: 'all 160ms ease',
  },
};

// Hover handlers reusables — `<button onMouseOver={hover.primary.over} ...>`
export const hover = {
  primary: {
    over: e => { e.currentTarget.style.background = NAVY_SOFT; },
    out:  e => { e.currentTarget.style.background = NAVY; },
  },
  secondary: {
    over: e => { e.currentTarget.style.background = NAVY; e.currentTarget.style.color = PAPER; },
    out:  e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = NAVY; },
  },
};
