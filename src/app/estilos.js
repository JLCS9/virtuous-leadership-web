import { NAVY, NAVY_DEEP, PAPER, MUTED, FONT_SLAB, FONT_BODY, GOLD_REF, GOLD_REF_DK, BRUMA } from '../theme';

export const sombra = '0 2px 8px rgba(15,30,51,0.10)';

export const tarjeta = {
  background: PAPER,
  borderTop: `2px solid ${GOLD_REF}`,
  borderRadius: 0,
  padding: '24px 22px',
};

export const eyebrow = {
  fontFamily: FONT_BODY, fontSize: 14, fontWeight: 600, letterSpacing: '0.16em',
  textTransform: 'uppercase', color: GOLD_REF_DK,
};

export const titulo = (tam = 28) => ({
  fontFamily: FONT_SLAB, fontWeight: 700, color: NAVY, margin: 0, lineHeight: 1.08, fontSize: tam,
});

export const parrafo = { fontFamily: FONT_BODY, fontSize: 18, lineHeight: 1.65, color: MUTED, margin: 0 };

export const heroFondo = `linear-gradient(135deg, ${NAVY} 0%, ${NAVY_DEEP} 100%)`;

export const botonPrimario = {
  fontFamily: FONT_BODY, fontSize: 16, fontWeight: 600, letterSpacing: '0.02em', color: '#fff',
  background: GOLD_REF, border: 'none', borderRadius: 0, padding: '16px 28px', cursor: 'pointer',
  display: 'inline-flex', alignItems: 'center', gap: 9, textDecoration: 'none',
  transition: 'background 200ms cubic-bezier(.22,.61,.36,1)',
};

export const botonSobreClaro = { ...botonPrimario, color: PAPER, background: NAVY };

export const botonContorno = {
  ...botonPrimario, background: 'transparent', color: NAVY, border: `2px solid ${NAVY}`,
};

export const barraFondo = { height: 6, borderRadius: 0, background: 'rgba(27,42,74,0.10)', overflow: 'hidden' };

export function fechaLarga(d = new Date()) {
  return d.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' });
}
