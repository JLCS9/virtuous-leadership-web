import { useEffect, useState, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { useOutletContext, useParams, Link } from 'react-router-dom';
import { pasosDelUsuario, pasosVisibles, progresoModulo, progresoActividad, continuarModulo, siguientePaso, pasoAnterior, moduloDelPaso, videoAnterior } from './flujoModulo';
import { useModuloProgreso } from './useModulo';
import { Reproductor } from './Formacion';
import { Quiz, Define, Desliza, Identifica, TestProfundo, TemperamentoPerfil, RetosTemperamento, CirculoPersonas, ConclusionModulo, ReflexionGuiada, Sintesis, TestCaracterFormacion, TestCorazonFormacion, ReflexionPiramide, TemperamentoMagnanimidad, PlanCrecimiento, PantallaResumen, leerPlan, guardarPlan, PantallaTablaDinamica, PantallaChecklist, PantallaChecklistCategorias, PantallaReflexionDoble, PantallaReflexionTemperamento, PantallaProposito } from './Actividad';
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
      progreso.completar(paso.id, undefined, { tipo: 'video', modulo: paso.modulo ?? 0 });
    }
  }

  function avanzarYMarcar() {
    if (!completado) progreso.completar(paso.id, undefined, { tipo: 'video', modulo: paso.modulo ?? 0 });
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

function PasoActividad({ paso, pasos, temperamento, progreso, avanzar, volver, user, irA }) {
  const _vidCtx = videoAnterior(pasos, paso.id);
  const _mod = _vidCtx ? moduloDelPaso(pasos, _vidCtx.id) : null;
  const moduloNum = _mod?.numero ?? 1;

  function completar(resultado) {
    progreso.completar(paso.id, resultado, { tipo: paso.tipo, modulo: paso.modulo ?? 0 });
    avanzar();
  }

  switch (paso.tipo) {
    case 'quiz': return <Quiz paso={paso} onComplete={completar} modulo={moduloNum} />;
    case 'define': return <Define paso={paso} onComplete={completar} modulo={moduloNum} />;
    case 'desliza': return <Desliza paso={paso} onComplete={completar} modulo={moduloNum} />;
    case 'identifica': return <Identifica paso={paso} onComplete={completar} modulo={moduloNum} />;
    case 'test_profundo': return <TestProfundo paso={paso} onComplete={completar} modulo={moduloNum} user={user} />;
    case 'reflexion_piramide': return <ReflexionPiramide paso={paso} onComplete={completar} modulo={moduloNum} />;
    case 'temperamento_magnanimidad': return <TemperamentoMagnanimidad paso={paso} temperamento={temperamento} onComplete={completar} />;
    case 'temperamento_perfil': return <TemperamentoPerfil paso={paso} temperamento={temperamento} onComplete={completar} />;
    case 'retos_temperamento': return <RetosTemperamento paso={paso} temperamento={temperamento} onComplete={completar} />;
    case 'circulo_personas': return <CirculoPersonas paso={paso} user={user} onComplete={completar} />;
    case 'conclusion_modulo': {
      const idxConcl = pasos.indexOf(paso);
      let idxVideo = -1;
      for (let i = idxConcl - 1; i >= 0; i--) {
        if (pasos[i].tipo === 'video' && !pasos[i].continua_modulo) { idxVideo = i; break; }
      }
      const pendientes = idxVideo >= 0
        ? pasos.slice(idxVideo, idxConcl).filter(p => p.tipo !== 'noop' && !progreso.completados[p.id])
        : [];
      return <ConclusionModulo paso={paso} completados={progreso.completados} pendientes={pendientes} onContinuar={completar} onVolver={volver} irA={irA} />;
    }
    case 'reflexion_guiada': return <ReflexionGuiada paso={paso} temperamento={temperamento} onComplete={completar} />;
    case 'plan_crecimiento': return <PlanCrecimiento paso={paso} temperamento={temperamento} onComplete={completar} userId={user.id} />;
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

function ModalEditarPlan({ pantalla, datos, onGuardar, onCerrar }) {
  const [valor, setValor] = useState(datos);
  let editor = null;
  if (pantalla.tipo === 'tabla_dinamica') editor = <PantallaTablaDinamica pantalla={pantalla} datos={valor} onChange={setValor} />;
  else if (pantalla.tipo === 'checklist') editor = <PantallaChecklist pantalla={pantalla} datos={valor} onChange={setValor} />;
  else if (pantalla.tipo === 'checklist_categorias') editor = <PantallaChecklistCategorias pantalla={pantalla} datos={valor} onChange={setValor} />;
  else if (pantalla.tipo === 'reflexion_doble') editor = <PantallaReflexionDoble pantalla={pantalla} datos={valor} onChange={setValor} />;
  else if (pantalla.tipo === 'reflexion_temperamento') editor = <PantallaReflexionTemperamento pantalla={pantalla} datos={valor} onChange={setValor} />;
  else if (pantalla.tipo === 'proposito') editor = <PantallaProposito pantalla={pantalla} datos={valor} onChange={setValor} />;

  return createPortal(
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9999, display: 'grid', placeItems: 'center',
      background: 'rgba(15,29,56,0.55)', backdropFilter: 'blur(4px)',
    }} onClick={onCerrar}>
      <div style={{
        background: PAPER, borderRadius: 0, maxWidth: 600, width: '92vw',
        maxHeight: '85vh', overflow: 'auto', padding: '28px 24px 20px',
        boxShadow: '0 12px 48px rgba(15,29,56,0.22)',
      }} onClick={e => e.stopPropagation()}>
        <h3 style={{ fontFamily: FONT_SLAB, fontSize: 20, fontWeight: 700, color: NAVY, margin: '0 0 16px' }}>
          {pantalla.titulo}
        </h3>
        {editor}
        <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 20 }}>
          <button type="button" onClick={onCerrar} style={{
            fontFamily: FONT_BODY, fontSize: 14, fontWeight: 600, color: MUTED,
            background: 'none', border: `1px solid ${LINE}`, padding: '10px 20px', cursor: 'pointer',
          }}>Cancelar</button>
          <button type="button" onClick={() => onGuardar(valor)} style={{
            fontFamily: FONT_BODY, fontSize: 14, fontWeight: 600, color: '#fff',
            background: GOLD_REF, border: 'none', padding: '10px 24px', cursor: 'pointer',
          }}>Guardar</button>
        </div>
      </div>
    </div>,
    document.body,
  );
}

function VistaResumenPlan({ paso, userId, onVolver }) {
  const [plan, setPlan] = useState(() => {
    let data = leerPlan(userId);
    if (userId !== 'anon' && (!data || Object.keys(data).length === 0)) {
      data = leerPlan('anon');
    }
    return data;
  });
  const [editIdx, setEditIdx] = useState(null);
  const pantallas = paso.pantallas ?? [];
  const hayDatos = pantallas.some(p => p.tipo !== 'texto' && p.tipo !== 'resumen' && plan[p.id]);

  function handleGuardar(valor) {
    const pant = pantallas[editIdx];
    const next = { ...plan, [pant.id]: valor };
    setPlan(next);
    guardarPlan(userId, next);
    setEditIdx(null);
  }

  return (
    <div style={{ maxWidth: 800, margin: '0 auto' }}>
      <button type="button" onClick={onVolver} style={{
        fontFamily: FONT_BODY, fontSize: 14, fontWeight: 600, color: GOLD_REF_DK,
        background: 'none', border: 'none', padding: 0, cursor: 'pointer', marginBottom: 16,
        display: 'inline-flex', alignItems: 'center', gap: 6,
      }}>
        ← Volver al listado
      </button>
      <div style={tarjeta}>
        <h2 style={{ fontFamily: FONT_SLAB, fontSize: 24, fontWeight: 700, color: NAVY, margin: '0 0 16px' }}>
          Tu Plan de Crecimiento
        </h2>
        {hayDatos
          ? <PantallaResumen paso={paso} plan={plan} onEditar={setEditIdx} />
          : <p style={{ fontFamily: FONT_BODY, fontSize: 16, color: MUTED, lineHeight: 1.6 }}>Aún no has completado el plan de crecimiento. Complétalo primero en el curso.</p>
        }
      </div>
      {editIdx != null && pantallas[editIdx] && (
        <ModalEditarPlan
          pantalla={pantallas[editIdx]}
          datos={plan[pantallas[editIdx].id]}
          onGuardar={handleGuardar}
          onCerrar={() => setEditIdx(null)}
        />
      )}
    </div>
  );
}

const TIPOS_EXCLUIR_CUADERNO = new Set(['video', 'quiz', 'conclusion_modulo', 'noop', 'plan_crecimiento', 'test_caracter', 'temperamento_perfil', 'reflexion_guiada', 'circulo_personas']);

function tieneDatos(datos) {
  if (!datos) return false;
  const keys = Object.keys(datos).filter(k => k !== 'fecha' && k !== 'aprobado');
  if (keys.length === 0) return false;
  if (keys.length === 1 && (datos.completado || datos.visto)) return false;
  if (keys.every(k => k === 'visto' || datos[k] === '' || datos[k] === null || datos[k] === undefined)) return false;
  return true;
}

function resumenEjercicio(paso) {
  switch (paso.tipo) {
    case 'define': return 'Asocia cada concepto con su definición correcta.';
    case 'desliza': return 'Identifica el temperamento que mejor encaja con cada situación.';
    case 'identifica': return 'Reflexiona sobre qué virtudes te resultan fáciles y cuáles te cuestan.';
    case 'test_profundo': return 'Responde a las señales concretas de este temperamento en tu vida.';
    case 'retos_temperamento': return 'Reflexión sobre lo que tu temperamento facilita y dificulta.';
    case 'temperamento_magnanimidad': return 'Cómo tu temperamento influye en la práctica de la magnanimidad.';
    case 'cierre': return 'Síntesis del curso: tu virtud desafío y tu propósito.';
    case 'reflexion_piramide': return 'Reflexión guiada sobre los conceptos del módulo.';
    default: return 'Ejercicio completado.';
  }
}

function resumenCorto(paso, datos) {
  if (paso.tipo === 'define') return `${datos.aciertos} de ${datos.total} aciertos`;
  if (paso.tipo === 'desliza') return `${datos.aciertos} de ${datos.total} aciertos`;
  if (paso.tipo === 'test_profundo') { const r = datos.respuestas ?? []; const n = r.filter(x => x && x.trim()).length; return `${n} respuesta${n !== 1 ? 's' : ''}`; }
  if (paso.tipo === 'identifica') { const r = datos.respuestas ?? []; const n = r.filter(x => x && (x.facil || x.dificil)).length; return `${n} virtud${n !== 1 ? 'es' : ''} valorada${n !== 1 ? 's' : ''}`; }
  return null;
}

function VistaCuaderno({ pasos, completados, onVolver, userId, moduloId, temperamento }) {
  const entradas = pasos.filter(p => !TIPOS_EXCLUIR_CUADERNO.has(p.tipo) && completados[p.id] && tieneDatos(completados[p.id]));

  return (
    <div style={{ maxWidth: 800, margin: '0 auto' }}>
      <button type="button" onClick={onVolver} style={{
        fontFamily: FONT_BODY, fontSize: 14, fontWeight: 600, color: GOLD_REF_DK,
        background: 'none', border: 'none', padding: 0, cursor: 'pointer', marginBottom: 16,
        display: 'inline-flex', alignItems: 'center', gap: 6,
      }}>
        ← Volver al listado
      </button>
      <div style={tarjeta}>
        <h2 style={{ fontFamily: FONT_SLAB, fontSize: 24, fontWeight: 700, color: NAVY, margin: '0 0 16px' }}>
          Tu cuaderno personal
        </h2>
        {entradas.length === 0 ? (
          <p style={{ fontFamily: FONT_BODY, fontSize: 16, color: MUTED, lineHeight: 1.6 }}>
            Aún no has completado ejercicios con respuestas. Completa los tests y reflexiones del curso.
          </p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
            {entradas.map(paso => {
              const datos = completados[paso.id];
              const corto = resumenCorto(paso, datos);
              return (
                <details key={paso.id} style={{ borderTop: `1px solid ${LINE}` }}>
                  <summary style={{ padding: '14px 0', cursor: 'pointer', listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 4 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontFamily: FONT_SLAB, fontSize: 15, fontWeight: 700, color: NAVY }}>{paso.titulo || paso.tipo}</span>
                      {corto && <span style={{ fontFamily: FONT_BODY, fontSize: 12, color: MUTED }}>· {corto}</span>}
                      <span style={{ marginLeft: 'auto', fontFamily: FONT_BODY, fontSize: 11, color: GOLD_REF_DK, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Completado</span>
                    </div>
                    <p style={{ fontFamily: FONT_BODY, fontSize: 13, color: MUTED, lineHeight: 1.4, margin: 0 }}>{resumenEjercicio(paso)}</p>
                  </summary>
                  <div style={{ padding: '0 0 16px 0' }}>
                    <RespuestasCuaderno paso={paso} datos={datos} />
                  </div>
                </details>
              );
            })}
          </div>
        )}
      </div>
      <div style={{ marginTop: 18 }}>
        <CuadernoPersonal userId={userId} pasos={pasos} temperamento={temperamento} moduloId={moduloId} />
      </div>
    </div>
  );
}

function RespuestasCuaderno({ paso, datos }) {
  if (!datos) return null;

  if (paso.tipo === 'define') {
    const conceptos = paso.conceptos ?? [];
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <p style={{ fontFamily: FONT_BODY, fontSize: 14, color: NAVY, margin: 0 }}>
          Resultado: <strong>{datos.aciertos}</strong> de {datos.total} aciertos
        </p>
        {conceptos.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {conceptos.map((c, i) => (
              <div key={i} style={{ paddingLeft: 16 }}>
                <p style={{ fontFamily: FONT_BODY, fontSize: 13, fontWeight: 600, color: NAVY, margin: '0 0 2px' }}>{c.concepto}</p>
                <p style={{ fontFamily: FONT_BODY, fontSize: 13, color: MUTED, lineHeight: 1.5, margin: 0 }}>{c.definicion}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  if (paso.tipo === 'test_profundo') {
    const preguntas = paso.preguntas ?? paso.senales ?? [];
    const respuestas = datos.respuestas ?? [];
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {preguntas.map((pregunta, i) => (
          <div key={i}>
            <p style={{ fontFamily: FONT_BODY, fontSize: 13, fontWeight: 600, color: NAVY, margin: '0 0 2px' }}>
              {i + 1}. {pregunta}
            </p>
            <p style={{ fontFamily: FONT_BODY, fontSize: 14, color: respuestas[i] ? NAVY : MUTED, lineHeight: 1.6, margin: 0, paddingLeft: 16, fontStyle: respuestas[i] ? 'normal' : 'italic' }}>
              {respuestas[i] || 'Sin respuesta'}
            </p>
          </div>
        ))}
      </div>
    );
  }

  if (paso.tipo === 'identifica') {
    const virtudes = paso.virtudes ?? [];
    const respuestas = datos.respuestas ?? [];
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {virtudes.map((v, i) => {
          const r = respuestas[i];
          if (!r) return null;
          return (
            <div key={i}>
              <p style={{ fontFamily: FONT_BODY, fontSize: 13, fontWeight: 600, color: NAVY, margin: '0 0 4px' }}>{v.nombre}</p>
              {r.facil && <p style={{ fontFamily: FONT_BODY, fontSize: 14, color: NAVY, lineHeight: 1.5, margin: '0 0 2px', paddingLeft: 16 }}><span style={{ color: MUTED, fontSize: 12 }}>Lo que me resulta fácil:</span> {r.facil}</p>}
              {r.ejemploFacil && <p style={{ fontFamily: FONT_BODY, fontSize: 14, color: NAVY, lineHeight: 1.5, margin: '0 0 2px', paddingLeft: 16 }}><span style={{ color: MUTED, fontSize: 12 }}>Ejemplo:</span> {r.ejemploFacil}</p>}
              {r.dificil && <p style={{ fontFamily: FONT_BODY, fontSize: 14, color: NAVY, lineHeight: 1.5, margin: '0 0 2px', paddingLeft: 16 }}><span style={{ color: MUTED, fontSize: 12 }}>Lo que me cuesta:</span> {r.dificil}</p>}
              {r.ejemploDificil && <p style={{ fontFamily: FONT_BODY, fontSize: 14, color: NAVY, lineHeight: 1.5, margin: '0 0 2px', paddingLeft: 16 }}><span style={{ color: MUTED, fontSize: 12 }}>Ejemplo:</span> {r.ejemploDificil}</p>}
            </div>
          );
        })}
      </div>
    );
  }

  if (paso.tipo === 'retos_temperamento') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {datos.textoFacilita && <p style={{ fontFamily: FONT_BODY, fontSize: 14, color: NAVY, lineHeight: 1.5, margin: 0 }}><span style={{ color: MUTED, fontSize: 12 }}>Lo que mi temperamento facilita:</span> {datos.textoFacilita}</p>}
        {datos.textoDificulta && <p style={{ fontFamily: FONT_BODY, fontSize: 14, color: NAVY, lineHeight: 1.5, margin: 0 }}><span style={{ color: MUTED, fontSize: 12 }}>Lo que mi temperamento dificulta:</span> {datos.textoDificulta}</p>}
        {datos.textoDefectos && <p style={{ fontFamily: FONT_BODY, fontSize: 14, color: NAVY, lineHeight: 1.5, margin: 0 }}><span style={{ color: MUTED, fontSize: 12 }}>Mis defectos dominantes:</span> {datos.textoDefectos}</p>}
      </div>
    );
  }

  if (paso.tipo === 'temperamento_magnanimidad') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {datos.textoFuerte && <p style={{ fontFamily: FONT_BODY, fontSize: 14, color: NAVY, lineHeight: 1.5, margin: 0 }}><span style={{ color: MUTED, fontSize: 12 }}>Lo que mi temperamento facilita:</span> {datos.textoFuerte}</p>}
        {datos.textoDebil && <p style={{ fontFamily: FONT_BODY, fontSize: 14, color: NAVY, lineHeight: 1.5, margin: 0 }}><span style={{ color: MUTED, fontSize: 12 }}>Lo que me cuesta más:</span> {datos.textoDebil}</p>}
        {datos.textoFuerteSec && <p style={{ fontFamily: FONT_BODY, fontSize: 14, color: NAVY, lineHeight: 1.5, margin: 0 }}><span style={{ color: MUTED, fontSize: 12 }}>Mi temperamento secundario facilita:</span> {datos.textoFuerteSec}</p>}
        {datos.textoDebilSec && <p style={{ fontFamily: FONT_BODY, fontSize: 14, color: NAVY, lineHeight: 1.5, margin: 0 }}><span style={{ color: MUTED, fontSize: 12 }}>Mi temperamento secundario dificulta:</span> {datos.textoDebilSec}</p>}
      </div>
    );
  }

  if (paso.tipo === 'cierre') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {datos.lo_que_facilita && <p style={{ fontFamily: FONT_BODY, fontSize: 14, color: NAVY, lineHeight: 1.5, margin: 0 }}><span style={{ color: MUTED, fontSize: 12 }}>Lo que facilita mi temperamento:</span> {datos.lo_que_facilita}</p>}
        {datos.lo_que_cuesta && <p style={{ fontFamily: FONT_BODY, fontSize: 14, color: NAVY, lineHeight: 1.5, margin: 0 }}><span style={{ color: MUTED, fontSize: 12 }}>Lo que me cuesta:</span> {datos.lo_que_cuesta}</p>}
        {datos.virtud_desafio && <p style={{ fontFamily: FONT_BODY, fontSize: 14, color: NAVY, lineHeight: 1.5, margin: 0 }}><span style={{ color: MUTED, fontSize: 12 }}>Mi virtud desafío:</span> {datos.virtud_desafio}</p>}
        {datos.proposito && <p style={{ fontFamily: FONT_BODY, fontSize: 14, color: NAVY, lineHeight: 1.5, margin: 0 }}><span style={{ color: MUTED, fontSize: 12 }}>Mi propósito:</span> {datos.proposito}</p>}
      </div>
    );
  }

  if (paso.tipo === 'reflexion_piramide') {
    const preguntas = paso.preguntas ?? [];
    const respuestas = datos.respuestas ?? [];
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {preguntas.map((pregunta, i) => (
          <div key={i}>
            <p style={{ fontFamily: FONT_BODY, fontSize: 13, fontWeight: 600, color: NAVY, margin: '0 0 2px' }}>
              {i + 1}. {pregunta}
            </p>
            <p style={{ fontFamily: FONT_BODY, fontSize: 14, color: respuestas[i] ? NAVY : MUTED, lineHeight: 1.6, margin: 0, paddingLeft: 16, fontStyle: respuestas[i] ? 'normal' : 'italic' }}>
              {respuestas[i] || 'Sin respuesta'}
            </p>
          </div>
        ))}
      </div>
    );
  }

  if (paso.tipo === 'desliza') {
    const escenas = paso.escenas ?? [];
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <p style={{ fontFamily: FONT_BODY, fontSize: 14, color: NAVY, margin: 0 }}>
          Resultado: <strong>{datos.aciertos}</strong> de {datos.total} aciertos
        </p>
        {escenas.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {escenas.map((e, i) => (
              <div key={i} style={{ paddingLeft: 16 }}>
                <p style={{ fontFamily: FONT_BODY, fontSize: 13, color: NAVY, lineHeight: 1.5, margin: 0 }}>
                  {e.texto?.substring(0, 120)}{e.texto?.length > 120 ? '…' : ''}
                </p>
                <p style={{ fontFamily: FONT_BODY, fontSize: 12, color: MUTED, margin: '2px 0 0' }}>Respuesta: {e.respuesta}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  const keys = Object.keys(datos).filter(k => k !== 'fecha' && k !== 'aprobado' && k !== 'completado' && k !== 'visto');
  if (keys.length > 0) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {keys.map(k => {
          const v = datos[k];
          if (v === null || v === undefined || v === '' || v === true || v === false) return null;
          const label = k.replace(/_/g, ' ').replace(/^./, c => c.toUpperCase());
          return (
            <p key={k} style={{ fontFamily: FONT_BODY, fontSize: 14, color: NAVY, lineHeight: 1.5, margin: 0 }}>
              <span style={{ color: MUTED, fontSize: 12 }}>{label}:</span> {typeof v === 'object' ? JSON.stringify(v) : String(v)}
            </p>
          );
        })}
      </div>
    );
  }

  return null;
}

function VistaListado({ modulo, pasos, visibles, completados, irA, cursoNum = 1, userId, temperamento }) {
  const [verPlan, setVerPlan] = useState(false);
  const [verCuaderno, setVerCuaderno] = useState(false);
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
  const cierreStep = pasos.find(p => p.tipo === 'cierre' && p.visible !== false);
  const cierreHecho = cierreStep ? Boolean(completados[cierreStep.id]) : false;

  if (verPlan && planStep) {
    return <VistaResumenPlan paso={planStep} userId={userId} onVolver={() => setVerPlan(false)} />;
  }

  if (verCuaderno) {
    return <VistaCuaderno pasos={pasos} completados={completados} onVolver={() => setVerCuaderno(false)} userId={userId} moduloId={modulo.id} temperamento={temperamento} />;
  }

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
            <button type="button" onClick={() => setVerCuaderno(true)} style={{
                display: 'flex', alignItems: 'center', gap: 8,
                fontFamily: FONT_BODY, fontSize: 14, fontWeight: 600,
                color: GOLD_REF_DK, background: 'none',
                border: `1.5px solid ${GOLD_REF}`, borderRadius: 0,
                padding: '10px 20px', cursor: 'pointer',
                transition: 'border-color 200ms ease, color 200ms ease',
                letterSpacing: '0.02em', width: '100%', justifyContent: 'center',
              }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ flexShrink: 0 }}>
                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
              </svg>
              Ver cuaderno personal
            </button>
            {planStep && (
              <button type="button" onClick={() => setVerPlan(true)} style={{
                display: 'flex', alignItems: 'center', gap: 8,
                fontFamily: FONT_BODY, fontSize: 14, fontWeight: 600,
                color: GOLD_REF_DK, background: 'none',
                border: `1.5px solid ${GOLD_REF}`, borderRadius: 0,
                padding: '10px 20px', cursor: 'pointer',
                transition: 'border-color 200ms ease, color 200ms ease',
                letterSpacing: '0.02em', width: '100%', justifyContent: 'center', marginTop: 10,
              }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ flexShrink: 0 }}>
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                  <line x1="16" y1="13" x2="8" y2="13" />
                  <line x1="16" y1="17" x2="8" y2="17" />
                </svg>
                Ver plan de crecimiento
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

        {cierreStep && (
          <section style={{ marginTop: 18 }}>
            <button type="button" onClick={() => irA(cierreStep.id)} style={{
              all: 'unset', boxSizing: 'border-box', width: '100%', cursor: 'pointer',
              ...tarjeta, display: 'flex', alignItems: 'center', gap: 14,
              borderTop: `2px solid ${GOLD_REF}`,
            }}>
              <span style={{
                flex: '0 0 32px', height: 32, borderRadius: '50%', display: 'grid', placeItems: 'center',
                background: cierreHecho ? GOLD_REF : 'transparent',
                border: cierreHecho ? 'none' : `1.5px solid ${LINE}`,
                color: cierreHecho ? '#fff' : NAVY,
                fontFamily: FONT_SLAB, fontSize: 16, fontWeight: 700,
              }}>
                {cierreHecho ? <IconoCheck width={16} height={16} /> : '✦'}
              </span>
              <div>
                <div style={{ fontFamily: FONT_SLAB, fontSize: 16, fontWeight: 700, color: NAVY }}>{cierreStep.titulo}</div>
                <div style={{ fontFamily: FONT_BODY, fontSize: 12, color: MUTED, marginTop: 2 }}>
                  {cierreHecho ? 'Completado' : 'Síntesis del curso'}
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
        <PasoActividad paso={pasoActual} pasos={pasos} temperamento={temperamento} progreso={progreso} avanzar={avanzar} volver={rewind} user={user} irA={irA} />
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
