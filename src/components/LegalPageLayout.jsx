// Layout minimalista para páginas legales (Política de Privacidad, Cookies).
// Sólo barra superior con la bandera de idioma — sin header, sin menú, sin footer.
// El contenido va dentro de un contenedor central de lectura cómoda.

import { useLocalPath } from '../i18n';
import LangSwitcher from './LangSwitcher';
import { PAPER, BEIGE, NAVY, NAVY_SOFT, GOLD, LINE, MUTED, INK, FONT_SERIF, FONT_SANS } from '../theme';

const READ_MAX_WIDTH = 780; // ancho cómodo para texto largo

export default function LegalPageLayout({ eyebrow, title, lastUpdated, lastUpdatedLabel = 'Última actualización', children }) {
  const lp = useLocalPath();
  return (
    <div style={{ minHeight: '100vh', background: PAPER, color: INK, fontFamily: FONT_SANS }}>
      {/* Barra superior: home link a la izquierda (discreto) + bandera a la derecha */}
      <header style={{
        position: 'sticky', top: 0, zIndex: 10,
        background: 'rgba(251,248,241,0.92)', backdropFilter: 'blur(8px)',
        borderBottom: `1px solid ${LINE}`,
        padding: '14px 24px',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      }}>
        <a href={lp('/')} style={{
          fontFamily: FONT_SERIF, fontSize: 18, fontWeight: 600,
          color: NAVY, textDecoration: 'none', letterSpacing: '-0.01em',
        }}>Virtuous Leadership</a>
        <LangSwitcher inverted={false} />
      </header>

      <main style={{ maxWidth: READ_MAX_WIDTH, margin: '0 auto', padding: '56px 24px 96px' }}>
        {eyebrow && (
          <div style={{
            fontSize: 12, color: '#9D8240', letterSpacing: '0.18em',
            textTransform: 'uppercase', fontWeight: 600, marginBottom: 12,
          }}>{eyebrow}</div>
        )}
        {title && (
          <h1 style={{
            fontFamily: FONT_SERIF, fontSize: 'clamp(30px, 4vw, 44px)', fontWeight: 600,
            color: NAVY, letterSpacing: '-0.01em', lineHeight: 1.15, margin: 0,
          }}>{title}</h1>
        )}
        {lastUpdated && (
          <div style={{ fontSize: 13, color: MUTED, marginTop: 12, fontStyle: 'italic' }}>
            {lastUpdatedLabel}: {lastUpdated}
          </div>
        )}
        <div style={{ marginTop: 32 }}>{children}</div>
      </main>
    </div>
  );
}

// ──────────── Componentes de texto reutilizables ────────────
// Para no repetir estilos en cada sección de las páginas legales.

export function H2({ children }) {
  return (
    <h2 style={{
      fontFamily: FONT_SERIF, fontSize: 'clamp(22px, 2.6vw, 28px)', fontWeight: 600,
      color: NAVY, letterSpacing: '-0.005em', margin: '40px 0 12px 0',
    }}>{children}</h2>
  );
}

export function H3({ children }) {
  return (
    <h3 style={{
      fontFamily: FONT_SERIF, fontSize: 20, fontWeight: 600, color: NAVY_SOFT,
      margin: '28px 0 10px 0',
    }}>{children}</h3>
  );
}

export function P({ children, html }) {
  const style = {
    fontFamily: FONT_SANS, fontSize: 16, lineHeight: 1.7, color: INK,
    margin: '12px 0',
  };
  return html
    ? <p style={style} dangerouslySetInnerHTML={{ __html: html }} />
    : <p style={style}>{children}</p>;
}

export function UL({ children }) {
  return (
    <ul style={{
      fontFamily: FONT_SANS, fontSize: 16, lineHeight: 1.7, color: INK,
      margin: '12px 0 12px 24px', padding: 0,
    }}>{children}</ul>
  );
}

export function LI({ children }) {
  return <li style={{ margin: '6px 0' }}>{children}</li>;
}

export function Strong({ children }) {
  return <strong style={{ color: NAVY }}>{children}</strong>;
}

export function ContactBox({ children }) {
  return (
    <div style={{
      background: BEIGE, border: `1px solid ${LINE}`, borderLeft: `3px solid ${GOLD}`,
      padding: '18px 22px', borderRadius: 2, margin: '20px 0',
      fontSize: 15, lineHeight: 1.65,
    }}>{children}</div>
  );
}

export function Table({ headers, rows }) {
  return (
    <div style={{ overflowX: 'auto', margin: '16px 0' }}>
      <table style={{
        width: '100%', borderCollapse: 'collapse', fontFamily: FONT_SANS, fontSize: 14,
      }}>
        <thead>
          <tr>
            {headers.map((h, i) => (
              <th key={i} style={{
                textAlign: 'left', padding: '10px 12px',
                background: BEIGE, color: NAVY, fontWeight: 600,
                borderBottom: `2px solid ${LINE}`,
                fontSize: 12, letterSpacing: '0.04em', textTransform: 'uppercase',
              }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, ri) => (
            <tr key={ri}>
              {row.map((cell, ci) => (
                <td key={ci} style={{
                  padding: '12px', borderBottom: `1px solid ${LINE}`,
                  color: INK, verticalAlign: 'top',
                }}>{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
