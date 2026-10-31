// Pestaña «Camino»: tu asistente (conversación), la siguiente lección y la gráfica de tus virtudes
// según el test de carácter.
import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { LocalLink as Link } from '../i18n';
import { retoDeHoy } from '../account/retos';
import { fetchLatestCharacter } from '../account/account';
import { extremos, resultadoCaracter } from '../lib/virtudes.js';
import { continuar, formatoDuracion } from '../lib/formacion.js';
import { GOLD_SOFT, INK, MUTED, NAVY, PAPER, FONT_SANS, FONT_SERIF } from '../theme';
import { botonContorno, botonPrimario, botonSobreClaro, eyebrow, heroFondo, parrafo, tarjeta, titulo } from './estilos';
import { IconoFlecha, IconoPlay } from './Iconos';
import { useCatalogo, useProgreso } from './useFormacion';
import Conversacion from './Conversacion';
import { VirtudesBarras, VirtudesRadar } from './Radar';

// Solo en desarrollo: ?demo=1 pinta la gráfica con datos de ejemplo (en producción no existe).
const DEMO = { self: { magnanimidad: 72, humildad: 55, prudencia: 63, fortaleza: 48, dominio: 60, justicia: 70 } };

function Asistente({ abrir }) {
  const [estado, setEstado] = useState({ cargando: true });
  useEffect(() => {
    let vivo = true;
    retoDeHoy().then((r) => { if (vivo) setEstado({ perfil: r.perfil }); }).catch(() => { if (vivo) setEstado({ error: true }); });
    return () => { vivo = false; };
  }, []);

  const configurado = estado.perfil === true;
  return (
    <section style={tarjeta} aria-label="Tu asistente">
      <div style={eyebrow}>Tu asistente</div>
      <h2 style={{ ...titulo(26), margin: '10px 0 8px' }}>{configurado ? 'Conversa cada noche' : 'Conoce a tu asistente'}</h2>
      <p style={{ ...parrafo, marginBottom: 18 }}>
        {configurado
          ? 'Cinco minutos para mirar el día y preparar el reto de mañana. Respondes con tus palabras, sin prisa.'
          : 'Una conversación breve, una sola vez, para conocer tu semana. Con ella tu reto de cada día se ajusta a tu vida.'}
      </p>
      {estado.cargando && <span style={{ ...parrafo, fontSize: 14 }}>Un momento…</span>}
      {estado.error && <span style={{ ...parrafo, fontSize: 14 }}>No he podido comprobar tu asistente ahora mismo. Recarga la página en unos minutos.</span>}
      {!estado.cargando && !estado.error && (
        <button type="button" style={botonPrimario} onClick={() => abrir(configurado ? 'noche' : 'onboarding')}>
          {configurado ? 'Hacer el examen de la noche' : 'Empezar'} <IconoFlecha width={18} height={18} />
        </button>
      )}
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

function Virtudes() {
  const [params] = useSearchParams();
  const [fila, setFila] = useState(undefined);
  useEffect(() => {
    let vivo = true;
    fetchLatestCharacter().then((r) => { if (vivo) setFila(r ?? null); }).catch(() => { if (vivo) setFila(null); });
    return () => { vivo = false; };
  }, []);

  const demo = import.meta.env.DEV && params.has('demo');
  const resultado = resultadoCaracter(demo ? DEMO : fila?.result);
  if (fila === undefined && !demo) return null;

  if (!resultado) {
    return (
      <section style={tarjeta} aria-label="Tus virtudes">
        <div style={eyebrow}>Tus virtudes</div>
        <h2 style={{ ...titulo(26), margin: '10px 0 8px' }}>Descubre qué virtudes has construido</h2>
        <p style={{ ...parrafo, marginBottom: 6 }}>El test de carácter mide las seis virtudes y dibuja aquí tu punto de partida. Son 68 preguntas y se hace una sola vez.</p>
        <p style={{ ...parrafo, fontSize: 13.5, marginBottom: 18 }}>Hazlo con tu sesión iniciada: así el resultado se guarda en tu cuenta.</p>
        <Link to="/tests/caracter" style={botonSobreClaro}>Hacer el test de carácter <IconoFlecha width={18} height={18} /></Link>
      </section>
    );
  }

  const { valores } = resultado;
  const { mayor, menor } = extremos(valores);
  const fecha = fila?.taken_at ? new Date(fila.taken_at).toLocaleDateString('es-ES', { day: 'numeric', month: 'long' }) : null;
  return (
    <section style={tarjeta} aria-label="Tus virtudes">
      <div style={eyebrow}>Tus virtudes{fecha ? ` · medido el ${fecha}` : ''}</div>
      <h2 style={{ ...titulo(26), margin: '10px 0 14px' }}>Tu mapa de carácter</h2>
      <VirtudesRadar valores={valores} />
      <p style={{ ...parrafo, margin: '14px 0 20px', color: INK, textAlign: 'center' }}>
        Tu virtud más presente es <strong>{mayor.nombre}</strong> ({Math.round(mayor.valor)} %). La que más puedes cultivar ahora es <strong>{menor.nombre}</strong> ({Math.round(menor.valor)} %).
      </p>
      <VirtudesBarras valores={valores} />
      <div style={{ marginTop: 18 }}>
        <Link to="/tests/caracter" style={{ fontFamily: FONT_SANS, fontSize: 14, color: NAVY, fontWeight: 600 }}>Repetir el test →</Link>
      </div>
    </section>
  );
}

export default function Camino({ user }) {
  const [params, setParams] = useSearchParams();
  const modo = params.get('conversacion');
  const conversando = modo === 'onboarding' || modo === 'noche';
  const abrir = (m) => setParams({ conversacion: m });
  const cerrar = () => setParams({});

  return (
    <div className="vl-cols">
      <div className="vl-ancho">
        <div style={eyebrow}>Tu camino</div>
        <h1 style={{ ...titulo(32), margin: '8px 0 4px' }}>Un paso cada día</h1>
        <p style={{ ...parrafo, color: MUTED }}>Conversa, mira cómo vas y sigue con tu formación.</p>
      </div>
      {conversando ? <Conversacion modo={modo} onTerminar={cerrar} /> : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          <Asistente abrir={abrir} />
          <SiguienteLeccion user={user} />
        </div>
      )}
      <Virtudes />
    </div>
  );
}

