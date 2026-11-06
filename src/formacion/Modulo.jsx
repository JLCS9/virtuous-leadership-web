import { useEffect, useState } from 'react';
import { useOutletContext, useParams, Link } from 'react-router-dom';
import { pasosDelUsuario, pasosVisibles, progresoModulo, progresoActividad, continuarModulo, siguientePaso, pasoAnterior, moduloDelPaso, videoAnterior } from './flujoModulo';
import { useModuloProgreso } from './useModulo';
import { Reproductor } from './Formacion';
import { Quiz, Define, Desliza, Identifica, TestProfundo, TemperamentoPerfil, RetosTemperamento, CirculoPersonas, ConclusionModulo, ReflexionGuiada, Sintesis, TestCaracterFormacion, TestCorazonFormacion, ReflexionPiramide, TemperamentoMagnanimidad, PlanCrecimiento } from './Actividad';
import { BlocDeNotas } from './BlocDeNotas';
import { useNotas } from './useNotas';
import { CuadernoPersonal } from './CuadernoPersonal';
import { fetchLatestTemperament } from '../account/account';
import { NAVY, MUTED, PAPER, LINE, GOLD_REF, GOLD_REF_DK, GOLD_REF_LT, FONT_SLAB, FONT_BODY, TEMP_COLORS, BEIGE } from '../theme';
import { barraFondo, botonPrimario, botonSobreClaro, eyebrow, heroFondo, parrafo, tarjeta, titulo } from '../app/estilos';
import { IconoCheck, IconoFlecha, IconoPlay, IconoChevron, IconoVideo, IconoEjercicio, IconoCuestionario } from '../app/Iconos';
import { UMBRAL_VISTA } from './cursos';

import { useCatalogo } from './useFormacion';

const MODULOS = {
  'curso-1': () => import('../data/modulo1.json'),
  'curso-2': () => import('../data/modulo2.json'),
};

function catalogoAModulo(curso) {
  const pasos = curso.lecciones.map((l, i) => ({
    id: l.id,
    num: i + 1,
    tipo: 'video',
    titulo: l.titulo,
    vimeoId: l.vimeoId,
    visible: true,
  }));

  if (curso.numero === 4) {
    pasos.push({
      id: 'curso4-test-caracter',
      num: pasos.length + 1,
      tipo: 'test_caracter',
      titulo: 'Test de carácter (comparativa)',
      descripcion: 'Repite el test de carácter para comparar tu progreso desde el inicio del curso 1.',
      visible: true,
    });
  }

  if (curso.numero === 5) {
    pasos.push({
      id: 'curso5-test-corazon',
      num: pasos.length + 1,
      tipo: 'test_corazon',
      titulo: 'Test del corazón',
      descripcion: 'Evalúa la libertad de tu corazón. 32 preguntas sobre las ocho enfermedades espirituales que pueden afectar a la razón, la voluntad y el corazón.',
      visible: true,
    });
  }

  return {
    id: `curso${curso.numero}`,
    titulo: curso.titulo,
    curso: curso.numero,
    descripcion: `${pasos.length} módulos`,
    pasos,
  };
}

const TEMP_NOMBRE = { COL: 'Colérico', MEL: 'Melancólico', SAN: 'Sanguíneo', FLE: 'Flemático' };

function mapTemp(result) {
  if (!result) return null;
  const p = result.primario ?? result.primary;
  const s = result.secundario ?? result.secondary ?? null;
  if (!TEMP_COLORS[p]) return null;
  return { primary: p, secondary: s };
}

function agruparIntro(parrafos) {
  if (!parrafos || !parrafos.length) return [];
  return parrafos.map(p => Array.isArray(p) ? p : [p]);
}

function renderIntroTexto(text) {
  const parts = text.split(/\*\*(.*?)\*\*/g);
  if (parts.length === 1) return text;
  return parts.map((part, i) => i % 2 === 1 ? <strong key={i}>{part}</strong> : part);
}

function PasoVideo({ paso, pasos, progreso, avanzar, retroceder, volver, cursoNum = 1, notasProps }) {
  const completado = Boolean(progreso.completados[paso.id]);
  const lec = moduloDelPaso(pasos, paso.id);
  const paginas = agruparIntro(paso.intro);
  const [introIdx, setIntroIdx] = useState(0);
  const [visible, setVisible] = useState(true);
  const enIntro = paginas.length > 0 && introIdx < paginas.length;

  function onProgreso(frac) {
    if (frac >= UMBRAL_VISTA && !completado) {
      progreso.completar(paso.id);
    }
  }

  function avanzarYMarcar() {
    if (!completado) progreso.completar(paso.id);
    avanzar();
  }

  function avanzarIntro() {
    setVisible(false);
    setTimeout(() => {
      setIntroIdx(i => i + 1);
      setVisible(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 300);
  }

  function retrocederIntro() {
    setVisible(false);
    setTimeout(() => {
      setIntroIdx(i => Math.max(0, i - 1));
      setVisible(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 300);
  }

  if (enIntro) {
    const pags = paginas[introIdx];
    const esUltima = introIdx === paginas.length - 1;
    return (
      <div style={{ maxWidth: 800, margin: '0 auto' }}>
        <button type="button" onClick={volver} style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', color: NAVY, fontFamily: FONT_BODY, fontSize: 14, fontWeight: 600, marginBottom: 14 }}>← Salir al curso</button>
        <div style={tarjeta}>
          <div style={eyebrow}>{lec ? `Módulo ${lec.numero}` : 'Introducción'}</div>
          <h2 style={{ fontFamily: FONT_SLAB, fontSize: 30, fontWeight: 700, color: NAVY, margin: '8px 0 8px' }}>{paso.titulo}</h2>
          <div style={{ fontFamily: FONT_BODY, fontSize: 14, color: MUTED, marginBottom: 20 }}>{introIdx + 1} de {paginas.length}</div>
          <div style={{ marginBottom: 10, height: 3, background: `${LINE}55`, borderRadius: 2 }}>
            <div style={{ height: 3, background: GOLD_REF, borderRadius: 2, transition: 'width 400ms ease', width: `${((introIdx + 1) / paginas.length) * 100}%` }} />
          </div>
          <div style={{
            opacity: visible ? 1 : 0, transform: visible ? 'translateY(0)' : 'translateY(12px)',
            transition: 'opacity 300ms ease, transform 300ms ease', padding: '24px 0',
            display: 'flex', flexDirection: 'column', gap: 14,
          }}>
            <style>{`
              @keyframes vlChipIn { from { opacity: 0; transform: translateY(14px); } to { opacity: 1; transform: translateY(0); } }
              .vl-chip-anim { animation: vlChipIn 450ms ease both; }
            `}</style>
            {paso.id === 'm1-01' && introIdx === 1 ? (
              <>
                <p style={{ fontFamily: FONT_BODY, fontSize: 20, color: NAVY, lineHeight: 1.75, margin: 0 }}>
                  El temperamento es una predisposición natural e innata a reaccionar de una determinada manera.
                </p>
                <p style={{ fontFamily: FONT_BODY, fontSize: 20, color: NAVY, lineHeight: 1.75, margin: '6px 0 0' }}>
                  Puede ser:
                </p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, margin: '4px 0 8px' }}>
                  {['Colérico', 'Melancólico', 'Sanguíneo', 'Flemático'].map((t, i) => (
                    <span key={t} className="vl-chip-anim" style={{
                      animationDelay: `${i * 160}ms`,
                      fontFamily: FONT_BODY, fontSize: 16, fontWeight: 600, color: GOLD_REF_DK,
                      background: 'rgba(165,139,38,0.08)', borderRadius: 20,
                      padding: '8px 18px', display: 'inline-block',
                      letterSpacing: '0.01em',
                    }}>
                      {t}
                    </span>
                  ))}
                </div>
                <p style={{ fontFamily: FONT_BODY, fontSize: 20, color: NAVY, lineHeight: 1.75, margin: 0 }}>
                  Nacemos con nuestro temperamento y <strong>no podemos cambiarlo</strong>: morimos con las cualidades y defectos de nuestro temperamento.
                </p>
              </>
            ) : paso.id === 'm1-01' && introIdx === 2 ? (
              <>
                <p style={{ fontFamily: FONT_BODY, fontSize: 20, color: NAVY, lineHeight: 1.75, margin: 0 }}>
                  Sobre la base de nuestro temperamento, construimos nuestro carácter.
                </p>
                <p style={{ fontFamily: FONT_BODY, fontSize: 20, color: NAVY, lineHeight: 1.75, margin: '14px 0 0' }}>
                  El carácter se compone de virtudes como:
                </p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, margin: '4px 0 8px' }}>
                  {['Prudencia', 'Valor', 'Autocontrol', 'Justicia', 'Magnanimidad', 'Humildad'].map((v, i) => (
                    <span key={v} className="vl-chip-anim" style={{
                      animationDelay: `${i * 160}ms`,
                      fontFamily: FONT_BODY, fontSize: 16, fontWeight: 600, color: GOLD_REF_DK,
                      background: 'rgba(165,139,38,0.08)', borderRadius: 20,
                      padding: '8px 18px', display: 'inline-block',
                      letterSpacing: '0.01em',
                    }}>
                      {v}
                    </span>
                  ))}
                </div>
                <p style={{ fontFamily: FONT_BODY, fontSize: 20, color: NAVY, lineHeight: 1.75, margin: 0 }}>
                  Las virtudes son hábitos morales, fortalezas espirituales que se adquieren y desarrollan con la práctica.
                </p>
                <p style={{ fontFamily: FONT_BODY, fontSize: 20, color: NAVY, lineHeight: 1.75, margin: '14px 0 0' }}>
                  <strong>No nacemos con nuestro carácter, lo construimos.</strong>
                </p>
              </>
            ) : (
              pags.map((p, i) => (
                <p key={i} style={{ fontFamily: FONT_BODY, fontSize: 20, color: NAVY, lineHeight: 1.75, margin: 0 }}>{renderIntroTexto(p)}</p>
              ))
            )}
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 12 }}>
            {introIdx > 0 ? (
              <button type="button" onClick={retrocederIntro} style={{
                fontFamily: FONT_BODY, fontSize: 18, fontWeight: 600, color: NAVY,
                background: 'none', border: `1.5px solid ${LINE}`, borderRadius: 0, padding: '14px 36px', cursor: 'pointer',
              }}>
                ← Anterior
              </button>
            ) : <span />}
            <button type="button" onClick={avanzarIntro} style={{
              fontFamily: FONT_BODY, fontSize: 18, fontWeight: 600, color: '#fff',
              background: GOLD_REF, border: 'none', borderRadius: 0, padding: '14px 36px', cursor: 'pointer',
            }}>
              {esUltima ? 'Ver vídeo →' : 'Siguiente →'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="vl-leccion" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <style>{`@media (min-width: 1100px) { .vl-leccion { display: grid !important; grid-template-columns: minmax(0, 2.2fr) minmax(300px, 1fr); gap: 24px !important; align-items: start; } .vl-leccion > .vl-back { grid-column: 1 / -1; } .vl-leccion > .vl-video-col { position: sticky; top: 20px; } }`}</style>
      <button type="button" className="vl-back" onClick={volver} style={{ justifySelf: 'start', background: 'none', border: 'none', padding: 0, cursor: 'pointer', color: NAVY, fontFamily: FONT_BODY, fontSize: 14, fontWeight: 600, marginBottom: -10 }}>← Salir al curso</button>
      <div className="vl-video-col">
        <Reproductor leccion={{ id: paso.id, vimeoId: paso.vimeoId, titulo: paso.titulo }} onProgreso={onProgreso} />
      </div>
      <div>
        <section style={tarjeta}>
          <div style={eyebrow}>
            {lec ? `Módulo ${lec.numero}` : 'Vídeo'}
          </div>
          <h2 style={{ ...titulo(26), margin: '8px 0 6px' }}>{paso.titulo}</h2>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginTop: 18 }}>
            {retroceder && (
              <button type="button" onClick={retroceder} style={botonSobreClaro}>← Anterior</button>
            )}
            <button type="button" onClick={avanzarYMarcar} style={botonPrimario}>
              {completado ? 'Siguiente' : 'Marcar como visto y seguir'} <IconoFlecha width={16} height={16} />
            </button>
          </div>
        </section>
        {notasProps && <BlocDeNotas {...notasProps} pasoActualId={paso.id} />}
      </div>
    </div>
  );
}

function PasoActividad({ paso, pasos, temperamento, progreso, avanzar, volver, user }) {
  const _vidCtx = videoAnterior(pasos, paso.id);
  const _mod = _vidCtx ? moduloDelPaso(pasos, _vidCtx.id) : null;
  const moduloNum = _mod?.numero ?? 1;

  function completar(resultado) {
    progreso.completar(paso.id, resultado, { tipo: paso.tipo, modulo: moduloNum });
    avanzar();
  }

  switch (paso.tipo) {
    case 'quiz': return <Quiz paso={paso} onComplete={completar} modulo={moduloNum} />;
    case 'define': return <Define paso={paso} onComplete={completar} modulo={moduloNum} />;
    case 'desliza': return <Desliza paso={paso} onComplete={completar} modulo={moduloNum} />;
    case 'identifica': return <Identifica paso={paso} onComplete={completar} modulo={moduloNum} />;
    case 'test_profundo': return <TestProfundo paso={paso} onComplete={completar} modulo={moduloNum} />;
    case 'reflexion_piramide': return <ReflexionPiramide paso={paso} onComplete={completar} modulo={moduloNum} />;
    case 'temperamento_magnanimidad': return <TemperamentoMagnanimidad paso={paso} temperamento={temperamento} onComplete={completar} />;
    case 'temperamento_perfil': return <TemperamentoPerfil paso={paso} temperamento={temperamento} onComplete={completar} />;
    case 'retos_temperamento': return <RetosTemperamento paso={paso} temperamento={temperamento} onComplete={completar} />;
    case 'circulo_personas': return <CirculoPersonas paso={paso} user={user} onComplete={completar} />;
    case 'conclusion_modulo': return <ConclusionModulo paso={paso} completados={progreso.completados} onContinuar={completar} onVolver={volver} />;
    case 'reflexion_guiada': return <ReflexionGuiada paso={paso} temperamento={temperamento} onComplete={completar} />;
    case 'plan_crecimiento': return <PlanCrecimiento paso={paso} temperamento={temperamento} onComplete={completar} />;
    case 'test_caracter': return <TestCaracterFormacion paso={paso} onComplete={completar} />;
    case 'test_corazon': return <TestCorazonFormacion paso={paso} onComplete={completar} />;
    case 'cierre': return <Sintesis paso={paso} temperamento={temperamento} onComplete={completar} />;
    default: return <p>Tipo desconocido: {paso.tipo}</p>;
  }
}

function agruparModulos(pasos) {
  const modulos = [];
  let actual = null;
  for (const p of pasos) {
    if (p.tipo === 'video') {
      if (p.continua_modulo && actual) {
        actual.actividades.push(p);
      } else {
        actual = { video: p, actividades: [] };
        modulos.push(actual);
      }
    } else if (actual && p.tipo !== 'noop' && p.tipo !== 'cierre' && p.tipo !== 'conclusion_modulo' && p.tipo !== 'reflexion_guiada' && p.tipo !== 'plan_crecimiento' && p.tipo !== 'test_caracter') {
      actual.actividades.push(p);
    }
  }
  return modulos;
}

function puntuacionActividad(completado) {
  if (!completado) return null;
  if (typeof completado.aciertos === 'number' && typeof completado.total === 'number') {
    return `${completado.aciertos}/${completado.total}`;
  }
  return null;
}

function tituloActividad(act) {
  if (act.tipo === 'define') return act.titulo.replace(/^Define\b/, 'Definiciones');
  if (act.tipo === 'quiz') return act.titulo.replace(/^Quiz\b/, 'Cuestionario');
  return act.titulo;
}

function etiquetaPaso(paso) {
  if (paso.tipo === 'quiz') return 'Cuestionario';
  if (paso.tipo === 'define') return 'Definiciones';
  if (paso.tipo === 'test_profundo') return 'Test';
  if (paso.tipo === 'reflexion_piramide') return 'Reflexión';
  if (paso.tipo === 'temperamento_magnanimidad') return 'Temperamento';
  if (paso.tipo === 'temperamento_perfil') return 'Tu perfil';
  if (paso.tipo === 'retos_temperamento') return 'Retos';
  if (paso.tipo === 'reflexion_guiada') return 'Reflexión';
  if (paso.tipo === 'plan_crecimiento') return 'Plan de crecimiento';
  if (paso.tipo === 'cierre') return 'Síntesis';
  if (paso.tipo === 'conclusion_modulo') return 'Resumen';
  if (paso.tipo === 'test_caracter') return 'Test de carácter';
  if (paso.tipo === 'test_corazon') return 'Test del corazón';
  return paso.titulo;
}

function EmojiShortcut({ emoji, hecho, onClick, title }) {
  return (
    <span
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      title={title}
      onClick={onClick ? (e) => { e.stopPropagation(); onClick(); } : undefined}
      onKeyDown={onClick ? (e) => { if (e.key === 'Enter') { e.stopPropagation(); onClick(); } } : undefined}
      style={{
        fontSize: 10, cursor: onClick ? 'pointer' : 'default',
        opacity: hecho ? 0.6 : 0.2,
        filter: 'grayscale(1)',
        transition: 'opacity 150ms ease',
        lineHeight: 1,
      }}
    >
      {emoji}
    </span>
  );
}

function ListaLecciones({ pasos, completados, irA }) {
  const [abierto, setAbierto] = useState(null);
  const modulos = agruparModulos(Array.from(pasos || []));

  return (
    <div style={{ ...tarjeta, padding: 0, overflow: 'hidden' }}>
      {modulos.map((mod, i) => {
        const isOpen = abierto === i;
        const videoHecho = Boolean(completados[mod.video.id]);
        const actsDone = mod.actividades.filter((a) => completados[a.id]).length;
        const allActsDone = mod.actividades.length > 0 && actsDone === mod.actividades.length;
        const todoHecho = videoHecho && (mod.actividades.length === 0 || allActsDone);

        return (
          <div key={mod.video.id} style={{ borderBottom: i < modulos.length - 1 ? `1px solid ${LINE}` : 'none' }}>
            <button type="button" onClick={() => setAbierto(isOpen ? null : i)} style={{
              all: 'unset', boxSizing: 'border-box', width: '100%', cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: 12, padding: '14px 18px',
            }}>
              <span style={{
                flex: '0 0 28px', height: 28, borderRadius: '50%', display: 'grid', placeItems: 'center',
                border: todoHecho ? 'none' : `1.5px solid ${LINE}`,
                background: todoHecho ? GOLD_REF : 'transparent', color: todoHecho ? '#fff' : NAVY,
                fontFamily: FONT_SLAB, fontSize: 13, fontWeight: 700,
              }}>
                {todoHecho ? <IconoCheck width={14} height={14} /> : i + 1}
              </span>
              <span style={{ flex: 1, minWidth: 0, fontFamily: FONT_BODY, fontSize: 14.5, color: NAVY, fontWeight: 500 }}>
                Módulo {i + 1}: {mod.video.titulo}
              </span>
              <span style={{ display: 'flex', gap: 6, alignItems: 'center', flex: '0 0 auto' }}></span>
              <IconoChevron width={16} height={16} style={{
                color: MUTED, flex: '0 0 16px',
                transition: 'transform 200ms ease',
                transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
              }} />
            </button>

            {isOpen && (
              <div style={{ padding: '0 18px 14px 58px', display: 'flex', flexDirection: 'column', gap: 0 }}>
                {mod.actividades.some(a => puntuacionActividad(completados[a.id])) && (
                  <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '4px 0 2px' }}>
                    <span style={{ fontFamily: FONT_BODY, fontSize: 10, color: MUTED, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Resultado</span>
                  </div>
                )}

                <button type="button" onClick={() => irA(mod.video.id)} style={{
                  all: 'unset', boxSizing: 'border-box', width: '100%', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', gap: 10, padding: '10px 0',
                  borderBottom: mod.actividades.length > 0 ? `1px solid ${LINE}` : 'none',
                }}>
                  <span style={{ width: 14, display: 'inline-flex' }}>{videoHecho && <IconoCheck width={14} height={14} style={{ color: GOLD_REF }} />}</span>
                  <IconoVideo width={15} height={15} style={{ color: MUTED, opacity: 0.5 }} />
                  <span style={{ flex: 1, fontFamily: FONT_BODY, fontSize: 14, color: NAVY }}>{mod.video.titulo}</span>
                </button>

                {mod.actividades.map((act, j) => {
                  const actHecho = completados[act.id];
                  const score = puntuacionActividad(actHecho);
                  return (
                    <button key={act.id} type="button" onClick={() => irA(act.id)} style={{
                      all: 'unset', boxSizing: 'border-box', width: '100%', cursor: 'pointer',
                      display: 'flex', alignItems: 'center', gap: 10, padding: '10px 0',
                      borderBottom: j < mod.actividades.length - 1 ? `1px solid ${LINE}` : 'none',
                    }}>
                      <span style={{ width: 14, display: 'inline-flex' }}>{actHecho && <IconoCheck width={14} height={14} style={{ color: GOLD_REF }} />}</span>
                      {act.tipo === 'video' ? <IconoVideo width={15} height={15} style={{ color: MUTED, opacity: 0.5 }} /> : act.tipo === 'quiz' ? <IconoCuestionario width={15} height={15} style={{ color: MUTED, opacity: 0.5 }} /> : <IconoEjercicio width={15} height={15} style={{ color: MUTED, opacity: 0.5 }} />}
                      <span style={{ flex: 1, fontFamily: FONT_BODY, fontSize: 14, color: NAVY }}>{act.tipo === 'video' ? act.titulo : tituloActividad(act)}</span>
                      {score && <span style={{ fontFamily: FONT_BODY, fontSize: 12, fontWeight: 600, color: GOLD_REF_DK }}>{score}</span>}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function ResumenPersonal({ temperamento, pasos, completados }) {
  if (!temperamento) return null;
  const p = temperamento.primary;
  const s = temperamento.secondary;
  const perfil = s ? `${p}-${s}` : p;

  const retosStep = pasos.find(paso => paso.tipo === 'retos_temperamento');
  const retosHecho = retosStep && completados[retosStep.id];
  const fd = retosStep?.facilita_dificulta?.[p];
  const virtudDesafio = retosStep?.virtud_desafio_map?.[perfil] ?? retosStep?.virtud_desafio_map?.[p];

  return (
    <div style={{ ...tarjeta, marginTop: 18 }}>
      <div style={eyebrow}>Mi perfil</div>

      <div style={{ display: 'flex', gap: 10, marginTop: 12 }}>
        <div style={{ flex: 1, padding: '10px 12px', background: BEIGE, borderLeft: `3px solid ${TEMP_COLORS[p] ?? LINE}` }}>
          <div style={{ fontFamily: FONT_BODY, fontSize: 10, color: MUTED, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Primario</div>
          <div style={{ fontFamily: FONT_SLAB, fontSize: 16, fontWeight: 700, color: NAVY, marginTop: 2 }}>{TEMP_NOMBRE[p]}</div>
        </div>
        {s && (
          <div style={{ flex: 1, padding: '10px 12px', background: BEIGE, borderLeft: `3px solid ${TEMP_COLORS[s] ?? LINE}` }}>
            <div style={{ fontFamily: FONT_BODY, fontSize: 10, color: MUTED, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Secundario</div>
            <div style={{ fontFamily: FONT_SLAB, fontSize: 16, fontWeight: 700, color: NAVY, marginTop: 2 }}>{TEMP_NOMBRE[s]}</div>
          </div>
        )}
      </div>

      {retosHecho && fd && (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginTop: 12 }}>
            <div style={{ padding: '8px 10px', background: '#ecfdf5', borderLeft: '2px solid #10b981' }}>
              <div style={{ fontFamily: FONT_BODY, fontSize: 10, fontWeight: 700, color: '#065f46', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Facilita</div>
              <div style={{ fontFamily: FONT_BODY, fontSize: 13, color: '#065f46', lineHeight: 1.4, marginTop: 2 }}>{fd.facilita}</div>
            </div>
            <div style={{ padding: '8px 10px', background: '#fef2f2', borderLeft: '2px solid #ef4444' }}>
              <div style={{ fontFamily: FONT_BODY, fontSize: 10, fontWeight: 700, color: '#991b1b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Dificulta</div>
              <div style={{ fontFamily: FONT_BODY, fontSize: 13, color: '#991b1b', lineHeight: 1.4, marginTop: 2 }}>{fd.dificulta}</div>
            </div>
          </div>

          {virtudDesafio && (
            <div style={{ padding: '10px 12px', background: BEIGE, borderLeft: `3px solid ${GOLD_REF}`, marginTop: 12 }}>
              <div style={{ fontFamily: FONT_BODY, fontSize: 10, fontWeight: 700, color: MUTED, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Mi virtud-desafío</div>
              <div style={{ fontFamily: FONT_SLAB, fontSize: 18, fontWeight: 700, color: NAVY, marginTop: 2 }}>{virtudDesafio}</div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function VistaListado({ modulo, pasos, visibles, completados, irA, cursoNum = 1, userId, temperamento }) {
  const progAll = progresoModulo(pasos, completados);
  const modHeaders = pasos.filter((p) => p.tipo === 'video' && !p.continua_modulo);
  const allVids = pasos.filter((p) => p.tipo === 'video');
  const vidsHechos = modHeaders.filter((p) => {
    if (!completados[p.id]) return false;
    const pIdx = allVids.indexOf(p);
    for (let j = pIdx + 1; j < allVids.length && allVids[j].continua_modulo; j++) {
      if (!completados[allVids[j].id]) return false;
    }
    return true;
  }).length;
  const vidsPct = modHeaders.length ? Math.round((vidsHechos / modHeaders.length) * 100) : 0;
  const cont = continuarModulo(pasos, completados);

  const planStep = pasos.find(p => p.tipo === 'plan_crecimiento');
  const planHecho = planStep ? Boolean(completados[planStep.id]) : false;

  return (
    <div className="vl-listado" style={{ margin: '0 auto' }}>
      <style>{`
        .vl-listado { display: grid; grid-template-columns: 1fr; gap: 0; max-width: 860px; }
        @media (min-width: 768px) {
          .vl-listado { grid-template-columns: 2fr 3fr; gap: 36px; max-width: none; }
          .vl-listado-izq { position: sticky; top: 20px; align-self: start; }
        }
      `}</style>

      <div className="vl-listado-izq">
        <Link to="/app/formacion" style={{ fontFamily: FONT_BODY, fontSize: 14, fontWeight: 600, color: GOLD_REF_DK, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 6, marginBottom: 16 }}>
          ← Toda la formación
        </Link>
        <div style={eyebrow}>Curso {cursoNum}</div>
        <h1 style={{ ...titulo(28), margin: '8px 0 10px' }}>{modulo.titulo}</h1>
        <p style={{ ...parrafo, marginBottom: 24 }}>{modulo.descripcion}</p>

        <div style={{ display: 'flex', alignItems: 'center', gap: 18, marginBottom: 8 }}>
          <svg width={72} height={72} viewBox="0 0 72 72" role="img" aria-label={`${vidsPct}% completado`}>
            <circle cx={36} cy={36} r={28} fill="none" stroke="rgba(27,42,74,0.10)" strokeWidth="5" />
            <circle cx={36} cy={36} r={28} fill="none" stroke={GOLD_REF_DK} strokeWidth="5" strokeLinecap="round"
                    strokeDasharray={`${(2 * Math.PI * 28 * vidsPct) / 100} ${2 * Math.PI * 28}`}
                    transform="rotate(-90 36 36)" style={{ transition: 'stroke-dasharray 600ms ease' }} />
            <text x="50%" y="50%" textAnchor="middle" dominantBaseline="central" fontFamily={FONT_SLAB} fontSize="18" fontWeight="700" fill={NAVY}>{vidsPct}%</text>
          </svg>
          <div>
            <div style={{ fontFamily: FONT_SLAB, fontSize: 20, fontWeight: 700, color: NAVY }}>{vidsHechos} de {modHeaders.length} módulos</div>
            <div style={{ fontFamily: FONT_BODY, fontSize: 13, color: MUTED, marginTop: 2 }}>
              {progAll.completo ? 'Curso completado' : 'En progreso'}
            </div>
          </div>
        </div>

        {temperamento && (
          <ResumenPersonal temperamento={temperamento} pasos={pasos} completados={completados} />
        )}

        {userId && (
          <div style={{ marginTop: 18 }}>
            <CuadernoPersonal userId={userId} pasos={modulo.pasos} temperamento={temperamento} moduloId={modulo.id} />
            {planStep && (
              <button type="button" disabled style={{
                all: 'unset', boxSizing: 'border-box', width: '100%', marginTop: 10,
                display: 'flex', alignItems: 'center', gap: 10,
                fontFamily: FONT_BODY, fontSize: 14, fontWeight: 600, color: MUTED,
                background: BEIGE, border: `1px dashed ${LINE}`, padding: '12px 16px',
                cursor: 'default', opacity: 0.7,
              }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ flexShrink: 0 }}>
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                  <line x1="16" y1="13" x2="8" y2="13" />
                  <line x1="16" y1="17" x2="8" y2="17" />
                </svg>
                Descargar plan de crecimiento
                <span style={{ fontFamily: FONT_BODY, fontSize: 11, marginLeft: 'auto' }}>Proximamente</span>
              </button>
            )}
          </div>
        )}
      </div>

      <div>
        {cont && (
          <section style={{ background: heroFondo, color: PAPER, borderRadius: 0, padding: 18, marginBottom: 18, boxShadow: '0 8px 24px rgba(15,29,56,0.22)' }}>
            <div style={{ ...eyebrow, color: GOLD_REF_LT, marginBottom: 8 }}>
              {vidsHechos > 0 ? 'Continúa donde lo dejaste' : 'Empieza aquí'}
            </div>
            <button type="button" onClick={() => irA(cont.id)} style={{
              all: 'unset', boxSizing: 'border-box', width: '100%', cursor: 'pointer',
              display: 'flex', gap: 14, alignItems: 'center',
            }}>
              <span style={{
                flex: '0 0 48px', height: 48, borderRadius: '50%', display: 'grid', placeItems: 'center',
                background: 'rgba(255,255,255,0.15)',
              }}>
                <IconoPlay width={22} height={22} />
              </span>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontFamily: FONT_SLAB, fontSize: 19, fontWeight: 600, lineHeight: 1.2 }}>{cont.titulo}</div>
                <div style={{ fontFamily: FONT_BODY, fontSize: 12, opacity: 0.72, marginTop: 4 }}>{cont.tipo === 'video' ? 'Vídeo' : cont.tipo === 'cierre' ? 'Conclusiones' : cont.tipo === 'conclusion_modulo' ? 'Resumen del módulo' : cont.tipo === 'reflexion_guiada' ? 'Reflexión' : cont.tipo === 'plan_crecimiento' ? 'Plan de crecimiento' : 'Actividad'}</div>
              </div>
            </button>
          </section>
        )}

        <ListaLecciones pasos={pasos} completados={completados} irA={irA} />

        {planStep && (
          <section style={{ marginTop: 18 }}>
            <button type="button" onClick={() => irA(planStep.id)} style={{
              all: 'unset', boxSizing: 'border-box', width: '100%', cursor: 'pointer',
              ...tarjeta, display: 'flex', alignItems: 'center', gap: 14,
              borderTop: `2px solid ${GOLD_REF}`,
            }}>
              <span style={{
                flex: '0 0 32px', height: 32, borderRadius: '50%', display: 'grid', placeItems: 'center',
                background: planHecho ? GOLD_REF : 'transparent',
                border: planHecho ? 'none' : `1.5px solid ${LINE}`,
                color: planHecho ? '#fff' : NAVY,
                fontFamily: FONT_SLAB, fontSize: 16, fontWeight: 700,
              }}>
                {planHecho ? <IconoCheck width={16} height={16} /> : '✦'}
              </span>
              <div>
                <div style={{ fontFamily: FONT_SLAB, fontSize: 16, fontWeight: 700, color: NAVY }}>{planStep.titulo}</div>
                <div style={{ fontFamily: FONT_BODY, fontSize: 12, color: MUTED, marginTop: 2 }}>
                  {planHecho ? 'Completado' : 'Plan de crecimiento'}
                </div>
              </div>
            </button>
          </section>
        )}

      </div>
    </div>
  );
}

export default function Modulo() {
  const { user } = useOutletContext();
  const { cursoId = 'curso-1' } = useParams();
  const [moduloData, setModuloData] = useState(null);
  const [cargando, setCargando] = useState(true);
  const cat = useCatalogo();

  useEffect(() => {
    const loader = MODULOS[cursoId];
    if (loader) {
      setCargando(true);
      loader().then((m) => { setModuloData(m.default ?? m); setCargando(false); });
      return;
    }
    if (cat.cargando) return;
    const num = parseInt(cursoId.replace('curso-', ''), 10);
    const curso = cat.cursos?.find((c) => c.numero === num);
    if (curso) {
      setModuloData(catalogoAModulo(curso));
    } else {
      setModuloData(null);
    }
    setCargando(false);
  }, [cursoId, cat.cargando, cat.cursos]);

  if (cargando || cat.cargando) {
    return (
      <section style={tarjeta}>
        <div style={eyebrow}>Curso</div>
        <p style={{ ...parrafo, marginTop: 10 }}>Cargando…</p>
      </section>
    );
  }

  if (!moduloData) {
    return (
      <section style={tarjeta}>
        <div style={eyebrow}>Curso no encontrado</div>
        <p style={{ ...parrafo, marginTop: 10 }}>Este curso aún no está disponible.</p>
        <Link to="/app/formacion" style={{ fontFamily: FONT_BODY, fontSize: 14, fontWeight: 600, color: GOLD_REF_DK, textDecoration: 'none', marginTop: 12, display: 'inline-block' }}>← Toda la formación</Link>
      </section>
    );
  }

  return <ModuloContenido moduloData={moduloData} user={user} cursoId={cursoId} />;
}

function ModuloContenido({ moduloData, user, cursoId }) {
  const cursoNum = moduloData.curso != null ? moduloData.curso : (parseInt(cursoId.replace('curso-', ''), 10) || 1);
  const progreso = useModuloProgreso(user.id, moduloData.id, cursoNum);
  const notasHook = useNotas(user.id, moduloData.id);
  const [temp, setTemp] = useState(undefined);

  useEffect(() => {
    let vivo = true;
    fetchLatestTemperament()
      .then((f) => { if (vivo) setTemp(mapTemp(f?.result)); })
      .catch(() => { if (vivo) setTemp(null); });
    return () => { vivo = false; };
  }, []);

  const temperamento = temp ?? null;
  const pasos = pasosDelUsuario(moduloData, temperamento);
  const visibles = pasosVisibles(pasos);
  const pasoActualId = progreso.pasoActual;
  const pasoActual = pasoActualId ? pasos.find((p) => p.id === pasoActualId) : null;

  function irA(pasoId) {
    progreso.irA(pasoId, pasos.length);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function avanzar() {
    if (!pasoActual) return;
    const sig = siguientePaso(pasos, pasoActual.id);
    if (sig) {
      irA(sig.id);
    } else {
      progreso.irA(null, pasos.length);
    }
  }

  function retroceder() {
    if (!pasoActual) return;
    const ant = pasoAnterior(pasos, pasoActual.id);
    if (ant) irA(ant.id);
  }

  function volver() {
    progreso.irA(null, pasos.length);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function rewind() {
    if (!pasoActual) return volver();
    if (pasoActual.tipo === 'video') return volver();
    const vid = videoAnterior(pasos, pasoActual.id);
    if (vid) {
      irA(vid.id);
    } else {
      volver();
    }
  }

  if (temp === undefined) {
    return (
      <section style={tarjeta}>
        <div style={eyebrow}>Curso {cursoNum}</div>
        <p style={{ ...parrafo, marginTop: 10 }}>Cargando…</p>
      </section>
    );
  }

  if (pasoActual) {
    if (pasoActual.tipo === 'video') {
      const videosPasos = pasos.filter((p) => p.tipo === 'video');
      return <PasoVideo paso={pasoActual} pasos={pasos} progreso={progreso} avanzar={avanzar} retroceder={pasoAnterior(pasos, pasoActual.id) ? retroceder : null} volver={volver} cursoNum={cursoNum} notasProps={{ videos: videosPasos, completados: progreso.completados, notas: notasHook.notas, onAgregar: notasHook.agregar, onEliminar: notasHook.eliminar }} />;
    }
    const videoCtx = videoAnterior(pasos, pasoActual.id);
    const videoCtxMod = videoCtx ? moduloDelPaso(pasos, videoCtx.id) : null;
    return (
      <div style={{ maxWidth: 800, margin: '0 auto' }}>
        <button type="button" onClick={rewind} style={{
          background: 'none', border: 'none', padding: 0, cursor: 'pointer',
          color: NAVY, fontFamily: FONT_BODY, fontSize: 14, fontWeight: 600, marginBottom: 14,
        }}>
          ← {videoCtx ? 'Atrás' : 'Salir al curso'}
        </button>
        {videoCtx && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', background: BEIGE, borderLeft: `3px solid ${GOLD_REF}`, marginBottom: 16, fontFamily: FONT_BODY, fontSize: 14, color: NAVY, flexWrap: 'wrap' }}>
            <span style={{ fontWeight: 600, color: MUTED, fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>Módulo {videoCtxMod?.numero ?? 1}</span>
            <span style={{ color: LINE }}>|</span>
            <span>{videoCtx.titulo}</span>
            <span style={{ color: MUTED, fontSize: 13 }}>/</span>
            <span style={{ fontWeight: 600, color: GOLD_REF_DK, fontSize: 13 }}>{etiquetaPaso(pasoActual)}</span>
          </div>
        )}
        <PasoActividad paso={pasoActual} pasos={pasos} temperamento={temperamento} progreso={progreso} avanzar={avanzar} volver={rewind} user={user} />
      </div>
    );
  }

  return (
    <VistaListado
      modulo={moduloData}
      pasos={pasos}
      visibles={visibles}
      completados={progreso.completados}
      irA={irA}
      cursoNum={cursoNum}
      userId={user.id}
      temperamento={temperamento}
    />
  );
}
