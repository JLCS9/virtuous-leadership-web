// Componentes interactivos para las actividades entre vídeos del módulo.
// Quiz, Define, Desliza, Identifica — todos comparten el mismo shell (título + barra progreso).
import { useCallback, useRef, useState } from 'react';
import { NAVY, MUTED, GOLD_REF, GOLD_REF_DK, LINE, PAPER, FONT_SLAB, FONT_BODY, BEIGE, TEMP_COLORS } from '../theme';
import { barraFondo, eyebrow, tarjeta } from '../app/estilos';

const TEMP_NOMBRE = { COL: 'Colérico', MEL: 'Melancólico', SAN: 'Sanguíneo', FLE: 'Flemático' };

function Shell({ titulo, actual, total, children }) {
  const pct = total > 0 ? Math.round(((actual) / total) * 100) : 0;
  return (
    <div style={{ maxWidth: 680, margin: '0 auto' }}>
      <div style={eyebrow}>{titulo}</div>
      <div style={{ ...barraFondo, margin: '10px 0 6px' }}>
        <div style={{ height: '100%', width: `${pct}%`, background: GOLD_REF_DK, transition: 'width 400ms ease' }} />
      </div>
      <div style={{ fontFamily: FONT_BODY, fontSize: 12, color: MUTED, marginBottom: 20 }}>{actual} de {total}</div>
      {children}
    </div>
  );
}

function BotonOpcion({ texto, seleccionada, correcta, revelada, onClick }) {
  let bg = PAPER;
  let border = `1.5px solid ${LINE}`;
  let color = NAVY;
  if (revelada && correcta) { bg = '#ecfdf5'; border = '1.5px solid #10b981'; color = '#065f46'; }
  else if (revelada && seleccionada && !correcta) { bg = '#fef2f2'; border = '1.5px solid #ef4444'; color = '#991b1b'; }
  else if (seleccionada) { bg = 'rgba(165,139,38,0.10)'; border = `1.5px solid ${GOLD_REF}`; }

  return (
    <button type="button" onClick={onClick} disabled={revelada} style={{
      fontFamily: FONT_BODY, fontSize: 15, lineHeight: 1.5, color, background: bg,
      border, borderRadius: 0, padding: '14px 18px', cursor: revelada ? 'default' : 'pointer',
      width: '100%', textAlign: 'left', transition: 'all 150ms ease',
    }}>
      {texto}
    </button>
  );
}

/* ─── QUIZ ─── */

function shuffleIndices(n) {
  const arr = Array.from({ length: n }, (_, i) => i);
  for (let i = arr.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [arr[i], arr[j]] = [arr[j], arr[i]]; }
  return arr;
}

export function Quiz({ paso, onComplete }) {
  const { preguntas } = paso;
  const [idx, setIdx] = useState(0);
  const [seleccion, setSeleccion] = useState(null);
  const [revelada, setRevelada] = useState(false);
  const [aciertos, setAciertos] = useState(0);
  const ordenRef = useRef({});

  const preg = preguntas[idx];
  if (!ordenRef.current[idx]) ordenRef.current[idx] = shuffleIndices(preg.opciones.length);
  const orden = ordenRef.current[idx];

  function elegir(originalIdx) {
    if (revelada) return;
    setSeleccion(originalIdx);
    setRevelada(true);
    if (originalIdx === preg.correcta) setAciertos((a) => a + 1);
  }

  function avanzar() {
    if (idx + 1 < preguntas.length) {
      setIdx((i) => i + 1);
      setSeleccion(null);
      setRevelada(false);
    } else {
      onComplete({ aciertos, total: preguntas.length });
    }
  }

  return (
    <Shell titulo={paso.titulo} actual={idx + 1} total={preguntas.length}>
      <div style={tarjeta}>
        <p style={{ fontFamily: FONT_SLAB, fontSize: 18, fontWeight: 700, color: NAVY, margin: '0 0 18px', lineHeight: 1.4 }}>
          {preg.texto}
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {orden.map((origIdx) => (
            <BotonOpcion key={origIdx} texto={preg.opciones[origIdx]} seleccionada={seleccion === origIdx}
              correcta={origIdx === preg.correcta} revelada={revelada} onClick={() => elegir(origIdx)} />
          ))}
        </div>
        {revelada && (
          <div style={{ marginTop: 18, display: 'flex', justifyContent: 'flex-end' }}>
            <button type="button" onClick={avanzar} style={{
              fontFamily: FONT_BODY, fontSize: 14, fontWeight: 600, color: '#fff',
              background: GOLD_REF, border: 'none', borderRadius: 0, padding: '12px 28px', cursor: 'pointer',
            }}>
              {idx + 1 < preguntas.length ? 'Siguiente' : 'Completar'}
            </button>
          </div>
        )}
      </div>
    </Shell>
  );
}

/* ─── DEFINE (word pools) ─── */

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
  return a;
}

export function Define({ paso, onComplete }) {
  const { conceptos } = paso;
  const [idx, setIdx] = useState(0);
  const [seleccionadas, setSeleccionadas] = useState(new Set());
  const [revelado, setRevelado] = useState(false);
  const [aciertos, setAciertos] = useState(0);
  const poolRef = useRef(null);

  const concepto = conceptos[idx];
  if (!poolRef.current || poolRef.current._idx !== idx) {
    poolRef.current = shuffle([...concepto.correctas, ...concepto.distractores]);
    poolRef.current._idx = idx;
  }
  const pool = poolRef.current;
  const correctasSet = new Set(concepto.correctas);

  function toggle(palabra) {
    if (revelado) return;
    setSeleccionadas((prev) => {
      const next = new Set(prev);
      next.has(palabra) ? next.delete(palabra) : next.add(palabra);
      return next;
    });
  }

  function comprobar() {
    setRevelado(true);
    const bien = [...seleccionadas].filter((p) => correctasSet.has(p)).length;
    const mal = [...seleccionadas].filter((p) => !correctasSet.has(p)).length;
    if (bien === concepto.correctas.length && mal === 0) setAciertos((a) => a + 1);
  }

  function avanzar() {
    if (idx + 1 < conceptos.length) {
      setIdx((i) => i + 1);
      setSeleccionadas(new Set());
      setRevelado(false);
      poolRef.current = null;
    } else {
      onComplete({ aciertos, total: conceptos.length });
    }
  }

  return (
    <Shell titulo={paso.titulo} actual={idx + 1} total={conceptos.length}>
      <div style={tarjeta}>
        <p style={{ fontFamily: FONT_BODY, fontSize: 13, color: MUTED, margin: '0 0 6px' }}>
          Selecciona las palabras que definen:
        </p>
        <p style={{ fontFamily: FONT_SLAB, fontSize: 22, fontWeight: 700, color: NAVY, margin: '0 0 18px' }}>
          {concepto.concepto}
        </p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {pool.map((p) => {
            const sel = seleccionadas.has(p);
            const esCorrecta = correctasSet.has(p);
            let bg = sel ? 'rgba(165,139,38,0.15)' : BEIGE;
            let border = sel ? `1.5px solid ${GOLD_REF}` : `1.5px solid ${LINE}`;
            let color = NAVY;
            if (revelado && esCorrecta) { bg = '#ecfdf5'; border = '1.5px solid #10b981'; color = '#065f46'; }
            else if (revelado && sel && !esCorrecta) { bg = '#fef2f2'; border = '1.5px solid #ef4444'; color = '#991b1b'; }
            return (
              <button key={p} type="button" onClick={() => toggle(p)} disabled={revelado} style={{
                fontFamily: FONT_BODY, fontSize: 13, fontWeight: 500, color, background: bg,
                border, borderRadius: 0, padding: '8px 14px', cursor: revelado ? 'default' : 'pointer',
                transition: 'all 150ms ease',
              }}>
                {p}
              </button>
            );
          })}
        </div>
        <div style={{ marginTop: 18, display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
          {!revelado && (
            <button type="button" onClick={comprobar} disabled={seleccionadas.size === 0} style={{
              fontFamily: FONT_BODY, fontSize: 14, fontWeight: 600, color: '#fff',
              background: seleccionadas.size > 0 ? GOLD_REF : LINE, border: 'none', borderRadius: 0,
              padding: '12px 28px', cursor: seleccionadas.size > 0 ? 'pointer' : 'default',
            }}>
              Comprobar
            </button>
          )}
          {revelado && (
            <button type="button" onClick={avanzar} style={{
              fontFamily: FONT_BODY, fontSize: 14, fontWeight: 600, color: '#fff',
              background: GOLD_REF, border: 'none', borderRadius: 0, padding: '12px 28px', cursor: 'pointer',
            }}>
              {idx + 1 < conceptos.length ? 'Siguiente' : 'Completar'}
            </button>
          )}
        </div>
      </div>
    </Shell>
  );
}

/* ─── DESLIZA (swipe) ─── */

export function Desliza({ paso, onComplete }) {
  const { escenas } = paso;
  const [idx, setIdx] = useState(0);
  const [seleccion, setSeleccion] = useState(null);
  const [revelada, setRevelada] = useState(false);
  const [aciertos, setAciertos] = useState(0);
  const escena = escenas[idx];

  function elegir(temp) {
    if (revelada) return;
    setSeleccion(temp);
    setRevelada(true);
    if (temp === escena.respuesta) setAciertos((a) => a + 1);
  }

  function avanzar() {
    if (idx + 1 < escenas.length) {
      setIdx((i) => i + 1);
      setSeleccion(null);
      setRevelada(false);
    } else {
      onComplete({ aciertos, total: escenas.length });
    }
  }

  return (
    <Shell titulo={paso.titulo} actual={idx + 1} total={escenas.length}>
      <div style={tarjeta}>
        <p style={{ fontFamily: FONT_BODY, fontSize: 16, color: NAVY, lineHeight: 1.6, margin: '0 0 22px', fontStyle: 'italic' }}>
          «{escena.texto}»
        </p>
        <p style={{ fontFamily: FONT_BODY, fontSize: 13, color: MUTED, margin: '0 0 12px' }}>
          ¿Qué temperamento describe esta escena?
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10 }}>
          {escena.opciones.map((t) => {
            const sel = seleccion === t;
            const esCorrecto = t === escena.respuesta;
            let bg = BEIGE;
            let border = `1.5px solid ${LINE}`;
            let color = NAVY;
            if (revelada && esCorrecto) { bg = '#ecfdf5'; border = '1.5px solid #10b981'; color = '#065f46'; }
            else if (revelada && sel && !esCorrecto) { bg = '#fef2f2'; border = '1.5px solid #ef4444'; color = '#991b1b'; }
            else if (sel) { bg = 'rgba(165,139,38,0.10)'; border = `1.5px solid ${GOLD_REF}`; }
            return (
              <button key={t} type="button" onClick={() => elegir(t)} disabled={revelada} style={{
                fontFamily: FONT_SLAB, fontSize: 16, fontWeight: 700, color, background: bg,
                border, borderRadius: 0, padding: '18px 14px', cursor: revelada ? 'default' : 'pointer',
                textAlign: 'center', transition: 'all 150ms ease',
                borderLeft: `4px solid ${TEMP_COLORS[t] ?? LINE}`,
              }}>
                {TEMP_NOMBRE[t]}
              </button>
            );
          })}
        </div>
        {revelada && (
          <div style={{ marginTop: 18, display: 'flex', justifyContent: 'flex-end' }}>
            <button type="button" onClick={avanzar} style={{
              fontFamily: FONT_BODY, fontSize: 14, fontWeight: 600, color: '#fff',
              background: GOLD_REF, border: 'none', borderRadius: 0, padding: '12px 28px', cursor: 'pointer',
            }}>
              {idx + 1 < escenas.length ? 'Siguiente' : 'Completar'}
            </button>
          </div>
        )}
      </div>
    </Shell>
  );
}

/* ─── IDENTIFICA (diagrama + preguntas) ─── */

function DiagramaVirtudes() {
  const virtudes = [
    { nombre: 'Prudencia', pasivo: 'Deliberación', activo: 'Decisión' },
    { nombre: 'Fortaleza', pasivo: 'Resistencia', activo: 'Audacia' },
    { nombre: 'Dominio de sí', pasivo: 'Sometimiento malas emociones', activo: 'Estímulo buenas emociones' },
    { nombre: 'Justicia', pasivo: 'Comunión', activo: 'Bien común' },
    { nombre: 'Magnanimidad', pasivo: 'Contemplación', activo: 'Acción' },
    { nombre: 'Humildad', pasivo: 'Conocimiento propio', activo: 'Servicio a los demás' },
  ];
  return (
    <div style={{ overflowX: 'auto', marginBottom: 18 }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: FONT_BODY, fontSize: 13 }}>
        <thead>
          <tr>
            <th style={{ padding: '8px 10px', borderBottom: `2px solid ${LINE}`, color: MUTED, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: 'left' }}>Virtud</th>
            <th style={{ padding: '8px 10px', borderBottom: `2px solid ${LINE}`, color: MUTED, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: 'left' }}>Pasivo</th>
            <th style={{ padding: '8px 10px', borderBottom: `2px solid ${LINE}`, color: MUTED, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: 'left' }}>Activo</th>
          </tr>
        </thead>
        <tbody>
          {virtudes.map((v) => (
            <tr key={v.nombre}>
              <td style={{ padding: '8px 10px', borderBottom: `1px solid ${LINE}`, fontWeight: 700, color: NAVY }}>{v.nombre}</td>
              <td style={{ padding: '8px 10px', borderBottom: `1px solid ${LINE}`, color: MUTED }}>{v.pasivo}</td>
              <td style={{ padding: '8px 10px', borderBottom: `1px solid ${LINE}`, color: MUTED }}>{v.activo}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function Identifica({ paso, onComplete }) {
  const { preguntas } = paso;
  const [idx, setIdx] = useState(0);
  const [seleccion, setSeleccion] = useState(null);
  const [revelada, setRevelada] = useState(false);
  const [aciertos, setAciertos] = useState(0);
  const preg = preguntas[idx];

  function elegir(i) {
    if (revelada) return;
    setSeleccion(i);
    setRevelada(true);
    if (i === preg.correcta) setAciertos((a) => a + 1);
  }

  function avanzar() {
    if (idx + 1 < preguntas.length) {
      setIdx((i) => i + 1);
      setSeleccion(null);
      setRevelada(false);
    } else {
      onComplete({ aciertos, total: preguntas.length });
    }
  }

  return (
    <Shell titulo={paso.titulo} actual={idx + 1} total={preguntas.length}>
      <div style={tarjeta}>
        <DiagramaVirtudes />
        <p style={{ fontFamily: FONT_SLAB, fontSize: 16, fontWeight: 700, color: NAVY, margin: '0 0 14px', lineHeight: 1.4 }}>
          {preg.texto}
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10 }}>
          {preg.opciones.map((op, i) => (
            <BotonOpcion key={i} texto={op} seleccionada={seleccion === i}
              correcta={i === preg.correcta} revelada={revelada} onClick={() => elegir(i)} />
          ))}
        </div>
        {revelada && (
          <div style={{ marginTop: 18, display: 'flex', justifyContent: 'flex-end' }}>
            <button type="button" onClick={avanzar} style={{
              fontFamily: FONT_BODY, fontSize: 14, fontWeight: 600, color: '#fff',
              background: GOLD_REF, border: 'none', borderRadius: 0, padding: '12px 28px', cursor: 'pointer',
            }}>
              {idx + 1 < preguntas.length ? 'Siguiente' : 'Completar'}
            </button>
          </div>
        )}
      </div>
    </Shell>
  );
}

/* ─── TEST PROFUNDO (preguntas abiertas) ─── */

export function TestProfundo({ paso, onComplete }) {
  const total = paso.num_preguntas;
  const [idx, setIdx] = useState(0);
  const [respuestas, setRespuestas] = useState(() => Array(total).fill(''));

  function avanzar() {
    if (idx + 1 < total) {
      setIdx((i) => i + 1);
    } else {
      onComplete({ respuestas });
    }
  }

  return (
    <Shell titulo={paso.titulo} actual={idx + 1} total={total}>
      <div style={tarjeta}>
        <p style={{ fontFamily: FONT_BODY, fontSize: 13, color: MUTED, margin: '0 0 8px' }}>
          {paso.foco}
        </p>
        <p style={{ fontFamily: FONT_SLAB, fontSize: 16, fontWeight: 700, color: NAVY, margin: '0 0 14px', lineHeight: 1.4 }}>
          Pregunta {idx + 1}
        </p>
        <textarea
          value={respuestas[idx]}
          onChange={(e) => setRespuestas((prev) => { const n = [...prev]; n[idx] = e.target.value; return n; })}
          placeholder="Escribe tu reflexión..."
          style={{
            fontFamily: FONT_BODY, fontSize: 14, color: NAVY, background: BEIGE,
            border: `1px solid ${LINE}`, borderRadius: 0, padding: '12px 14px',
            width: '100%', minHeight: 120, resize: 'vertical', outline: 'none',
          }}
        />
        <div style={{ marginTop: 18, display: 'flex', justifyContent: 'flex-end' }}>
          <button type="button" onClick={avanzar} disabled={!respuestas[idx]?.trim()} style={{
            fontFamily: FONT_BODY, fontSize: 14, fontWeight: 600, color: '#fff',
            background: respuestas[idx]?.trim() ? GOLD_REF : LINE, border: 'none', borderRadius: 0,
            padding: '12px 28px', cursor: respuestas[idx]?.trim() ? 'pointer' : 'default',
          }}>
            {idx + 1 < total ? 'Siguiente' : 'Completar'}
          </button>
        </div>
      </div>
    </Shell>
  );
}

/* ─── CIERRE / SÍNTESIS ─── */

export function Sintesis({ paso, temperamento, onComplete }) {
  const map = paso.sintesis?.virtud_desafio_map ?? {};
  const virtudDesafio = map[temperamento?.primary] ?? '';
  const [datos, setDatos] = useState({
    lo_que_facilita: '',
    lo_que_cuesta: '',
    proposito: '',
  });

  function guardar() {
    onComplete({
      temperamento_primario: temperamento?.primary,
      temperamento_secundario: temperamento?.secondary,
      virtud_desafio: virtudDesafio,
      ...datos,
    });
  }

  const TEMP_NOMBRE_LOCAL = { COL: 'Colérico', MEL: 'Melancólico', SAN: 'Sanguíneo', FLE: 'Flemático' };

  return (
    <div style={{ maxWidth: 680, margin: '0 auto' }}>
      <div style={eyebrow}>Mi Síntesis</div>
      <div style={{ ...tarjeta, marginTop: 12 }}>
        <h2 style={{ fontFamily: FONT_SLAB, fontSize: 22, fontWeight: 700, color: NAVY, margin: '0 0 18px' }}>
          Conclusiones del Módulo 1
        </h2>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 14, marginBottom: 20 }}>
          <div style={{ padding: 14, background: BEIGE, borderLeft: `3px solid ${TEMP_COLORS[temperamento?.primary] ?? LINE}` }}>
            <div style={{ fontFamily: FONT_BODY, fontSize: 11, color: MUTED, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Temperamento primario</div>
            <div style={{ fontFamily: FONT_SLAB, fontSize: 18, fontWeight: 700, color: NAVY, marginTop: 4 }}>
              {TEMP_NOMBRE_LOCAL[temperamento?.primary] ?? '—'}
            </div>
          </div>
          <div style={{ padding: 14, background: BEIGE, borderLeft: `3px solid ${TEMP_COLORS[temperamento?.secondary] ?? LINE}` }}>
            <div style={{ fontFamily: FONT_BODY, fontSize: 11, color: MUTED, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Temperamento secundario</div>
            <div style={{ fontFamily: FONT_SLAB, fontSize: 18, fontWeight: 700, color: NAVY, marginTop: 4 }}>
              {TEMP_NOMBRE_LOCAL[temperamento?.secondary] ?? '—'}
            </div>
          </div>
        </div>

        <div style={{ padding: 14, background: `linear-gradient(135deg, ${BEIGE}, rgba(165,139,38,0.08))`, borderLeft: `3px solid ${GOLD_REF}`, marginBottom: 20 }}>
          <div style={{ fontFamily: FONT_BODY, fontSize: 11, color: MUTED, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Tu virtud-desafío</div>
          <div style={{ fontFamily: FONT_SLAB, fontSize: 20, fontWeight: 700, color: GOLD_REF_DK, marginTop: 4 }}>
            {virtudDesafio || '—'}
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <label style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <span style={{ fontFamily: FONT_BODY, fontSize: 13, fontWeight: 600, color: NAVY }}>Lo que mi temperamento me facilita</span>
            <input type="text" value={datos.lo_que_facilita} onChange={(e) => setDatos((d) => ({ ...d, lo_que_facilita: e.target.value }))}
              placeholder="Una frase..." style={{
                fontFamily: FONT_BODY, fontSize: 14, padding: '10px 12px', border: `1px solid ${LINE}`,
                borderRadius: 0, outline: 'none', width: '100%', background: '#fff',
              }} />
          </label>
          <label style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <span style={{ fontFamily: FONT_BODY, fontSize: 13, fontWeight: 600, color: NAVY }}>Lo que más me cuesta</span>
            <input type="text" value={datos.lo_que_cuesta} onChange={(e) => setDatos((d) => ({ ...d, lo_que_cuesta: e.target.value }))}
              placeholder="Una frase..." style={{
                fontFamily: FONT_BODY, fontSize: 14, padding: '10px 12px', border: `1px solid ${LINE}`,
                borderRadius: 0, outline: 'none', width: '100%', background: '#fff',
              }} />
          </label>
          <label style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <span style={{ fontFamily: FONT_BODY, fontSize: 13, fontWeight: 600, color: NAVY }}>Mi propósito para las próximas semanas</span>
            <textarea value={datos.proposito} onChange={(e) => setDatos((d) => ({ ...d, proposito: e.target.value }))}
              placeholder="Escribe tu propósito..." style={{
                fontFamily: FONT_BODY, fontSize: 14, padding: '10px 12px', border: `1px solid ${LINE}`,
                borderRadius: 0, outline: 'none', width: '100%', minHeight: 80, resize: 'vertical', background: '#fff',
              }} />
          </label>
        </div>

        <div style={{ marginTop: 22, display: 'flex', justifyContent: 'flex-end' }}>
          <button type="button" onClick={guardar}
            disabled={!datos.lo_que_facilita.trim() || !datos.lo_que_cuesta.trim() || !datos.proposito.trim()}
            style={{
              fontFamily: FONT_BODY, fontSize: 15, fontWeight: 600, color: '#fff',
              background: (datos.lo_que_facilita.trim() && datos.lo_que_cuesta.trim() && datos.proposito.trim()) ? GOLD_REF : LINE,
              border: 'none', borderRadius: 0, padding: '14px 32px',
              cursor: (datos.lo_que_facilita.trim() && datos.lo_que_cuesta.trim() && datos.proposito.trim()) ? 'pointer' : 'default',
            }}>
            Completar módulo
          </button>
        </div>
      </div>
    </div>
  );
}
