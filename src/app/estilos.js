// Estilos compartidos del panel con pestañas (Hoy / Camino / Formación). Mismo lenguaje visual que
// la web (theme.js): azul marino, dorado, papel; Cormorant Garamond para los titulares.
import { NAVY, NAVY_DEEP, GOLD_DEEP, PAPER, MUTED, LINE, FONT_SERIF, FONT_SANS } from '../theme';

export const sombra = '0 1px 2px rgba(27,42,74,0.05), 0 10px 30px rgba(27,42,74,0.07)';

export const tarjeta = {
  background: PAPER,
  border: `1px solid ${LINE}`,
  borderRadius: 18,
  boxShadow: sombra,
  padding: '22px 20px',
};

export const eyebrow = {
  fontFamily: FONT_SANS, fontSize: 11, fontWeight: 700, letterSpacing: '0.16em',
  textTransform: 'uppercase', color: GOLD_DEEP,
};

export const titulo = (tam = 28) => ({
  fontFamily: FONT_SERIF, fontWeight: 700, color: NAVY, margin: 0, lineHeight: 1.15, fontSize: tam,
});

export const parrafo = { fontFamily: FONT_SANS, fontSize: 15, lineHeight: 1.55, color: MUTED, margin: 0 };

export const heroFondo = `linear-gradient(135deg, ${NAVY} 0%, ${NAVY_DEEP} 100%)`;

export const botonPrimario = {
  fontFamily: FONT_SANS, fontSize: 14, fontWeight: 600, letterSpacing: '0.03em', color: NAVY,
  background: '#C5A55A', border: 'none', borderRadius: 999, padding: '12px 22px', cursor: 'pointer',
  display: 'inline-flex', alignItems: 'center', gap: 8, textDecoration: 'none',
};

export const botonSobreClaro = { ...botonPrimario, color: PAPER, background: NAVY };

export const botonContorno = {
  ...botonPrimario, background: 'transparent', color: NAVY, border: `1px solid ${NAVY}`,
};

export const barraFondo = { height: 6, borderRadius: 999, background: 'rgba(27,42,74,0.10)', overflow: 'hidden' };

export function fechaLarga(d = new Date()) {
  return d.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' });
}
