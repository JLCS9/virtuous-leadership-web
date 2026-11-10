// Componentes interactivos para las actividades entre vídeos del módulo.
// Quiz, Define, Desliza, Identifica — todos comparten el mismo shell (título + barra progreso).
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { NAVY, MUTED, GOLD_REF, GOLD_REF_DK, GOLD_REF_LT, LINE, PAPER, FONT_SLAB, FONT_BODY, BEIGE, TEMP_COLORS } from '../theme';
import { barraFondo, eyebrow, tarjeta } from '../app/estilos';
import diagramaVirtudesImg from './diagrama-virtudes.png';
import diagramaCOL from './diagrama-COL.png';
import diagramaMEL from './diagrama-MEL.png';
import diagramaSAN from './diagrama-SAN.png';
import diagramaFLE from './diagrama-FLE.png';
import diagramaTemperamentosImg from './diagrama-magnanimidad-temperamentos.jpg';
import retratoCOL from './assets/retrato-COL.jpg';
import retratoMEL from './assets/retrato-MEL.jpg';
import retratoSAN from './assets/retrato-SAN.jpg';
import retratoFLE from './assets/retrato-FLE.jpg';
import retratoTEMP from './assets/retrato-TEMP.jpg';
import retratoCaracter from './assets/retrato-caracter.jpg';
import retratoPrudencia from './assets/retrato-prudencia.jpg';
import retratoFortaleza from './assets/retrato-fortaleza.jpg';
import retratoDominio from './assets/retrato-dominio.jpg';
import retratoJusticia from './assets/retrato-justicia.jpg';
import retratoMagnanimidad from './assets/retrato-magnanimidad.jpg';
import piramidaImg from '../assets/piramida ES.png';
import piramideViciosImg from './piramide-virtudes-vicios.png';
import piramideLVImg from './piramide-liderazgo-virtuoso.png';
import { PREGUNTAS, TEMPS, NO_SE } from '../lib/personas';
import CHARACTER_TEST from '../data/character-test.json';
import CHARACTER_SUPPORT from '../data/character-support-text.json';
import { scoreCharacter } from '../lib/characterScoring';
import HEART_TEST from '../data/heart-test.json';
import HEART_SUPPORT from '../data/heart-support-text.json';
import { scoreHeart, HEART_DISORDER_CODES } from '../lib/heartScoring';
import { saveCharacterResultIfLoggedIn, saveHeartResultIfLoggedIn } from '../account/account';
import heartFaceR from '../assets/heart-disorder-R.jpeg';
import heartFaceVR from '../assets/heart-disorder-VR.jpeg';
import heartFaceVM from '../assets/heart-disorder-VM.jpeg';
import heartFaceVI from '../assets/heart-disorder-VI.jpeg';
import heartFaceVC from '../assets/heart-disorder-VC.jpeg';
import heartFaceSV from '../assets/heart-disorder-SV.jpeg';
import heartFaceSI from '../assets/heart-disorder-SI.jpeg';
import heartFaceSC from '../assets/heart-disorder-SC.jpeg';
import faceP from '../assets/Pastorelle.jpg.jpeg';
import faceC from '../assets/Courage.jpg.jpeg';
import faceS from '../assets/Judith.jpg.jpeg';
import faceJ from '../assets/Judith.jpg.jpeg';
import faceM from '../assets/Paul.jpg.jpeg';
import faceH from '../assets/Jean.jpg.jpeg';

const DIAGRAMA_TEMP = { COL: diagramaCOL, MEL: diagramaMEL, SAN: diagramaSAN, FLE: diagramaFLE };

const IconoLupa = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ flexShrink: 0 }}>
    <circle cx="10.5" cy="10.5" r="7" /><path d="m21 21-5.2-5.2" />
  </svg>
);
const TEMP_SUBTITULO = { COL: 'la acción', MEL: 'las ideas', SAN: 'las personas', FLE: 'la paz' };
const RETRATO_TEMP = { COL: retratoCOL, MEL: retratoMEL, SAN: retratoSAN, FLE: retratoFLE };
const CONCEPTO_A_RETRATO = { 'Temperamento': retratoTEMP, 'Temperamento colérico': retratoCOL, 'Temperamento melancólico': retratoMEL, 'Temperamento sanguíneo': retratoSAN, 'Temperamento flemático': retratoFLE, 'Carácter': retratoCaracter, 'Prudencia': retratoPrudencia, 'Fortaleza': retratoFortaleza, 'Dominio de sí': retratoDominio, 'Justicia': retratoJusticia, 'Magnanimidad': retratoMagnanimidad };

const TEMP_NOMBRE = { COL: 'Colérico', MEL: 'Melancólico', SAN: 'Sanguíneo', FLE: 'Flemático' };

if (typeof document !== 'undefined' && !document.getElementById('autoguardado-css')) {
  const s = document.createElement('style');
  s.id = 'autoguardado-css';
  s.textContent = '@keyframes fadeInCheck{from{opacity:0;transform:scale(0.8)}to{opacity:1;transform:scale(1)}}';
  document.head.appendChild(s);
}

function useAutoguardado(guardarFn, datos, delay = 5000) {
  const [guardados, setGuardados] = useState({});
  const timerRef = useRef(null);
  const prevRef = useRef(datos);

  useEffect(() => {
    const prev = prevRef.current;
    prevRef.current = datos;
    const cambiados = [];
    if (typeof datos === 'object' && datos !== null && !Array.isArray(datos)) {
      for (const k of Object.keys(datos)) {
        if (JSON.stringify(datos[k]) !== JSON.stringify(prev?.[k])) cambiados.push(k);
      }
    } else if (Array.isArray(datos)) {
      datos.forEach((v, i) => { if (v !== prev?.[i]) cambiados.push(String(i)); });
    }
    if (cambiados.length === 0) return;
    cambiados.forEach(k => setGuardados(g => { const n = { ...g }; delete n[k]; return n; }));
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      guardarFn(datos);
      cambiados.forEach(k => setGuardados(g => ({ ...g, [k]: Date.now() })));
    }, delay);
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [datos, delay, guardarFn]);

  return guardados;
}

function CheckGuardado({ campo, guardados }) {
  const ts = guardados[campo];
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    if (!ts) { setVisible(false); return; }
    setVisible(true);
    const t = setTimeout(() => setVisible(false), 3000);
    return () => clearTimeout(t);
  }, [ts]);
  if (!visible) return null;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 4,
      fontFamily: FONT_BODY, fontSize: 12, color: '#10b981', fontWeight: 600,
      animation: 'fadeInCheck 300ms ease forwards',
    }}>
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M3 7l3 3 5-5" stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
      Guardado
    </span>
  );
}

function Shell({ titulo, actual, total, children }) {
  const pct = total > 0 ? Math.round(((actual) / total) * 100) : 0;
  return (
    <div style={{ maxWidth: 860, margin: '0 auto' }}>
      <div style={{ ...eyebrow, fontSize: 13 }}>{titulo}</div>
      <div style={{ ...barraFondo, margin: '12px 0 8px', height: 7 }}>
        <div style={{ height: '100%', width: `${pct}%`, background: GOLD_REF_DK, transition: 'width 400ms ease' }} />
      </div>
      <div style={{ fontFamily: FONT_BODY, fontSize: 17, color: MUTED, marginBottom: 28 }}>{actual} de {total}</div>
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
      fontFamily: FONT_BODY, fontSize: 20, lineHeight: 1.55, color, background: bg,
      border, borderRadius: 0, padding: '20px 26px', cursor: revelada ? 'default' : 'pointer',
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

const CARATULA_TEXTOS = {
  quiz: { icono: '?', tipo: 'Cuestionario', desc: 'Responde a unas preguntas para poner a prueba lo que has aprendido en este módulo y afianzar los conceptos clave.' },
  define: { icono: '✦', tipo: 'Definiciones y conceptos', desc: 'Selecciona todas las palabras que definen cada concepto. Para conseguir la máxima puntuación, debes escoger todas las palabras correctas.' },
  desliza: { icono: '↔', tipo: 'Identifica temperamentos', desc: 'Lee cada escena y asocia el temperamento que mejor encaja.' },
  identifica: { icono: '◉', tipo: 'Diagrama de virtudes', desc: 'Reflexiona sobre las virtudes y cómo se manifiestan en tu vida.' },
  test_profundo: { icono: '◇', tipo: 'Autoexamen profundo', desc: 'Reflexiona con sinceridad sobre estas preguntas. No hay respuestas correctas ni incorrectas: este ejercicio es para tu crecimiento personal.' },
  retos_temperamento: { icono: '✶', tipo: 'Los retos de mi temperamento', desc: 'Descubre qué aspectos de las virtudes te facilita y te dificulta tu temperamento, y cuál es tu virtud-desafío: la virtud que más necesitas trabajar a lo largo de tu vida.' },
  test_caracter: { icono: '◈', tipo: 'Test de carácter', desc: 'Evalúa tu nivel actual en las seis virtudes del liderazgo: prudencia, valor, autocontrol, justicia, magnanimidad y humildad.' },
  test_corazon: { icono: '♡', tipo: 'Test del corazón', desc: 'Evalúa la libertad de tu corazón. 32 preguntas sobre las ocho enfermedades espirituales que pueden afectar a la razón, la voluntad y el corazón.' },
  reflexion_piramide: { icono: '△', tipo: 'Reflexión', desc: 'Observa el diagrama y reflexiona sobre las relaciones entre las virtudes.' },
  temperamento_magnanimidad: { icono: '✶', tipo: 'Temperamento y magnanimidad', desc: 'Descubre cómo tu temperamento puede ayudarte a practicar la magnanimidad.' },
};

function Caratula({ paso, tipo, onEmpezar, modulo }) {
  const txt = CARATULA_TEXTOS[tipo] ?? { icono: '●', tipo: 'Ejercicio', desc: '' };
  return (
    <div style={{ maxWidth: 860, margin: '0 auto' }}>
      <div style={tarjeta}>
        <div style={{ textAlign: 'center', padding: '20px 0 10px' }}>
          <span style={{
            display: 'inline-grid', placeItems: 'center', width: 64, height: 64, borderRadius: '50%',
            background: BEIGE, border: `2px solid ${GOLD_REF}`,
            fontFamily: FONT_SLAB, fontSize: 28, fontWeight: 700, color: GOLD_REF_DK,
          }}>{txt.icono}</span>
        </div>
        {modulo != null && (
          <div style={{ textAlign: 'center', marginTop: 16 }}>
            <div style={{ ...eyebrow, display: 'inline-block' }}>Módulo {modulo}</div>
          </div>
        )}
        <h2 style={{ fontFamily: FONT_SLAB, fontSize: 28, fontWeight: 700, color: NAVY, margin: '12px 0 14px', textAlign: 'center', lineHeight: 1.3 }}>
          {txt.tipo}
        </h2>
        <div style={{ fontFamily: FONT_BODY, fontSize: 17, color: MUTED, lineHeight: 1.7, textAlign: 'center', maxWidth: 520, margin: '0 auto 8px' }}>
          {(paso.descripcion ?? txt.desc).split('\n\n').map((p, i) => (
            <p key={i} style={{ margin: i === 0 ? 0 : '12px 0 0' }}>{p}</p>
          ))}
        </div>
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: 28, marginBottom: 8 }}>
          <button type="button" onClick={onEmpezar} style={{
            fontFamily: FONT_BODY, fontSize: 19, fontWeight: 600, color: '#fff',
            background: GOLD_REF, border: 'none', borderRadius: 0, padding: '18px 48px', cursor: 'pointer',
          }}>
            Empezar →
          </button>
        </div>
      </div>
    </div>
  );
}

function Conclusion({ titulo, aciertos, total, onReintentar, onContinuar, nota, requiereAprobado }) {
  const pct = total > 0 ? Math.round((aciertos / total) * 100) : 0;
  const perfecto = pct === 100;
  const bueno = pct >= 70;
  const aprobado = pct >= 70;
  const bloqueado = requiereAprobado && !aprobado;

  return (
    <div style={{ maxWidth: 860, margin: '0 auto' }}>
      <div style={tarjeta}>
        <div style={{ textAlign: 'center', padding: '12px 0 8px' }}>
          <span style={{
            display: 'inline-grid', placeItems: 'center', width: 72, height: 72, borderRadius: '50%',
            background: perfecto ? '#ecfdf5' : bueno ? '#fef7ed' : '#fef2f2',
            border: `2px solid ${perfecto ? '#10b981' : bueno ? '#f59e0b' : '#ef4444'}`,
            fontFamily: FONT_SLAB, fontSize: 28, fontWeight: 700,
            color: perfecto ? '#065f46' : bueno ? '#92400e' : '#991b1b',
          }}>
            {pct}%
          </span>
        </div>
        <h2 style={{ fontFamily: FONT_SLAB, fontSize: 26, fontWeight: 700, color: NAVY, margin: '14px 0 8px', textAlign: 'center', lineHeight: 1.3 }}>
          {perfecto ? 'Perfecto' : bueno ? 'Buen trabajo' : 'Sigue practicando'}
        </h2>
        <p style={{ fontFamily: FONT_BODY, fontSize: 17, color: MUTED, lineHeight: 1.6, textAlign: 'center', margin: '0 auto 6px', maxWidth: 480 }}>
          Has acertado <strong style={{ color: NAVY }}>{aciertos} de {total}</strong> en {titulo}.
        </p>
        {bloqueado && (
          <p style={{ fontFamily: FONT_BODY, fontSize: 15, color: '#991b1b', textAlign: 'center', margin: '8px 0 0', lineHeight: 1.5 }}>
            Necesitas al menos un 70% de aciertos para continuar. Inténtalo de nuevo.
          </p>
        )}
        {!perfecto && !bloqueado && (
          <p style={{ fontFamily: FONT_BODY, fontSize: 15, color: MUTED, textAlign: 'center', margin: '8px 0 0', lineHeight: 1.5 }}>
            Puedes volver a intentarlo para mejorar tu puntuación.
          </p>
        )}
        {nota && (
          <p style={{ fontFamily: FONT_BODY, fontSize: 13, color: MUTED, textAlign: 'center', margin: '8px 0 0', fontStyle: 'italic' }}>
            {nota}
          </p>
        )}
        <div style={{ display: 'flex', justifyContent: 'center', gap: 14, marginTop: 28, marginBottom: 8, flexWrap: 'wrap' }}>
          {!perfecto && (
            <button type="button" onClick={onReintentar} style={{
              fontFamily: FONT_BODY, fontSize: 17, fontWeight: 600, color: bloqueado ? '#fff' : NAVY,
              background: bloqueado ? GOLD_REF : BEIGE, border: bloqueado ? 'none' : `1.5px solid ${LINE}`, borderRadius: 0,
              padding: bloqueado ? '18px 40px' : '16px 32px', cursor: 'pointer',
            }}>
              Reintentar
            </button>
          )}
          {!bloqueado && (
            <button type="button" onClick={onContinuar} style={{
              fontFamily: FONT_BODY, fontSize: 19, fontWeight: 600, color: '#fff',
              background: GOLD_REF, border: 'none', borderRadius: 0, padding: '18px 40px', cursor: 'pointer',
            }}>
              Continuar →
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export function Quiz({ paso, onComplete, modulo }) {
  const { preguntas } = paso;
  const [fase, setFase] = useState('caratula');
  const [idx, setIdx] = useState(0);
  const [seleccion, setSeleccion] = useState(null);
  const [revelada, setRevelada] = useState(false);
  const [aciertos, setAciertos] = useState(0);
  const [verRueda, setVerRueda] = useState(false);
  const ordenRef = useRef({});
  const respuestasRef = useRef([]);

  if (fase === 'caratula') return <Caratula paso={paso} tipo="quiz" modulo={modulo} onEmpezar={() => setFase('ejercicio')} />;

  if (fase === 'conclusion') return <Conclusion
    titulo="cuestionario" aciertos={aciertos} total={preguntas.length} requiereAprobado
    onReintentar={() => { setFase('ejercicio'); setIdx(0); setSeleccion(null); setRevelada(false); setAciertos(0); ordenRef.current = {}; respuestasRef.current = []; }}
    onContinuar={() => onComplete({ aciertos, total: preguntas.length })}
  />;

  const preg = preguntas[idx];
  if (!ordenRef.current[idx]) ordenRef.current[idx] = shuffleIndices(preg.opciones.length);
  const orden = ordenRef.current[idx];

  function elegir(originalIdx) {
    if (revelada) return;
    setSeleccion(originalIdx);
    setRevelada(true);
    respuestasRef.current[idx] = originalIdx;
    if (originalIdx === preg.correcta) setAciertos((a) => a + 1);
  }

  function avanzar() {
    if (idx + 1 < preguntas.length) {
      const next = idx + 1;
      setIdx(next);
      const prev = respuestasRef.current[next];
      if (prev != null) {
        setSeleccion(prev);
        setRevelada(true);
      } else {
        setSeleccion(null);
        setRevelada(false);
      }
    } else {
      setFase('conclusion');
    }
  }

  function retroceder() {
    const prev = idx - 1;
    setIdx(prev);
    setSeleccion(respuestasRef.current[prev]);
    setRevelada(true);
  }

  return (
    <Shell titulo="Cuestionario" actual={idx + 1} total={preguntas.length}>
      <div style={tarjeta}>
        <p style={{ fontFamily: FONT_BODY, fontSize: 15, color: MUTED, margin: '0 0 16px', lineHeight: 1.5 }}>
          Responde las siguientes preguntas del cuestionario.
        </p>
        <p style={{ fontFamily: FONT_SLAB, fontSize: 26, fontWeight: 700, color: NAVY, margin: '0 0 24px', lineHeight: 1.4 }}>
          {preg.texto}
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {orden.map((origIdx) => (
            <BotonOpcion key={origIdx} texto={preg.opciones[origIdx]} seleccionada={seleccion === origIdx}
              correcta={origIdx === preg.correcta} revelada={revelada} onClick={() => elegir(origIdx)} />
          ))}
        </div>
        {paso.diagrama_temperamentos && (
          <div style={{ marginTop: 20 }}>
            <button type="button" onClick={() => setVerRueda(v => !v)} style={{
              background: 'none', border: 'none', padding: 0, cursor: 'pointer',
              fontFamily: FONT_BODY, fontSize: 13, fontWeight: 600, color: GOLD_REF_DK,
              display: 'flex', alignItems: 'center', gap: 5,
              textDecoration: 'underline', textUnderlineOffset: 3,
            }}>
              <IconoLupa />
              {verRueda ? 'Ocultar rueda de temperamentos' : 'Ver rueda de los temperamentos'}
            </button>
            {verRueda && (
              <div style={{ marginTop: 14, textAlign: 'center' }}>
                <img src={diagramaTemperamentosImg} alt="Diagrama de los 4 temperamentos" style={{ width: '100%', maxWidth: 360, height: 'auto' }} />
              </div>
            )}
          </div>
        )}
        {revelada && (
          <div style={{ marginTop: 22, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            {idx > 0 ? (
              <button type="button" onClick={retroceder} style={{
                fontFamily: FONT_BODY, fontSize: 15, fontWeight: 600, color: MUTED,
                background: 'none', border: `1.5px solid ${LINE}`, borderRadius: 0, padding: '14px 24px', cursor: 'pointer',
              }}>
                ← Anterior
              </button>
            ) : <span />}
            <button type="button" onClick={avanzar} style={{
              fontFamily: FONT_BODY, fontSize: 19, fontWeight: 600, color: '#fff',
              background: GOLD_REF, border: 'none', borderRadius: 0, padding: '17px 38px', cursor: 'pointer',
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

export function Define({ paso, onComplete, modulo }) {
  const { conceptos } = paso;
  const totalPalabras = conceptos.reduce((sum, c) => sum + c.correctas.length, 0);
  const [fase, setFase] = useState('caratula');
  const [idx, setIdx] = useState(0);
  const [seleccionadas, setSeleccionadas] = useState(new Set());
  const [revelado, setRevelado] = useState(false);
  const [aciertos, setAciertos] = useState(0);
  const poolRef = useRef(null);
  const historialRef = useRef([]);
  const [viendo, setViendo] = useState(null);

  if (fase === 'caratula') return <Caratula paso={paso} tipo="define" modulo={modulo} onEmpezar={() => setFase('ejercicio')} />;

  if (fase === 'conclusion') return <Conclusion
    titulo="definiciones" aciertos={aciertos} total={totalPalabras} requiereAprobado
    nota="Para conseguir la máxima puntuación en cada concepto, debes seleccionar todas las palabras correctas."
    onReintentar={() => { setFase('ejercicio'); setIdx(0); setSeleccionadas(new Set()); setRevelado(false); setAciertos(0); poolRef.current = null; historialRef.current = []; setViendo(null); }}
    onContinuar={() => onComplete({ aciertos, total: totalPalabras })}
  />;

  if (viendo !== null) {
    const h = historialRef.current[viendo];
    const cpt = conceptos[viendo];
    const correctasH = new Set(cpt.correctas);
    const bien = [...h.seleccionadas].filter((p) => correctasH.has(p)).length;
    const mal = [...h.seleccionadas].filter((p) => !correctasH.has(p)).length;
    const perfecto = bien === cpt.correctas.length && mal === 0;
    const faltantesH = cpt.correctas.filter(p => !h.seleccionadas.has(p));
    return (
      <Shell titulo="Definiciones y conceptos" actual={viendo + 1} total={conceptos.length}>
        <div style={tarjeta}>
          <p style={{ fontFamily: FONT_BODY, fontSize: 18, color: MUTED, margin: '0 0 4px' }}>
            Selecciona todas las palabras que definen el siguiente concepto:
          </p>
          <p style={{ fontFamily: FONT_SLAB, fontSize: 28, fontWeight: 700, color: NAVY, margin: '0 0 22px' }}>
            {cpt.concepto}
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
            {h.pool.map((p) => {
              const sel = h.seleccionadas.has(p);
              const esCorrecta = correctasH.has(p);
              let bg = BEIGE; let border = `1.5px solid ${LINE}`; let color = NAVY;
              if (esCorrecta && sel) { bg = '#ecfdf5'; border = '1.5px solid #10b981'; color = '#065f46'; }
              else if (esCorrecta && !sel) { bg = '#fef7ed'; border = '1.5px dashed #f59e0b'; color = '#92400e'; }
              else if (sel && !esCorrecta) { bg = '#fef2f2'; border = '1.5px solid #ef4444'; color = '#991b1b'; }
              return (
                <button key={p} type="button" disabled style={{
                  fontFamily: FONT_BODY, fontSize: 20, fontWeight: 500, color, background: bg,
                  border, borderRadius: 0, padding: '14px 22px', cursor: 'default', transition: 'all 150ms ease',
                }}>{p}</button>
              );
            })}
          </div>
          <p style={{ fontFamily: FONT_BODY, fontSize: 15, fontWeight: 600, margin: '18px 0 8px', color: perfecto ? '#065f46' : '#92400e' }}>
            {perfecto ? 'Correcto.' : faltantesH.length > 0
              ? <>Te ha faltado: <strong>{faltantesH.join(', ')}</strong>.</>
              : 'Has marcado alguna palabra de más.'}
          </p>
          {cpt.definicion && (
            <div style={{ padding: '16px 20px', background: BEIGE, borderLeft: `3px solid ${GOLD_REF}`, lineHeight: 1.6 }}>
              <div style={{ fontFamily: FONT_BODY, fontSize: 13, fontWeight: 700, color: MUTED, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6 }}>Definición</div>
              <p style={{ fontFamily: FONT_BODY, fontSize: 17, color: NAVY, margin: 0 }}><strong>{cpt.concepto}:</strong> {cpt.definicion}</p>
            </div>
          )}
          <div style={{ marginTop: 22, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            {viendo > 0 ? (
              <button type="button" onClick={() => setViendo(viendo - 1)} style={{
                background: 'none', border: 'none', padding: 0, cursor: 'pointer',
                fontFamily: FONT_BODY, fontSize: 14, fontWeight: 600, color: NAVY,
              }}>← Anterior</button>
            ) : <span />}
            <button type="button" onClick={() => setViendo(null)} style={{
              fontFamily: FONT_BODY, fontSize: 19, fontWeight: 600, color: '#fff',
              background: GOLD_REF, border: 'none', borderRadius: 0, padding: '17px 38px', cursor: 'pointer',
            }}>
              Volver a la pregunta actual
            </button>
          </div>
        </div>
      </Shell>
    );
  }

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
    setAciertos((a) => a + Math.max(0, bien - mal));
    historialRef.current[idx] = { seleccionadas: new Set(seleccionadas), pool: [...pool] };
  }

  function avanzar() {
    if (idx + 1 < conceptos.length) {
      setIdx((i) => i + 1);
      setSeleccionadas(new Set());
      setRevelado(false);
      poolRef.current = null;
    } else {
      setFase('conclusion');
    }
  }

  const feedbackActual = revelado ? (() => {
    const bien = [...seleccionadas].filter((p) => correctasSet.has(p)).length;
    const mal = [...seleccionadas].filter((p) => !correctasSet.has(p)).length;
    const perfecto = bien === concepto.correctas.length && mal === 0;
    const faltantes = concepto.correctas.filter(p => !seleccionadas.has(p));
    const erroneas = [...seleccionadas].filter(p => !correctasSet.has(p));
    return { perfecto, faltantes, erroneas };
  })() : null;

  return (
    <Shell titulo="Definiciones y conceptos" actual={idx + 1} total={conceptos.length}>
      <div style={tarjeta}>
        {(() => {
          const ret = CONCEPTO_A_RETRATO[concepto.concepto];
          return (
            <div style={{ display: 'flex', gap: 22, alignItems: 'center', marginBottom: 22 }}>
              {ret && <img src={ret} alt={concepto.concepto} style={{ width: 150, height: 150, objectFit: 'cover', mixBlendMode: 'multiply', flexShrink: 0, borderRadius: 6 }} />}
              <div style={{ flex: 1 }}>
                <p style={{ fontFamily: FONT_BODY, fontSize: 18, color: MUTED, margin: '0 0 4px' }}>
                  Selecciona todas las palabras que definen el siguiente concepto:
                </p>
                <p style={{ fontFamily: FONT_SLAB, fontSize: 28, fontWeight: 700, color: NAVY, margin: 0 }}>
                  {concepto.concepto}
                </p>
              </div>
            </div>
          );
        })()}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
          {pool.map((p) => {
            const sel = seleccionadas.has(p);
            const esCorrecta = correctasSet.has(p);
            let bg = sel ? 'rgba(165,139,38,0.15)' : BEIGE;
            let border = sel ? `1.5px solid ${GOLD_REF}` : `1.5px solid ${LINE}`;
            let color = NAVY;
            if (revelado && esCorrecta && sel) { bg = '#ecfdf5'; border = '1.5px solid #10b981'; color = '#065f46'; }
            else if (revelado && esCorrecta && !sel) { bg = '#fef7ed'; border = '1.5px dashed #f59e0b'; color = '#92400e'; }
            else if (revelado && sel && !esCorrecta) { bg = '#fef2f2'; border = '1.5px solid #ef4444'; color = '#991b1b'; }
            return (
              <button key={p} type="button" onClick={() => toggle(p)} disabled={revelado} style={{
                fontFamily: FONT_BODY, fontSize: 20, fontWeight: 500, color, background: bg,
                border, borderRadius: 0, padding: '14px 22px', cursor: revelado ? 'default' : 'pointer',
                transition: 'all 150ms ease',
              }}>
                {p}
              </button>
            );
          })}
        </div>
        {feedbackActual && (
          <div style={{ margin: '18px 0 8px' }}>
            <p style={{ fontFamily: FONT_BODY, fontSize: 15, fontWeight: 600, margin: '0 0 6px', color: feedbackActual.perfecto ? '#065f46' : '#92400e' }}>
              {feedbackActual.perfecto ? 'Correcto.' : feedbackActual.faltantes.length > 0
                ? <>Te ha faltado: <strong>{feedbackActual.faltantes.join(', ')}</strong>.</>
                : null}
            </p>
            {feedbackActual.erroneas.length > 0 && (
              <p style={{ fontFamily: FONT_BODY, fontSize: 15, fontWeight: 600, margin: 0, color: '#991b1b' }}>
                Te has equivocado en: {feedbackActual.erroneas.map((e, i) => (
                  <span key={e}>{i > 0 && ', '}<strong>{e}</strong></span>
                ))}
                {' — '}no {feedbackActual.erroneas.length === 1 ? 'es una definición' : 'son definiciones'} de {concepto.concepto}.
              </p>
            )}
          </div>
        )}
        {revelado && concepto.definicion && (
          <div style={{ padding: '16px 20px', background: BEIGE, borderLeft: `3px solid ${GOLD_REF}`, lineHeight: 1.6, marginTop: 14 }}>
            <div style={{ fontFamily: FONT_BODY, fontSize: 13, fontWeight: 700, color: MUTED, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6 }}>Definición</div>
            <p style={{ fontFamily: FONT_BODY, fontSize: 17, color: NAVY, margin: 0 }}><strong>{concepto.concepto}:</strong> {concepto.definicion}</p>
          </div>
        )}
        <div style={{ marginTop: 22, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16 }}>
          {!revelado && (
            <p style={{ fontFamily: FONT_BODY, fontSize: 13, color: MUTED, margin: 0, fontStyle: 'italic', flex: 1 }}>
              Para conseguir la máxima puntuación, debes escoger todas las palabras correctas.
            </p>
          )}
          {revelado && idx > 0 ? (
            <button type="button" onClick={() => setViendo(idx - 1)} style={{
              background: 'none', border: 'none', padding: 0, cursor: 'pointer',
              fontFamily: FONT_BODY, fontSize: 14, fontWeight: 600, color: NAVY,
            }}>← Anterior</button>
          ) : revelado ? <span /> : null}
          {!revelado && (
            <button type="button" onClick={comprobar} disabled={seleccionadas.size === 0} style={{
              fontFamily: FONT_BODY, fontSize: 19, fontWeight: 600, color: '#fff',
              background: seleccionadas.size > 0 ? GOLD_REF : LINE, border: 'none', borderRadius: 0,
              padding: '17px 38px', cursor: seleccionadas.size > 0 ? 'pointer' : 'default',
              flexShrink: 0,
            }}>
              Comprobar
            </button>
          )}
          {revelado && (
            <button type="button" onClick={avanzar} style={{
              fontFamily: FONT_BODY, fontSize: 19, fontWeight: 600, color: '#fff',
              background: GOLD_REF, border: 'none', borderRadius: 0, padding: '17px 38px', cursor: 'pointer',
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

export function Desliza({ paso, onComplete, modulo }) {
  const { escenas } = paso;
  const [fase, setFase] = useState('caratula');
  const [idx, setIdx] = useState(0);
  const [seleccion, setSeleccion] = useState(null);
  const [revelada, setRevelada] = useState(false);
  const [aciertos, setAciertos] = useState(0);
  const [ordenEscenas] = useState(() => escenas.map(e => shuffle([...e.opciones])));

  if (fase === 'caratula') return <Caratula paso={paso} tipo="desliza" modulo={modulo} onEmpezar={() => setFase('ejercicio')} />;

  if (fase === 'conclusion') return <Conclusion
    titulo={paso.titulo} aciertos={aciertos} total={escenas.length}
    onReintentar={() => { setFase('ejercicio'); setIdx(0); setSeleccion(null); setRevelada(false); setAciertos(0); }}
    onContinuar={() => onComplete({ aciertos, total: escenas.length })}
  />;

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
      setFase('conclusion');
    }
  }

  return (
    <Shell titulo="Identifica temperamentos" actual={idx + 1} total={escenas.length}>
      <div style={tarjeta}>
        <p style={{ fontFamily: FONT_BODY, fontSize: 22, color: NAVY, lineHeight: 1.6, margin: '0 0 24px', fontStyle: 'italic' }}>
          «{escena.texto}»
        </p>
        <p style={{ fontFamily: FONT_BODY, fontSize: 18, color: MUTED, margin: '0 0 16px' }}>
          ¿Qué temperamento describe esta escena?
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
          {ordenEscenas[idx].map((t) => {
            const sel = seleccion === t;
            const esCorrecto = t === escena.respuesta;
            let bg = BEIGE;
            let borderColor = LINE;
            let color = NAVY;
            if (revelada && esCorrecto) { bg = '#ecfdf5'; borderColor = '#10b981'; color = '#065f46'; }
            else if (revelada && sel && !esCorrecto) { bg = '#fef2f2'; borderColor = '#ef4444'; color = '#991b1b'; }
            else if (sel) { bg = 'rgba(165,139,38,0.10)'; borderColor = GOLD_REF; }
            return (
              <button key={t} type="button" onClick={() => elegir(t)} disabled={revelada} style={{
                fontFamily: FONT_SLAB, fontSize: 22, fontWeight: 700, color, background: bg,
                borderTop: `1.5px solid ${borderColor}`, borderRight: `1.5px solid ${borderColor}`,
                borderBottom: `1.5px solid ${borderColor}`, borderLeft: `4px solid ${TEMP_COLORS[t] ?? LINE}`,
                borderRadius: 0, padding: '24px 20px', cursor: revelada ? 'default' : 'pointer',
                textAlign: 'center', transition: 'all 150ms ease',
              }}>
                {TEMP_NOMBRE[t]}
              </button>
            );
          })}
        </div>
        {revelada && (
          <div style={{ marginTop: 22, display: 'flex', justifyContent: 'flex-end' }}>
            <button type="button" onClick={avanzar} style={{
              fontFamily: FONT_BODY, fontSize: 19, fontWeight: 600, color: '#fff',
              background: GOLD_REF, border: 'none', borderRadius: 0, padding: '17px 38px', cursor: 'pointer',
            }}>
              {idx + 1 < escenas.length ? 'Siguiente' : 'Completar'}
            </button>
          </div>
        )}
      </div>
    </Shell>
  );
}

/* ─── IDENTIFICA (diagrama + reflexión virtudes) ─── */

function Lightbox({ src, alt, onClose }) {
  const [zoomed, setZoomed] = useState(false);

  return createPortal(
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9999,
      display: 'grid', placeItems: 'center',
      background: zoomed ? 'rgba(15,29,56,0.92)' : 'rgba(15,29,56,0.55)',
      transition: 'background 300ms ease',
    }} onClick={e => { if (e.target === e.currentTarget) { zoomed ? setZoomed(false) : onClose(); } }}>
      <div style={{
        position: 'relative',
        maxWidth: zoomed ? '98vw' : 'min(1100px, 95vw)',
        maxHeight: zoomed ? '98vh' : '92vh',
        overflow: zoomed ? 'auto' : 'visible',
        transition: 'max-width 300ms ease, max-height 300ms ease',
      }}>
        <button type="button" onClick={onClose} aria-label="Cerrar" style={{
          position: zoomed ? 'fixed' : 'absolute', top: zoomed ? 12 : -44, right: zoomed ? 16 : 0,
          background: zoomed ? NAVY : 'none', border: 'none', borderRadius: 0,
          fontFamily: FONT_BODY, fontSize: 14, fontWeight: 600, color: PAPER,
          cursor: 'pointer', padding: '8px 16px', lineHeight: 1, letterSpacing: '0.06em',
          textTransform: 'uppercase', zIndex: 10000,
        }}>Cerrar</button>
        <img src={src} alt={alt} onClick={() => setZoomed(!zoomed)} style={{
          width: zoomed ? 'max(1400px, 95vw)' : '100%',
          maxWidth: zoomed ? 'none' : '100%',
          maxHeight: zoomed ? 'none' : '92vh',
          display: 'block', cursor: zoomed ? 'zoom-out' : 'zoom-in',
          boxShadow: zoomed ? 'none' : '0 12px 40px rgba(15,29,56,0.30)',
          transition: 'width 300ms ease',
        }} />
      </div>
    </div>,
    document.body,
  );
}

export function Identifica({ paso, onComplete, modulo }) {
  const { virtudes, enunciado, enunciadoCorto } = paso;
  const total = virtudes.length + 1;
  const [fase, setFase] = useState('caratula');
  const [slide, setSlide] = useState(0);
  const [lightbox, setLightbox] = useState(false);
  const [respuestas, setRespuestas] = useState(() =>
    virtudes.map(() => ({ facil: null, ejemploFacil: '', ejemploDificil: '' }))
  );
  const [ejemploAbierto, setEjemploAbierto] = useState({});

  if (fase === 'caratula') return <Caratula paso={paso} tipo="identifica" modulo={modulo} onEmpezar={() => setFase('ejercicio')} />;

  function elegirFacil(vIdx, aspecto) {
    setRespuestas((prev) => {
      const n = [...prev];
      n[vIdx] = { ...n[vIdx], facil: aspecto };
      return n;
    });
  }

  function escribir(vIdx, campo, valor) {
    setRespuestas((prev) => {
      const n = [...prev];
      n[vIdx] = { ...n[vIdx], [campo]: valor };
      return n;
    });
  }

  function avanzar() {
    if (slide < total - 1) {
      setSlide((s) => s + 1);
      setEjemploAbierto({});
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      onComplete({ respuestas: respuestas.map((r, i) => ({
        virtud: virtudes[i].nombre,
        facil: r.facil === 'pasivo' ? virtudes[i].pasivo : virtudes[i].activo,
        dificil: r.facil === 'pasivo' ? virtudes[i].activo : virtudes[i].pasivo,
        ejemploFacil: r.ejemploFacil,
        ejemploDificil: r.ejemploDificil,
      })) });
    }
  }

  if (slide === 0) {
    return (
      <Shell titulo={paso.titulo} actual={1} total={total}>
        <div style={tarjeta}>
          <h3 style={{ fontFamily: FONT_BODY, fontSize: 20, fontWeight: 700, color: NAVY, margin: '0 0 14px', lineHeight: 1.4 }}>
            Analiza la foto y entiende el diagrama de virtudes
          </h3>
          <div style={{ marginBottom: 18, cursor: 'zoom-in' }} onClick={() => setLightbox(true)}>
            <img src={diagramaVirtudesImg} alt="Diagrama de las 6 virtudes del líder" style={{ width: '100%', height: 'auto' }} />
          </div>
          {lightbox && <Lightbox src={diagramaVirtudesImg} alt="Diagrama de las 6 virtudes del líder" onClose={() => setLightbox(false)} />}
          <div style={{ fontFamily: FONT_BODY, fontSize: 18, color: NAVY, lineHeight: 1.7 }}>
            {enunciado.split('\n\n').map((p, i) => (
              <p key={i} style={{ margin: i === 0 ? '0 0 14px' : '14px 0 0' }}>{p}</p>
            ))}
          </div>
          <div style={{ marginTop: 22, display: 'flex', justifyContent: 'flex-end' }}>
            <button type="button" onClick={avanzar} style={{
              fontFamily: FONT_BODY, fontSize: 19, fontWeight: 600, color: '#fff',
              background: GOLD_REF, border: 'none', borderRadius: 0, padding: '18px 40px', cursor: 'pointer',
            }}>
              Empezar
            </button>
          </div>
        </div>
      </Shell>
    );
  }

  const vIdx = slide - 1;
  const v = virtudes[vIdx];
  const r = respuestas[vIdx];
  const dificil = r.facil ? (r.facil === 'pasivo' ? 'activo' : 'pasivo') : null;
  const listo = r.facil && r.ejemploFacil.trim() && r.ejemploDificil.trim();

  function aspBtn(aspecto, label) {
    const esFacil = r.facil === aspecto;
    const esDificil = dificil === aspecto;
    let bg = PAPER;
    let border = `1.5px solid ${LINE}`;
    let badge = null;
    if (esFacil) { bg = '#ecfdf5'; border = '1.5px solid #10b981'; badge = '+'; }
    else if (esDificil) { bg = '#fef7ed'; border = '1.5px solid #f59e0b'; badge = '−'; }
    return (
      <button type="button" onClick={() => elegirFacil(vIdx, aspecto)} style={{
        fontFamily: FONT_BODY, fontSize: 19, lineHeight: 1.5, color: NAVY, background: bg,
        border, borderRadius: 0, padding: '18px 22px', cursor: 'pointer',
        width: '100%', textAlign: 'left', transition: 'all 150ms ease', position: 'relative',
      }}>
        <span style={{ fontFamily: FONT_BODY, fontSize: 13, color: MUTED, textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: 4 }}>
          {aspecto === 'pasivo' ? 'Aspecto pasivo' : 'Aspecto activo'}
        </span>
        {label}
        {badge && (
          <span style={{
            position: 'absolute', top: 8, right: 12,
            fontFamily: FONT_SLAB, fontSize: 18, fontWeight: 700,
            color: esFacil ? '#10b981' : '#f59e0b',
          }}>{badge}</span>
        )}
      </button>
    );
  }

  return (
    <Shell titulo={paso.titulo} actual={slide + 1} total={total}>
      <div style={tarjeta}>
        <p style={{ fontFamily: FONT_BODY, fontSize: 19, color: NAVY, margin: '0 0 10px', lineHeight: 1.6 }}>
          {enunciadoCorto}
        </p>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 20 }}>
          <h3 style={{ fontFamily: FONT_SLAB, fontSize: 24, fontWeight: 700, color: GOLD_REF_DK, margin: 0 }}>
            {v.nombre}
          </h3>
          <button type="button" onClick={() => setLightbox(true)} style={{
            background: 'none', border: 'none', padding: 0, cursor: 'pointer',
            fontFamily: FONT_BODY, fontSize: 13, fontWeight: 600, color: GOLD_REF_DK,
            display: 'flex', alignItems: 'center', gap: 5,
            textDecoration: 'underline', textUnderlineOffset: 3,
          }}>
            <IconoLupa />
            Ver diagrama
          </button>
        </div>
        {lightbox && <Lightbox src={diagramaVirtudesImg} alt="Diagrama de las 6 virtudes del líder" onClose={() => setLightbox(false)} />}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12, marginBottom: 20 }}>
          <div>
            {aspBtn('pasivo', v.pasivo)}
            {v.ejemploPasivo && (
              <button type="button" onClick={() => setEjemploAbierto(prev => ({ ...prev, pasivo: !prev.pasivo }))} style={{
                background: 'none', border: 'none', padding: '8px 0 0', cursor: 'pointer',
                fontFamily: FONT_BODY, fontSize: 13, fontWeight: 600, color: GOLD_REF_DK,
                display: 'flex', alignItems: 'center', gap: 5,
                textDecoration: 'underline', textUnderlineOffset: 3,
              }}>
                <IconoLupa />
                Ver ejemplo
              </button>
            )}
            {ejemploAbierto.pasivo && v.ejemploPasivo && (
              <p style={{ fontFamily: FONT_BODY, fontSize: 14, color: MUTED, lineHeight: 1.6, margin: '6px 0 0', padding: '10px 14px', background: BEIGE, borderLeft: `2px solid ${GOLD_REF}` }}>
                {v.ejemploPasivo}
              </p>
            )}
          </div>
          <div>
            {aspBtn('activo', v.activo)}
            {v.ejemploActivo && (
              <button type="button" onClick={() => setEjemploAbierto(prev => ({ ...prev, activo: !prev.activo }))} style={{
                background: 'none', border: 'none', padding: '8px 0 0', cursor: 'pointer',
                fontFamily: FONT_BODY, fontSize: 13, fontWeight: 600, color: GOLD_REF_DK,
                display: 'flex', alignItems: 'center', gap: 5,
                textDecoration: 'underline', textUnderlineOffset: 3,
              }}>
                <IconoLupa />
                Ver ejemplo
              </button>
            )}
            {ejemploAbierto.activo && v.ejemploActivo && (
              <p style={{ fontFamily: FONT_BODY, fontSize: 14, color: MUTED, lineHeight: 1.6, margin: '6px 0 0', padding: '10px 14px', background: BEIGE, borderLeft: `2px solid ${GOLD_REF}` }}>
                {v.ejemploActivo}
              </p>
            )}
          </div>
        </div>
        {r.facil && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <span style={{ fontFamily: FONT_BODY, fontSize: 16, fontWeight: 600, color: '#065f46' }}>
                Me resulta fácil (+): {r.facil === 'pasivo' ? v.pasivo : v.activo}
              </span>
              <textarea value={r.ejemploFacil} onChange={(e) => escribir(vIdx, 'ejemploFacil', e.target.value)}
                placeholder="Escribe un ejemplo de tu vida…" style={{
                  fontFamily: FONT_BODY, fontSize: 18, color: NAVY, background: '#fff',
                  border: `1px solid ${LINE}`, borderRadius: 0, padding: '14px 16px',
                  width: '100%', minHeight: 90, resize: 'vertical', outline: 'none',
                }} />
            </label>
            <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <span style={{ fontFamily: FONT_BODY, fontSize: 16, fontWeight: 600, color: '#92400e' }}>
                Me resulta difícil (−): {dificil === 'pasivo' ? v.pasivo : v.activo}
              </span>
              <textarea value={r.ejemploDificil} onChange={(e) => escribir(vIdx, 'ejemploDificil', e.target.value)}
                placeholder="Escribe un ejemplo de tu vida…" style={{
                  fontFamily: FONT_BODY, fontSize: 18, color: NAVY, background: '#fff',
                  border: `1px solid ${LINE}`, borderRadius: 0, padding: '14px 16px',
                  width: '100%', minHeight: 90, resize: 'vertical', outline: 'none',
                }} />
            </label>
          </div>
        )}
        <div style={{ marginTop: 20, display: 'flex', justifyContent: 'flex-end' }}>
          <button type="button" onClick={avanzar} disabled={!listo} style={{
            fontFamily: FONT_BODY, fontSize: 19, fontWeight: 600, color: '#fff',
            background: listo ? GOLD_REF : LINE, border: 'none', borderRadius: 0,
            padding: '18px 40px', cursor: listo ? 'pointer' : 'default',
          }}>
            {slide < total - 1 ? 'Siguiente' : 'Completar'}
          </button>
        </div>
      </div>
    </Shell>
  );
}

/* ─── TEST PROFUNDO (preguntas abiertas) ─── */

const TEST_PROF_KEY = (pasoId) => `vl-test-profundo:${pasoId}`;
function leerTestProf(pasoId, total) {
  try { const d = JSON.parse(localStorage.getItem(TEST_PROF_KEY(pasoId))); return Array.isArray(d) && d.length === total ? d : Array(total).fill(''); } catch { return Array(total).fill(''); }
}

function SelectorCirculoOro({ user, seleccionados, onToggle, onExplicar }) {
  const [personas, setPersonas] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [anadiendo, setAnadiendo] = useState(false);
  const [nuevoNombre, setNuevoNombre] = useState('');
  const [editando, setEditando] = useState(null);
  useEffect(() => {
    if (!user?.id) { setCargando(false); return; }
    import('../account/personas').then(m => m.listarPersonas()).then(p => setPersonas(p ?? [])).catch(() => {}).finally(() => setCargando(false));
  }, [user?.id]);

  if (cargando) return <p style={{ fontFamily: FONT_BODY, fontSize: 14, color: MUTED }}>Cargando tu círculo...</p>;

  function agregarNuevo() {
    const n = nuevoNombre.trim();
    if (!n) return;
    const tempId = `nuevo_${Date.now()}`;
    setPersonas(prev => [...prev, { id: tempId, nombre: n, primario: null }]);
    onToggle(tempId, n);
    setNuevoNombre('');
    setAnadiendo(false);
  }

  function aceptarRazon(id, valor) {
    onExplicar(id, valor);
    setEditando(null);
  }

  return (
    <div style={{ marginBottom: 16 }}>
      <p style={{ fontFamily: FONT_BODY, fontSize: 13, color: MUTED, margin: '0 0 10px', textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: 600 }}>
        Tu círculo de personas
      </p>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 10 }}>
        {personas.map(p => {
          const entry = seleccionados[p.id];
          const activo = entry?.activo;
          return (
            <button key={p.id} type="button" onClick={() => {
              if (activo && entry?.razon) { setEditando(p.id); return; }
              onToggle(p.id, p.nombre);
            }} style={{
              fontFamily: FONT_BODY, fontSize: 14, fontWeight: 600,
              color: activo ? PAPER : NAVY, background: activo ? NAVY : BEIGE,
              border: `1.5px solid ${activo ? NAVY : LINE}`, borderRadius: 0,
              padding: '9px 16px', cursor: 'pointer', transition: 'all 150ms',
              display: 'inline-flex', alignItems: 'center', gap: 8,
            }}>
              {p.nombre}
              {activo && entry?.razon && <span style={{ color: PAPER, opacity: 0.7, display: 'inline-flex' }}><IconoLapiz /></span>}
            </button>
          );
        })}
        {anadiendo ? (
          <span style={{ display: 'inline-flex', gap: 6, alignItems: 'center' }}>
            <input
              autoFocus
              type="text"
              value={nuevoNombre}
              onChange={(e) => setNuevoNombre(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') agregarNuevo(); if (e.key === 'Escape') { setAnadiendo(false); setNuevoNombre(''); } }}
              placeholder="Nombre..."
              style={{
                fontFamily: FONT_BODY, fontSize: 14, color: NAVY, background: PAPER,
                border: `1.5px solid ${LINE}`, borderRadius: 0, padding: '9px 12px',
                width: 140, outline: 'none',
              }}
            />
            <button type="button" onClick={agregarNuevo} disabled={!nuevoNombre.trim()} style={{
              fontFamily: FONT_BODY, fontSize: 13, fontWeight: 600,
              color: PAPER, background: nuevoNombre.trim() ? GOLD_REF : LINE,
              border: 'none', borderRadius: 0, padding: '9px 14px', cursor: nuevoNombre.trim() ? 'pointer' : 'default',
            }}>
              Añadir
            </button>
          </span>
        ) : (
          <button type="button" onClick={() => setAnadiendo(true)} style={{
            fontFamily: FONT_BODY, fontSize: 20, fontWeight: 400,
            color: MUTED, background: 'transparent',
            border: `1.5px dashed ${LINE}`, borderRadius: 0,
            padding: '6px 16px', cursor: 'pointer', lineHeight: 1,
          }}>
            +
          </button>
        )}
      </div>
      {Object.entries(seleccionados).filter(([id, v]) => v.activo && (!v.razon || editando === id)).map(([id, v]) => (
        <div key={id} style={{ marginTop: 8, padding: '12px 14px', background: BEIGE, border: `1px solid ${LINE}`, borderRadius: 0 }}>
          <p style={{ fontFamily: FONT_BODY, fontSize: 14, color: NAVY, margin: '0 0 8px', fontWeight: 600 }}>
            ¿Por qué consideras a {v.nombre} magnánimo/a?
          </p>
          <div style={{ display: 'flex', gap: 8 }}>
            <input
              autoFocus
              type="text"
              defaultValue={v.razon || ''}
              placeholder="Escribe brevemente..."
              onKeyDown={(e) => { if (e.key === 'Enter') aceptarRazon(id, e.target.value); }}
              ref={el => { if (el) el._ref = id; }}
              style={{
                fontFamily: FONT_BODY, fontSize: 15, color: NAVY, background: PAPER,
                border: `1px solid ${LINE}`, borderRadius: 0, padding: '10px 14px',
                flex: 1, outline: 'none',
              }}
            />
            <button type="button" onClick={(e) => {
              const input = e.currentTarget.previousElementSibling;
              aceptarRazon(id, input?.value || '');
            }} style={{
              fontFamily: FONT_BODY, fontSize: 14, fontWeight: 600,
              color: PAPER, background: GOLD_REF, border: 'none', borderRadius: 0,
              padding: '10px 18px', cursor: 'pointer',
            }}>
              Aceptar
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

export function TestProfundo({ paso, onComplete, modulo, user }) {
  const rawPreguntas = paso.preguntas ?? [];
  const preguntas = rawPreguntas.map(p => typeof p === 'string' ? { texto: p } : p);
  const total = preguntas.length || paso.num_preguntas;
  const [fase, setFase] = useState('caratula');
  const [idx, setIdx] = useState(0);
  const [respuestas, setRespuestas] = useState(() => leerTestProf(paso.id, total));
  const [circuloData, setCirculoData] = useState({});
  const guardarTestCb = useCallback((d) => { try { localStorage.setItem(TEST_PROF_KEY(paso.id), JSON.stringify(d)); } catch {} }, [paso.id]);
  const guardados = useAutoguardado(guardarTestCb, respuestas);

  if (fase === 'caratula') return <Caratula paso={paso} tipo="test_profundo" modulo={modulo} onEmpezar={() => setFase('ejercicio')} />;

  const preg = preguntas[idx];

  function avanzar() {
    if (idx + 1 < total) {
      setIdx((i) => i + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      setFase('cierre');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  function togglePersona(id, nombre) {
    setCirculoData(prev => {
      const entry = prev[`${idx}:${id}`];
      return { ...prev, [`${idx}:${id}`]: entry?.activo ? { ...entry, activo: false } : { activo: true, nombre, razon: '' } };
    });
  }

  function explicarPersona(id, razon) {
    setCirculoData(prev => ({ ...prev, [`${idx}:${id}`]: { ...prev[`${idx}:${id}`], razon } }));
  }

  const seleccionadosIdx = {};
  for (const [k, v] of Object.entries(circuloData)) {
    if (k.startsWith(`${idx}:`)) seleccionadosIdx[k.split(':')[1]] = v;
  }

  if (fase === 'cierre') {
    return (
      <div style={{ maxWidth: 860, margin: '0 auto' }}>
        <div style={tarjeta}>
          <div style={{ textAlign: 'center', padding: '20px 0 10px' }}>
            <span style={{
              display: 'inline-grid', placeItems: 'center', width: 64, height: 64, borderRadius: '50%',
              background: '#ecfdf5', border: '2px solid #10b981',
              fontFamily: FONT_SLAB, fontSize: 28, fontWeight: 700, color: '#065f46',
            }}>✓</span>
          </div>
          <h2 style={{ fontFamily: FONT_SLAB, fontSize: 26, fontWeight: 700, color: NAVY, margin: '16px 0 12px', textAlign: 'center' }}>
            Autoexamen completado
          </h2>
          <p style={{ fontFamily: FONT_BODY, fontSize: 16, color: MUTED, lineHeight: 1.7, textAlign: 'center', maxWidth: 480, margin: '0 auto 28px' }}>
            Gracias por tomarte el tiempo de reflexionar con profundidad. Este ejercicio de autoconocimiento es uno de los más valiosos del curso.
          </p>
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <button type="button" onClick={() => onComplete({ respuestas, circulo: circuloData })} style={{
              fontFamily: FONT_BODY, fontSize: 19, fontWeight: 600, color: '#fff',
              background: GOLD_REF, border: 'none', borderRadius: 0, padding: '18px 48px', cursor: 'pointer',
            }}>
              Continuar →
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <Shell titulo={paso.titulo} actual={idx + 1} total={total}>
      <div style={tarjeta}>
        <p style={{ fontFamily: FONT_BODY, fontSize: 14, color: MUTED, margin: '0 0 12px', lineHeight: 1.5, textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: 600 }}>
          Examínate y fija metas para el mes que empieza
        </p>
        <p style={{ fontFamily: FONT_SLAB, fontSize: 24, fontWeight: 700, color: NAVY, margin: '0 0 20px', lineHeight: 1.45 }}>
          {preg.texto ?? `Pregunta ${idx + 1}`}
        </p>
        {preg.circulo_oro && user && (
          <SelectorCirculoOro user={user} seleccionados={seleccionadosIdx} onToggle={togglePersona} onExplicar={explicarPersona} />
        )}
        <textarea
          key={idx}
          autoFocus
          value={respuestas[idx]}
          onChange={(e) => setRespuestas((prev) => { const n = [...prev]; n[idx] = e.target.value; return n; })}
          placeholder={preg.placeholder ?? 'Escribe tu reflexión...'}
          style={{
            fontFamily: FONT_BODY, fontSize: 18, color: NAVY, background: BEIGE,
            border: `1px solid ${LINE}`, borderRadius: 0, padding: '16px 18px',
            width: '100%', minHeight: 160, resize: 'vertical', outline: 'none',
          }}
        />
        <div style={{ display: 'flex', justifyContent: 'flex-end', minHeight: 20, marginTop: 6 }}>
          <CheckGuardado campo={String(idx)} guardados={guardados} />
        </div>
        <div style={{ marginTop: 16, display: 'flex', justifyContent: 'flex-end' }}>
          <button type="button" onClick={avanzar} disabled={!respuestas[idx]?.trim()} style={{
            fontFamily: FONT_BODY, fontSize: 19, fontWeight: 600, color: '#fff',
            background: respuestas[idx]?.trim() ? GOLD_REF : LINE, border: 'none', borderRadius: 0,
            padding: '18px 40px', cursor: respuestas[idx]?.trim() ? 'pointer' : 'default',
          }}>
            {idx + 1 < total ? 'Siguiente' : 'Completar'}
          </button>
        </div>
      </div>
    </Shell>
  );
}

/* ─── REFLEXIÓN PIRÁMIDE (imagen + preguntas abiertas) ─── */

const REFLEXION_IMAGENES = {
  'piramide-lv': [piramideViciosImg, piramideLVImg],
  'magnanimidad-temperamentos': diagramaTemperamentosImg,
};

const REFLEXION_KEY = (pasoId) => `vl-reflexion:${pasoId}`;
function leerReflexion(pasoId, total) {
  try { const d = JSON.parse(localStorage.getItem(REFLEXION_KEY(pasoId))); return Array.isArray(d) && d.length === total ? d : Array(total).fill(''); } catch { return Array(total).fill(''); }
}

export function ReflexionPiramide({ paso, onComplete, modulo }) {
  const preguntas = paso.preguntas ?? [];
  const totalSlides = preguntas.length + 1;
  const [fase, setFase] = useState('caratula');
  const [slide, setSlide] = useState(0);
  const [respuestas, setRespuestas] = useState(() => leerReflexion(paso.id, preguntas.length));
  const guardarReflCb = useCallback((d) => { try { localStorage.setItem(REFLEXION_KEY(paso.id), JSON.stringify(d)); } catch {} }, [paso.id]);
  const guardados = useAutoguardado(guardarReflCb, respuestas);
  const [lbSrc, setLbSrc] = useState(null);
  const [ejemploAb, setEjemploAb] = useState({});

  const imgEntry = REFLEXION_IMAGENES[paso.imagen] ?? null;
  const imgs = Array.isArray(imgEntry) ? imgEntry : imgEntry ? [imgEntry] : [];

  if (fase === 'caratula') return <Caratula paso={paso} tipo="reflexion_piramide" modulo={modulo} onEmpezar={() => setFase('ejercicio')} />;

  function avanzar() {
    if (slide + 1 < totalSlides) {
      setSlide((s) => s + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      setFase('cierre');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  if (fase === 'cierre') {
    return (
      <div style={{ maxWidth: 860, margin: '0 auto' }}>
        <div style={tarjeta}>
          <div style={{ textAlign: 'center', padding: '20px 0 10px' }}>
            <span style={{
              display: 'inline-grid', placeItems: 'center', width: 64, height: 64, borderRadius: '50%',
              background: '#ecfdf5', border: '2px solid #10b981',
              fontFamily: FONT_SLAB, fontSize: 28, fontWeight: 700, color: '#065f46',
            }}>✓</span>
          </div>
          <h2 style={{ fontFamily: FONT_SLAB, fontSize: 26, fontWeight: 700, color: NAVY, margin: '16px 0 12px', textAlign: 'center' }}>
            Reflexión completada
          </h2>
          <p style={{ fontFamily: FONT_BODY, fontSize: 16, color: MUTED, lineHeight: 1.7, textAlign: 'center', maxWidth: 480, margin: '0 auto 28px' }}>
            Has completado esta reflexión. Tus respuestas quedan guardadas en tu cuaderno personal.
          </p>
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <button type="button" onClick={() => onComplete({ respuestas })} style={{
              fontFamily: FONT_BODY, fontSize: 19, fontWeight: 600, color: '#fff',
              background: GOLD_REF, border: 'none', borderRadius: 0, padding: '18px 48px', cursor: 'pointer',
            }}>
              Continuar →
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (slide === 0) {
    return (
      <Shell titulo={paso.titulo} actual={1} total={totalSlides}>
        <div style={tarjeta}>
          <h3 style={{ fontFamily: FONT_BODY, fontSize: 20, fontWeight: 700, color: NAVY, margin: '0 0 14px', lineHeight: 1.4 }}>
            {paso.enunciado}
          </h3>
          {imgs.length > 0 && (
            <>
              <div style={{ display: 'flex', gap: 10, marginBottom: 8 }}>
                {imgs.map((src, i) => (
                  <div key={i} style={{ flex: 1, cursor: 'zoom-in', minWidth: 0 }} onClick={() => setLbSrc(src)}>
                    <img src={src} alt={paso.enunciado} style={{ width: '100%', height: 'auto', mixBlendMode: 'multiply' }} />
                  </div>
                ))}
              </div>
              <div style={{ marginBottom: 18, textAlign: 'center' }}>
                <button type="button" onClick={() => setLbSrc(imgs[0])} style={{
                  background: 'none', border: 'none', padding: 0, cursor: 'pointer',
                  fontFamily: FONT_BODY, fontSize: 14, fontWeight: 600, color: GOLD_REF_DK,
                  display: 'inline-flex', alignItems: 'center', gap: 5,
                  textDecoration: 'underline', textUnderlineOffset: 3,
                }}>
                  <IconoLupa />
                  Ampliar diagrama
                </button>
              </div>
            </>
          )}
          {lbSrc && <Lightbox src={lbSrc} alt={paso.enunciado} onClose={() => setLbSrc(null)} />}
          {paso.descripcion && (
            <div style={{ fontFamily: FONT_BODY, fontSize: 18, color: NAVY, lineHeight: 1.7 }}>
              {paso.descripcion.split('\n\n').map((p, i) => (
                <p key={i} style={{ margin: i === 0 ? '0 0 14px' : '14px 0 0' }}>{p}</p>
              ))}
            </div>
          )}
          <div style={{ marginTop: 22, display: 'flex', justifyContent: 'flex-end' }}>
            <button type="button" onClick={avanzar} style={{
              fontFamily: FONT_BODY, fontSize: 19, fontWeight: 600, color: '#fff',
              background: GOLD_REF, border: 'none', borderRadius: 0, padding: '18px 40px', cursor: 'pointer',
            }}>
              Empezar
            </button>
          </div>
        </div>
      </Shell>
    );
  }

  const qIdx = slide - 1;
  return (
    <Shell titulo={paso.titulo} actual={slide + 1} total={totalSlides}>
      <div style={tarjeta}>
        <p style={{ fontFamily: FONT_BODY, fontSize: 14, color: MUTED, margin: '0 0 16px', lineHeight: 1.5 }}>
          Tómate un momento para reflexionar y responde con tus propias palabras.
        </p>
        <p style={{ fontFamily: FONT_SLAB, fontSize: 22, fontWeight: 700, color: NAVY, margin: '0 0 20px', lineHeight: 1.45 }}>
          {preguntas[qIdx]}
        </p>
        <textarea
          key={qIdx}
          autoFocus
          value={respuestas[qIdx]}
          onChange={(e) => setRespuestas((prev) => { const n = [...prev]; n[qIdx] = e.target.value; return n; })}
          placeholder="Escribe tu reflexión..."
          style={{
            fontFamily: FONT_BODY, fontSize: 18, color: NAVY, background: BEIGE,
            border: `1px solid ${LINE}`, borderRadius: 0, padding: '16px 18px',
            width: '100%', boxSizing: 'border-box', minHeight: 140, resize: 'vertical', outline: 'none',
          }}
        />
        {paso.ejemplos?.[qIdx] && (
          <EjemploColapsable texto={paso.ejemplos[qIdx]} abierto={ejemploAb[qIdx]} onToggle={() => setEjemploAb(prev => ({ ...prev, [qIdx]: !prev[qIdx] }))} />
        )}
        <div style={{ display: 'flex', justifyContent: 'flex-end', minHeight: 20, marginTop: 6 }}>
          <CheckGuardado campo={String(qIdx)} guardados={guardados} />
        </div>
        <div style={{ marginTop: 16, display: 'flex', justifyContent: 'flex-end' }}>
          <button type="button" onClick={avanzar} disabled={!respuestas[qIdx]?.trim()} style={{
            fontFamily: FONT_BODY, fontSize: 19, fontWeight: 600, color: '#fff',
            background: respuestas[qIdx]?.trim() ? GOLD_REF : LINE, border: 'none', borderRadius: 0,
            padding: '18px 40px', cursor: respuestas[qIdx]?.trim() ? 'pointer' : 'default',
          }}>
            {slide + 1 < totalSlides ? 'Siguiente' : 'Completar'}
          </button>
        </div>
      </div>
    </Shell>
  );
}

/* ─── TEMPERAMENTO × MAGNANIMIDAD ─── */

export function TemperamentoMagnanimidad({ paso, temperamento, onComplete }) {
  const [fase, setFase] = useState(-1);
  const [textoFuerte, setTextoFuerte] = useState('');
  const [textoDebil, setTextoDebil] = useState('');
  const [textoFuerteSec, setTextoFuerteSec] = useState('');
  const [textoDebilSec, setTextoDebilSec] = useState('');
  const [lbSrc, setLbSrc] = useState(null);

  const p = temperamento?.primary;
  const s = temperamento?.secondary;
  const perfil = s ? `${p}-${s}` : p;
  const img = REFLEXION_IMAGENES[paso.imagen] ?? null;
  const obstaculo = paso.obstaculos?.[p];
  const sinergia = paso.sinergias_secundario?.[perfil];
  const reto = paso.reto_por_temperamento?.[p];

  if (fase === -1) {
    return <Caratula paso={paso} tipo="temperamento_magnanimidad" onEmpezar={() => { setFase(0); window.scrollTo({ top: 0, behavior: 'smooth' }); }} />;
  }

  if (fase === 0) {
    return (
      <div style={{ maxWidth: 800, margin: '0 auto' }}>
        <div style={tarjeta}>
          <div style={eyebrow}>Paso 1 — Tu temperamento dominante</div>
          <h2 style={{ fontFamily: FONT_SLAB, fontSize: 24, fontWeight: 700, color: NAVY, margin: '8px 0 14px' }}>
            {paso.enunciado}
          </h2>
          <p style={{ fontFamily: FONT_BODY, fontSize: 15, color: MUTED, lineHeight: 1.65, margin: '0 0 20px' }}>
            {paso.descripcion}
          </p>

          {img && (
            <div style={{ marginBottom: 20, textAlign: 'center' }}>
              <button type="button" onClick={() => setLbSrc(img)} style={{
                background: 'none', border: 'none', padding: 0, cursor: 'pointer',
              }}>
                <img src={img} alt={paso.enunciado} style={{ maxWidth: '100%', maxHeight: 300 }} />
              </button>
              <div style={{ marginTop: 8 }}>
                <button type="button" onClick={() => setLbSrc(img)} style={{
                  background: 'none', border: 'none', padding: 0, cursor: 'pointer',
                  fontFamily: FONT_BODY, fontSize: 14, fontWeight: 600, color: GOLD_REF_DK,
                  display: 'inline-flex', alignItems: 'center', gap: 5,
                  textDecoration: 'underline', textUnderlineOffset: 3,
                }}>
                  <IconoLupa />
                  Ampliar diagrama
                </button>
              </div>
            </div>
          )}

          {lbSrc && <Lightbox src={lbSrc} alt={paso.enunciado} onClose={() => setLbSrc(null)} />}

          {p && RETRATO_TEMP[p] && (
            <div style={{ display: 'flex', gap: 16, alignItems: 'center', marginBottom: 18, padding: '14px 16px', background: BEIGE, borderLeft: `3px solid ${TEMP_COLORS[p] ?? LINE}` }}>
              <img src={RETRATO_TEMP[p]} alt={TEMP_NOMBRE[p]} style={{ width: 60, height: 60, objectFit: 'cover', mixBlendMode: 'multiply', borderRadius: 4, flexShrink: 0 }} />
              <div>
                <div style={{ fontFamily: FONT_BODY, fontSize: 11, color: MUTED, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Tu temperamento dominante</div>
                <div style={{ fontFamily: FONT_SLAB, fontSize: 20, fontWeight: 700, color: NAVY, marginTop: 4 }}>{TEMP_NOMBRE[p]}</div>
              </div>
            </div>
          )}

          <div style={{ marginBottom: 20 }}>
            <label style={{ fontFamily: FONT_BODY, fontSize: 14, fontWeight: 600, color: NAVY, display: 'block', marginBottom: 6 }}>
              {paso.pregunta_fuerte}
            </label>
            <textarea
              value={textoFuerte}
              onChange={(e) => setTextoFuerte(e.target.value)}
              placeholder="Escribe los puntos fuertes que identificas…"
              rows={3}
              style={{
                width: '100%', padding: '12px 14px', boxSizing: 'border-box',
                border: `1px solid ${LINE}`, fontFamily: FONT_BODY, fontSize: 15, color: NAVY,
                background: '#fff', resize: 'vertical', lineHeight: 1.55,
              }}
            />
          </div>

          <div style={{ marginBottom: 20 }}>
            <label style={{ fontFamily: FONT_BODY, fontSize: 14, fontWeight: 600, color: NAVY, display: 'block', marginBottom: 6 }}>
              {paso.pregunta_debil}
            </label>
            <textarea
              value={textoDebil}
              onChange={(e) => setTextoDebil(e.target.value)}
              placeholder="Escribe los puntos débiles que identificas…"
              rows={3}
              style={{
                width: '100%', padding: '12px 14px', boxSizing: 'border-box',
                border: `1px solid ${LINE}`, fontFamily: FONT_BODY, fontSize: 15, color: NAVY,
                background: '#fff', resize: 'vertical', lineHeight: 1.55,
              }}
            />
          </div>

          {obstaculo && (
            <div style={{ padding: '16px 18px', background: '#fef2f2', borderLeft: '3px solid #ef4444', marginBottom: 20 }}>
              <div style={{ fontFamily: FONT_BODY, fontSize: 12, fontWeight: 700, color: '#991b1b', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6 }}>Obstáculo</div>
              <div style={{ fontFamily: FONT_BODY, fontSize: 15, color: '#991b1b', lineHeight: 1.55 }}>{obstaculo}</div>
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button type="button" onClick={() => { setLbSrc(null); setFase(1); window.scrollTo({ top: 0, behavior: 'smooth' }); }} style={{
              fontFamily: FONT_BODY, fontSize: 18, fontWeight: 600, color: '#fff',
              background: GOLD_REF, border: 'none', borderRadius: 0, padding: '16px 38px', cursor: 'pointer',
            }}>
              Siguiente →
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (fase === 1) {
    return (
      <div style={{ maxWidth: 800, margin: '0 auto' }}>
        <div style={tarjeta}>
          <div style={eyebrow}>Paso 2 — Tu temperamento secundario</div>
          <h2 style={{ fontFamily: FONT_SLAB, fontSize: 24, fontWeight: 700, color: NAVY, margin: '8px 0 14px' }}>
            Temperamento secundario y magnanimidad
          </h2>

          {s && RETRATO_TEMP[s] && (
            <div style={{ display: 'flex', gap: 16, alignItems: 'center', marginBottom: 18, padding: '14px 16px', background: BEIGE, borderLeft: `3px solid ${TEMP_COLORS[s] ?? LINE}` }}>
              <img src={RETRATO_TEMP[s]} alt={TEMP_NOMBRE[s]} style={{ width: 60, height: 60, objectFit: 'cover', mixBlendMode: 'multiply', borderRadius: 4, flexShrink: 0 }} />
              <div>
                <div style={{ fontFamily: FONT_BODY, fontSize: 11, color: MUTED, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Tu temperamento secundario</div>
                <div style={{ fontFamily: FONT_SLAB, fontSize: 20, fontWeight: 700, color: NAVY, marginTop: 4 }}>{TEMP_NOMBRE[s]}</div>
              </div>
            </div>
          )}

          <div style={{ marginBottom: 20 }}>
            <label style={{ fontFamily: FONT_BODY, fontSize: 14, fontWeight: 600, color: NAVY, display: 'block', marginBottom: 6 }}>
              {paso.pregunta_fuerte_sec}
            </label>
            <textarea
              value={textoFuerteSec}
              onChange={(e) => setTextoFuerteSec(e.target.value)}
              placeholder="Escribe los puntos fuertes de tu secundario…"
              rows={3}
              style={{
                width: '100%', padding: '12px 14px', boxSizing: 'border-box',
                border: `1px solid ${LINE}`, fontFamily: FONT_BODY, fontSize: 15, color: NAVY,
                background: '#fff', resize: 'vertical', lineHeight: 1.55,
              }}
            />
          </div>

          <div style={{ marginBottom: 20 }}>
            <label style={{ fontFamily: FONT_BODY, fontSize: 14, fontWeight: 600, color: NAVY, display: 'block', marginBottom: 6 }}>
              {paso.pregunta_debil_sec}
            </label>
            <textarea
              value={textoDebilSec}
              onChange={(e) => setTextoDebilSec(e.target.value)}
              placeholder="Escribe los puntos débiles de tu secundario…"
              rows={3}
              style={{
                width: '100%', padding: '12px 14px', boxSizing: 'border-box',
                border: `1px solid ${LINE}`, fontFamily: FONT_BODY, fontSize: 15, color: NAVY,
                background: '#fff', resize: 'vertical', lineHeight: 1.55,
              }}
            />
          </div>

          {sinergia && (
            <div style={{ padding: '16px 18px', background: '#ecfdf5', borderLeft: '3px solid #10b981', marginBottom: 20 }}>
              <div style={{ fontFamily: FONT_BODY, fontSize: 12, fontWeight: 700, color: '#065f46', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6 }}>Sinergia</div>
              <div style={{ fontFamily: FONT_BODY, fontSize: 15, color: '#065f46', lineHeight: 1.55 }}>{sinergia}</div>
            </div>
          )}

          {reto && (
            <div style={{ padding: '16px 18px', background: BEIGE, borderLeft: `4px solid ${TEMP_COLORS[p] ?? GOLD_REF}`, marginBottom: 20 }}>
              <div style={{ fontFamily: FONT_BODY, fontSize: 12, fontWeight: 700, color: MUTED, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6 }}>Tu reto personal</div>
              <div style={{ fontFamily: FONT_BODY, fontSize: 15, color: NAVY, lineHeight: 1.6 }}>{reto}</div>
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 24 }}>
            <button type="button" onClick={() => { setFase(0); window.scrollTo({ top: 0, behavior: 'smooth' }); }} style={{
              fontFamily: FONT_BODY, fontSize: 16, fontWeight: 600, color: NAVY,
              background: 'none', border: `1.5px solid ${LINE}`, borderRadius: 0, padding: '14px 28px', cursor: 'pointer',
            }}>
              ← Paso 1
            </button>
            <button type="button" onClick={() => onComplete({ visto: true, textoFuerte, textoDebil, textoFuerteSec, textoDebilSec })} style={{
              fontFamily: FONT_BODY, fontSize: 18, fontWeight: 600, color: '#fff',
              background: GOLD_REF, border: 'none', borderRadius: 0, padding: '16px 38px', cursor: 'pointer',
            }}>
              Siguiente →
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
}

/* ─── CIERRE / SÍNTESIS ─── */

function TempCard({ codigo, tipo, onVerDiagrama }) {
  return (
    <div style={{ padding: 16, background: BEIGE, borderLeft: `3px solid ${TEMP_COLORS[codigo] ?? LINE}` }}>
      <div style={{ fontFamily: FONT_BODY, fontSize: 12, color: MUTED, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Temperamento {tipo}</div>
      <div style={{ fontFamily: FONT_SLAB, fontSize: 22, fontWeight: 700, color: NAVY, marginTop: 4 }}>
        {TEMP_NOMBRE[codigo] ?? '—'}
      </div>
      {TEMP_SUBTITULO[codigo] && <div style={{ fontFamily: FONT_BODY, fontSize: 13, color: MUTED, marginTop: 2, fontStyle: 'italic' }}>{TEMP_SUBTITULO[codigo]}</div>}
      {DIAGRAMA_TEMP[codigo] && (
        <button type="button" onClick={() => onVerDiagrama(DIAGRAMA_TEMP[codigo])} style={{
          background: 'none', border: 'none', padding: 0, marginTop: 10, cursor: 'pointer',
          fontFamily: FONT_BODY, fontSize: 13, fontWeight: 600, color: GOLD_REF_DK,
          display: 'flex', alignItems: 'center', gap: 5,
          textDecoration: 'underline', textUnderlineOffset: 3,
        }}>
          <IconoLupa />
          Ver diagrama del temperamento
        </button>
      )}
    </div>
  );
}

export function TemperamentoPerfil({ paso, temperamento, onComplete }) {
  const [lbSrc, setLbSrc] = useState(null);
  const p = temperamento?.primary;
  const s = temperamento?.secondary;

  return (
    <div style={{ maxWidth: 800, margin: '0 auto' }}>
      <div style={{ ...tarjeta, marginTop: 0 }}>
        <h2 style={{ fontFamily: FONT_SLAB, fontSize: 26, fontWeight: 700, color: NAVY, margin: '0 0 8px' }}>
          Tu temperamento
        </h2>
        <p style={{ fontFamily: FONT_BODY, fontSize: 15, color: MUTED, lineHeight: 1.6, margin: '0 0 22px' }}>
          Según los resultados de tu test, esta es tu combinación de temperamentos.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: s ? 'repeat(2, 1fr)' : '1fr', gap: 14, marginBottom: 24 }}>
          <TempCard codigo={p} tipo="primario" onVerDiagrama={setLbSrc} />
          {s && <TempCard codigo={s} tipo="secundario" onVerDiagrama={setLbSrc} />}
        </div>

        {lbSrc && <Lightbox src={lbSrc} alt="Diagrama de temperamento" onClose={() => setLbSrc(null)} />}

        <div style={{ borderTop: `1.5px solid ${GOLD_REF}`, paddingTop: 18, marginBottom: 22 }}>
          <h3 style={{ fontFamily: FONT_SLAB, fontSize: 18, fontWeight: 700, color: NAVY, margin: '0 0 14px' }}>
            Cómo leer los diagramas:
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
            {[
              { signo: '+', texto: 'tu temperamento te facilita este aspecto de la virtud.' },
              { signo: '−', texto: 'tu temperamento te lo dificulta.' },
              { signo: '+/−', texto: 'te facilita una parte y te dificulta otra: lee el texto de la casilla.' },
            ].map((item) => (
              <div key={item.signo} style={{ display: 'flex', alignItems: 'baseline', gap: 16, padding: '12px 0', borderBottom: `1px solid ${LINE}` }}>
                <span style={{ fontFamily: FONT_SLAB, fontSize: 22, fontWeight: 700, color: NAVY, flex: '0 0 48px', textAlign: 'center' }}>{item.signo}</span>
                <span style={{ fontFamily: FONT_BODY, fontSize: 15, color: NAVY, lineHeight: 1.5 }}>{item.texto}</span>
              </div>
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button type="button" onClick={() => onComplete({ visto: true })} style={{
            fontFamily: FONT_BODY, fontSize: 18, fontWeight: 600, color: '#fff',
            background: GOLD_REF, border: 'none', borderRadius: 0, padding: '16px 38px', cursor: 'pointer',
          }}>
            Siguiente →
          </button>
        </div>
      </div>
    </div>
  );
}

function EjemploColapsable({ texto, abierto, onToggle }) {
  if (!texto) return null;
  return (
    <div style={{ marginTop: 6 }}>
      <button type="button" onClick={onToggle} style={{
        background: 'none', border: 'none', padding: 0, cursor: 'pointer',
        fontFamily: FONT_BODY, fontSize: 13, fontWeight: 600, color: GOLD_REF_DK,
        display: 'flex', alignItems: 'center', gap: 5,
        textDecoration: 'underline', textUnderlineOffset: 3,
      }}>
        <IconoLupa />
        Ver ejemplo
      </button>
      {abierto && (
        <p style={{ fontFamily: FONT_BODY, fontSize: 14, color: MUTED, lineHeight: 1.6, margin: '6px 0 0', paddingLeft: 16, borderLeft: `2px solid ${LINE}`, fontStyle: 'italic' }}>
          {texto}
        </p>
      )}
    </div>
  );
}

/* ─── RETOS DEL TEMPERAMENTO (cuaderno sección 4) ─── */

const VIRTUD_DESAFIO_DESC = {
  'Humildad': 'La virtud de la humildad en su conjunto: cuidar de los demás, servirles y vivir en la verdad sobre ti mismo. Tendrás que mejorar esta virtud durante toda tu vida.',
  'Humildad fraterna': 'El aspecto de la virtud de la humildad que te insta a cuidar de los demás y a servirles, en lugar de servirte de ellos.',
  'Humildad fundamental': 'El aspecto de la virtud de la humildad relacionado con el autoconocimiento: vivir en la verdad sobre ti mismo, sobre tus talentos y tus límites.',
  'Audacia': 'El aspecto activo de la virtud de la fortaleza: atreverte a actuar, a correr riesgos y a convertir tus sueños en realidad superando el miedo a equivocarte.',
  'Resistencia y persistencia': 'El aspecto pasivo de la virtud de la fortaleza: la perseverancia, la constancia y la fidelidad necesarias para terminar lo que comienzas.',
  'Magnanimidad': 'La virtud de la grandeza: aspirar a cosas grandes, soñar en grande y convertir el sueño en una misión que da sentido a tu vida.',
};

export function RetosTemperamento({ paso, temperamento, onComplete }) {
  const [fase, setFase] = useState(-1);
  const [textoFacilita, setTextoFacilita] = useState('');
  const [textoDificulta, setTextoDificulta] = useState('');
  const [textoDefectos, setTextoDefectos] = useState('');
  const [lbSrc, setLbSrc] = useState(null);
  const [ejemploAbierto, setEjemploAbierto] = useState({});

  const p = temperamento?.primary;
  const s = temperamento?.secondary;
  const perfil = s ? `${p}-${s}` : p;
  const virtudDesafio = paso.virtud_desafio_map?.[perfil] ?? paso.virtud_desafio_map?.[p] ?? '—';
  const fd = paso.facilita_dificulta?.[p];
  const compensa = paso.secundario_compensa?.[perfil];


  if (fase === -1) {
    return <Caratula paso={paso} tipo="retos_temperamento" onEmpezar={() => { setFase(0); window.scrollTo({ top: 0, behavior: 'smooth' }); }} />;
  }

  if (fase === 0) {
    return (
      <div style={{ maxWidth: 800, margin: '0 auto' }}>
        <div style={tarjeta}>
          <div style={{ display: 'flex', gap: 22, alignItems: 'center', marginBottom: 18 }}>
            {RETRATO_TEMP[p] && (
              <img src={RETRATO_TEMP[p]} alt={TEMP_NOMBRE[p]} style={{ width: 140, height: 140, objectFit: 'cover', mixBlendMode: 'multiply', flexShrink: 0, borderRadius: 6 }} />
            )}
            <div style={{ flex: 1 }}>
              <div style={eyebrow}>Paso 1</div>
              <h2 style={{ fontFamily: FONT_SLAB, fontSize: 24, fontWeight: 700, color: NAVY, margin: '8px 0 10px' }}>
                Tu temperamento primario y las virtudes
              </h2>
              <p style={{ fontFamily: FONT_BODY, fontSize: 15, color: NAVY, lineHeight: 1.65, margin: 0 }}>
                Tu temperamento primario favorece la práctica de aspectos concretos de cada virtud y dificulta la práctica de otros aspectos.
              </p>
            </div>
          </div>

          {fd && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
              <div style={{ padding: '16px 18px', background: '#ecfdf5', borderLeft: '3px solid #10b981' }}>
                <div style={{ fontFamily: FONT_BODY, fontSize: 12, fontWeight: 700, color: '#065f46', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6 }}>Favorece</div>
                <div style={{ fontFamily: FONT_BODY, fontSize: 15, color: '#065f46', lineHeight: 1.5 }}>{fd.facilita}</div>
              </div>
              <div style={{ padding: '16px 18px', background: '#fef2f2', borderLeft: '3px solid #ef4444' }}>
                <div style={{ fontFamily: FONT_BODY, fontSize: 12, fontWeight: 700, color: '#991b1b', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6 }}>Dificulta</div>
                <div style={{ fontFamily: FONT_BODY, fontSize: 15, color: '#991b1b', lineHeight: 1.5 }}>{fd.dificulta}</div>
              </div>
            </div>
          )}

          {DIAGRAMA_TEMP[p] && (
            <div style={{ marginBottom: 20 }}>
              <button type="button" onClick={() => setLbSrc(DIAGRAMA_TEMP[p])} style={{
                background: 'none', border: 'none', padding: 0, cursor: 'pointer',
                fontFamily: FONT_BODY, fontSize: 14, fontWeight: 600, color: GOLD_REF_DK,
                display: 'flex', alignItems: 'center', gap: 5,
                textDecoration: 'underline', textUnderlineOffset: 3,
              }}>
                <IconoLupa />
                Ver diagrama de {TEMP_NOMBRE[p]}
              </button>
            </div>
          )}

          {lbSrc && <Lightbox src={lbSrc} alt="Diagrama de temperamento" onClose={() => setLbSrc(null)} />}

          <div style={{ marginBottom: 20 }}>
            <label style={{ fontFamily: FONT_BODY, fontSize: 14, fontWeight: 600, color: NAVY, display: 'block', marginBottom: 6 }}>
              Lo que mi temperamento me facilita
            </label>
            <textarea
              value={textoFacilita}
              onChange={(e) => setTextoFacilita(e.target.value)}
              placeholder="Escribe los aspectos de las virtudes que tu temperamento te facilita…"
              rows={3}
              style={{
                width: '100%', padding: '12px 14px', boxSizing: 'border-box',
                border: `1px solid ${LINE}`, fontFamily: FONT_BODY, fontSize: 15, color: NAVY,
                background: '#fff', resize: 'vertical', lineHeight: 1.55,
              }}
            />
            <EjemploColapsable
              texto={paso.ejemplos_facilita?.[p]}
              abierto={ejemploAbierto.facilita}
              onToggle={() => setEjemploAbierto(prev => ({ ...prev, facilita: !prev.facilita }))}
            />
          </div>

          <div style={{ marginBottom: 24 }}>
            <label style={{ fontFamily: FONT_BODY, fontSize: 14, fontWeight: 600, color: NAVY, display: 'block', marginBottom: 6 }}>
              Lo que mi temperamento me dificulta
            </label>
            <textarea
              value={textoDificulta}
              onChange={(e) => setTextoDificulta(e.target.value)}
              placeholder="Escribe los aspectos de las virtudes que tu temperamento te dificulta…"
              rows={3}
              style={{
                width: '100%', padding: '12px 14px', boxSizing: 'border-box',
                border: `1px solid ${LINE}`, fontFamily: FONT_BODY, fontSize: 15, color: NAVY,
                background: '#fff', resize: 'vertical', lineHeight: 1.55,
              }}
            />
            <EjemploColapsable
              texto={paso.ejemplos_dificulta?.[p]}
              abierto={ejemploAbierto.dificulta}
              onToggle={() => setEjemploAbierto(prev => ({ ...prev, dificulta: !prev.dificulta }))}
            />
          </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button type="button" onClick={() => { setLbSrc(null); setFase(1); window.scrollTo({ top: 0, behavior: 'smooth' }); }} style={{
              fontFamily: FONT_BODY, fontSize: 18, fontWeight: 600, color: '#fff',
              background: GOLD_REF, border: 'none', borderRadius: 0, padding: '16px 38px', cursor: 'pointer',
            }}>
              Siguiente →
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (fase === 1) {
    return (
      <div style={{ maxWidth: 800, margin: '0 auto' }}>
        <div style={tarjeta}>
          <h2 style={{ fontFamily: FONT_SLAB, fontSize: 26, fontWeight: 700, color: NAVY, margin: '0 0 14px', textAlign: 'center' }}>
            Tu virtud-desafío
          </h2>
          <p style={{ fontFamily: FONT_BODY, fontSize: 15, color: MUTED, lineHeight: 1.65, margin: '0 0 24px', textAlign: 'center' }}>
            Cada temperamento tiene una virtud-desafío: la virtud que más necesitas trabajar a lo largo de tu vida.
          </p>

          <div style={{
            padding: '24px 28px', background: BEIGE, borderLeft: `4px solid ${TEMP_COLORS[p] ?? GOLD_REF}`,
            marginBottom: 16,
          }}>
            <div style={{ fontFamily: FONT_BODY, fontSize: 12, fontWeight: 700, color: MUTED, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>
              Tu virtud-desafío
            </div>
            <div style={{ fontFamily: FONT_SLAB, fontSize: 28, fontWeight: 700, color: NAVY }}>
              {virtudDesafio}
            </div>
          </div>

          <p style={{ fontFamily: FONT_BODY, fontSize: 15, color: NAVY, lineHeight: 1.65, margin: '0 0 28px' }}>
            {VIRTUD_DESAFIO_DESC[virtudDesafio] ?? 'Si trabajas en ella, te será más fácil trabajar las demás virtudes.'}
          </p>

          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <button type="button" onClick={() => { setFase(0); window.scrollTo({ top: 0, behavior: 'smooth' }); }} style={{
              fontFamily: FONT_BODY, fontSize: 16, fontWeight: 600, color: NAVY,
              background: 'none', border: `1.5px solid ${LINE}`, borderRadius: 0, padding: '14px 28px', cursor: 'pointer',
            }}>
              ← Paso 1
            </button>
            <button type="button" onClick={() => { setFase(2); window.scrollTo({ top: 0, behavior: 'smooth' }); }} style={{
              fontFamily: FONT_BODY, fontSize: 18, fontWeight: 600, color: '#fff',
              background: GOLD_REF, border: 'none', borderRadius: 0, padding: '16px 38px', cursor: 'pointer',
            }}>
              Paso 2 →
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 800, margin: '0 auto' }}>
      <div style={tarjeta}>
        <div style={eyebrow}>Paso 2</div>
        <h2 style={{ fontFamily: FONT_SLAB, fontSize: 24, fontWeight: 700, color: NAVY, margin: '8px 0 14px' }}>
          Tu temperamento secundario
        </h2>
        <p style={{ fontFamily: FONT_BODY, fontSize: 15, color: NAVY, lineHeight: 1.65, margin: '0 0 18px' }}>
          Tu temperamento secundario puede compensar algunos defectos de tu temperamento primario.
        </p>

        {s && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
            <div style={{ padding: '14px 16px', background: BEIGE, borderLeft: `3px solid ${TEMP_COLORS[p] ?? LINE}`, display: 'flex', gap: 12, alignItems: 'center' }}>
              {RETRATO_TEMP[p] && <img src={RETRATO_TEMP[p]} alt={TEMP_NOMBRE[p]} style={{ width: 70, height: 70, objectFit: 'cover', mixBlendMode: 'multiply', borderRadius: 4, flexShrink: 0 }} />}
              <div>
                <div style={{ fontFamily: FONT_BODY, fontSize: 11, color: MUTED, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Primario</div>
                <div style={{ fontFamily: FONT_SLAB, fontSize: 20, fontWeight: 700, color: NAVY, marginTop: 4 }}>{TEMP_NOMBRE[p]}</div>
              </div>
            </div>
            <div style={{ padding: '14px 16px', background: BEIGE, borderLeft: `3px solid ${TEMP_COLORS[s] ?? LINE}`, display: 'flex', gap: 12, alignItems: 'center' }}>
              {RETRATO_TEMP[s] && <img src={RETRATO_TEMP[s]} alt={TEMP_NOMBRE[s]} style={{ width: 70, height: 70, objectFit: 'cover', mixBlendMode: 'multiply', borderRadius: 4, flexShrink: 0 }} />}
              <div>
                <div style={{ fontFamily: FONT_BODY, fontSize: 11, color: MUTED, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Secundario</div>
                <div style={{ fontFamily: FONT_SLAB, fontSize: 20, fontWeight: 700, color: NAVY, marginTop: 4 }}>{TEMP_NOMBRE[s]}</div>
              </div>
            </div>
          </div>
        )}

        {compensa && (
          <div style={{ padding: '16px 20px', background: '#f0fdf4', borderLeft: '3px solid #10b981', marginBottom: 20 }}>
            <p style={{ fontFamily: FONT_BODY, fontSize: 15, color: '#065f46', lineHeight: 1.6, margin: 0 }}>
              Como {TEMP_NOMBRE[p]}/{TEMP_NOMBRE[s]}, {compensa}.
            </p>
          </div>
        )}

        {DIAGRAMA_TEMP[s] && (
          <div style={{ marginBottom: 20 }}>
            <button type="button" onClick={() => setLbSrc(DIAGRAMA_TEMP[s])} style={{
              background: 'none', border: 'none', padding: 0, cursor: 'pointer',
              fontFamily: FONT_BODY, fontSize: 14, fontWeight: 600, color: GOLD_REF_DK,
              display: 'flex', alignItems: 'center', gap: 5,
              textDecoration: 'underline', textUnderlineOffset: 3,
            }}>
              <IconoLupa />
              Ver diagrama de {TEMP_NOMBRE[s]}
            </button>
          </div>
        )}

        {lbSrc && <Lightbox src={lbSrc} alt="Diagrama de temperamento" onClose={() => setLbSrc(null)} />}

        <div style={{ marginBottom: 24 }}>
          <label style={{ fontFamily: FONT_BODY, fontSize: 14, fontWeight: 600, color: NAVY, display: 'block', marginBottom: 6 }}>
            ¿Qué defectos de tu temperamento primario pueden ser superados con la ayuda de tu temperamento secundario?
          </label>
          <textarea
            value={textoDefectos}
            onChange={(e) => setTextoDefectos(e.target.value)}
            placeholder="Escribe tu reflexión…"
            rows={4}
            style={{
              width: '100%', padding: '12px 14px', boxSizing: 'border-box',
              border: `1px solid ${LINE}`, fontFamily: FONT_BODY, fontSize: 15, color: NAVY,
              background: '#fff', resize: 'vertical', lineHeight: 1.55,
            }}
          />
          <EjemploColapsable
            texto={paso.ejemplos_defectos?.[perfil]}
            abierto={ejemploAbierto.defectos}
            onToggle={() => setEjemploAbierto(prev => ({ ...prev, defectos: !prev.defectos }))}
          />
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 24 }}>
          <button type="button" onClick={() => { setLbSrc(null); setFase(1); window.scrollTo({ top: 0, behavior: 'smooth' }); }} style={{
            fontFamily: FONT_BODY, fontSize: 16, fontWeight: 600, color: NAVY,
            background: 'none', border: `1.5px solid ${LINE}`, borderRadius: 0, padding: '14px 28px', cursor: 'pointer',
          }}>
            ← Atrás
          </button>
          <button type="button" onClick={() => onComplete({ visto: true, textoFacilita, textoDificulta, textoDefectos })} style={{
            fontFamily: FONT_BODY, fontSize: 18, fontWeight: 600, color: '#fff',
            background: GOLD_REF, border: 'none', borderRadius: 0, padding: '16px 38px', cursor: 'pointer',
          }}>
            Siguiente →
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── CÍRCULO DE PERSONAS ─── */

const GRUPOS_SIMPLE = [
  ['familia', 'Familia'],
  ['amigos', 'Amigos'],
  ['trabajo', 'Trabajo / estudios'],
  ['otros', 'Otros'],
];

const MINI_PREGUNTAS_IDX = [0, 1, 2, 3, 5, 7];

const DIAG_IMPOSIBLE = new Set(['COL-FLE', 'FLE-COL', 'MEL-SAN', 'SAN-MEL']);

export function CirculoPersonas({ paso, user, onComplete }) {
  const [fase, setFase] = useState('intro');
  const [nombre, setNombre] = useState('');
  const [grupo, setGrupo] = useState(null);
  const [respuestas, setRespuestas] = useState([]);
  const [preguntaIdx, setPreguntaIdx] = useState(0);
  const [notas, setNotas] = useState('');
  const [guardando, setGuardando] = useState(false);
  const [personas, setPersonas] = useState([]);
  const [copiado, setCopiado] = useState(false);
  const temp = paso.temperamento_tema;

  const [ordenOpciones] = useState(() =>
    MINI_PREGUNTAS_IDX.map(() => {
      const o = [...TEMPS];
      for (let i = o.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [o[i], o[j]] = [o[j], o[i]];
      }
      return o;
    })
  );

  if (fase === 'intro') {
    return (
      <div style={{ maxWidth: 860, margin: '0 auto' }}>
        <div style={tarjeta}>
          <div style={{ textAlign: 'center', padding: '20px 0 10px' }}>
            <span style={{
              display: 'inline-grid', placeItems: 'center', width: 72, height: 72, borderRadius: '50%',
              background: BEIGE, border: `2px solid ${GOLD_REF}`,
              fontFamily: FONT_SLAB, fontSize: 32, fontWeight: 700, color: NAVY,
            }}>?</span>
          </div>
          <h2 style={{ fontFamily: FONT_SLAB, fontSize: 26, fontWeight: 700, color: NAVY, margin: '16px 0 12px', textAlign: 'center' }}>
            ¿Conoces a alguien así?
          </h2>
          <p style={{ fontFamily: FONT_BODY, fontSize: 16, color: MUTED, lineHeight: 1.7, textAlign: 'center', maxWidth: 520, margin: '0 auto 12px' }}>
            Mientras escuchabas la formación o hacías el examen de autoconciencia, ¿te venía alguien a la cabeza?
          </p>
          <p style={{ fontFamily: FONT_BODY, fontSize: 16, color: MUTED, lineHeight: 1.7, textAlign: 'center', maxWidth: 520, margin: '0 auto 28px' }}>
            Este ejercicio te invita a observar el temperamento de las personas que te rodean. Podrás anotar tus impresiones y crear un pequeño perfil para cada una.
          </p>
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <button type="button" onClick={() => setFase('datos')} style={{
              fontFamily: FONT_BODY, fontSize: 19, fontWeight: 600, color: '#fff',
              background: GOLD_REF, border: 'none', borderRadius: 0, padding: '18px 48px', cursor: 'pointer',
            }}>
              Empezar →
            </button>
          </div>
        </div>
      </div>
    );
  }

  function calcularResultado() {
    const puntos = { COL: 0, MEL: 0, SAN: 0, FLE: 0 };
    for (const r of respuestas) if (puntos[r] !== undefined) puntos[r] += 1;
    const resto = TEMPS.filter(k => k !== temp).sort((a, b) => puntos[b] - puntos[a]);
    let secundario = puntos[resto[0]] >= 2 ? resto[0] : null;
    const noSe = respuestas.filter(r => r === NO_SE).length;
    const confianza = noSe <= 1 ? 'media' : 'baja';
    const imposible = secundario && DIAG_IMPOSIBLE.has(`${temp}-${secundario}`);
    if (imposible) secundario = null;
    return { puntos, secundario, confianza, imposible, indeterminado: !secundario && !imposible };
  }

  function responder(tempCode) {
    const nuevas = [...respuestas, tempCode];
    setRespuestas(nuevas);
    if (preguntaIdx < MINI_PREGUNTAS_IDX.length - 1) {
      setPreguntaIdx(preguntaIdx + 1);
    } else {
      setFase('resumen');
    }
  }

  function retrocederPregunta() {
    if (preguntaIdx > 0) {
      setRespuestas(respuestas.slice(0, -1));
      setPreguntaIdx(preguntaIdx - 1);
    } else {
      setFase('datos');
      setRespuestas([]);
      setPreguntaIdx(0);
    }
  }

  async function guardar() {
    const n = nombre.trim();
    if (!n || !grupo || !user?.id) return;
    setGuardando(true);
    try {
      const { puntos, secundario, confianza } = calcularResultado();
      const { crearPersona, anotarObservacion } = await import('../account/personas');
      const estimacion = { primario: temp, secundario, confianza, puntos, respuestas };
      const persona = await crearPersona(user.id, { nombre: n, grupo }, estimacion);
      if (notas.trim() && persona?.id) {
        await anotarObservacion(user.id, persona.id, {
          situacion: 'nota_formacion', palabra: null, temperamento: null, linea: notas.trim(),
        });
      }
      setPersonas(prev => [...prev, { nombre: n, grupo, primario: temp, secundario }]);
      setNombre('');
      setGrupo(null);
      setRespuestas([]);
      setPreguntaIdx(0);
      setNotas('');
      setFase('datos');
    } catch (err) {
      console.error('Error al guardar persona:', err);
    } finally {
      setGuardando(false);
    }
  }

  const preguntaActual = fase === 'test' ? PREGUNTAS[MINI_PREGUNTAS_IDX[preguntaIdx]] : null;
  const resultado = fase === 'resumen' ? calcularResultado() : null;

  return (
    <div style={{ maxWidth: 800, margin: '0 auto' }}>
      <div style={tarjeta}>
        <div style={{ textAlign: 'center', marginBottom: 16 }}>
          <span style={{
            display: 'inline-grid', placeItems: 'center', width: 56, height: 56, borderRadius: '50%',
            background: TEMP_COLORS[temp] ?? BEIGE, border: `2px solid ${TEMP_COLORS[temp] ?? GOLD_REF}`,
            fontFamily: FONT_SLAB, fontSize: 22, fontWeight: 700, color: '#fff',
          }}>
            {TEMP_NOMBRE[temp]?.[0] ?? '?'}
          </span>
        </div>

        <h2 style={{ fontFamily: FONT_SLAB, fontSize: 24, fontWeight: 700, color: NAVY, margin: '0 0 8px', textAlign: 'center' }}>
          {paso.titulo}
        </h2>

        {/* ── FASE DATOS ── */}
        {fase === 'datos' && <>
          <p style={{ fontFamily: FONT_BODY, fontSize: 15, color: MUTED, lineHeight: 1.65, margin: '0 0 8px', textAlign: 'center' }}>
            {paso.pregunta}
          </p>
          <p style={{ fontFamily: FONT_BODY, fontSize: 14, color: NAVY, lineHeight: 1.5, margin: '0 0 22px', textAlign: 'center', fontStyle: 'italic' }}>
            {TEMP_NOMBRE[temp]}: {paso.descripcion_temp}
          </p>

          {personas.length > 0 && (
            <div style={{ marginBottom: 18 }}>
              <div style={{ fontFamily: FONT_BODY, fontSize: 12, fontWeight: 700, color: MUTED, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>
                Personas añadidas
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {personas.map((p, i) => (
                  <span key={i} style={{
                    fontFamily: FONT_BODY, fontSize: 14, padding: '6px 14px',
                    background: '#ecfdf5', border: '1px solid #10b981', color: '#065f46',
                  }}>
                    {p.nombre}{p.secundario ? ` · ${TEMP_NOMBRE[p.secundario]}` : ''}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div style={{ marginBottom: 14 }}>
            <label style={{ fontFamily: FONT_BODY, fontSize: 14, fontWeight: 600, color: NAVY, display: 'block', marginBottom: 6 }}>
              Nombre o apodo
            </label>
            <input
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder="Ej: María, mi jefe, el abuelo…"
              maxLength={40}
              autoComplete="off"
              style={{
                width: '100%', padding: '12px 14px', boxSizing: 'border-box',
                border: `1px solid ${LINE}`, fontFamily: FONT_BODY, fontSize: 15, color: NAVY,
                background: '#fff',
              }}
            />
          </div>

          <div style={{ marginBottom: 20 }}>
            <label style={{ fontFamily: FONT_BODY, fontSize: 14, fontWeight: 600, color: NAVY, display: 'block', marginBottom: 8 }}>
              ¿De qué entorno?
            </label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {GRUPOS_SIMPLE.map(([key, label]) => (
                <button key={key} type="button" onClick={() => setGrupo(grupo === key ? null : key)} style={{
                  fontFamily: FONT_BODY, fontSize: 14, padding: '8px 16px',
                  border: `1.5px solid ${grupo === key ? NAVY : LINE}`,
                  background: grupo === key ? NAVY : PAPER,
                  color: grupo === key ? PAPER : NAVY,
                  borderRadius: 0, cursor: 'pointer', transition: 'all 150ms ease',
                }}>
                  {label}
                </button>
              ))}
            </div>
          </div>

          {nombre.trim() && grupo && (
            <p style={{ fontFamily: FONT_BODY, fontSize: 14, color: MUTED, lineHeight: 1.6, margin: '0 0 14px', fontStyle: 'italic' }}>
              A continuación harás un breve test (6 preguntas) para estimar qué temperamento secundario tiene {nombre.trim()}.
            </p>
          )}

          <div style={{ display: 'flex', gap: 10, marginBottom: 8 }}>
            <button type="button" onClick={() => { setFase('test'); setPreguntaIdx(0); setRespuestas([]); }} disabled={!nombre.trim() || !grupo} style={{
              fontFamily: FONT_BODY, fontSize: 16, fontWeight: 600,
              color: nombre.trim() && grupo ? '#fff' : MUTED,
              background: nombre.trim() && grupo ? GOLD_REF : LINE,
              border: 'none', borderRadius: 0, padding: '14px 28px', cursor: nombre.trim() && grupo ? 'pointer' : 'default',
              transition: 'all 150ms ease',
            }}>
              Siguiente →
            </button>
          </div>

          <div style={{ borderTop: `1px solid ${LINE}`, marginTop: 20, paddingTop: 18, display: 'flex', justifyContent: 'flex-end' }}>
            <button type="button" onClick={() => onComplete({ personas: personas.length })} style={{
              fontFamily: FONT_BODY, fontSize: 18, fontWeight: 600, color: '#fff',
              background: GOLD_REF, border: 'none', borderRadius: 0, padding: '16px 38px', cursor: 'pointer',
            }}>
              {personas.length > 0 ? 'Continuar →' : 'Saltar →'}
            </button>
          </div>
        </>}

        {/* ── FASE LISTADO ── */}
        {fase === 'listado' && <>
          <h3 style={{ fontFamily: FONT_SLAB, fontSize: 22, fontWeight: 700, color: NAVY, margin: '0 0 6px', textAlign: 'center' }}>
            Personas añadidas
          </h3>
          <p style={{ fontFamily: FONT_BODY, fontSize: 14, color: MUTED, textAlign: 'center', margin: '0 0 20px' }}>
            {personas.length === 1 ? '1 persona' : `${personas.length} personas`}
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 24 }}>
            {personas.map((p, i) => {
              const grupoLabel = GRUPOS_SIMPLE.find(([k]) => k === p.grupo)?.[1] ?? p.grupo;
              return (
                <div key={i} style={{
                  display: 'flex', alignItems: 'center', gap: 14,
                  padding: '14px 18px', background: PAPER,
                  borderLeft: `4px solid ${TEMP_COLORS[p.primario] ?? GOLD_REF}`,
                  border: `1px solid ${LINE}`, borderLeftWidth: 4, borderLeftColor: TEMP_COLORS[p.primario] ?? GOLD_REF,
                }}>
                  <span style={{
                    display: 'inline-grid', placeItems: 'center', width: 38, height: 38, borderRadius: '50%',
                    background: TEMP_COLORS[p.primario] ? `${TEMP_COLORS[p.primario]}22` : BEIGE,
                    fontFamily: FONT_SLAB, fontSize: 16, fontWeight: 700, color: TEMP_COLORS[p.primario] ?? NAVY,
                    flexShrink: 0,
                  }}>
                    {i + 1}
                  </span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontFamily: FONT_BODY, fontSize: 16, fontWeight: 600, color: NAVY }}>
                      {p.nombre}
                    </div>
                    <div style={{ fontFamily: FONT_BODY, fontSize: 13, color: MUTED, marginTop: 2 }}>
                      {grupoLabel} · {TEMP_NOMBRE[p.primario]}{p.secundario ? ` / ${TEMP_NOMBRE[p.secundario]}` : ''}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <button type="button" onClick={() => setFase('datos')} style={{
              fontFamily: FONT_BODY, fontSize: 15, fontWeight: 600, color: NAVY,
              background: PAPER, border: `1.5px solid ${LINE}`, borderRadius: 0,
              padding: '14px 24px', cursor: 'pointer', flex: 1, minWidth: 160,
            }}>
              + Añadir otra persona
            </button>
            <button type="button" onClick={() => onComplete({ personas: personas.length })} style={{
              fontFamily: FONT_BODY, fontSize: 15, fontWeight: 600, color: '#fff',
              background: GOLD_REF, border: 'none', borderRadius: 0,
              padding: '14px 24px', cursor: 'pointer', flex: 1, minWidth: 160,
            }}>
              Continuar →
            </button>
          </div>
        </>}

        {/* ── FASE TEST (6 preguntas) ── */}
        {fase === 'test' && preguntaActual && <>
          <p style={{ fontFamily: FONT_BODY, fontSize: 13, color: MUTED, textAlign: 'center', margin: '0 0 6px' }}>
            Piensa en cómo reacciona {nombre.trim()}, no en cómo es por fuera.
          </p>
          <div style={{ ...barraFondo, margin: '12px 0 8px', height: 6 }}>
            <div style={{ height: '100%', width: `${Math.round(((preguntaIdx + 1) / MINI_PREGUNTAS_IDX.length) * 100)}%`, background: GOLD_REF_DK, transition: 'width 400ms ease' }} />
          </div>
          <div style={{ fontFamily: FONT_BODY, fontSize: 14, color: MUTED, marginBottom: 22, textAlign: 'center' }}>
            Pregunta {preguntaIdx + 1} de {MINI_PREGUNTAS_IDX.length}
          </div>

          <h3 style={{ fontFamily: FONT_SLAB, fontSize: 20, fontWeight: 700, color: NAVY, margin: '0 0 18px', textAlign: 'center' }}>
            {preguntaActual[0]}
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 16 }}>
            {ordenOpciones[preguntaIdx].map(tKey => (
              <button key={tKey} type="button" onClick={() => responder(tKey)} style={{
                fontFamily: FONT_BODY, fontSize: 15, padding: '14px 18px', textAlign: 'left',
                border: `1.5px solid ${LINE}`, background: PAPER, color: NAVY,
                borderRadius: 0, cursor: 'pointer', transition: 'all 150ms ease', lineHeight: 1.45,
              }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = GOLD_REF; e.currentTarget.style.background = '#fffbf0'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = LINE; e.currentTarget.style.background = PAPER; }}
              >
                {preguntaActual[1][tKey]}
              </button>
            ))}
            <button type="button" onClick={() => responder(NO_SE)} style={{
              fontFamily: FONT_BODY, fontSize: 14, padding: '10px 18px', textAlign: 'center',
              border: `1px dashed ${LINE}`, background: 'transparent', color: MUTED,
              borderRadius: 0, cursor: 'pointer', fontStyle: 'italic',
            }}>
              No lo sé
            </button>
          </div>

          <button type="button" onClick={retrocederPregunta} style={{
            fontFamily: FONT_BODY, fontSize: 14, color: MUTED, background: 'none', border: 'none',
            cursor: 'pointer', padding: '4px 0',
          }}>
            ← {preguntaIdx === 0 ? 'Volver' : 'Pregunta anterior'}
          </button>
        </>}

        {/* ── FASE RESUMEN + NOTAS ── */}
        {fase === 'resumen' && resultado && (() => {
          const sinResultado = resultado.imposible || !resultado.secundario;
          const urlTest = 'https://virtuousleadership.com/es/tests/temperamento?utm_source=portal&utm_medium=referral&utm_campaign=conoces_alguien';
          const textoWa = `Hola, te invito a hacer este test de temperamento para conocerte mejor: ${urlTest}`;
          const urlWa = `https://wa.me/?text=${encodeURIComponent(textoWa)}`;
          return <>
          <p style={{ fontFamily: FONT_BODY, fontSize: 15, color: MUTED, textAlign: 'center', margin: '0 0 20px', lineHeight: 1.6 }}>
            Resultado estimado para <strong style={{ color: NAVY }}>{nombre.trim()}</strong>
          </p>

          <div style={{ display: 'flex', justifyContent: 'center', gap: 16, marginBottom: 24, flexWrap: 'wrap' }}>
            <div style={{ textAlign: 'center', padding: '14px 22px', background: TEMP_COLORS[temp] ? `${TEMP_COLORS[temp]}18` : '#f5f0e8', border: `1.5px solid ${TEMP_COLORS[temp] ?? LINE}` }}>
              <div style={{ fontFamily: FONT_BODY, fontSize: 11, fontWeight: 700, color: MUTED, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>Primario</div>
              <div style={{ fontFamily: FONT_SLAB, fontSize: 18, fontWeight: 700, color: NAVY }}>{TEMP_NOMBRE[temp]}</div>
            </div>
            <div style={{ textAlign: 'center', padding: '14px 22px', background: resultado.secundario ? `${TEMP_COLORS[resultado.secundario]}18` : '#f9f9f9', border: `1.5px solid ${resultado.secundario ? TEMP_COLORS[resultado.secundario] : LINE}` }}>
              <div style={{ fontFamily: FONT_BODY, fontSize: 11, fontWeight: 700, color: MUTED, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>Secundario</div>
              <div style={{ fontFamily: FONT_SLAB, fontSize: 18, fontWeight: 700, color: resultado.secundario ? NAVY : MUTED }}>
                {resultado.secundario ? TEMP_NOMBRE[resultado.secundario] : 'No determinado'}
              </div>
            </div>
          </div>

          {sinResultado ? (
            <div style={{ textAlign: 'center', padding: '16px 20px', background: '#fef9ee', border: `1px solid ${GOLD_REF_LT}`, marginBottom: 20 }}>
              <p style={{ fontFamily: FONT_BODY, fontSize: 14, color: NAVY, margin: '0 0 6px', lineHeight: 1.6 }}>
                {resultado.imposible
                  ? `La combinación ${TEMP_NOMBRE[temp]} con el secundario estimado no es posible según el modelo de temperamentos.`
                  : 'Las respuestas no son suficientes para determinar un temperamento secundario.'}
              </p>
              <p style={{ fontFamily: FONT_BODY, fontSize: 13, color: MUTED, margin: 0, lineHeight: 1.5 }}>
                Lo mejor es que {nombre.trim()} haga el test de temperamento completo.
              </p>
            </div>
          ) : (
            <p style={{ fontFamily: FONT_BODY, fontSize: 12, color: MUTED, textAlign: 'center', fontStyle: 'italic', margin: '0 0 20px' }}>
              Es una estimación tuya — solo {nombre.trim()} puede confirmarlo haciendo el test.
            </p>
          )}

          {/* ── COMPARTIR TEST ── */}
          <div style={{ borderTop: `1px solid ${LINE}`, margin: '0 0 20px', paddingTop: 16 }}>
            <p style={{ fontFamily: FONT_BODY, fontSize: 14, fontWeight: 600, color: NAVY, margin: '0 0 10px', textAlign: 'center' }}>
              Invita a {nombre.trim()} a hacer el test completo
            </p>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
              <button type="button" onClick={() => { navigator.clipboard.writeText(urlTest).then(() => { setCopiado(true); setTimeout(() => setCopiado(false), 2000); }); }} style={{
                fontFamily: FONT_BODY, fontSize: 14, fontWeight: 600, padding: '10px 20px',
                border: `1.5px solid ${NAVY}`, background: copiado ? NAVY : PAPER,
                color: copiado ? PAPER : NAVY, borderRadius: 0, cursor: 'pointer',
                transition: 'all 150ms ease', minWidth: 140,
              }}>
                {copiado ? 'Enlace copiado' : 'Copiar enlace'}
              </button>
              <a href={urlWa} target="_blank" rel="noopener noreferrer" style={{
                fontFamily: FONT_BODY, fontSize: 14, fontWeight: 600, padding: '10px 20px',
                border: `1.5px solid #25d366`, background: '#25d366', color: '#fff',
                borderRadius: 0, textDecoration: 'none', textAlign: 'center', minWidth: 140,
                display: 'inline-block',
              }}>
                Compartir por WhatsApp
              </a>
            </div>
          </div>

          <div style={{ marginBottom: 20 }}>
            <label style={{ fontFamily: FONT_BODY, fontSize: 14, fontWeight: 600, color: NAVY, display: 'block', marginBottom: 6 }}>
              Notas sobre {nombre.trim()} <span style={{ fontWeight: 400, color: MUTED }}>(opcional)</span>
            </label>
            <textarea
              value={notas}
              onChange={(e) => setNotas(e.target.value)}
              placeholder="Observaciones, cómo le tratas, lo que te llama la atención…"
              rows={3}
              style={{
                width: '100%', padding: '12px 14px', boxSizing: 'border-box',
                border: `1px solid ${LINE}`, fontFamily: FONT_BODY, fontSize: 15, color: NAVY,
                background: '#fff', resize: 'vertical', minHeight: 70, lineHeight: 1.5,
              }}
            />
          </div>

          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <button type="button" onClick={() => { setFase('test'); setRespuestas(respuestas.slice(0, -1)); setPreguntaIdx(MINI_PREGUNTAS_IDX.length - 1); }} style={{
              fontFamily: FONT_BODY, fontSize: 14, color: MUTED, background: 'none', border: 'none',
              cursor: 'pointer', padding: '4px 0',
            }}>
              ← Volver
            </button>
            <button type="button" onClick={guardar} disabled={guardando} style={{
              fontFamily: FONT_BODY, fontSize: 16, fontWeight: 600,
              color: '#fff', background: GOLD_REF,
              border: 'none', borderRadius: 0, padding: '14px 28px', cursor: 'pointer',
              transition: 'all 150ms ease', flex: 1,
            }}>
              {guardando ? 'Guardando…' : 'Guardar persona'}
            </button>
          </div>
        </>;
        })()}
      </div>
    </div>
  );
}

/* ─── CONCLUSIÓN DE MÓDULO ─── */

export function ConclusionModulo({ paso, completados, pendientes = [], onContinuar, onVolver, irA }) {
  const aprendizajes = paso.aprendizajes ?? [];
  const ejercicios = paso.ejercicios_evaluables ?? [];
  const hayPendientes = pendientes.length > 0;

  const scores = ejercicios.map(e => {
    const id = typeof e === 'string' ? e : e.id;
    const label = typeof e === 'string' ? '' : (e.label ?? '');
    const c = completados[id];
    if (!c || typeof c.aciertos !== 'number') return null;
    return { id, label, aciertos: c.aciertos, total: c.total };
  }).filter(Boolean);

  const hayEvaluables = scores.length > 0;
  const todosACero = hayEvaluables && scores.every(s => s.aciertos === 0);
  const bloqueado = todosACero || hayPendientes;

  const ETIQUETAS = {
    video: 'Vídeo', quiz: 'Cuestionario', define: 'Definiciones', desliza: 'Desliza',
    identifica: 'Identifica', test_profundo: 'Test', reflexion_piramide: 'Reflexión',
    temperamento_magnanimidad: 'Temperamento', temperamento_perfil: 'Tu perfil',
    retos_temperamento: 'Retos', circulo_personas: 'Círculo de personas',
    reflexion_guiada: 'Reflexión', plan_crecimiento: 'Plan de crecimiento',
    test_caracter: 'Test de carácter', test_corazon: 'Test del corazón',
  };

  return (
    <div style={{ maxWidth: 860, margin: '0 auto' }}>
      <div style={tarjeta}>
        <div style={{ textAlign: 'center', padding: '20px 0 10px' }}>
          <span style={{
            display: 'inline-grid', placeItems: 'center', width: 72, height: 72, borderRadius: '50%',
            background: bloqueado ? '#fef2f2' : '#ecfdf5',
            border: `2px solid ${bloqueado ? '#ef4444' : '#10b981'}`,
            fontFamily: FONT_SLAB, fontSize: 32, fontWeight: 700,
            color: bloqueado ? '#991b1b' : '#065f46',
          }}>
            {bloqueado ? '✗' : '✓'}
          </span>
        </div>

        <h2 style={{ fontFamily: FONT_SLAB, fontSize: 26, fontWeight: 700, color: NAVY, margin: '14px 0 6px', textAlign: 'center', lineHeight: 1.3 }}>
          {hayPendientes
            ? 'Todavía no has completado todos los pasos'
            : todosACero ? 'Módulo no superado' : `Módulo ${paso.modulo_numero} completado`}
        </h2>
        <p style={{ fontFamily: FONT_BODY, fontSize: 15, color: MUTED, textAlign: 'center', margin: '0 0 20px' }}>
          {paso.modulo_titulo}
        </p>

        {hayPendientes && (
          <div style={{ padding: '16px 20px', background: '#fef2f2', borderLeft: '3px solid #ef4444', marginBottom: 20, lineHeight: 1.6 }}>
            <div style={{ fontFamily: FONT_BODY, fontSize: 13, fontWeight: 700, color: '#991b1b', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 10 }}>
              Debes finalizar los siguientes pasos
            </div>
            <ul style={{ margin: 0, paddingLeft: 0, listStyle: 'none' }}>
              {pendientes.map((p) => (
                <li key={p.id} style={{ marginBottom: 8 }}>
                  <button type="button" onClick={() => irA && irA(p.id)} style={{
                    background: 'none', border: 'none', padding: '6px 0', cursor: 'pointer',
                    fontFamily: FONT_BODY, fontSize: 15, color: GOLD_REF_DK, fontWeight: 600,
                    textDecoration: 'underline', textAlign: 'left',
                  }}>
                    {ETIQUETAS[p.tipo] ?? p.tipo}: {p.titulo}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}

        {!hayPendientes && hayEvaluables && (
          <div style={{ display: 'grid', gridTemplateColumns: scores.length > 1 ? 'repeat(2, 1fr)' : '1fr', gap: 14, marginBottom: 20 }}>
            {scores.map((s) => {
              const pct = s.total > 0 ? Math.round((s.aciertos / s.total) * 100) : 0;
              const ok = pct > 0;
              return (
                <div key={s.id} style={{ padding: '18px 20px', background: PAPER, border: `1px solid ${LINE}`, textAlign: 'center' }}>
                  <div style={{ fontFamily: FONT_SLAB, fontSize: 28, fontWeight: 700, color: ok ? (pct >= 70 ? '#065f46' : '#92400e') : '#991b1b' }}>
                    {s.aciertos} de {s.total}
                  </div>
                  {s.label && (
                    <div style={{ fontFamily: FONT_BODY, fontSize: 14, color: MUTED, marginTop: 4 }}>
                      {s.label}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {!hayPendientes && !bloqueado && aprendizajes.length > 0 && (
          <div style={{ padding: '16px 20px', background: BEIGE, borderLeft: `3px solid ${GOLD_REF}`, marginBottom: 20, lineHeight: 1.6 }}>
            <div style={{ fontFamily: FONT_BODY, fontSize: 13, fontWeight: 700, color: MUTED, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 10 }}>
              En este módulo has aprendido
            </div>
            <ul style={{ margin: 0, paddingLeft: 20 }}>
              {aprendizajes.map((a, i) => (
                <li key={i} style={{ fontFamily: FONT_BODY, fontSize: 16, color: NAVY, marginBottom: 6 }}>{a}</li>
              ))}
            </ul>
          </div>
        )}

        {!hayPendientes && todosACero && (
          <p style={{ fontFamily: FONT_BODY, fontSize: 15, color: '#991b1b', textAlign: 'center', margin: '0 0 8px', lineHeight: 1.5 }}>
            Necesitas aprobar los cuestionarios para avanzar al siguiente módulo.
          </p>
        )}

        <div style={{ display: 'flex', justifyContent: 'center', gap: 14, marginTop: 24, marginBottom: 8, flexWrap: 'wrap' }}>
          {bloqueado ? (
            <button type="button" onClick={onVolver} style={{
              fontFamily: FONT_BODY, fontSize: 17, fontWeight: 600, color: NAVY,
              background: BEIGE, border: `1.5px solid ${LINE}`, borderRadius: 0,
              padding: '16px 32px', cursor: 'pointer',
            }}>
              Volver al módulo
            </button>
          ) : (
            <button type="button" onClick={() => onContinuar({ completado: true })} style={{
              fontFamily: FONT_BODY, fontSize: 19, fontWeight: 600, color: '#fff',
              background: GOLD_REF, border: 'none', borderRadius: 0, padding: '18px 40px', cursor: 'pointer',
            }}>
              Siguiente módulo →
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export function ReflexionGuiada({ paso, temperamento, onComplete }) {
  const raw = paso.parrafos ?? [];
  const parrafos = raw.reduce((acc, p) => {
    if (p.tipo === 'generico') {
      acc.push(p.texto);
    } else if (p.tipo === 'condicional' && p.variantes) {
      const texto = p.variantes[temperamento?.primary];
      if (texto) acc.push(texto);
    }
    return acc;
  }, []);

  const paginas = parrafos.length <= 2
    ? parrafos.map(t => [t])
    : [[parrafos[0], parrafos[1]], parrafos.slice(2)];

  const [idx, setIdx] = useState(0);
  const [visible, setVisible] = useState(true);

  function siguiente() {
    setVisible(false);
    setTimeout(() => {
      if (idx < paginas.length - 1) {
        setIdx(idx + 1);
        setVisible(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        onComplete({});
      }
    }, 300);
  }

  if (!paginas.length) {
    onComplete({});
    return null;
  }

  const pag = paginas[idx];
  const esUltima = idx === paginas.length - 1;

  return (
    <div style={{ maxWidth: 800, margin: '0 auto' }}>
      <div style={eyebrow}>Reflexión</div>
      <div style={{ ...tarjeta, marginTop: 12 }}>
        <h2 style={{ fontFamily: FONT_SLAB, fontSize: 30, fontWeight: 700, color: NAVY, margin: '0 0 8px' }}>
          Reflexión guiada
        </h2>
        <div style={{ fontFamily: FONT_BODY, fontSize: 14, color: MUTED, marginBottom: 20 }}>
          {idx + 1} de {paginas.length}
        </div>

        <div style={{ marginBottom: 10, height: 3, background: `${LINE}55`, borderRadius: 2 }}>
          <div style={{ height: 3, background: GOLD_REF, borderRadius: 2, transition: 'width 400ms ease', width: `${((idx + 1) / paginas.length) * 100}%` }} />
        </div>

        <div style={{
          opacity: visible ? 1 : 0, transform: visible ? 'translateY(0)' : 'translateY(12px)',
          transition: 'opacity 300ms ease, transform 300ms ease',
          padding: '24px 0', display: 'flex', flexDirection: 'column', gap: 14,
        }}>
          {pag.map((texto, i) => (
            <p key={i} style={{ fontFamily: FONT_BODY, fontSize: 20, color: NAVY, lineHeight: 1.75, margin: 0 }}>
              {texto}
            </p>
          ))}
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 12 }}>
          <button type="button" onClick={siguiente} style={{
            fontFamily: FONT_BODY, fontSize: 18, fontWeight: 600, color: '#fff',
            background: GOLD_REF, border: 'none', borderRadius: 0,
            padding: '14px 36px', cursor: 'pointer',
          }}>
            {esUltima ? 'Continuar →' : 'Siguiente →'}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── TEST DE CARÁCTER (E2) — embebido en formación ─── */

const CHAR_VIRTUE_ORDER = ['P', 'C', 'S', 'J', 'M', 'H'];
const CHAR_FACES = { P: faceP, C: faceC, S: faceS, J: faceJ, M: faceM, H: faceH };
const CHAR_COLORS = {
  P: { color: '#5B8C5A' }, C: { color: '#C0392B' }, S: { color: '#2980B9' },
  J: { color: '#8E44AD' }, M: { color: '#D4A017' }, H: { color: '#16A085' },
};

const { order: CHAR_CANONICAL, groups: CHAR_GROUPS } = (() => {
  const groups = Object.fromEntries(CHAR_VIRTUE_ORDER.map(v => [v, []]));
  CHARACTER_TEST.questions.forEach((q, i) => {
    const v = q.code && q.code[0];
    if (groups[v]) groups[v].push(i);
    else groups[CHAR_VIRTUE_ORDER[0]].push(i);
  });
  const order = [];
  for (const v of CHAR_VIRTUE_ORDER) order.push(...groups[v]);
  return { order, groups };
})();

const CHAR_CUMULATIVE = (() => {
  const cum = [];
  let acc = 0;
  for (const v of CHAR_VIRTUE_ORDER) {
    acc += CHAR_GROUPS[v].length;
    cum.push(acc);
  }
  return cum;
})();

function resolveCharSupport(supportObj, key) {
  const entry = supportObj?.[key];
  if (!entry) return '';
  return entry.es || entry.en || '';
}

function CharMilestoneModal({ virtueCode, pct, onContinue }) {
  const face = CHAR_FACES[virtueCode];
  const c = CHAR_COLORS[virtueCode];
  const virtueName = resolveCharSupport(CHARACTER_SUPPORT.labels, `chResult${virtueCode}`);

  return (
    <div role="dialog" aria-modal="true" style={{
      position: 'fixed', inset: 0, zIndex: 1000,
      background: 'rgba(27, 42, 74, 0.55)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16,
    }}>
      <div style={{
        background: PAPER, maxWidth: 440, width: '100%', borderRadius: 4,
        borderTop: `4px solid ${c.color}`,
        boxShadow: '0 20px 60px rgba(0,0,0,0.25)',
        padding: '32px 28px', textAlign: 'center',
      }}>
        <div style={{ ...eyebrow, marginBottom: 4 }}>Virtud completada</div>
        <div style={{
          margin: '4px auto 20px', width: 120, height: 120, borderRadius: '50%',
          border: `3px solid ${c.color}`, overflow: 'hidden', background: BEIGE,
        }}>
          <img src={face} alt={virtueName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        </div>
        <h3 style={{ fontFamily: FONT_SLAB, fontSize: 24, fontWeight: 700, color: NAVY, margin: '0 0 8px' }}>
          {virtueName}
        </h3>
        <div style={{ fontFamily: FONT_SLAB, fontSize: 48, fontWeight: 600, color: c.color, lineHeight: 1, margin: '12px 0 20px' }}>
          {Math.round(pct)}%
        </div>
        <p style={{ fontFamily: FONT_BODY, fontSize: 14, color: MUTED, lineHeight: 1.5, margin: '0 0 24px' }}>
          Esta puntuación refleja tu estado actual en esta virtud. Las virtudes se desarrollan con la práctica.
        </p>
        <button onClick={onContinue} style={{
          fontFamily: FONT_BODY, fontSize: 18, fontWeight: 600, color: '#fff',
          background: GOLD_REF, border: 'none', borderRadius: 0, padding: '14px 36px',
          cursor: 'pointer', width: '100%',
        }}>
          Continuar
        </button>
      </div>
    </div>
  );
}

function CharResultSummary({ scoreResult, onContinue }) {
  return (
    <div style={{ maxWidth: 860, margin: '0 auto' }}>
      <div style={tarjeta}>
        <div style={{ textAlign: 'center', padding: '12px 0 8px' }}>
          <span style={{
            display: 'inline-grid', placeItems: 'center', width: 64, height: 64, borderRadius: '50%',
            background: BEIGE, border: `2px solid ${GOLD_REF}`,
            fontFamily: FONT_SLAB, fontSize: 28, fontWeight: 700, color: GOLD_REF_DK,
          }}>&#x2726;</span>
        </div>
        <h2 style={{ fontFamily: FONT_SLAB, fontSize: 26, fontWeight: 700, color: NAVY, margin: '14px 0 8px', textAlign: 'center' }}>
          Tu perfil de carácter
        </h2>
        <p style={{ fontFamily: FONT_BODY, fontSize: 16, color: MUTED, textAlign: 'center', margin: '0 0 24px', lineHeight: 1.6 }}>
          Aquí tienes tu resultado en las seis virtudes del liderazgo. Podrás consultarlo en tu panel.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 12, marginBottom: 24 }}>
          {CHAR_VIRTUE_ORDER.map(code => {
            const s = scoreResult[code];
            const c = CHAR_COLORS[code];
            const virtueName = resolveCharSupport(CHARACTER_SUPPORT.labels, s.virtue_label_key);
            return (
              <div key={code} style={{
                background: PAPER, border: `1px solid ${LINE}`, borderTop: `3px solid ${c.color}`,
                padding: '18px 14px', textAlign: 'center',
              }}>
                <div style={{ fontFamily: FONT_SLAB, fontSize: 32, fontWeight: 600, color: c.color, lineHeight: 1 }}>
                  {Math.round(s.global ?? 0)}%
                </div>
                <div style={{ fontFamily: FONT_BODY, fontSize: 11, color: NAVY, textTransform: 'uppercase', letterSpacing: '0.08em', marginTop: 8, fontWeight: 600 }}>
                  {virtueName}
                </div>
              </div>
            );
          })}
        </div>

        {CHAR_VIRTUE_ORDER.map(code => {
          const s = scoreResult[code];
          const c = CHAR_COLORS[code];
          const face = CHAR_FACES[code];
          const virtueName = resolveCharSupport(CHARACTER_SUPPORT.labels, s.virtue_label_key);
          const passiveName = resolveCharSupport(CHARACTER_SUPPORT.labels, s.passive_facet_key);
          const activeName = resolveCharSupport(CHARACTER_SUPPORT.labels, s.active_facet_key);
          return (
            <div key={code} style={{
              background: PAPER, border: `1px solid ${LINE}`, borderLeft: `4px solid ${c.color}`,
              marginBottom: 12, padding: '16px 20px',
              display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap',
            }}>
              <div style={{
                width: 48, height: 48, borderRadius: '50%', overflow: 'hidden', flexShrink: 0,
                border: `2px solid ${c.color}`, background: BEIGE,
              }}>
                <img src={face} alt={virtueName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
              <div style={{ flex: '1 1 140px', minWidth: 120 }}>
                <div style={{ fontFamily: FONT_SLAB, fontSize: 20, fontWeight: 700, color: NAVY }}>{virtueName}</div>
              </div>
              <div style={{ fontFamily: FONT_SLAB, fontSize: 26, fontWeight: 600, color: c.color }}>
                {Math.round(s.global ?? 0)}%
              </div>
              <div style={{ width: '100%', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                <div style={{ padding: '8px 12px', background: BEIGE }}>
                  <div style={{ fontFamily: FONT_BODY, fontSize: 11, color: MUTED, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Aspecto pasivo</div>
                  <div style={{ fontFamily: FONT_BODY, fontSize: 14, color: NAVY, fontWeight: 500 }}>{passiveName} — {Math.round(s.passive ?? 0)}%</div>
                </div>
                <div style={{ padding: '8px 12px', background: BEIGE }}>
                  <div style={{ fontFamily: FONT_BODY, fontSize: 11, color: MUTED, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Aspecto activo</div>
                  <div style={{ fontFamily: FONT_BODY, fontSize: 14, color: NAVY, fontWeight: 500 }}>{activeName} — {Math.round(s.active ?? 0)}%</div>
                </div>
              </div>
            </div>
          );
        })}

        <div style={{ display: 'flex', justifyContent: 'center', marginTop: 24, marginBottom: 8 }}>
          <button type="button" onClick={onContinue} style={{
            fontFamily: FONT_BODY, fontSize: 19, fontWeight: 600, color: '#fff',
            background: GOLD_REF, border: 'none', borderRadius: 0, padding: '18px 40px', cursor: 'pointer',
          }}>
            Continuar →
          </button>
        </div>
      </div>
    </div>
  );
}

export function TestCaracterFormacion({ paso, onComplete }) {
  const [fase, setFase] = useState('caratula');
  const [answers, setAnswers] = useState([]);
  const [idx, setIdx] = useState(0);
  const [milestone, setMilestone] = useState(null);

  const scoreResult = useMemo(() => {
    if (fase !== 'resultado') return null;
    const canonical = new Array(CHARACTER_TEST.questions.length).fill(0);
    for (let i = 0; i < CHAR_CANONICAL.length; i++) {
      canonical[CHAR_CANONICAL[i]] = answers[i] ?? 0;
    }
    return scoreCharacter(canonical, CHARACTER_TEST);
  }, [fase, answers]);

  function handleStart() {
    setAnswers([]);
    setIdx(0);
    setMilestone(null);
    setFase('preguntas');
  }

  function handleAnswer(value) {
    const next = [...answers];
    next[idx] = value;
    setAnswers(next);

    const total = CHAR_CANONICAL.length;
    const nextIdx = idx + 1;

    const cutoffIdx = CHAR_CUMULATIVE.indexOf(nextIdx);
    if (cutoffIdx >= 0 && cutoffIdx < CHAR_CUMULATIVE.length - 1) {
      const virtueCode = CHAR_VIRTUE_ORDER[cutoffIdx];
      const canonical = new Array(CHARACTER_TEST.questions.length).fill(0);
      for (let i = 0; i < next.length; i++) {
        canonical[CHAR_CANONICAL[i]] = next[i] ?? 0;
      }
      const res = scoreCharacter(canonical, CHARACTER_TEST);
      const pct = res?.[virtueCode]?.global ?? 0;
      setMilestone({ virtueCode, pct });
      return;
    }

    if (nextIdx < total) {
      setIdx(nextIdx);
    } else {
      setFase('resultado');
      const canonical = new Array(CHARACTER_TEST.questions.length).fill(0);
      for (let i = 0; i < next.length; i++) {
        canonical[CHAR_CANONICAL[i]] = next[i] ?? 0;
      }
      const result = scoreCharacter(canonical, CHARACTER_TEST);
      void saveCharacterResultIfLoggedIn(result);
    }
  }

  function handleMilestoneContinue() {
    setMilestone(null);
    setIdx(idx + 1);
  }

  function handleBack() {
    if (idx > 0 && !milestone) setIdx(idx - 1);
  }

  if (fase === 'caratula') {
    return (
      <Caratula
        paso={{ ...paso, descripcion: paso.descripcion }}
        tipo="test_caracter"
        modulo={null}
        onEmpezar={handleStart}
      />
    );
  }

  if (fase === 'resultado' && scoreResult) {
    return <CharResultSummary scoreResult={scoreResult} onContinue={() => onComplete({ scoreResult })} />;
  }

  const itemIdx = CHAR_CANONICAL[idx];
  const item = CHARACTER_TEST.questions[itemIdx];
  const text = item.text?.es || item.text?.en || '';
  const total = CHAR_CANONICAL.length;
  const pct = total > 0 ? Math.round(((idx + 1) / total) * 100) : 0;

  const LIKERT = [
    { key: 'sa', value: 1, label: 'Totalmente de acuerdo' },
    { key: 'a', value: 0.5, label: 'De acuerdo' },
    { key: 'n', value: 0, label: 'Neutral' },
    { key: 'd', value: -0.5, label: 'En desacuerdo' },
    { key: 'sd', value: -1, label: 'Totalmente en desacuerdo' },
  ];

  return (
    <>
      <Shell titulo="Test de carácter" actual={idx + 1} total={total}>
        <div style={tarjeta}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <span style={{ fontFamily: FONT_BODY, fontSize: 14, color: MUTED }}>{idx + 1} de {total}</span>
            <button
              type="button"
              disabled={idx === 0 || !!milestone}
              onClick={handleBack}
              style={{
                background: 'none', border: 'none', padding: 0,
                fontFamily: FONT_BODY, fontSize: 14, fontWeight: 600, color: GOLD_REF_DK,
                cursor: idx > 0 && !milestone ? 'pointer' : 'default',
                opacity: idx > 0 && !milestone ? 1 : 0.3,
              }}
            >
              ← Anterior
            </button>
          </div>

          <p style={{ fontFamily: FONT_SLAB, fontSize: 22, fontWeight: 500, color: NAVY, margin: '20px 0 24px', lineHeight: 1.45 }}>
            {text}
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {LIKERT.map(opt => (
              <button
                key={opt.key}
                type="button"
                onClick={() => handleAnswer(opt.value)}
                style={{
                  fontFamily: FONT_BODY, fontSize: 17, lineHeight: 1.5,
                  padding: '16px 20px', border: `1.5px solid ${LINE}`,
                  background: PAPER, color: NAVY, borderRadius: 0,
                  cursor: 'pointer', textAlign: 'left',
                  transition: 'all 160ms ease',
                }}
                onMouseOver={e => { e.currentTarget.style.background = GOLD_REF; e.currentTarget.style.color = '#fff'; e.currentTarget.style.borderColor = GOLD_REF; }}
                onMouseOut={e => { e.currentTarget.style.background = PAPER; e.currentTarget.style.color = NAVY; e.currentTarget.style.borderColor = LINE; }}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      </Shell>
      {milestone && (
        <CharMilestoneModal
          virtueCode={milestone.virtueCode}
          pct={milestone.pct}
          onContinue={handleMilestoneContinue}
        />
      )}
    </>
  );
}

export function Sintesis({ paso, temperamento, onComplete }) {
  const map = paso.sintesis?.virtud_desafio_map ?? {};
  const p = temperamento?.primary;
  const s = temperamento?.secondary;
  const perfilSintesis = s ? `${p}-${s}` : p;
  const virtudDesafio = map[perfilSintesis] ?? map[p] ?? '';
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
    <div style={{ maxWidth: 800, margin: '0 auto' }}>
      <div style={eyebrow}>Mi Síntesis</div>
      <div style={{ ...tarjeta, marginTop: 12 }}>
        <h2 style={{ fontFamily: FONT_SLAB, fontSize: 26, fontWeight: 700, color: NAVY, margin: '0 0 20px' }}>
          Conclusiones del Curso 1
        </h2>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 14, marginBottom: 20 }}>
          <div style={{ padding: 16, background: BEIGE, borderLeft: `3px solid ${TEMP_COLORS[temperamento?.primary] ?? LINE}` }}>
            <div style={{ fontFamily: FONT_BODY, fontSize: 12, color: MUTED, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Temperamento primario</div>
            <div style={{ fontFamily: FONT_SLAB, fontSize: 22, fontWeight: 700, color: NAVY, marginTop: 4 }}>
              {TEMP_NOMBRE_LOCAL[temperamento?.primary] ?? '—'}
            </div>
          </div>
          <div style={{ padding: 16, background: BEIGE, borderLeft: `3px solid ${TEMP_COLORS[temperamento?.secondary] ?? LINE}` }}>
            <div style={{ fontFamily: FONT_BODY, fontSize: 12, color: MUTED, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Temperamento secundario</div>
            <div style={{ fontFamily: FONT_SLAB, fontSize: 22, fontWeight: 700, color: NAVY, marginTop: 4 }}>
              {TEMP_NOMBRE_LOCAL[temperamento?.secondary] ?? '—'}
            </div>
          </div>
        </div>

        <div style={{ padding: 16, background: `linear-gradient(135deg, ${BEIGE}, rgba(165,139,38,0.08))`, borderLeft: `3px solid ${GOLD_REF}`, marginBottom: 20 }}>
          <div style={{ fontFamily: FONT_BODY, fontSize: 12, color: MUTED, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Tu virtud-desafío</div>
          <div style={{ fontFamily: FONT_SLAB, fontSize: 24, fontWeight: 700, color: GOLD_REF_DK, marginTop: 4 }}>
            {virtudDesafio || '—'}
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <span style={{ fontFamily: FONT_BODY, fontSize: 18, fontWeight: 600, color: NAVY }}>Lo que mi temperamento me facilita</span>
            <input type="text" value={datos.lo_que_facilita} onChange={(e) => setDatos((d) => ({ ...d, lo_que_facilita: e.target.value }))}
              placeholder="Una frase..." style={{
                fontFamily: FONT_BODY, fontSize: 18, padding: '16px 18px', border: `1px solid ${LINE}`,
                borderRadius: 0, outline: 'none', width: '100%', background: '#fff',
              }} />
          </label>
          <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <span style={{ fontFamily: FONT_BODY, fontSize: 18, fontWeight: 600, color: NAVY }}>Lo que más me cuesta</span>
            <input type="text" value={datos.lo_que_cuesta} onChange={(e) => setDatos((d) => ({ ...d, lo_que_cuesta: e.target.value }))}
              placeholder="Una frase..." style={{
                fontFamily: FONT_BODY, fontSize: 18, padding: '16px 18px', border: `1px solid ${LINE}`,
                borderRadius: 0, outline: 'none', width: '100%', background: '#fff',
              }} />
          </label>
          <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <span style={{ fontFamily: FONT_BODY, fontSize: 18, fontWeight: 600, color: NAVY }}>Mi propósito para las próximas semanas</span>
            <textarea value={datos.proposito} onChange={(e) => setDatos((d) => ({ ...d, proposito: e.target.value }))}
              placeholder="Escribe tu propósito..." style={{
                fontFamily: FONT_BODY, fontSize: 18, padding: '16px 18px', border: `1px solid ${LINE}`,
                borderRadius: 0, outline: 'none', width: '100%', minHeight: 100, resize: 'vertical', background: '#fff',
              }} />
          </label>
        </div>

        <div style={{ marginTop: 22, display: 'flex', justifyContent: 'flex-end' }}>
          <button type="button" onClick={guardar}
            disabled={!datos.lo_que_facilita.trim() || !datos.lo_que_cuesta.trim() || !datos.proposito.trim()}
            style={{
              fontFamily: FONT_BODY, fontSize: 19, fontWeight: 600, color: '#fff',
              background: (datos.lo_que_facilita.trim() && datos.lo_que_cuesta.trim() && datos.proposito.trim()) ? GOLD_REF : LINE,
              border: 'none', borderRadius: 0, padding: '16px 38px',
              cursor: (datos.lo_que_facilita.trim() && datos.lo_que_cuesta.trim() && datos.proposito.trim()) ? 'pointer' : 'default',
            }}>
            Pasar al siguiente curso →
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── TEST DEL CORAZÓN (inline en formación, curso 5) ─── */

const HEART_FACES = { R: heartFaceR, VR: heartFaceVR, VM: heartFaceVM, VI: heartFaceVI, VC: heartFaceVC, SV: heartFaceSV, SI: heartFaceSI, SC: heartFaceSC };
const HEART_STAGE_COLORS = { none: '#10b981', stage1: '#f59e0b', stage2: '#ef4444' };
const HEART_STAGE_LABELS = { none: 'Sin inclinación', stage1: 'Cierta inclinación', stage2: 'Fuerte inclinación' };

function resolveHeartLabel(key) {
  const entry = HEART_SUPPORT?.labels?.[key];
  if (!entry) return '';
  return entry.es || entry.en || '';
}

function HeartMilestoneModal({ disorderCode, pct, onContinue }) {
  const face = HEART_FACES[disorderCode];
  const name = resolveHeartLabel(`hResult${disorderCode}`);
  const stageColor = pct >= 66 ? HEART_STAGE_COLORS.stage2 : pct >= 33 ? HEART_STAGE_COLORS.stage1 : HEART_STAGE_COLORS.none;

  return (
    <div role="dialog" aria-modal="true" style={{
      position: 'fixed', inset: 0, zIndex: 1000,
      background: 'rgba(27, 42, 74, 0.55)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16,
    }}>
      <div style={{
        background: PAPER, maxWidth: 440, width: '100%', borderRadius: 4,
        borderTop: `4px solid ${stageColor}`,
        boxShadow: '0 20px 60px rgba(0,0,0,0.25)',
        padding: '32px 28px', textAlign: 'center',
      }}>
        <div style={{ ...eyebrow, marginBottom: 4 }}>Bloque completado</div>
        <div style={{
          margin: '4px auto 20px', width: 120, height: 120, borderRadius: '50%',
          border: `3px solid ${stageColor}`, overflow: 'hidden', background: BEIGE,
        }}>
          <img src={face} alt={name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        </div>
        <h3 style={{ fontFamily: FONT_SLAB, fontSize: 24, fontWeight: 700, color: NAVY, margin: '0 0 8px' }}>
          {name}
        </h3>
        <div style={{ fontFamily: FONT_SLAB, fontSize: 48, fontWeight: 600, color: stageColor, lineHeight: 1, margin: '12px 0 20px' }}>
          {Math.round(pct)}%
        </div>
        <p style={{ fontFamily: FONT_BODY, fontSize: 14, color: MUTED, lineHeight: 1.5, margin: '0 0 24px' }}>
          Al finalizar el test podrás ver el diagnóstico y remedio de cada enfermedad.
        </p>
        <button type="button" onClick={onContinue} style={{
          fontFamily: FONT_BODY, fontSize: 18, fontWeight: 600, color: '#fff',
          background: GOLD_REF, border: 'none', borderRadius: 0, padding: '14px 36px',
          cursor: 'pointer', width: '100%',
        }}>
          Continuar
        </button>
      </div>
    </div>
  );
}

function HeartResultSummary({ scoreResult, onContinue }) {
  const balanced = scoreResult.verdict === 'balanced';

  return (
    <div style={{ maxWidth: 860, margin: '0 auto' }}>
      <div style={tarjeta}>
        <div style={{ textAlign: 'center', padding: '12px 0 8px' }}>
          <span style={{
            display: 'inline-grid', placeItems: 'center', width: 64, height: 64, borderRadius: '50%',
            background: balanced ? '#ecfdf5' : BEIGE, border: `2px solid ${balanced ? '#10b981' : GOLD_REF}`,
            fontFamily: FONT_SLAB, fontSize: 28, fontWeight: 700, color: balanced ? '#065f46' : GOLD_REF_DK,
          }}>♡</span>
        </div>
        <h2 style={{ fontFamily: FONT_SLAB, fontSize: 26, fontWeight: 700, color: NAVY, margin: '14px 0 8px', textAlign: 'center' }}>
          {balanced ? 'Corazón equilibrado' : 'Tu perfil del corazón'}
        </h2>
        <p style={{ fontFamily: FONT_BODY, fontSize: 16, color: MUTED, textAlign: 'center', margin: '0 0 24px', lineHeight: 1.6 }}>
          {balanced
            ? 'No se detectan inclinaciones marcadas hacia ninguna enfermedad espiritual. Podrás consultarlo en tu panel.'
            : 'Aquí tienes tu resultado en las ocho enfermedades espirituales. Podrás consultarlo en tu panel.'}
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 12, marginBottom: 24 }}>
          {HEART_DISORDER_CODES.map(code => {
            const d = scoreResult.disorders[code];
            const stageColor = HEART_STAGE_COLORS[d.stage];
            const name = resolveHeartLabel(d.label_key);
            return (
              <div key={code} style={{
                background: PAPER, border: `1px solid ${LINE}`, borderTop: `3px solid ${stageColor}`,
                padding: '18px 14px', textAlign: 'center',
              }}>
                <div style={{
                  width: 56, height: 56, borderRadius: '50%', overflow: 'hidden', margin: '0 auto 10px',
                  border: `2px solid ${stageColor}`, background: BEIGE,
                }}>
                  <img src={HEART_FACES[code]} alt={name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
                <div style={{ fontFamily: FONT_SLAB, fontSize: 28, fontWeight: 600, color: stageColor, lineHeight: 1 }}>
                  {Math.round(d.pct)}%
                </div>
                <div style={{ fontFamily: FONT_BODY, fontSize: 11, color: NAVY, textTransform: 'uppercase', letterSpacing: '0.06em', marginTop: 8, fontWeight: 600 }}>
                  {name}
                </div>
                <div style={{ fontFamily: FONT_BODY, fontSize: 11, color: MUTED, marginTop: 4 }}>
                  {HEART_STAGE_LABELS[d.stage]}
                </div>
              </div>
            );
          })}
        </div>

        <div style={{ display: 'flex', justifyContent: 'center', marginTop: 24, marginBottom: 8 }}>
          <button type="button" onClick={onContinue} style={{
            fontFamily: FONT_BODY, fontSize: 19, fontWeight: 600, color: '#fff',
            background: GOLD_REF, border: 'none', borderRadius: 0, padding: '18px 40px', cursor: 'pointer',
          }}>
            Continuar →
          </button>
        </div>
      </div>
    </div>
  );
}

export function TestCorazonFormacion({ paso, onComplete }) {
  const [fase, setFase] = useState('caratula');
  const [answers, setAnswers] = useState([]);
  const [idx, setIdx] = useState(0);
  const [milestone, setMilestone] = useState(null);

  const questions = HEART_TEST.questions;
  const total = questions.length;

  const scoreResult = useMemo(() => {
    if (fase !== 'resultado') return null;
    return scoreHeart(answers, HEART_TEST);
  }, [fase, answers]);

  function handleStart() {
    setAnswers([]);
    setIdx(0);
    setMilestone(null);
    setFase('preguntas');
  }

  function handleAnswer(value) {
    const next = [...answers];
    next[idx] = value;
    setAnswers(next);

    const nextIdx = idx + 1;

    if (nextIdx % 4 === 0 && nextIdx < total) {
      const disorderIdx = Math.floor(idx / 4);
      const disorder = HEART_TEST.disorders[disorderIdx];
      if (disorder) {
        let score = 0;
        for (let i = disorderIdx * 4; i < disorderIdx * 4 + 4; i++) {
          score += next[i] ?? 0;
        }
        const pct = Math.round((score / 16) * 100);
        setMilestone({ disorderCode: disorder.code, pct });
        return;
      }
    }

    if (nextIdx < total) {
      setIdx(nextIdx);
    } else {
      setFase('resultado');
      const result = scoreHeart(next, HEART_TEST);
      void saveHeartResultIfLoggedIn(result);
    }
  }

  function handleMilestoneContinue() {
    setMilestone(null);
    const nextIdx = idx + 1;
    if (nextIdx < total) {
      setIdx(nextIdx);
    } else {
      const result = scoreHeart(answers, HEART_TEST);
      void saveHeartResultIfLoggedIn(result);
      setFase('resultado');
    }
  }

  function handleBack() {
    if (idx > 0 && !milestone) setIdx(idx - 1);
  }

  if (fase === 'caratula') {
    return (
      <Caratula
        paso={{ ...paso, descripcion: paso.descripcion }}
        tipo="test_corazon"
        modulo={null}
        onEmpezar={handleStart}
      />
    );
  }

  if (fase === 'resultado' && scoreResult) {
    return <HeartResultSummary scoreResult={scoreResult} onContinue={() => onComplete({ scoreResult })} />;
  }

  const item = questions[idx];
  const text = item.text?.es || item.text?.en || '';

  const LIKERT = [
    { key: 'sa', value: 4, label: 'Totalmente de acuerdo' },
    { key: 'a', value: 3, label: 'De acuerdo' },
    { key: 'n', value: 2, label: 'Neutral' },
    { key: 'd', value: 1, label: 'En desacuerdo' },
    { key: 'sd', value: 0, label: 'Totalmente en desacuerdo' },
  ];

  return (
    <>
      <Shell titulo="Test del corazón" actual={idx + 1} total={total}>
        <div style={tarjeta}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <span style={{ fontFamily: FONT_BODY, fontSize: 14, color: MUTED }}>{idx + 1} de {total}</span>
            <button
              type="button"
              disabled={idx === 0 || !!milestone}
              onClick={handleBack}
              style={{
                background: 'none', border: 'none', padding: 0,
                fontFamily: FONT_BODY, fontSize: 14, fontWeight: 600, color: GOLD_REF_DK,
                cursor: idx > 0 && !milestone ? 'pointer' : 'default',
                opacity: idx > 0 && !milestone ? 1 : 0.3,
              }}
            >
              ← Anterior
            </button>
          </div>

          <p style={{ fontFamily: FONT_SLAB, fontSize: 22, fontWeight: 500, color: NAVY, margin: '20px 0 24px', lineHeight: 1.45 }}>
            {text}
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {LIKERT.map(opt => (
              <button
                key={opt.key}
                type="button"
                onClick={() => handleAnswer(opt.value)}
                style={{
                  fontFamily: FONT_BODY, fontSize: 17, lineHeight: 1.5,
                  padding: '16px 20px', border: `1.5px solid ${LINE}`,
                  background: PAPER, color: NAVY, borderRadius: 0,
                  cursor: 'pointer', textAlign: 'left',
                  transition: 'all 160ms ease',
                }}
                onMouseOver={e => { e.currentTarget.style.background = GOLD_REF; e.currentTarget.style.color = '#fff'; e.currentTarget.style.borderColor = GOLD_REF; }}
                onMouseOut={e => { e.currentTarget.style.background = PAPER; e.currentTarget.style.color = NAVY; e.currentTarget.style.borderColor = LINE; }}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      </Shell>
      {milestone && (
        <HeartMilestoneModal
          disorderCode={milestone.disorderCode}
          pct={milestone.pct}
          onContinue={handleMilestoneContinue}
        />
      )}
    </>
  );
}

/* ─── PLAN DE CRECIMIENTO EN MAGNANIMIDAD ─── */

const IconoEnlace = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ flexShrink: 0 }}>
    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" /><polyline points="15 3 21 3 21 9" /><line x1="10" y1="14" x2="21" y2="3" />
  </svg>
);

const IconoMas = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true">
    <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);

const IconoBorrar = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

function renderTextoFormateado(texto) {
  return texto.split(/(\*\*[^*]+\*\*)/g).map((part, i) =>
    part.startsWith('**') && part.endsWith('**')
      ? <strong key={i}>{part.slice(2, -2)}</strong>
      : part
  );
}

function RecursoLink({ recurso }) {
  if (!recurso) return null;
  return (
    <div style={{ marginTop: 8, marginBottom: 14 }}>
      <a href={recurso.url} target="_blank" rel="noopener noreferrer" style={{
        display: 'inline-flex', alignItems: 'center', gap: 5,
        fontFamily: FONT_BODY, fontSize: 13, fontWeight: 600, color: GOLD_REF_DK,
        textDecoration: 'underline', textUnderlineOffset: 3,
      }}>
        <IconoLupa /> {recurso.label}
      </a>
    </div>
  );
}

function PantallaTablaDinamica({ pantalla, datos, onChange }) {
  const filas = datos ?? [];
  const cols = pantalla.columnas ?? [];
  function addRow() { onChange([...filas, Object.fromEntries(cols.map(c => [c.key, '']))]); }
  function updateCell(i, key, val) {
    const next = filas.map((f, j) => j === i ? { ...f, [key]: val } : f);
    onChange(next);
  }
  function removeRow(i) { onChange(filas.filter((_, j) => j !== i)); }

  return (
    <>
      <div style={{ marginBottom: 18 }}>
        {pantalla.explicacion.split('\n\n').map((p, i) => (
          <p key={i} style={{ fontFamily: FONT_BODY, fontSize: 16, color: NAVY, lineHeight: 1.6, margin: i === 0 ? '0 0 8px' : '8px 0 0' }}>
            {renderTextoFormateado(p)}
          </p>
        ))}
      </div>
      <RecursoLink recurso={pantalla.recurso} />
      {filas.map((fila, i) => (
        <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 10, alignItems: 'flex-start' }}>
          {cols.map(col => (
            <div key={col.key} style={{ flex: 1, minWidth: 0 }}>
              {i === 0 && <div style={{ fontFamily: FONT_BODY, fontSize: 11, color: MUTED, marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{col.label}</div>}
              <input type="text" value={fila[col.key] ?? ''} onChange={e => updateCell(i, col.key, e.target.value)}
                placeholder={col.placeholder} style={{
                  width: '100%', boxSizing: 'border-box', fontFamily: FONT_BODY, fontSize: 14, color: NAVY,
                  border: `1px solid ${LINE}`, background: '#fff', padding: '10px 12px', borderRadius: 0,
                }} />
            </div>
          ))}
          <button type="button" onClick={() => removeRow(i)} style={{
            background: 'none', border: 'none', cursor: 'pointer', color: MUTED, padding: 6, marginTop: i === 0 ? 20 : 0,
          }} aria-label="Eliminar"><IconoBorrar /></button>
        </div>
      ))}
      <button type="button" onClick={addRow} style={{
        display: 'inline-flex', alignItems: 'center', gap: 6,
        fontFamily: FONT_BODY, fontSize: 14, fontWeight: 600, color: GOLD_REF_DK,
        background: 'none', border: `1px dashed ${GOLD_REF}`, padding: '10px 18px', cursor: 'pointer', borderRadius: 0,
      }}>
        <IconoMas /> Añadir persona
      </button>
    </>
  );
}

function PantallaChecklist({ pantalla, datos, onChange }) {
  const items = datos ?? [];
  function addItem() { onChange([...items, '']); }
  function updateItem(i, val) { onChange(items.map((it, j) => j === i ? val : it)); }
  function removeItem(i) { onChange(items.filter((_, j) => j !== i)); }

  return (
    <>
      <div style={{ marginBottom: 18 }}>
        {pantalla.explicacion.split('\n\n').map((p, i) => (
          <p key={i} style={{ fontFamily: FONT_BODY, fontSize: 16, color: NAVY, lineHeight: 1.6, margin: i === 0 ? '0 0 8px' : '8px 0 0' }}>
            {renderTextoFormateado(p)}
          </p>
        ))}
      </div>
      <RecursoLink recurso={pantalla.recurso} />
      {items.map((item, i) => (
        <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 8, alignItems: 'center' }}>
          <span style={{ fontFamily: FONT_BODY, fontSize: 14, color: MUTED, width: 20, textAlign: 'right', flexShrink: 0 }}>{i + 1}.</span>
          <input type="text" value={item} onChange={e => updateItem(i, e.target.value)}
            placeholder={pantalla.placeholder} style={{
              flex: 1, fontFamily: FONT_BODY, fontSize: 14, color: NAVY,
              border: `1px solid ${LINE}`, background: '#fff', padding: '10px 12px', borderRadius: 0,
            }} />
          <button type="button" onClick={() => removeItem(i)} style={{
            background: 'none', border: 'none', cursor: 'pointer', color: MUTED, padding: 6,
          }} aria-label="Eliminar"><IconoBorrar /></button>
        </div>
      ))}
      <button type="button" onClick={addItem} style={{
        display: 'inline-flex', alignItems: 'center', gap: 6,
        fontFamily: FONT_BODY, fontSize: 14, fontWeight: 600, color: GOLD_REF_DK,
        background: 'none', border: `1px dashed ${GOLD_REF}`, padding: '10px 18px', cursor: 'pointer', borderRadius: 0,
      }}>
        <IconoMas /> Añadir elemento
      </button>
    </>
  );
}

function PantallaChecklistCategorias({ pantalla, datos, onChange }) {
  const items = datos ?? [];
  const cats = pantalla.categorias ?? [];
  function addItem() { onChange([...items, { text: '', categoria: cats[0] || '' }]); }
  function updateItem(i, field, val) {
    onChange(items.map((it, j) => j === i ? { ...it, [field]: val } : it));
  }
  function removeItem(i) { onChange(items.filter((_, j) => j !== i)); }

  return (
    <>
      <p style={{ fontFamily: FONT_BODY, fontSize: 16, color: NAVY, lineHeight: 1.6, margin: '0 0 18px' }}>
        {pantalla.explicacion}
      </p>
      {items.map((item, i) => (
        <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 8, alignItems: 'center', flexWrap: 'wrap' }}>
          <select value={item.categoria || cats[0] || ''} onChange={e => updateItem(i, 'categoria', e.target.value)}
            style={{
              fontFamily: FONT_BODY, fontSize: 12, color: GOLD_REF_DK, fontWeight: 600,
              border: `1px solid ${GOLD_REF}`, background: BEIGE, padding: '8px 10px', borderRadius: 0,
              textTransform: 'uppercase', letterSpacing: '0.04em', cursor: 'pointer',
              appearance: 'auto',
            }}>
            {cats.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <input type="text" value={item.text || ''} onChange={e => updateItem(i, 'text', e.target.value)}
            placeholder={pantalla.placeholder} style={{
              flex: 1, minWidth: 150, fontFamily: FONT_BODY, fontSize: 14, color: NAVY,
              border: `1px solid ${LINE}`, background: '#fff', padding: '10px 12px', borderRadius: 0,
            }} />
          <button type="button" onClick={() => removeItem(i)} style={{
            background: 'none', border: 'none', cursor: 'pointer', color: MUTED, padding: 6,
          }} aria-label="Eliminar"><IconoBorrar /></button>
        </div>
      ))}
      <button type="button" onClick={addItem} style={{
        display: 'inline-flex', alignItems: 'center', gap: 6,
        fontFamily: FONT_BODY, fontSize: 14, fontWeight: 600, color: GOLD_REF_DK,
        background: 'none', border: `1px dashed ${GOLD_REF}`, padding: '10px 18px', cursor: 'pointer', borderRadius: 0,
      }}>
        <IconoMas /> Añadir objetivo
      </button>
    </>
  );
}

function PantallaReflexionDoble({ pantalla, datos, onChange }) {
  const vals = datos ?? {};
  return (
    <>
      <p style={{ fontFamily: FONT_BODY, fontSize: 16, color: NAVY, lineHeight: 1.6, margin: '0 0 18px' }}>
        {pantalla.explicacion}
      </p>
      {(pantalla.preguntas ?? []).map(preg => (
        <div key={preg.key} style={{ marginBottom: 18 }}>
          <label style={{ fontFamily: FONT_BODY, fontSize: 15, fontWeight: 600, color: NAVY, display: 'block', marginBottom: 6 }}>
            {preg.label}
          </label>
          <textarea value={vals[preg.key] ?? ''} onChange={e => onChange({ ...vals, [preg.key]: e.target.value })}
            placeholder={preg.placeholder} rows={4} style={{
              width: '100%', boxSizing: 'border-box', fontFamily: FONT_BODY, fontSize: 14, color: NAVY,
              border: `1px solid ${LINE}`, background: '#fff', padding: '12px', borderRadius: 0, resize: 'vertical',
            }} />
        </div>
      ))}
    </>
  );
}

function EjemploSlider({ slides }) {
  const [idx, setIdx] = useState(0);
  if (!slides.length) return null;
  const cur = slides[idx];
  return (
    <div style={{ marginBottom: 18 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        {slides.length > 1 && (
          <button type="button" onClick={() => setIdx(i => (i - 1 + slides.length) % slides.length)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, color: MUTED, fontSize: 22, lineHeight: 1, flexShrink: 0 }}
            aria-label="Anterior">{'‹'}</button>
        )}
        <div style={{ flex: 1, background: BEIGE, padding: '14px 18px', borderLeft: `3px solid ${cur.border}` }}>
          <div style={{ fontFamily: FONT_BODY, fontSize: 11, color: MUTED, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 4 }}>
            Ejemplo — {cur.label}
          </div>
          <p style={{ fontFamily: FONT_BODY, fontSize: 15, color: NAVY, lineHeight: 1.6, margin: 0, fontStyle: 'italic' }}>
            {cur.text}
          </p>
        </div>
        {slides.length > 1 && (
          <button type="button" onClick={() => setIdx(i => (i + 1) % slides.length)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, color: MUTED, fontSize: 22, lineHeight: 1, flexShrink: 0 }}
            aria-label="Siguiente">{'›'}</button>
        )}
      </div>
      {slides.length > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: 6, marginTop: 8 }}>
          {slides.map((_, i) => (
            <button key={i} type="button" onClick={() => setIdx(i)}
              style={{
                width: 8, height: 8, borderRadius: '50%', border: 'none', cursor: 'pointer', padding: 0,
                background: i === idx ? GOLD_REF : LINE,
              }} aria-label={`Ejemplo ${i + 1}`} />
          ))}
        </div>
      )}
    </div>
  );
}

function PantallaReflexionTemperamento({ pantalla, temperamento, datos, onChange }) {
  const vals = datos ?? {};
  const primary = temperamento?.primary;
  const secondary = temperamento?.secondary;
  const TEMP_LABELS = { COL: 'Colérico', MEL: 'Melancólico', SAN: 'Sanguíneo', FLE: 'Flemático' };
  const debilidadPri = primary && pantalla.debilidades?.[primary];
  const debilidadSec = secondary && pantalla.debilidades?.[secondary];

  return (
    <>
      {(primary || secondary) && (
        <div style={{ display: 'flex', gap: 12, marginBottom: 18, flexWrap: 'wrap' }}>
          {primary && (
            <div style={{ padding: '8px 14px', background: BEIGE, borderLeft: `3px solid ${GOLD_REF}`, flex: '1 1 auto', minWidth: 120 }}>
              <div style={{ fontFamily: FONT_BODY, fontSize: 10, fontWeight: 700, color: MUTED, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Primario</div>
              <div style={{ fontFamily: FONT_SLAB, fontSize: 16, fontWeight: 700, color: NAVY, marginTop: 2 }}>{TEMP_LABELS[primary] || primary}</div>
            </div>
          )}
          {secondary && (
            <div style={{ padding: '8px 14px', background: BEIGE, borderLeft: `3px solid ${LINE}`, flex: '1 1 auto', minWidth: 120 }}>
              <div style={{ fontFamily: FONT_BODY, fontSize: 10, fontWeight: 700, color: MUTED, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Secundario</div>
              <div style={{ fontFamily: FONT_SLAB, fontSize: 16, fontWeight: 700, color: NAVY, marginTop: 2 }}>{TEMP_LABELS[secondary] || secondary}</div>
            </div>
          )}
        </div>
      )}
      <p style={{ fontFamily: FONT_BODY, fontSize: 16, color: NAVY, lineHeight: 1.6, margin: '0 0 14px' }}>
        {pantalla.explicacion}
      </p>
      <EjemploSlider slides={[
        debilidadPri && { label: TEMP_LABELS[primary] || primary, text: debilidadPri, border: GOLD_REF },
        debilidadSec && { label: TEMP_LABELS[secondary] || secondary, text: debilidadSec, border: LINE },
      ].filter(Boolean)} />
      <label style={{ fontFamily: FONT_BODY, fontSize: 15, fontWeight: 600, color: NAVY, display: 'block', marginBottom: 6 }}>
        {pantalla.pregunta_refuerzo}
      </label>
      <textarea value={vals.refuerzo ?? ''} onChange={e => onChange({ ...vals, refuerzo: e.target.value })}
        placeholder="Escribe los puntos que más necesitas trabajar..." rows={4} style={{
          width: '100%', boxSizing: 'border-box', fontFamily: FONT_BODY, fontSize: 14, color: NAVY,
          border: `1px solid ${LINE}`, background: '#fff', padding: '12px', borderRadius: 0, resize: 'vertical',
        }} />
    </>
  );
}

function PantallaProposito({ pantalla, datos, onChange }) {
  return (
    <>
      <p style={{ fontFamily: FONT_BODY, fontSize: 16, color: NAVY, lineHeight: 1.6, margin: '0 0 18px' }}>
        {pantalla.explicacion}
      </p>
      <textarea value={datos ?? ''} onChange={e => onChange(e.target.value)}
        placeholder={pantalla.placeholder} rows={6} style={{
          width: '100%', boxSizing: 'border-box', fontFamily: FONT_BODY, fontSize: 16, color: NAVY,
          border: `1px solid ${LINE}`, background: '#fff', padding: '16px', borderRadius: 0, resize: 'vertical',
          lineHeight: 1.7,
        }} />
      {pantalla.ejemplo && (
        <div style={{ marginTop: 14, padding: '12px 16px', background: BEIGE, borderLeft: `3px solid ${GOLD_REF}` }}>
          <div style={{ fontFamily: FONT_BODY, fontSize: 11, color: MUTED, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 4 }}>
            Ejemplo
          </div>
          <p style={{ fontFamily: FONT_BODY, fontSize: 14, color: NAVY, lineHeight: 1.6, margin: 0, fontStyle: 'italic' }}>
            {pantalla.ejemplo}
          </p>
        </div>
      )}
    </>
  );
}

function IconoLapiz() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ display: 'block' }}>
      <path d="M11.5 1.5l3 3L5 14H2v-3L11.5 1.5z" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M9.5 3.5l3 3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  );
}

export function PantallaResumen({ paso, plan, onEditar }) {
  const pantallas = paso.pantallas ?? [];
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <p style={{ fontFamily: FONT_BODY, fontSize: 16, color: NAVY, lineHeight: 1.6, margin: 0 }}>
        Este es el resumen de tu Plan de Crecimiento en Magnanimidad. Revisa que refleja tus intenciones para este año.
      </p>
      {pantallas.filter(p => p.tipo !== 'texto' && p.tipo !== 'resumen').map((pant, _i, arr) => {
        const dato = plan[pant.id];
        if (!dato || (Array.isArray(dato) && dato.length === 0)) return null;
        const pantIdx = pantallas.indexOf(pant);
        return (
          <div key={pant.id} style={{ borderTop: `1px solid ${LINE}`, paddingTop: 14 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
              <h3 style={{ fontFamily: FONT_SLAB, fontSize: 16, fontWeight: 700, color: NAVY, margin: 0 }}>
                {pant.titulo}
              </h3>
              {onEditar && (
                <button type="button" onClick={() => onEditar(pantIdx)} title="Editar" style={{
                  background: 'none', border: 'none', padding: 4, cursor: 'pointer', color: MUTED, flexShrink: 0,
                }}>
                  <IconoLapiz />
                </button>
              )}
            </div>
            {pant.tipo === 'tabla_dinamica' && Array.isArray(dato) && (
              <ul style={{ margin: 0, paddingLeft: 20 }}>
                {dato.filter(f => f.nombre).map((f, i) => (
                  <li key={i} style={{ fontFamily: FONT_BODY, fontSize: 14, color: NAVY, lineHeight: 1.6, marginBottom: 4 }}>
                    <strong>{f.nombre}</strong>{f.motivo ? ` — ${f.motivo}` : ''}
                  </li>
                ))}
              </ul>
            )}
            {pant.tipo === 'checklist' && Array.isArray(dato) && (
              <ul style={{ margin: 0, paddingLeft: 20 }}>
                {dato.filter(Boolean).map((item, i) => (
                  <li key={i} style={{ fontFamily: FONT_BODY, fontSize: 14, color: NAVY, lineHeight: 1.6, marginBottom: 4 }}>
                    {item}
                  </li>
                ))}
              </ul>
            )}
            {pant.tipo === 'checklist_categorias' && Array.isArray(dato) && (
              <ul style={{ margin: 0, paddingLeft: 20 }}>
                {dato.filter(d => d.text).map((item, i) => (
                  <li key={i} style={{ fontFamily: FONT_BODY, fontSize: 14, color: NAVY, lineHeight: 1.6, marginBottom: 4 }}>
                    <span style={{ fontFamily: FONT_BODY, fontSize: 11, color: GOLD_REF_DK, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em', marginRight: 6 }}>{item.categoria}</span>
                    {item.text}
                  </li>
                ))}
              </ul>
            )}
            {pant.tipo === 'reflexion_doble' && typeof dato === 'object' && (
              <div>
                {Object.entries(dato).filter(([, v]) => v).map(([k, v]) => (
                  <p key={k} style={{ fontFamily: FONT_BODY, fontSize: 14, color: NAVY, lineHeight: 1.6, margin: '0 0 4px' }}>{v}</p>
                ))}
              </div>
            )}
            {pant.tipo === 'reflexion_temperamento' && typeof dato === 'object' && dato.refuerzo && (
              <p style={{ fontFamily: FONT_BODY, fontSize: 14, color: NAVY, lineHeight: 1.6, margin: 0 }}>{dato.refuerzo}</p>
            )}
            {pant.tipo === 'proposito' && typeof dato === 'string' && (
              <p style={{ fontFamily: FONT_BODY, fontSize: 14, color: NAVY, lineHeight: 1.6, margin: 0, fontWeight: 600 }}>{dato}</p>
            )}
          </div>
        );
      })}
    </div>
  );
}

const PLAN_STORAGE_KEY = (userId) => `vl-plan:${userId}`;

export function leerPlan(userId) {
  try { return JSON.parse(localStorage.getItem(PLAN_STORAGE_KEY(userId))) ?? {}; } catch { return {}; }
}
function guardarPlan(userId, data) {
  try { localStorage.setItem(PLAN_STORAGE_KEY(userId), JSON.stringify(data)); } catch {}
}

export function PlanCrecimiento({ paso, temperamento, onComplete }) {
  const userId = (() => { try { return JSON.parse(localStorage.getItem('sb-session'))?.user?.id ?? 'anon'; } catch { return 'anon'; } })();
  const pantallas = paso.pantallas ?? [];
  const [idx, setIdx] = useState(0);
  const [fase, setFase] = useState('caratula');
  const [visible, setVisible] = useState(true);
  const [plan, setPlan] = useState(() => leerPlan(userId));
  const guardarCb = useCallback((d) => guardarPlan(userId, d), [userId]);
  const guardados = useAutoguardado(guardarCb, plan);

  function actualizarPantalla(pantallaId, valor) {
    const next = { ...plan, [pantallaId]: valor };
    setPlan(next);
  }

  function siguiente() {
    guardarPlan(userId, plan);
    setVisible(false);
    setTimeout(() => {
      if (idx < pantallas.length - 1) {
        setIdx(idx + 1);
        setVisible(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        onComplete({ plan });
      }
    }, 300);
  }

  function anterior() {
    if (idx > 0) {
      setVisible(false);
      setTimeout(() => { setIdx(idx - 1); setVisible(true); window.scrollTo({ top: 0, behavior: 'smooth' }); }, 300);
    }
  }

  if (fase === 'caratula') {
    return (
      <div style={{ maxWidth: 860, margin: '0 auto' }}>
        <div style={tarjeta}>
          <div style={{ textAlign: 'center', padding: '20px 0 10px' }}>
            <span style={{
              display: 'inline-grid', placeItems: 'center', width: 64, height: 64, borderRadius: '50%',
              background: BEIGE, border: `2px solid ${GOLD_REF}`,
              fontFamily: FONT_SLAB, fontSize: 28, fontWeight: 700, color: GOLD_REF_DK,
            }}>✦</span>
          </div>
          <h2 style={{ fontFamily: FONT_SLAB, fontSize: 28, fontWeight: 700, color: NAVY, margin: '12px 0 14px', textAlign: 'center', lineHeight: 1.3 }}>
            Desarrolla tu Plan de Crecimiento en Magnanimidad
          </h2>
          <p style={{ fontFamily: FONT_BODY, fontSize: 17, color: MUTED, lineHeight: 1.7, textAlign: 'center', maxWidth: 520, margin: '0 auto 12px' }}>
            {paso.descripcion}
          </p>
          {paso.nota_anual && (
            <p style={{ fontFamily: FONT_BODY, fontSize: 14, color: GOLD_REF_DK, lineHeight: 1.6, textAlign: 'center', maxWidth: 480, margin: '0 auto 8px', fontStyle: 'italic' }}>
              {paso.nota_anual}
            </p>
          )}
          <div style={{ display: 'flex', justifyContent: 'center', marginTop: 28, marginBottom: 8 }}>
            <button type="button" onClick={() => setFase('ejercicio')} style={{
              fontFamily: FONT_BODY, fontSize: 19, fontWeight: 600, color: '#fff',
              background: GOLD_REF, border: 'none', borderRadius: 0, padding: '18px 48px', cursor: 'pointer',
            }}>
              Empezar →
            </button>
          </div>
        </div>
      </div>
    );
  }

  const pant = pantallas[idx];
  if (!pant) { onComplete({ plan }); return null; }

  let contenido = null;
  if (pant.tipo === 'texto') {
    contenido = (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {pant.contenido.split('\n\n').map((parrafo, i) => (
          <p key={i} style={{ fontFamily: FONT_BODY, fontSize: 17, color: NAVY, lineHeight: 1.7, margin: 0 }}>
            {renderTextoFormateado(parrafo)}
          </p>
        ))}
      </div>
    );
  } else if (pant.tipo === 'tabla_dinamica') {
    contenido = <PantallaTablaDinamica pantalla={pant} datos={plan[pant.id]} onChange={v => actualizarPantalla(pant.id, v)} />;
  } else if (pant.tipo === 'checklist') {
    contenido = <PantallaChecklist pantalla={pant} datos={plan[pant.id]} onChange={v => actualizarPantalla(pant.id, v)} />;
  } else if (pant.tipo === 'reflexion_doble') {
    contenido = <PantallaReflexionDoble pantalla={pant} datos={plan[pant.id]} onChange={v => actualizarPantalla(pant.id, v)} />;
  } else if (pant.tipo === 'reflexion_temperamento') {
    contenido = <PantallaReflexionTemperamento pantalla={pant} temperamento={temperamento} datos={plan[pant.id]} onChange={v => actualizarPantalla(pant.id, v)} />;
  } else if (pant.tipo === 'proposito') {
    contenido = <PantallaProposito pantalla={pant} datos={plan[pant.id]} onChange={v => actualizarPantalla(pant.id, v)} />;
  } else if (pant.tipo === 'checklist_categorias') {
    contenido = <PantallaChecklistCategorias pantalla={pant} datos={plan[pant.id]} onChange={v => actualizarPantalla(pant.id, v)} />;
  } else if (pant.tipo === 'resumen') {
    contenido = <PantallaResumen paso={paso} plan={plan} onEditar={(pantIdx) => { setIdx(pantIdx); window.scrollTo({ top: 0, behavior: 'smooth' }); }} />;
  }

  const esUltima = idx === pantallas.length - 1;

  return (
    <div style={{ maxWidth: 800, margin: '0 auto' }}>
      <div style={eyebrow}>Plan de crecimiento</div>
      <div style={{ ...tarjeta, marginTop: 12 }}>
        <h2 style={{ fontFamily: FONT_SLAB, fontSize: 26, fontWeight: 700, color: NAVY, margin: '0 0 8px' }}>
          {pant.titulo}
        </h2>
        <div style={{ fontFamily: FONT_BODY, fontSize: 14, color: MUTED, marginBottom: 20 }}>
          {idx + 1} de {pantallas.length}
        </div>

        <div style={{ marginBottom: 10, height: 3, background: `${LINE}55`, borderRadius: 2 }}>
          <div style={{ height: 3, background: GOLD_REF, borderRadius: 2, transition: 'width 400ms ease', width: `${((idx + 1) / pantallas.length) * 100}%` }} />
        </div>

        <div style={{
          opacity: visible ? 1 : 0, transform: visible ? 'translateY(0)' : 'translateY(12px)',
          transition: 'opacity 300ms ease, transform 300ms ease',
          padding: '24px 0',
        }}>
          {contenido}
        </div>

        {pant.tipo !== 'texto' && pant.tipo !== 'resumen' && (
          <div style={{ display: 'flex', justifyContent: 'flex-end', minHeight: 20, marginTop: 4 }}>
            <CheckGuardado campo={pant.id} guardados={guardados} />
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 12 }}>
          <button type="button" onClick={anterior} disabled={idx === 0} style={{
            fontFamily: FONT_BODY, fontSize: 16, fontWeight: 600, color: idx === 0 ? `${MUTED}66` : NAVY,
            background: 'none', border: `1px solid ${idx === 0 ? `${LINE}66` : LINE}`, borderRadius: 0,
            padding: '12px 28px', cursor: idx === 0 ? 'default' : 'pointer',
          }}>
            ← Anterior
          </button>
          <button type="button" onClick={siguiente} style={{
            fontFamily: FONT_BODY, fontSize: 18, fontWeight: 600, color: '#fff',
            background: GOLD_REF, border: 'none', borderRadius: 0,
            padding: '14px 36px', cursor: 'pointer',
          }}>
            {esUltima ? 'Finalizar plan →' : 'Siguiente →'}
          </button>
        </div>
      </div>
    </div>
  );
}
