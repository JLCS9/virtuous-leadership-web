// Portal VL — fuente única de verdad del diseño.
// Colores: re-exportados de theme.js (compartidos con la web).
// Fuentes, radios, sombras, escalas: los valores del portal
// (Roboto Slab / Roboto, esquinas redondeadas, pill buttons).

// ─── Colores ────────────────────────────────────────────────────
export {
  NAVY, NAVY_SOFT, NAVY_DEEP,
  GOLD, GOLD_SOFT, GOLD_DEEP,
  BEIGE, PAPER, INK, MUTED, LINE,
  GOLD_REF, GOLD_REF_LT, GOLD_REF_DK,
  SUCCESS_BG, SUCCESS, SUCCESS_DK,
  ERROR_BG, ERROR, ERROR_DK,
  WARNING_BG, WARNING, WARNING_DK,
  TEMP_COLORS,
} from '../theme';

// ─── Fuentes ────────────────────────────────────────────────────
export const FONT_SLAB = "'Roboto Slab', Georgia, serif";
export const FONT_BODY = "'Roboto', system-ui, sans-serif";

// ─── Radios ─────────────────────────────────────────────────────
export const RADIO_PILL    = 999;
export const RADIO_TARJETA = 20;
export const RADIO_BLOQUE  = 14;
export const RADIO_CAMPO   = 12;

// ─── Sombras ────────────────────────────────────────────────────
export const SOMBRA_SM   = '0 1px 2px rgba(20,32,60,0.03), 0 6px 24px rgba(20,32,60,0.05)';
export const SOMBRA_MD   = '0 2px 4px rgba(20,32,60,0.04), 0 10px 30px rgba(20,32,60,0.08)';
export const SOMBRA_LG   = '0 8px 24px rgba(15,29,56,0.22)';
export const SOMBRA_XL   = '0 18px 40px rgba(15,29,56,0.28)';
export const SOMBRA_GOLD = '0 4px 12px rgba(165,139,38,0.22)';
export const SOMBRA_NAVY = '0 4px 12px rgba(27,42,74,0.18)';

// ─── Escala de spacing ──────────────────────────────────────────
export const SP = { 2: 4, 4: 8, 6: 12, 8: 16, 12: 24, 18: 36 };

// ─── Escala de line-height ──────────────────────────────────────
export const LH_TIGHT   = 1;
export const LH_TITULO  = 1.18;
export const LH_COMPACT = 1.45;
export const LH_CUERPO  = 1.6;
export const LH_LECTURA = 1.75;

// ─── Escala de letter-spacing ───────────────────────────────────
export const LS_TITULO  = '-0.015em';
export const LS_NORMAL  = '0.01em';
export const LS_LABEL   = '0.06em';
export const LS_EYEBROW = '0.14em';

// ─── Estilos compuestos del portal ──────────────────────────────
// (los colores importados arriba via re-export; aquí se usan directamente)
import { NAVY, NAVY_DEEP, MUTED, GOLD_REF, GOLD_REF_DK } from '../theme'; // eslint-disable-line no-duplicate-imports

export const sombra = SOMBRA_SM;

export const tarjeta = {
  background: '#fff',
  border: '1px solid rgba(27,42,74,0.05)',
  borderRadius: RADIO_TARJETA,
  boxShadow: SOMBRA_SM,
  padding: '22px 22px',
};

export const tarjetaCentrada = {
  ...tarjeta,
  padding: '36px 24px',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
};

export const eyebrow = {
  fontFamily: FONT_BODY, fontSize: 12, fontWeight: 600, letterSpacing: LS_EYEBROW,
  textTransform: 'uppercase', color: GOLD_REF_DK,
};

const ESCALA_TITULOS = 0.8;
export const titulo = (tam = 28) => ({
  fontFamily: FONT_SLAB, fontWeight: 700, color: NAVY, margin: 0,
  lineHeight: LH_TITULO, fontSize: Math.max(18, Math.round(tam * ESCALA_TITULOS)),
  letterSpacing: LS_TITULO,
});

export const parrafo = {
  fontFamily: FONT_BODY, fontSize: 16, lineHeight: LH_CUERPO, color: MUTED, margin: 0,
};

export const heroFondo = `linear-gradient(135deg, ${NAVY} 0%, ${NAVY_DEEP} 100%)`;

export const botonPrimario = {
  fontFamily: FONT_BODY, fontSize: 16, fontWeight: 600, letterSpacing: LS_NORMAL, color: '#fff',
  background: GOLD_REF, border: 'none', borderRadius: RADIO_PILL, padding: '11px 22px',
  cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
  gap: 9, textDecoration: 'none', boxShadow: SOMBRA_GOLD,
};

export const botonSobreClaro = {
  ...botonPrimario, color: '#fff', background: NAVY, boxShadow: SOMBRA_NAVY,
};

export const botonContorno = {
  ...botonPrimario, background: 'transparent', color: NAVY,
  border: '1px solid rgba(27,42,74,0.22)', boxShadow: 'none',
};

export const barraFondo = {
  height: 6, borderRadius: RADIO_PILL, background: 'rgba(27,42,74,0.08)', overflow: 'hidden',
};

export function fechaLarga(d = new Date()) {
  return d.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' });
}
