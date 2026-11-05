import { useEffect, useRef, useState } from 'react';
import { useSearchParams, useOutletContext } from 'react-router-dom';
import { LocalLink as Link } from '../i18n';
import {
  UMBRAL_VISTA, buscarLeccion, continuar, duracionCurso, formatoDuracion, progresoCurso, resumenGlobal, urlVimeo,
} from './cursos.js';
import { pasosDelUsuario } from './flujoModulo';
import moduloData from '../data/modulo1.json';
import { INK, LINE, MUTED, NAVY, PAPER, FONT_SLAB, FONT_BODY, GOLD_REF, GOLD_REF_DK, GOLD_REF_LT } from '../theme';
import { barraFondo, botonContorno, botonPrimario, botonSobreClaro, eyebrow, heroFondo, parrafo, tarjeta, titulo } from '../app/estilos';
import { IconoCheck, IconoChevron, IconoFlecha, IconoPlay } from '../app/Iconos';
import { useCatalogo, useProgreso } from './useFormacion';

import img01 from '../assets/formacion/escultura-01-atleta.jpg';
import img07 from '../assets/formacion/escultura-07-hercules.jpg';
import img09 from '../assets/formacion/escultura-09-apolo-bn.jpg';
import img10 from '../assets/formacion/escultura-10-ojo-macro.jpg';
import img11 from '../assets/formacion/escultura-11-zeus-bronce.jpg';
import img12 from '../assets/formacion/escultura-12-fragmento-museo.jpg';
import img13 from '../assets/formacion/escultura-13-coliseo.jpg';

import cuadro01 from '../assets/formacion/cuadro-01-caminante-friedrich.jpg';
import cuadro02 from '../assets/formacion/cuadro-02-templo-lorrain.jpg';
import cuadro03 from '../assets/formacion/cuadro-03-pastoral-cuyp.jpg';
import cuadro04 from '../assets/formacion/cuadro-04-niagara-cole.jpg';
import cuadro05 from '../assets/formacion/cuadro-05-veleros-heade.jpg';
import cuadro06 from '../assets/formacion/cuadro-06-valle-cropsey.jpg';
import cuadro07 from '../assets/formacion/cuadro-07-rio-corot.webp';
import cuadro08 from '../assets/formacion/cuadro-08-fel-c1.jpg';
import cuadro09 from '../assets/formacion/cuadro-09-fel-c2.jpg';
import cuadro10 from '../assets/formacion/cuadro-10-mel-c3.jpg';

const PORTADAS_A = { 1: img01, 2: img12, 3: img10, 4: img11, 5: img09, 6: img13, 7: img07 };
const PORTADAS_B = { 1: cuadro09, 2: cuadro10, 3: cuadro03, 4: cuadro08, 5: cuadro05, 6: cuadro07, 7: cuadro01 };
const PORTADAS = PORTADAS_A;
const PORTADA_POS = { 5: '20%', 7: '20%' };
const PORTADA_POS_B = { 1: 'bottom', 2: 'bottom', 4: 'left bottom' };
const PORTADA_ESCALA_B = { 1: 1.5, 3: 1.1, 4: 1.3 };
const PORTADA_BRILLO_B = { 4: 1.12, 5: 0.92 };
const PORTADA_NOBRILLO_B = new Set([6]);
function portada(numero) { return PORTADAS[numero] ?? img01; }

function leerModulo1Progreso(userId) {
  try {
    const bruto = JSON.parse(localStorage.getItem(`vl-modulo:${userId}:modulo1`));
    return bruto && typeof bruto.completados === 'object' ? bruto.completados : {};
  } catch { return {}; }
}

function Anillo({ valor, tam = 84 }) {
  const r = (tam - 10) / 2;
  const c = 2 * Math.PI * r;
  return (
    <svg width={tam} height={tam} viewBox={`0 0 ${tam} ${tam}`} role="img" aria-label={`${valor} % completado`}>
      <circle cx={tam / 2} cy={tam / 2} r={r} fill="none" stroke="rgba(27,42,74,0.10)" strokeWidth="5" />
      <circle cx={tam / 2} cy={tam / 2} r={r} fill="none" stroke={GOLD_REF_DK} strokeWidth="5" strokeLinecap="round"
              strokeDasharray={`${(c * valor) / 100} ${c}`} transform={`rotate(-90 ${tam / 2} ${tam / 2})`} style={{ transition: 'stroke-dasharray 600ms ease' }} />
      <text x="50%" y="50%" textAnchor="middle" dominantBaseline="central" fontFamily={FONT_SLAB} fontSize="22" fontWeight="700" fill={NAVY}>{valor}%</text>
    </svg>
  );
}

function Miniatura({ leccion, ancho = 132 }) {
  return (
    <div style={{ position: 'relative', flex: `0 0 ${ancho}px`, aspectRatio: '16 / 9', borderRadius: 0, overflow: 'hidden', background: 'rgba(27,42,74,0.14)' }}>
      {leccion.miniatura && <img src={leccion.miniatura} alt="" loading="lazy" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />}
      <span style={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center', color: PAPER, background: 'rgba(15,29,56,0.28)' }}><IconoPlay width={26} height={26} /></span>
    </div>
  );
}

export function Reproductor({ leccion, onProgreso }) {
  const ref = useRef(null);
  const aviso = useRef(onProgreso);
  aviso.current = onProgreso;

  useEffect(() => {
    function alMensaje(ev) {
      if (ev.origin !== 'https://player.vimeo.com' || ev.source !== ref.current?.contentWindow) return;
      let d = ev.data;
      if (typeof d === 'string') { try { d = JSON.parse(d); } catch { return; } }
      if (d?.event === 'playProgress') aviso.current(Number(d.data?.percent) || 0);
      else if (d?.event === 'finish') aviso.current(1);
    }
    window.addEventListener('message', alMensaje);
    return () => window.removeEventListener('message', alMensaje);
  }, []);

  function suscribir() {
    const w = ref.current?.contentWindow;
    if (!w) return;
    for (const value of ['playProgress', 'finish']) w.postMessage(JSON.stringify({ method: 'addEventListener', value }), 'https://player.vimeo.com');
  }

  return (
    <div style={{ position: 'relative', width: '100%', aspectRatio: '16 / 9', borderRadius: 0, overflow: 'hidden', background: NAVY, boxShadow: '0 8px 24px rgba(15,29,56,0.22)' }}>
      <iframe ref={ref} key={leccion.id} src={urlVimeo(leccion.vimeoId)} onLoad={suscribir} title={leccion.titulo}
              allow="autoplay; fullscreen; picture-in-picture" allowFullScreen
              style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', border: 'none' }} />
    </div>
  );
}

function VistaLeccion({ cursos, encontrada, progreso, volver, ir }) {
  const { curso, leccion } = encontrada;
  const vista = Boolean(progreso.vistas[leccion.id]);
  useEffect(() => { progreso.abrir(leccion.id); }, [leccion.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const i = curso.lecciones.findIndex((l) => l.id === leccion.id);
  const siguienteDelCurso = curso.lecciones[i + 1];
  const siguienteCurso = cursos[cursos.findIndex((c) => c.id === curso.id) + 1];
  const siguiente = siguienteDelCurso ?? siguienteCurso?.lecciones[0] ?? null;
  const cursoAnterior = cursos[cursos.findIndex((c) => c.id === curso.id) - 1];
  const anterior = curso.lecciones[i - 1] ?? (cursoAnterior ? cursoAnterior.lecciones[cursoAnterior.lecciones.length - 1] : null);

  function avanzar() {
    if (!vista) progreso.marcarVista(leccion.id);
    if (siguiente) ir(siguiente.id);
  }

  return (
    <div className="vl-leccion" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <style>{`@media (min-width: 1100px) { .vl-leccion { display: grid !important; grid-template-columns: minmax(0, 2.2fr) minmax(300px, 1fr); gap: 24px !important; align-items: start; } .vl-leccion > button { grid-column: 1 / -1; } }`}</style>
      <button type="button" onClick={volver} style={{ alignSelf: 'flex-start', background: 'none', border: 'none', padding: 0, cursor: 'pointer', color: NAVY, fontFamily: FONT_BODY, fontSize: 14, fontWeight: 600 }}>← Formación</button>
      <Reproductor leccion={leccion} onProgreso={(f) => { if (f >= UMBRAL_VISTA) progreso.marcarVista(leccion.id); }} />
      <section style={tarjeta}>
        <div style={eyebrow}>Curso {curso.numero} · {curso.titulo}</div>
        <h1 style={{ ...titulo(28), margin: '10px 0 6px' }}>{leccion.titulo}</h1>
        <p style={{ ...parrafo, fontSize: 14 }}>{formatoDuracion(leccion.duracion)}</p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginTop: 18 }}>
          {anterior && (
            <button type="button" onClick={() => ir(anterior.id)} style={botonSobreClaro}>← Anterior</button>
          )}
          {siguiente ? (
            <button type="button" onClick={avanzar} style={botonPrimario}>
              {vista ? 'Siguiente módulo' : 'Marcar como vista y seguir'} <IconoFlecha width={18} height={18} />
            </button>
          ) : (
            <button type="button" onClick={() => { if (!vista) progreso.marcarVista(leccion.id); }} style={vista ? botonContorno : botonPrimario}>
              {vista ? 'Completada ✓' : 'Marcar como vista'}
            </button>
          )}
        </div>
      </section>
    </div>
  );
}

function VistaCurso({ curso, progreso, volver, irALeccion }) {
  const p = progresoCurso(curso, progreso.vistas);
  const sig = curso.lecciones.find((l) => !progreso.vistas[l.id]) ?? curso.lecciones[0];

  return (
    <div style={{ maxWidth: 680, margin: '0 auto' }}>
      <button type="button" onClick={volver} style={{ alignSelf: 'flex-start', background: 'none', border: 'none', padding: 0, cursor: 'pointer', color: NAVY, fontFamily: FONT_BODY, fontSize: 14, fontWeight: 600, marginBottom: 14 }}>← Formación</button>
      <div style={eyebrow}>Curso {curso.numero}</div>
      <h1 style={{ ...titulo(30), margin: '8px 0 6px' }}>{curso.titulo}</h1>
      <p style={{ ...parrafo, marginBottom: 20 }}>{curso.lecciones.length} módulos · {formatoDuracion(duracionCurso(curso))}</p>

      <section style={{ ...tarjeta, display: 'flex', alignItems: 'center', gap: 18, marginBottom: 18 }} aria-label="Progreso">
        <Anillo valor={p.porcentaje} />
        <div>
          <div style={{ fontFamily: FONT_SLAB, fontSize: 20, fontWeight: 700, color: NAVY }}>{p.hechas} de {p.total} vistas</div>
          <div style={{ fontFamily: FONT_BODY, fontSize: 13, color: MUTED, marginTop: 2 }}>
            {p.completo ? 'Curso completado' : 'En progreso'}
          </div>
        </div>
      </section>

      {sig && (
        <section style={{ background: heroFondo, color: PAPER, borderRadius: 0, padding: 18, marginBottom: 18, boxShadow: '0 8px 24px rgba(15,29,56,0.22)' }}>
          <div style={{ ...eyebrow, color: GOLD_REF_LT, marginBottom: 8 }}>
            {p.hechas > 0 ? 'Continúa donde lo dejaste' : 'Empieza aquí'}
          </div>
          <button type="button" onClick={() => irALeccion(sig.id)} style={{
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
              <div style={{ fontFamily: FONT_SLAB, fontSize: 19, fontWeight: 600, lineHeight: 1.2 }}>{sig.titulo}</div>
              <div style={{ fontFamily: FONT_BODY, fontSize: 12, opacity: 0.72, marginTop: 4 }}>{formatoDuracion(sig.duracion)}</div>
            </div>
          </button>
        </section>
      )}

      <div style={{ ...tarjeta, padding: 0, overflow: 'hidden' }}>
        <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
          {curso.lecciones.map((l, idx) => {
            const vista = Boolean(progreso.vistas[l.id]);
            return (
              <li key={l.id} style={{ borderBottom: idx < curso.lecciones.length - 1 ? `1px solid ${LINE}` : 'none' }}>
                <button type="button" onClick={() => irALeccion(l.id)} style={{
                  all: 'unset', boxSizing: 'border-box', width: '100%', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', gap: 12, padding: '14px 18px',
                }}>
                  <span style={{
                    flex: '0 0 28px', height: 28, borderRadius: '50%', display: 'grid', placeItems: 'center',
                    border: vista ? 'none' : `1.5px solid ${LINE}`,
                    background: vista ? GOLD_REF : 'transparent', color: vista ? '#fff' : NAVY,
                    fontFamily: FONT_SLAB, fontSize: 13, fontWeight: 700,
                  }}>
                    {vista ? <IconoCheck width={14} height={14} /> : idx + 1}
                  </span>
                  <span style={{ flex: 1, minWidth: 0, fontFamily: FONT_BODY, fontSize: 14.5, color: NAVY, fontWeight: vista ? 400 : 500 }}>
                    {l.titulo}
                  </span>
                  <span style={{ fontFamily: FONT_BODY, fontSize: 12, color: MUTED }}>{formatoDuracion(l.duracion)}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}

function Portada({ src, alt = '', alto = 260, pos = 'center', brillo = false, escala }) {
  return (
    <div style={{ width: '100%', height: alto, overflow: 'hidden', position: 'relative' }}>
      <img src={src} alt={alt} loading="lazy" style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: pos, display: 'block', filter: brillo ? `brightness(${typeof brillo === 'number' ? brillo : 1.25})` : 'none', transform: escala ? `scale(${escala})` : undefined, transformOrigin: escala ? pos : undefined }} />
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, transparent 40%, rgba(15,29,56,0.45) 100%)' }} />
    </div>
  );
}

function CursoCard({ curso, vistas, abrirCurso, portadas, brillo, posiciones, escalas, noBrillo, brilloMap }) {
  const p = progresoCurso(curso, vistas);
  const imgs = portadas || PORTADAS;
  const img = imgs[curso.numero] ?? img01;
  const posMap = posiciones || PORTADA_POS;
  const pos = posMap[curso.numero];
  const esc = escalas?.[curso.numero];
  const customBrillo = brilloMap?.[curso.numero];
  const useBrillo = customBrillo ?? (brillo && !noBrillo?.has(curso.numero));
  return (
    <section style={{ ...tarjeta, padding: 0, overflow: 'hidden' }}>
      <button type="button" onClick={() => abrirCurso(curso.id)} style={{ all: 'unset', boxSizing: 'border-box', width: '100%', cursor: 'pointer', display: 'block' }}>
        <Portada src={img} pos={pos} brillo={useBrillo} escala={esc} />
        <div style={{ padding: '16px 20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <span style={{
              flex: '0 0 36px', height: 36, borderRadius: '50%', display: 'grid', placeItems: 'center',
              background: p.completo ? GOLD_REF : 'rgba(27,42,74,0.08)', color: NAVY, fontFamily: FONT_SLAB, fontSize: 17, fontWeight: 700,
            }}>
              {p.completo ? <IconoCheck width={18} height={18} /> : curso.numero}
            </span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontFamily: FONT_SLAB, fontSize: 19, fontWeight: 700, color: NAVY, lineHeight: 1.2 }}>{curso.titulo}</div>
              <div style={{ fontFamily: FONT_BODY, fontSize: 12.5, color: MUTED, marginTop: 3 }}>{curso.lecciones.length} módulos · {formatoDuracion(duracionCurso(curso))}</div>
            </div>
            <IconoFlecha style={{ color: MUTED, flex: '0 0 24px' }} />
          </div>
          <div style={{ ...barraFondo, marginTop: 14 }} aria-hidden><div style={{ width: `${p.porcentaje}%`, height: '100%', background: GOLD_REF_DK, borderRadius: 0, transition: 'width 500ms ease' }} /></div>
          <div style={{ fontFamily: FONT_BODY, fontSize: 12, color: MUTED, marginTop: 6 }}>{p.hechas} de {p.total} vistas</div>
        </div>
      </button>
    </section>
  );
}

function CtaFormacion({ prog }) {
  const completo = prog.completo;
  const empezado = prog.hechos > 0;
  const ctaTitulo = completo ? '¡Curso 1 completado!' : empezado ? 'Continúa donde lo dejaste' : 'Comienza tu formación';
  const ctaTexto = completo
    ? 'Has completado el Curso 1. Continúa con el siguiente curso de la formación.'
    : empezado
      ? `Llevas ${prog.hechos} de ${prog.total} módulos completados. ¡Sigue avanzando!`
      : 'Descubre tu temperamento, trabaja tus virtudes y construye tu carácter.';
  const ctaBoton = completo ? 'Siguiente curso' : empezado ? 'Continuar' : 'Empezar ahora';

  return (
    <Link to="/app/formacion/curso-1" style={{ textDecoration: 'none', display: 'flex', flexDirection: 'column', justifyContent: 'center', flex: 1, minWidth: 0 }}>
      <section style={{ background: heroFondo, borderRadius: 0, padding: '28px 24px 26px', display: 'flex', flexDirection: 'column', gap: 12, height: '100%', boxSizing: 'border-box', justifyContent: 'center', position: 'relative', overflow: 'hidden' }}>
        <span aria-hidden style={{ position: 'absolute', top: 0, left: 24, width: 56, height: 3, background: GOLD_REF }} />
        <div style={{ fontFamily: FONT_BODY, fontSize: 14, fontWeight: 600, letterSpacing: '0.16em', textTransform: 'uppercase', color: GOLD_REF_LT }}>Curso 1</div>
        <div style={{ fontFamily: FONT_SLAB, fontSize: 26, fontWeight: 600, color: PAPER, lineHeight: 1.22 }}>{ctaTitulo}</div>
        <div style={{ fontFamily: FONT_BODY, fontSize: 14.5, color: 'rgba(255,255,255,0.80)', lineHeight: 1.5 }}>{ctaTexto}</div>
        {!completo && empezado && (
          <div style={{ background: 'rgba(255,255,255,0.15)', borderRadius: 0, height: 6, marginTop: 2 }}>
            <div style={{ width: `${prog.porcentaje}%`, height: '100%', background: GOLD_REF, borderRadius: 0, transition: 'width 500ms ease' }} />
          </div>
        )}
        <span style={{ alignSelf: 'flex-start', marginTop: 4, fontFamily: FONT_BODY, fontSize: 16, fontWeight: 600, color: PAPER, background: GOLD_REF, padding: '16px 28px', borderRadius: 0, display: 'inline-flex', alignItems: 'center', gap: 9 }}>
          {ctaBoton} →
        </span>
      </section>
    </Link>
  );
}

function Modulo1Card({ userId, m1Prog, portadas, brillo, posiciones, escalas }) {
  const pasos = pasosDelUsuario(moduloData, null);
  const videos = pasos.filter((p) => p.tipo === 'video');
  const videosHechos = videos.filter((v) => m1Prog[v.id]).length;
  const videosPct = videos.length ? Math.round((videosHechos / videos.length) * 100) : 0;
  const prog = { hechos: videosHechos, total: videos.length, porcentaje: videosPct, completo: videosHechos === videos.length };
  const imgs = portadas || PORTADAS;
  const img = imgs[1] ?? img01;
  const posMap = posiciones || PORTADA_POS;
  const pos = posMap[1];
  const esc = escalas?.[1];

  return (
    <section style={{ ...tarjeta, padding: 0, overflow: 'hidden', flex: 1, minWidth: 0 }}>
      <Link to="/app/formacion/curso-1" style={{ textDecoration: 'none', display: 'block', cursor: 'pointer' }}>
        <Portada src={img} pos={pos} brillo={brillo} escala={esc} />
        <div style={{ padding: '16px 20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <span style={{
              flex: '0 0 36px', height: 36, borderRadius: '50%', display: 'grid', placeItems: 'center',
              background: prog.completo ? GOLD_REF : 'rgba(27,42,74,0.08)', color: NAVY, fontFamily: FONT_SLAB, fontSize: 17, fontWeight: 700,
            }}>
              {prog.completo ? <IconoCheck width={18} height={18} /> : '1'}
            </span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontFamily: FONT_SLAB, fontSize: 19, fontWeight: 700, color: NAVY, lineHeight: 1.2 }}>Del temperamento al carácter</div>
              <div style={{ fontFamily: FONT_BODY, fontSize: 12.5, color: MUTED, marginTop: 3 }}>{prog.hechos} de {prog.total} módulos</div>
            </div>
            <IconoFlecha style={{ color: MUTED, flex: '0 0 24px' }} />
          </div>
          <div style={{ ...barraFondo, marginTop: 14 }} aria-hidden><div style={{ width: `${prog.porcentaje}%`, height: '100%', background: GOLD_REF_DK, borderRadius: 0, transition: 'width 500ms ease' }} /></div>
        </div>
      </Link>
    </section>
  );
}

function Listado({ cursos: todosLosCursos, progreso, abrirCurso, userId }) {
  const cursos = todosLosCursos.filter((c) => c.numero !== 1);
  const m1Prog = leerModulo1Progreso(userId);

  const m1Pasos = pasosDelUsuario(moduloData, null);
  const m1Videos = m1Pasos.filter((p) => p.tipo === 'video');
  const m1VideosHechos = m1Videos.filter((p) => m1Prog[p.id]).length;

  const m1VideosPct = m1Videos.length ? Math.round((m1VideosHechos / m1Videos.length) * 100) : 0;
  const m1ProgVid = { hechos: m1VideosHechos, total: m1Videos.length, porcentaje: m1VideosPct, completo: m1VideosHechos === m1Videos.length };

  const resumenCursos = resumenGlobal(cursos, progreso.vistas);
  const totalLecciones = resumenCursos.total + m1Videos.length;
  const hechasLecciones = resumenCursos.hechas + m1VideosHechos;
  const porcentaje = totalLecciones ? Math.round((hechasLecciones / totalLecciones) * 100) : 0;

  const siguiente = continuar(cursos, progreso.vistas, progreso.ultima);

  return (
    <div className="vl-cols vl-cols-3">
      <div className="vl-ancho">
        <div style={eyebrow}>Formación</div>
        <h1 style={{ ...titulo(32), margin: '8px 0 4px' }}>Virtuous Leadership</h1>
        <p style={{ ...parrafo, color: MUTED }}>Los cursos de Alexandre Havard, a tu ritmo.</p>
      </div>

      <section className="vl-ancho" style={{ ...tarjeta, display: 'flex', alignItems: 'center', gap: 18 }} aria-label="Tu progreso">
        <Anillo valor={porcentaje} />
        <div>
          <div style={{ fontFamily: FONT_SLAB, fontSize: 24, fontWeight: 700, color: NAVY, lineHeight: 1.15 }}>{hechasLecciones} de {totalLecciones} módulos</div>
          <div style={{ ...parrafo, fontSize: 14, marginTop: 4 }}>{formatoDuracion(resumenCursos.segundosVistos)} vistas de {formatoDuracion(resumenCursos.segundosTotal)}</div>
        </div>
      </section>

      <div className="vl-ancho" style={{ background: '#b8c8d9', padding: '10px 16px', borderRadius: 6, fontFamily: FONT_SLAB, fontSize: 18, fontWeight: 700, color: NAVY }}>Opción B — Cuadros</div>
      <div className="vl-ancho" style={{ display: 'flex', gap: 16, alignItems: 'stretch' }}>
        <CtaFormacion prog={m1ProgVid} />
        <Modulo1Card userId={userId} m1Prog={m1Prog} portadas={PORTADAS_B} brillo posiciones={PORTADA_POS_B} escalas={PORTADA_ESCALA_B} />
      </div>
      {cursos.map((c) => (
        <CursoCard key={`b-${c.id}`} curso={c} vistas={progreso.vistas}
                   abrirCurso={abrirCurso} portadas={PORTADAS_B} brillo posiciones={PORTADA_POS_B} escalas={PORTADA_ESCALA_B} noBrillo={PORTADA_NOBRILLO_B} brilloMap={PORTADA_BRILLO_B} />
      ))}

      <div className="vl-ancho" style={{ background: '#e8d9b8', padding: '10px 16px', borderRadius: 6, fontFamily: FONT_SLAB, fontSize: 18, fontWeight: 700, color: NAVY }}>Opción A — Esculturas</div>
      <div className="vl-ancho" style={{ display: 'flex', gap: 16, alignItems: 'stretch' }}>
        <CtaFormacion prog={m1ProgVid} />
        <Modulo1Card userId={userId} m1Prog={m1Prog} />
      </div>
      {cursos.map((c) => (
        <CursoCard key={`a-${c.id}`} curso={c} vistas={progreso.vistas}
                   abrirCurso={abrirCurso} portadas={PORTADAS_A} />
      ))}
    </div>
  );
}

export default function Formacion() {
  const { user } = useOutletContext();
  const cat = useCatalogo();
  const progreso = useProgreso(user.id);
  const [params, setParams] = useSearchParams();
  const idLeccion = params.get('leccion');
  const idCurso = params.get('curso');
  const abrirLeccion = (id) => setParams({ leccion: id });
  const abrirCurso = (id) => setParams({ curso: id });
  const volver = () => setParams({});
  const volverACurso = (cursoId) => setParams({ curso: cursoId });

  if (cat.cargando) {
    return <section style={tarjeta}><div style={eyebrow}>Formación</div><p style={{ ...parrafo, marginTop: 10 }}>Cargando tu formación…</p></section>;
  }
  if (cat.error) {
    return (
      <section style={tarjeta}>
        <div style={eyebrow}>Formación</div>
        <h1 style={{ ...titulo(26), margin: '10px 0 8px' }}>No he podido cargar la formación</h1>
        <p style={{ ...parrafo, marginBottom: 16 }}>Inténtalo de nuevo en unos minutos.{cat.error?.detalle ? ` [${cat.error.detalle}]` : ''}</p>
        <button type="button" style={botonSobreClaro} onClick={cat.reintentar}>Reintentar</button>
      </section>
    );
  }
  const encontrada = idLeccion ? buscarLeccion(cat.cursos, idLeccion) : null;
  if (encontrada) return <VistaLeccion cursos={cat.cursos} encontrada={encontrada} progreso={progreso} volver={() => volverACurso(encontrada.curso.id)} ir={abrirLeccion} />;
  if (idCurso) {
    const curso = cat.cursos.find((c) => c.id === idCurso);
    if (curso) return <VistaCurso curso={curso} progreso={progreso} volver={volver} irALeccion={abrirLeccion} />;
  }
  return <Listado cursos={cat.cursos} progreso={progreso} abrirCurso={abrirCurso} userId={user.id} />;
}
