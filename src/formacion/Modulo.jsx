import { useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import moduloData from '../data/modulo1.json';
import { pasosDelUsuario, pasosVisibles, progresoModulo, continuarModulo, siguientePaso, leccionDelPaso } from './flujoModulo';
import { useModuloProgreso } from './useModulo';
import { Reproductor } from './Formacion';
import { Quiz, Define, Desliza, Identifica, TestProfundo, Sintesis } from './Actividad';
import { fetchLatestTemperament } from '../account/account';
import { NAVY, MUTED, PAPER, LINE, GOLD_REF, GOLD_REF_DK, GOLD_REF_LT, FONT_SLAB, FONT_BODY, TEMP_COLORS, BEIGE } from '../theme';
import { barraFondo, botonPrimario, botonSobreClaro, eyebrow, heroFondo, parrafo, tarjeta, titulo } from '../app/estilos';
import { IconoCheck, IconoFlecha, IconoPlay, IconoChevron } from '../app/Iconos';
import { UMBRAL_VISTA } from './cursos';

const TEMP_NOMBRE = { COL: 'Colérico', MEL: 'Melancólico', SAN: 'Sanguíneo', FLE: 'Flemático' };

function mapTemp(result) {
  if (!result) return null;
  const p = result.primario;
  const s = result.secundario ?? null;
  if (!TEMP_COLORS[p]) return null;
  return { primary: p, secondary: s };
}

function PasoVideo({ paso, pasos, progreso, avanzar }) {
  const completado = Boolean(progreso.completados[paso.id]);
  const lec = leccionDelPaso(pasos, paso.id);

  function onProgreso(frac) {
    if (frac >= UMBRAL_VISTA && !completado) {
      progreso.completar(paso.id);
    }
  }

  return (
    <div style={{ maxWidth: 800, margin: '0 auto' }}>
      <div style={eyebrow}>
        {lec ? `Lección ${lec.numero} de ${lec.total}` : 'Vídeo'}
      </div>
      <h2 style={{ ...titulo(26), margin: '8px 0 16px' }}>{paso.titulo}</h2>
      <Reproductor leccion={{ id: paso.id, vimeoId: paso.vimeoId, titulo: paso.titulo }} onProgreso={onProgreso} />
      <div style={{ marginTop: 18, display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
        {!completado && (
          <button type="button" onClick={() => { progreso.completar(paso.id); }} style={botonSobreClaro}>
            <IconoCheck width={16} height={16} /> Marcar como visto
          </button>
        )}
        <button type="button" onClick={avanzar} style={botonPrimario}>
          Siguiente <IconoFlecha width={16} height={16} />
        </button>
      </div>
    </div>
  );
}

function PasoActividad({ paso, pasos, temperamento, progreso, avanzar }) {
  function completar(resultado) {
    progreso.completar(paso.id, resultado);
    avanzar();
  }

  switch (paso.tipo) {
    case 'quiz': return <Quiz paso={paso} onComplete={completar} />;
    case 'define': return <Define paso={paso} onComplete={completar} />;
    case 'desliza': return <Desliza paso={paso} onComplete={completar} />;
    case 'identifica': return <Identifica paso={paso} onComplete={completar} />;
    case 'test_profundo': return <TestProfundo paso={paso} onComplete={completar} />;
    case 'cierre': return <Sintesis paso={paso} temperamento={temperamento} onComplete={completar} />;
    default: return <p>Tipo desconocido: {paso.tipo}</p>;
  }
}

function ListaLecciones({ visibles, completados, irA }) {
  return (
    <div style={{ ...tarjeta, padding: 0, overflow: 'hidden' }}>
      <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
        {visibles.map((p, i) => {
          const hecho = Boolean(completados[p.id]);
          return (
            <li key={p.id} style={{ borderBottom: i < visibles.length - 1 ? `1px solid ${LINE}` : 'none' }}>
              <button type="button" onClick={() => irA(p.id)} style={{
                all: 'unset', boxSizing: 'border-box', width: '100%', cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: 12, padding: '14px 18px',
              }}>
                <span style={{
                  flex: '0 0 28px', height: 28, borderRadius: '50%', display: 'grid', placeItems: 'center',
                  border: hecho ? 'none' : `1.5px solid ${LINE}`,
                  background: hecho ? GOLD_REF : 'transparent', color: hecho ? '#fff' : NAVY,
                  fontFamily: FONT_SLAB, fontSize: 13, fontWeight: 700,
                }}>
                  {hecho ? <IconoCheck width={14} height={14} /> : i + 1}
                </span>
                <span style={{ flex: 1, minWidth: 0, fontFamily: FONT_BODY, fontSize: 14.5, color: NAVY, fontWeight: hecho ? 400 : 500 }}>
                  {p.titulo}
                </span>
                {p.tipo === 'video' && <IconoPlay width={16} height={16} style={{ color: MUTED, flex: '0 0 16px' }} />}
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function VistaListado({ modulo, pasos, visibles, completados, temperamento, irA }) {
  const prog = progresoModulo(pasos, completados);
  const cont = continuarModulo(pasos, completados);

  return (
    <div style={{ maxWidth: 680, margin: '0 auto' }}>
      <div style={eyebrow}>Módulo 1</div>
      <h1 style={{ ...titulo(30), margin: '8px 0 6px' }}>{modulo.titulo}</h1>
      <p style={{ ...parrafo, marginBottom: 20 }}>{modulo.descripcion}</p>

      {temperamento && (
        <div style={{ display: 'flex', gap: 10, marginBottom: 18 }}>
          <div style={{ padding: '8px 14px', background: BEIGE, borderLeft: `3px solid ${TEMP_COLORS[temperamento.primary] ?? LINE}`, fontFamily: FONT_BODY, fontSize: 13, color: NAVY }}>
            <strong>{TEMP_NOMBRE[temperamento.primary]}</strong> <span style={{ color: MUTED }}>primario</span>
          </div>
          {temperamento.secondary && (
            <div style={{ padding: '8px 14px', background: BEIGE, borderLeft: `3px solid ${TEMP_COLORS[temperamento.secondary] ?? LINE}`, fontFamily: FONT_BODY, fontSize: 13, color: NAVY }}>
              <strong>{TEMP_NOMBRE[temperamento.secondary]}</strong> <span style={{ color: MUTED }}>secundario</span>
            </div>
          )}
        </div>
      )}

      <section style={{ ...tarjeta, display: 'flex', alignItems: 'center', gap: 18, marginBottom: 18 }} aria-label="Progreso">
        <div style={{ flex: '0 0 auto' }}>
          <svg width={72} height={72} viewBox="0 0 72 72" role="img" aria-label={`${prog.porcentaje}% completado`}>
            <circle cx={36} cy={36} r={28} fill="none" stroke="rgba(27,42,74,0.10)" strokeWidth="5" />
            <circle cx={36} cy={36} r={28} fill="none" stroke={GOLD_REF_DK} strokeWidth="5" strokeLinecap="round"
                    strokeDasharray={`${(2 * Math.PI * 28 * prog.porcentaje) / 100} ${2 * Math.PI * 28}`}
                    transform="rotate(-90 36 36)" style={{ transition: 'stroke-dasharray 600ms ease' }} />
            <text x="50%" y="50%" textAnchor="middle" dominantBaseline="central" fontFamily={FONT_SLAB} fontSize="18" fontWeight="700" fill={NAVY}>{prog.porcentaje}%</text>
          </svg>
        </div>
        <div>
          <div style={{ fontFamily: FONT_SLAB, fontSize: 20, fontWeight: 700, color: NAVY }}>{prog.hechos} de {prog.total} pasos</div>
          <div style={{ fontFamily: FONT_BODY, fontSize: 13, color: MUTED, marginTop: 2 }}>
            {prog.completo ? 'Módulo completado' : 'En progreso'}
          </div>
        </div>
      </section>

      {cont && (
        <section style={{ background: heroFondo, color: PAPER, borderRadius: 0, padding: 18, marginBottom: 18, boxShadow: '0 8px 24px rgba(15,29,56,0.22)' }}>
          <div style={{ ...eyebrow, color: GOLD_REF_LT, marginBottom: 8 }}>
            {prog.hechos > 0 ? 'Continúa donde lo dejaste' : 'Empieza aquí'}
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
              <div style={{ fontFamily: FONT_BODY, fontSize: 12, opacity: 0.72, marginTop: 4 }}>{cont.tipo === 'video' ? 'Vídeo' : 'Actividad'}</div>
            </div>
          </button>
        </section>
      )}

      <ListaLecciones visibles={visibles} completados={completados} irA={irA} />
    </div>
  );
}

export default function Modulo() {
  const { user } = useOutletContext();
  const progreso = useModuloProgreso(user.id, moduloData.id);
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
    progreso.irA(pasoId);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function avanzar() {
    if (!pasoActual) return;
    const sig = siguientePaso(pasos, pasoActual.id);
    if (sig) {
      irA(sig.id);
    } else {
      progreso.irA(null);
    }
  }

  function volver() {
    progreso.irA(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  if (temp === undefined) {
    return (
      <section style={tarjeta}>
        <div style={eyebrow}>Módulo 1</div>
        <p style={{ ...parrafo, marginTop: 10 }}>Cargando…</p>
      </section>
    );
  }

  if (pasoActual) {
    return (
      <div style={{ maxWidth: 800, margin: '0 auto' }}>
        <button type="button" onClick={volver} style={{
          background: 'none', border: 'none', padding: 0, cursor: 'pointer',
          color: NAVY, fontFamily: FONT_BODY, fontSize: 14, fontWeight: 600, marginBottom: 14,
        }}>
          ← Módulo 1
        </button>
        {pasoActual.tipo === 'video'
          ? <PasoVideo paso={pasoActual} pasos={pasos} progreso={progreso} avanzar={avanzar} />
          : <PasoActividad paso={pasoActual} pasos={pasos} temperamento={temperamento} progreso={progreso} avanzar={avanzar} />}
      </div>
    );
  }

  return (
    <VistaListado
      modulo={moduloData}
      pasos={pasos}
      visibles={visibles}
      completados={progreso.completados}
      temperamento={temperamento}
      irA={irA}
    />
  );
}
