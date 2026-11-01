// Pestaña «Camino»: tu siguiente paso. Los 14 primeros días (semanas 0 y 1): en qué día estás, la
// sesión de hoy, el examen de la noche y la siguiente lección. Sin perfil, «Personaliza tu camino».
// Las pantallas se abren con ?paso=onboarding · ?dia=N (sesión) · ?examen=N.
import { useSearchParams } from 'react-router-dom';
import { LocalLink as Link } from '../i18n';
import { continuar, formatoDuracion } from '../lib/formacion.js';
import { DIAS, TOTAL_DIAS, conPunto, fechaCorta, fechaLocal, infoDia, semanaDe, siguientePaso, tieneExamen } from '../lib/camino.js';
import { GOLD, GOLD_SOFT, INK, LINE, MUTED, NAVY, PAPER, FONT_SANS, FONT_SERIF } from '../theme';
import { barraFondo, botonContorno, botonPrimario, eyebrow, heroFondo, parrafo, tarjeta, titulo } from './estilos';
import { IconoCheck, IconoFlecha, IconoPlay } from './Iconos';
import { useCatalogo, useProgreso } from './useFormacion';
import { useCamino } from './useCamino';
import Onboarding from './camino/Onboarding';
import Sesion from './camino/Sesion';
import Examen from './camino/Examen';

function Progreso({ camino }) {
  const { diaHoy, racha, porDia } = camino;
  const hechas = Object.values(porDia).filter((d) => d.sesion_en).length;
  const semana = semanaDe(Math.min(diaHoy, TOTAL_DIAS));
  return (
    <section style={tarjeta} aria-label="Tu progreso">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 12, flexWrap: 'wrap' }}>
        <div style={eyebrow}>Semana {semana.numero} · {semana.titulo}</div>
        {racha > 0 && <div style={{ fontFamily: FONT_SANS, fontSize: 13, fontWeight: 600, color: INK }}>🔥 {racha} {racha === 1 ? 'día seguido' : 'días seguidos'}</div>}
      </div>
      <h2 style={{ ...titulo(30), margin: '10px 0 12px' }}>Día {Math.min(diaHoy, TOTAL_DIAS)} de {TOTAL_DIAS}</h2>
      <div style={barraFondo}><div style={{ width: `${(hechas / TOTAL_DIAS) * 100}%`, height: '100%', background: GOLD, transition: 'width 500ms ease' }} /></div>
      <p style={{ ...parrafo, fontSize: 13.5, marginTop: 8 }}>{hechas} de {TOTAL_DIAS} sesiones hechas</p>
      <Tira camino={camino} />
    </section>
  );
}

function Tira({ camino }) {
  const { diaHoy, porDia } = camino;
  const [, setParams] = useSearchParams();
  return (
    <div style={{ marginTop: 18 }}>
      {[0, 1].map((s) => (
        <div key={s} style={{ marginTop: s ? 14 : 0 }}>
          <div style={{ fontFamily: FONT_SANS, fontSize: 11.5, fontWeight: 600, color: MUTED, marginBottom: 8 }}>Semana {s}</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, minmax(0, 1fr))', gap: 6 }}>
            {DIAS.slice(s * 7, s * 7 + 7).map((d) => {
              const hecho = Boolean(porDia[d.dia]?.sesion_en);
              const abierto = d.dia <= diaHoy;
              const esHoy = d.dia === diaHoy;
              return (
                <button key={d.dia} type="button" disabled={!abierto} onClick={() => setParams({ dia: String(d.dia) })}
                        title={`Día ${d.dia} · ${d.titulo}`} aria-label={`Día ${d.dia}: ${d.titulo}${hecho ? ' (hecho)' : ''}`}
                        style={{
                          aspectRatio: '1', borderRadius: 12, cursor: abierto ? 'pointer' : 'default', padding: 0,
                          display: 'grid', placeItems: 'center', fontFamily: FONT_SANS, fontSize: 14, fontWeight: 700,
                          background: hecho ? NAVY : esHoy ? 'rgba(197,165,90,0.16)' : 'transparent',
                          color: hecho ? PAPER : abierto ? NAVY : 'rgba(27,42,74,0.35)',
                          border: esHoy ? `2px solid ${GOLD}` : `1px solid ${hecho ? NAVY : LINE}`,
                        }}>
                  {hecho ? <IconoCheck width={18} height={18} /> : d.tipo === 'video' ? <IconoPlay width={15} height={15} /> : d.cierre ? '★' : d.dia}
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

function SiguientePaso({ camino }) {
  const [, setParams] = useSearchParams();
  const paso = siguientePaso(camino);
  const etiqueta = { ...eyebrow, color: GOLD_SOFT };
  const hero = { background: heroFondo, color: PAPER, borderRadius: 22, padding: '26px 22px 24px', boxShadow: '0 18px 40px rgba(15,29,56,0.28)' };
  if (!paso) return null;

  if (paso.tipo === 'hecho') {
    const manana = infoDia(paso.dia + 1);
    return (
      <section style={hero}>
        <div style={etiqueta}>Tu siguiente paso</div>
        <p style={{ fontFamily: FONT_SERIF, fontSize: 28, fontWeight: 600, lineHeight: 1.2, margin: '14px 0 8px' }}>Hoy está hecho.</p>
        <p style={{ fontFamily: FONT_SANS, fontSize: 15, opacity: 0.82, margin: 0 }}>
          {manana ? `Mañana, día ${manana.dia}: ${conPunto(manana.titulo)}` : 'Has llegado al final de tus dos primeras semanas.'}
        </p>
      </section>
    );
  }

  const info = infoDia(paso.dia);
  const examen = paso.tipo === 'examen';
  return (
    <section style={hero}>
      <div style={etiqueta}>{paso.atrasada ? 'Te quedó pendiente' : examen ? 'Esta noche' : 'Tu siguiente paso'}</div>
      <p style={{ fontFamily: FONT_SANS, fontSize: 13, opacity: 0.72, margin: '14px 0 4px' }}>Día {paso.dia}{examen ? '' : ` · ${info.tiempo}`}</p>
      <p style={{ fontFamily: FONT_SERIF, fontSize: 28, fontWeight: 600, lineHeight: 1.2, margin: '0 0 20px' }}>{examen ? 'Examen de la noche' : info.titulo}</p>
      <button type="button" style={botonPrimario} onClick={() => setParams(examen ? { examen: String(paso.dia) } : { dia: String(paso.dia) })}>
        {examen ? 'Mirar mi día · 45 s' : paso.atrasada ? 'Hacerla ahora' : 'Empezar'} <IconoFlecha width={18} height={18} />
      </button>
    </section>
  );
}

function AunNo({ camino }) {
  const [, setParams] = useSearchParams();
  return (
    <section style={tarjeta}>
      <div style={eyebrow}>Tu camino</div>
      <h2 style={{ ...titulo(28), margin: '10px 0 8px' }}>Empieza el {fechaCorta(camino.perfil.inicio)}</h2>
      <p style={{ ...parrafo, marginBottom: 6 }}>Ese día verás tu primer vídeo y empezará tu primer reto: <strong style={{ color: INK }}>{semanaDe(1).reto.toLowerCase()}</strong>.</p>
      <p style={{ ...parrafo, marginBottom: 18 }}>Cada semana, un vídeo. Cada día, cinco minutos. Cada noche, un momento para mirar tu día.</p>
      <button type="button" style={botonContorno} onClick={() => setParams({ paso: 'onboarding' })}>Cambiar el día del vídeo</button>
    </section>
  );
}

function Terminado() {
  return (
    <section style={tarjeta}>
      <div style={eyebrow}>Tu camino</div>
      <h2 style={{ ...titulo(28), margin: '10px 0 8px' }}>Has completado tus dos primeras semanas</h2>
      <p style={parrafo}>Tu próximo vídeo: el carácter se construye sobre la base del temperamento. La semana 2 llega muy pronto.</p>
    </section>
  );
}

function SiguienteLeccion({ user }) {
  const cat = useCatalogo();
  const progreso = useProgreso(user.id);
  const eyebrowClaro = { ...eyebrow, color: GOLD_SOFT };

  if (cat.cargando) {
    return <section style={{ ...tarjeta, background: heroFondo, color: PAPER, border: 'none' }}><div style={eyebrowClaro}>Siguiente lección</div><p style={{ margin: '12px 0 0', opacity: 0.75, fontFamily: FONT_SERIF, fontSize: 20 }}>Cargando tu formación…</p></section>;
  }
  if (cat.error) {
    return (
      <section style={tarjeta}>
        <div style={eyebrow}>Siguiente lección</div>
        <p style={{ ...parrafo, margin: '10px 0 14px' }}>No he podido cargar la formación ahora mismo.</p>
        <button type="button" style={botonContorno} onClick={cat.reintentar}>Reintentar</button>
      </section>
    );
  }
  const siguiente = continuar(cat.cursos, progreso.vistas, progreso.ultima);
  if (!siguiente) {
    return (
      <section style={tarjeta}>
        <div style={eyebrow}>Formación</div>
        <h2 style={{ ...titulo(24), margin: '10px 0 6px' }}>Has completado toda la formación</h2>
        <p style={parrafo}>Puedes repasar cualquier lección cuando quieras.</p>
        <div style={{ marginTop: 14 }}><Link to="/mi-panel/formacion" style={botonContorno}>Ver la formación</Link></div>
      </section>
    );
  }
  const { curso, leccion, retomada } = siguiente;
  return (
    <section style={{ background: heroFondo, color: PAPER, borderRadius: 22, padding: 18, boxShadow: '0 18px 40px rgba(15,29,56,0.26)' }}>
      <div style={{ ...eyebrowClaro, padding: '4px 6px 12px' }}>{retomada ? 'Continúa donde lo dejaste' : 'Siguiente lección'}</div>
      <Link to={`/mi-panel/formacion?leccion=${leccion.id}`} style={{ display: 'flex', gap: 14, alignItems: 'center', textDecoration: 'none', color: 'inherit' }}>
        <div style={{ position: 'relative', flex: '0 0 132px', aspectRatio: '16 / 9', borderRadius: 12, overflow: 'hidden', background: 'rgba(255,255,255,0.08)' }}>
          {leccion.miniatura && <img src={leccion.miniatura} alt="" loading="lazy" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />}
          <span style={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center', color: PAPER, background: 'rgba(15,29,56,0.30)' }}><IconoPlay width={30} height={30} /></span>
        </div>
        <div style={{ minWidth: 0 }}>
          <div style={{ fontFamily: FONT_SANS, fontSize: 12, opacity: 0.72, marginBottom: 3 }}>Curso {curso.numero} · {curso.titulo}</div>
          <div style={{ fontFamily: FONT_SERIF, fontSize: 21, fontWeight: 600, lineHeight: 1.2 }}>{leccion.titulo}</div>
          <div style={{ fontFamily: FONT_SANS, fontSize: 12.5, opacity: 0.72, marginTop: 6 }}>{formatoDuracion(leccion.duracion)}</div>
        </div>
      </Link>
      <div style={{ padding: '14px 4px 2px' }}>
        <Link to={`/mi-panel/formacion?leccion=${leccion.id}`} style={botonPrimario}>Ver lección <IconoFlecha width={18} height={18} /></Link>
      </div>
    </section>
  );
}

export default function Camino({ user }) {
  const [params, setParams] = useSearchParams();
  const camino = useCamino();
  const cerrar = () => setParams({});

  if (camino.cargando) return <p style={{ ...parrafo, textAlign: 'center', padding: 40 }}>Cargando tu camino…</p>;
  if (camino.error) {
    return (
      <section style={tarjeta}>
        <p style={{ ...parrafo, marginBottom: 14 }}>No he podido cargar tu camino ahora mismo.</p>
        <button type="button" style={botonContorno} onClick={camino.recargar}>Reintentar</button>
      </section>
    );
  }

  const unaColumna = (hijo) => <div style={{ maxWidth: 640, margin: '0 auto' }}>{hijo}</div>;
  const n = (k) => Number(params.get(k));
  const abierto = (d) => Number.isInteger(d) && d >= 1 && d <= Math.min(camino.diaHoy ?? 0, TOTAL_DIAS);

  if (!camino.perfil || params.get('paso') === 'onboarding') {
    return unaColumna(
      <Onboarding user={user} perfil={camino.perfil}
                  onSalir={camino.perfil ? cerrar : undefined}
                  onHecho={(p) => { camino.recargar(); setParams(p.inicio <= fechaLocal() ? { dia: '1' } : {}); }} />,
    );
  }
  if (abierto(n('dia'))) {
    const dia = n('dia');
    return unaColumna(<Sesion key={dia} dia={dia} user={user} camino={camino} onCerrar={cerrar} onExamen={() => setParams({ examen: String(dia) })} />);
  }
  if (abierto(n('examen')) && tieneExamen(n('examen'))) {
    return unaColumna(<Examen key={n('examen')} dia={n('examen')} user={user} camino={camino} onCerrar={cerrar} />);
  }

  const { diaHoy } = camino;
  return (
    <div className="vl-cols">
      <div className="vl-ancho">
        <div style={eyebrow}>Tu camino</div>
        <h1 style={{ ...titulo(32), margin: '8px 0 4px' }}>Tu siguiente paso</h1>
        <p style={{ ...parrafo, color: MUTED }}>Cada semana, un vídeo. Cada día, cinco minutos. Cada noche, un momento para mirar tu día.</p>
      </div>
      {diaHoy < 1 ? <AunNo camino={camino} /> : diaHoy > TOTAL_DIAS ? <Terminado /> : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          <SiguientePaso camino={camino} />
          <SiguienteLeccion user={user} />
        </div>
      )}
      {diaHoy >= 1 && <Progreso camino={camino} />}
    </div>
  );
}
