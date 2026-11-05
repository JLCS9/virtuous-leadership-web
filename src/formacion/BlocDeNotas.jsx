import { useState } from 'react';
import { NAVY, MUTED, LINE, GOLD_REF, GOLD_REF_DK, FONT_BODY, PAPER } from '../theme';
import { tarjeta, eyebrow } from '../app/estilos';

function formatFecha(iso) {
  const d = new Date(iso);
  return d.toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' });
}

const IconoLupa = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ flexShrink: 0 }}>
    <circle cx="10.5" cy="10.5" r="7" /><path d="m21 21-5.2-5.2" />
  </svg>
);

function leccionesDesbloqueadas(videos, completados) {
  const result = [];
  for (const v of videos) {
    result.push(v);
    if (!completados[v.id]) break;
  }
  return result;
}

export function BlocDeNotas({ videos, completados, pasoActualId, notas, onAgregar, onEliminar }) {
  const desbloqueadas = leccionesDesbloqueadas(videos, completados);

  if (!desbloqueadas.find((v) => v.id === pasoActualId)) {
    const actual = videos.find((v) => v.id === pasoActualId);
    if (actual && !desbloqueadas.includes(actual)) desbloqueadas.push(actual);
  }

  const [texto, setTexto] = useState('');
  const [verPasadas, setVerPasadas] = useState(false);
  const [filtro, setFiltro] = useState(pasoActualId);

  const totalNotas = Object.values(notas).reduce((s, arr) => s + arr.length, 0);
  const notasDelFiltro = (notas[filtro] ?? []).slice().reverse();

  function guardarNota() {
    const t = texto.trim();
    if (!t || !pasoActualId) return;
    onAgregar(pasoActualId, t);
    setTexto('');
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      guardarNota();
    }
  }

  return (
    <section style={{ ...tarjeta, marginTop: 20 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <div style={eyebrow}>Bloc de notas</div>
        {totalNotas > 0 && (
          <button
            type="button"
            onClick={() => setVerPasadas(!verPasadas)}
            style={{
              background: 'none', border: 'none', padding: 0,
              fontFamily: FONT_BODY, fontSize: 13, fontWeight: 600,
              color: GOLD_REF_DK, cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: 5,
              textDecoration: 'underline', textUnderlineOffset: 3,
            }}
          >
            <IconoLupa />
            {verPasadas ? 'Ocultar notas pasadas' : 'Ver notas pasadas'}
          </button>
        )}
      </div>

      <div style={{
        background: '#fff',
        border: `1px solid ${LINE}`,
        boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.04)',
      }}>
        <textarea
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Escribe una reflexión…"
          rows={3}
          style={{
            width: '100%', padding: '14px 16px',
            border: 'none', outline: 'none',
            fontFamily: FONT_BODY, fontSize: 15, color: NAVY,
            resize: 'vertical', boxSizing: 'border-box',
            minHeight: 80, background: 'transparent',
            lineHeight: 1.55,
          }}
        />
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 10 }}>
        <span style={{ fontFamily: FONT_BODY, fontSize: 12, color: MUTED }}>
          ⌘ + Enter para guardar
        </span>
        <button
          type="button"
          onClick={guardarNota}
          disabled={!texto.trim()}
          style={{
            fontFamily: FONT_BODY, fontSize: 14, fontWeight: 600,
            color: texto.trim() ? PAPER : MUTED,
            background: texto.trim() ? GOLD_REF : LINE,
            border: 'none', borderRadius: 0, padding: '10px 22px',
            cursor: texto.trim() ? 'pointer' : 'default',
            transition: 'background 200ms ease, color 200ms ease',
            letterSpacing: '0.02em',
          }}
        >
          Guardar nota
        </button>
      </div>

      {verPasadas && (
        <div style={{ marginTop: 18, borderTop: `1px solid ${LINE}`, paddingTop: 14 }}>
          <select
            value={filtro}
            onChange={(e) => setFiltro(e.target.value)}
            style={{
              width: '100%', padding: '12px 40px 12px 16px',
              border: `1px solid ${LINE}`,
              borderRadius: 0, fontFamily: FONT_BODY, fontSize: 15, fontWeight: 500,
              color: NAVY, background: '#fff',
              marginBottom: 14, cursor: 'pointer',
              appearance: 'none',
              backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%237a8599' stroke-width='1.5' fill='none'/%3E%3C/svg%3E")`,
              backgroundRepeat: 'no-repeat',
              backgroundPosition: 'right 16px center',
            }}
          >
            {desbloqueadas.map((v, i) => {
              return (
                <option key={v.id} value={v.id}>
                  Módulo {i} — {v.titulo}
                </option>
              );
            })}
          </select>

          {notasDelFiltro.length === 0 && (
            <p style={{ fontFamily: FONT_BODY, fontSize: 14, color: MUTED, fontStyle: 'italic', margin: 0 }}>
              Sin notas en esta lección.
            </p>
          )}

          {notasDelFiltro.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {notasDelFiltro.map((nota) => (
                <div key={nota.id} style={{
                  padding: '14px 18px 14px 16px',
                  borderLeft: `3px solid ${GOLD_REF}`,
                  background: 'rgba(165,139,38,0.04)',
                  position: 'relative',
                }}>
                  <div style={{
                    fontFamily: FONT_BODY, fontSize: 11, color: MUTED,
                    letterSpacing: '0.04em', textTransform: 'uppercase',
                    marginBottom: 6,
                  }}>
                    {formatFecha(nota.fecha)}
                  </div>
                  <p style={{
                    fontFamily: FONT_BODY, fontSize: 16, color: NAVY, margin: 0,
                    lineHeight: 1.65, whiteSpace: 'pre-wrap', paddingRight: 24,
                  }}>
                    {nota.texto}
                  </p>
                  <button
                    type="button"
                    onClick={() => onEliminar(filtro, nota.id)}
                    style={{
                      position: 'absolute', top: 10, right: 10,
                      background: 'none', border: 'none',
                      color: MUTED, cursor: 'pointer', fontSize: 15,
                      padding: '4px 6px', lineHeight: 1,
                      opacity: 0.4, transition: 'opacity 150ms ease',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.opacity = '1'; }}
                    onMouseLeave={e => { e.currentTarget.style.opacity = '0.4'; }}
                    aria-label="Eliminar nota"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </section>
  );
}
