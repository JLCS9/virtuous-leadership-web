import { NAVY, NAVY_DEEP, MUTED, FONT_SLAB, FONT_BODY, GOLD_REF, GOLD_REF_DK, BRUMA } from '../theme';

// Estilo del portal: suave, redondeado y minimalista. Los radios y la fuente de los títulos se afinan en
// un solo sitio, el CSS del portal (AppShell); aquí van los bloques que reutilizan las pantallas.
export const sombra = '0 1px 2px rgba(20,32,60,0.04), 0 10px 32px rgba(20,32,60,0.07)';

export const tarjeta = {
  background: '#fff',
  border: '1px solid rgba(27,42,74,0.06)',
  borderRadius: 24,
  boxShadow: sombra,
  padding: '28px 26px',
};

// Plantilla de las tarjetas con icono redondo y texto centrado (carátulas, completado, resultados).
export const tarjetaCentrada = {
  ...tarjeta,
  padding: '48px 32px',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
};

export const eyebrow = {
  fontFamily: FONT_BODY, fontSize: 14, fontWeight: 600, letterSpacing: '0.16em',
  textTransform: 'uppercase', color: GOLD_REF_DK,
};

export const titulo = (tam = 28) => ({
  fontFamily: FONT_SLAB, fontWeight: 700, color: NAVY, margin: 0, lineHeight: 1.12, fontSize: tam, letterSpacing: '-0.015em',
});

export const parrafo = { fontFamily: FONT_BODY, fontSize: 18, lineHeight: 1.65, color: MUTED, margin: 0 };

export const heroFondo = `linear-gradient(135deg, ${NAVY} 0%, ${NAVY_DEEP} 100%)`;

// Botones en píldora. El dorado es el acento y el azul la acción principal; el de contorno, el secundario.
export const botonPrimario = {
  fontFamily: FONT_BODY, fontSize: 16, fontWeight: 600, letterSpacing: '0.01em', color: '#fff',
  background: GOLD_REF, border: 'none', borderRadius: 999, padding: '15px 28px', cursor: 'pointer',
  display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 9, textDecoration: 'none',
  boxShadow: '0 6px 18px rgba(165,139,38,0.28)',
};

export const botonSobreClaro = { ...botonPrimario, color: '#fff', background: NAVY, boxShadow: '0 6px 18px rgba(27,42,74,0.22)' };

export const botonContorno = {
  ...botonPrimario, background: 'transparent', color: NAVY, border: '1.5px solid rgba(27,42,74,0.28)', boxShadow: 'none',
};

export const barraFondo = { height: 8, borderRadius: 999, background: 'rgba(27,42,74,0.08)', overflow: 'hidden' };

export function fechaLarga(d = new Date()) {
  return d.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' });
}
