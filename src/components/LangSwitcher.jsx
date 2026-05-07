import { useState, useEffect, useRef } from 'react';
import { useT } from '../i18n';
import { NAVY, NAVY_SOFT, GOLD, PAPER, LINE, MUTED, FONT_SANS } from '../theme';

export default function LangSwitcher({ inverted = true }) {
  // inverted=true → estilo para Header navy (texto blanco, hover oro)
  // inverted=false → para uso sobre fondo claro
  const { lang, setLang, langs } = useT();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  // Cerrar al hacer click fuera
  useEffect(() => {
    function handler(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    if (open) document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  const current = langs.find(l => l.code === lang) || langs[0];

  const triggerColor = inverted ? PAPER : NAVY;
  const triggerBorder = inverted ? 'rgba(197,165,90,0.3)' : LINE;

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={`Idioma: ${current.label}`}
        title={current.label}
        onClick={() => setOpen(o => !o)}
        style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          padding: '6px 10px',
          background: 'transparent',
          color: triggerColor,
          border: `1px solid ${triggerBorder}`,
          borderRadius: 999,
          cursor: 'pointer',
          transition: 'all 160ms ease',
        }}
        onMouseOver={e => { e.currentTarget.style.borderColor = GOLD; }}
        onMouseOut={e => { e.currentTarget.style.borderColor = triggerBorder; }}
      >
        <span style={{ fontSize: 18, lineHeight: 1 }}>{current.flag}</span>
        <svg width="10" height="10" viewBox="0 0 10 10" fill="currentColor" style={{ opacity: 0.7 }}><path d="M2 3 L5 7 L8 3 Z"/></svg>
      </button>

      {open && (
        <ul role="listbox"
            style={{
              position: 'absolute', top: 'calc(100% + 6px)', right: 0,
              listStyle: 'none', margin: 0, padding: 6,
              background: PAPER, border: `1px solid ${LINE}`,
              borderRadius: 2,
              boxShadow: '0 12px 28px rgba(0,0,0,0.18)',
              minWidth: 180, zIndex: 100,
            }}>
          {langs.map(l => {
            const active = l.code === lang;
            return (
              <li key={l.code} role="option" aria-selected={active}>
                <button
                  type="button"
                  onClick={() => { setLang(l.code); setOpen(false); }}
                  style={{
                    width: '100%', textAlign: 'left',
                    display: 'flex', alignItems: 'center', gap: 10,
                    padding: '10px 12px',
                    fontFamily: FONT_SANS, fontSize: 14,
                    color: active ? NAVY : MUTED,
                    fontWeight: active ? 600 : 500,
                    background: active ? '#F4F1EA' : 'transparent',
                    border: 'none',
                    borderLeft: `2px solid ${active ? GOLD : 'transparent'}`,
                    borderRadius: 2,
                    cursor: 'pointer',
                  }}
                >
                  <span style={{ fontSize: 18, lineHeight: 1 }}>{l.flag}</span>
                  <span>{l.label}</span>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
