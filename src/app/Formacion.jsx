// Pestaña «Formación»: los cursos en vídeo de Alexandre Havard y tu progreso en ellos.
// El catálogo lo sirve el servidor (solo con suscripción activa). El progreso, de momento, se guarda
// solo en este navegador (ver useFormacion.js).
import { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  UMBRAL_VISTA, buscarLeccion, continuar, duracionCurso, formatoDuracion, progresoCurso, resumenGlobal, urlVimeo,
} from '../lib/formacion.js';
import { GOLD, GOLD_DEEP, GOLD_SOFT, INK, LINE, MUTED, NAVY, PAPER, FONT_SANS, FONT_SERIF } from '../theme';
import { barraFondo, botonContorno, botonPrimario, botonSobreClaro, eyebrow, heroFondo, parrafo, tarjeta, titulo } from './estilos';
import { IconoCheck, IconoChevron, IconoFlecha, IconoPlay } from './Iconos';
import { useCatalogo, useProgreso } from './useFormacion';

function Anillo({ valor, tam = 84 }) {
  const r = (tam - 10) / 2;
  const c = 2 * Math.PI * r;
  return (
    <svg width={tam} height={tam} viewBox={`0 0 ${tam} ${tam}`} role="img" aria-label={`${valor} % completado`}>
      <circle cx={tam / 2} cy={tam / 2} r={r} fill="none" stroke="rgba(27,42,74,0.10)" strokeWidth="5" />
      <circle cx={tam / 2} cy={tam / 2} r={r} fill="none" stroke={GOLD_DEEP} strokeWidth="5" strokeLinecap="round"
              strokeDasharray={`${(c * valor) / 100} ${c}`} transform={`rotate(-90 ${tam / 2} ${tam / 2})`} style={{ transition: 'stroke-dasharray 600ms ease' }} />
      <text x="50%" y="50%" textAnchor="middle" dominantBaseline="central" fontFamily={FONT_SERIF} fontSize="22" fontWeight="700" fill={NAVY}>{valor}%</text>
    </svg>
  );
}

function Miniatura({ leccion, ancho = 132 }) {
  return (
    <div style={{ position: 'relative', flex: `0 0 ${ancho}px`, aspectRatio: '16 / 9', borderRadius: 12, overflow: 'hidden', background: 'rgba(27,42,74,0.14)' }}>
      {leccion.miniatura && <img src={leccion.miniatura} alt="" loading="lazy" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />}
      <span style={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center', color: PAPER, background: 'rgba(15,29,56,0.28)' }}><IconoPlay width={26} height={26} /></span>
    </div>
  );
}

// Reproductor de Vimeo. Avisa del progreso por el canal de mensajes del propio reproductor
// (sin librerías): al llegar al 90 % la lección se da por vista.
function Reproductor({ leccion, onProgreso }) {
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
    <div style={{ position: 'relative', width: '100%', aspectRatio: '16 / 9', borderRadius: 18, overflow: 'hidden', background: NAVY, boxShadow: '0 18px 40px rgba(15,29,56,0.28)' }}>
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

  return (
    <div className="vl-leccion" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <style>{`@media (min-width: 1100px) { .vl-leccion { display: grid !important; grid-template-columns: minmax(0, 2.2fr) minmax(300px, 1fr); gap: 24px !important; align-items: start; } .vl-leccion > button { grid-column: 1 / -1; } }`}</style>
      <button type="button" onClick={volver} style={{ alignSelf: 'flex-start', background: 'none', border: 'none', padding: 0, cursor: 'pointer', color: NAVY, fontFamily: FONT_SANS, fontSize: 14, fontWeight: 600 }}>← Formación</button>
      <Reproductor leccion={leccion} onProgreso={(f) => { if (f >= UMBRAL_VISTA) progreso.marcarVista(leccion.id); }} />
      <section style={tarjeta}>
        <div style={eyebrow}>Curso {curso.numero} · {curso.titulo}</div>
        <h1 style={{ ...titulo(28), margin: '10px 0 6px' }}>{leccion.titulo}</h1>
        <p style={{ ...parrafo, fontSize: 14 }}>{formatoDuracion(leccion.duracion)}</p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginTop: 18 }}>
          <button type="button" onClick={() => (vista ? progreso.desmarcar(leccion.id) : progreso.marcarVista(leccion.id))}
                  style={vista ? { ...botonContorno } : botonSobreClaro} aria-pressed={vista}>
            <IconoCheck width={18} height={18} /> {vista ? 'Vista · quitar' : 'Marcar como vista'}
          </button>
          {siguiente && (
            <button type="button" onClick={() => ir(siguiente.id)} style={botonPrimario}>Siguiente lección <IconoFlecha width={18} height={18} /></button>
          )}
        </div>
        {!siguiente && <p style={{ ...parrafo, marginTop: 14, fontSize: 14 }}>Es la última lección de la formación.</p>}
      </section>
    </div>
  );
}

function Curso({ curso, vistas, abierto, alternar, abrirLeccion }) {
  const p = progresoCurso(curso, vistas);
  return (
    <section style={{ ...tarjeta, padding: 0, overflow: 'hidden' }}>
      <button type="button" onClick={alternar} aria-expanded={abierto} style={{ all: 'unset', boxSizing: 'border-box', width: '100%', cursor: 'pointer', display: 'block', padding: '18px 20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <span style={{ flex: '0 0 40px', height: 40, borderRadius: '50%', display: 'grid', placeItems: 'center', background: p.completo ? GOLD : 'rgba(27,42,74,0.08)', color: p.completo ? NAVY : NAVY, fontFamily: FONT_SERIF, fontSize: 20, fontWeight: 700 }}>
            {p.completo ? <IconoCheck width={20} height={20} /> : curso.numero}
          </span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontFamily: FONT_SERIF, fontSize: 21, fontWeight: 700, color: NAVY, lineHeight: 1.2 }}>{curso.titulo}</div>
            <div style={{ fontFamily: FONT_SANS, fontSize: 12.5, color: MUTED, marginTop: 3 }}>{curso.lecciones.length} lecciones · {formatoDuracion(duracionCurso(curso))}</div>
          </div>
          <IconoChevron style={{ color: MUTED, transition: 'transform 200ms ease', transform: abierto ? 'rotate(180deg)' : 'none', flex: '0 0 24px' }} />
        </div>
        <div style={{ ...barraFondo, marginTop: 14 }} aria-hidden><div style={{ width: `${p.porcentaje}%`, height: '100%', background: GOLD_DEEP, borderRadius: 999, transition: 'width 500ms ease' }} /></div>
        <div style={{ fontFamily: FONT_SANS, fontSize: 12, color: MUTED, marginTop: 6 }}>{p.hechas} de {p.total} vistas</div>
      </button>
      {abierto && (
        <ul style={{ listStyle: 'none', margin: 0, padding: '0 8px 10px', borderTop: `1px solid ${LINE}` }}>
          {curso.lecciones.map((l) => {
            const vista = Boolean(vistas[l.id]);
            return (
              <li key={l.id}>
                <button type="button" onClick={() => abrirLeccion(l.id)} style={{ all: 'unset', boxSizing: 'border-box', width: '100%', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 12, padding: '11px 12px', borderRadius: 12 }}>
                  <span aria-hidden style={{ flex: '0 0 24px', height: 24, borderRadius: '50%', display: 'grid', placeItems: 'center', border: vista ? 'none' : `1.5px solid ${LINE}`, background: vista ? GOLD : 'transparent', color: NAVY }}>
                    {vista && <IconoCheck width={14} height={14} />}
                  </span>
                  <span style={{ flex: 1, minWidth: 0, fontFamily: FONT_SANS, fontSize: 14.5, color: INK, fontWeight: vista ? 400 : 500 }}>{l.titulo}</span>
                  <span style={{ fontFamily: FONT_SANS, fontSize: 12, color: MUTED }}>{formatoDuracion(l.duracion)}</span>
                  <span className="vl-sr" style={{ position: 'absolute', width: 1, height: 1, overflow: 'hidden', clip: 'rect(0 0 0 0)' }}>{vista ? 'vista' : 'sin ver'}</span>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}

function Listado({ cursos, progreso, abrirLeccion }) {
  const resumen = resumenGlobal(cursos, progreso.vistas);
  const siguiente = continuar(cursos, progreso.vistas, progreso.ultima);
  const [abiertos, setAbiertos] = useState(() => (siguiente ? { [siguiente.curso.id]: true } : {}));

  return (
    <div className="vl-cols vl-cols-3">
      <div className="vl-ancho">
        <div style={eyebrow}>Formación</div>
        <h1 style={{ ...titulo(32), margin: '8px 0 4px' }}>Virtuous Leadership</h1>
        <p style={{ ...parrafo, color: MUTED }}>Los cursos de Alexandre Havard, a tu ritmo.</p>
      </div>

      <section className="vl-ancho" style={{ ...tarjeta, display: 'flex', alignItems: 'center', gap: 18 }} aria-label="Tu progreso">
        <Anillo valor={resumen.porcentaje} />
        <div>
          <div style={{ fontFamily: FONT_SERIF, fontSize: 24, fontWeight: 700, color: NAVY, lineHeight: 1.15 }}>{resumen.hechas} de {resumen.total} lecciones</div>
          <div style={{ ...parrafo, fontSize: 14, marginTop: 4 }}>{formatoDuracion(resumen.segundosVistos)} vistas de {formatoDuracion(resumen.segundosTotal)}</div>
        </div>
      </section>

      {siguiente && (
        <section className="vl-ancho" style={{ background: heroFondo, color: PAPER, borderRadius: 22, padding: 18, boxShadow: '0 18px 40px rgba(15,29,56,0.26)' }}>
          <div style={{ ...eyebrow, color: GOLD_SOFT, padding: '4px 6px 12px' }}>{siguiente.retomada ? 'Continúa donde lo dejaste' : resumen.hechas ? 'Siguiente lección' : 'Empieza aquí'}</div>
          <button type="button" onClick={() => abrirLeccion(siguiente.leccion.id)} style={{ all: 'unset', boxSizing: 'border-box', width: '100%', cursor: 'pointer', display: 'flex', gap: 14, alignItems: 'center' }}>
            <Miniatura leccion={siguiente.leccion} />
            <div style={{ minWidth: 0 }}>
              <div style={{ fontFamily: FONT_SANS, fontSize: 12, opacity: 0.72, marginBottom: 3 }}>Curso {siguiente.curso.numero} · {siguiente.curso.titulo}</div>
              <div style={{ fontFamily: FONT_SERIF, fontSize: 21, fontWeight: 600, lineHeight: 1.2 }}>{siguiente.leccion.titulo}</div>
              <div style={{ fontFamily: FONT_SANS, fontSize: 12.5, opacity: 0.72, marginTop: 6 }}>{formatoDuracion(siguiente.leccion.duracion)}</div>
            </div>
          </button>
        </section>
      )}

      {cursos.map((c) => (
        <Curso key={c.id} curso={c} vistas={progreso.vistas} abierto={Boolean(abiertos[c.id])}
               alternar={() => setAbiertos((a) => ({ ...a, [c.id]: !a[c.id] }))} abrirLeccion={abrirLeccion} />
      ))}

      <p className="vl-ancho" style={{ ...parrafo, fontSize: 12.5, textAlign: 'center' }}>Tu progreso se guarda en este navegador.</p>
    </div>
  );
}

export default function Formacion({ user }) {
  const cat = useCatalogo();
  const progreso = useProgreso(user.id);
  const [params, setParams] = useSearchParams();
  const idLeccion = params.get('leccion');
  const abrirLeccion = (id) => setParams({ leccion: id });
  const volver = () => setParams({});

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
  if (encontrada) return <VistaLeccion cursos={cat.cursos} encontrada={encontrada} progreso={progreso} volver={volver} ir={abrirLeccion} />;
  return <Listado cursos={cat.cursos} progreso={progreso} abrirLeccion={abrirLeccion} />;
}

