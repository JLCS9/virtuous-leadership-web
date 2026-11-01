// La sesión de un día del camino, siempre en tres pasos: Recuerda (la frase y el reto de la semana),
// Juega (la interacción del día) y Elige (con quién vas a hacer hoy el reto).
import { useEffect, useState } from 'react';
import { useT } from '../../i18n';
import { guardarLineaBase, guardarSesion } from '../../account/camino';
import { fetchLatestTemperament } from '../../account/account';
import { buscarLeccion } from '../../lib/formacion.js';
import {
  CON_QUIEN, EJEMPLO_CUATRO, conPunto, LEMA, PUNTO_PARTIDA, RETO_PRESENTACION, VERDAD_MITO, infoDia, semanaDe, tieneExamen,
} from '../../lib/camino.js';
import { GOLD, INK, LINE, MUTED, NAVY, PAPER, TEMP_COLORS, FONT_SANS, FONT_SERIF } from '../../theme';
import { botonContorno, botonPrimario, botonSobreClaro, eyebrow, heroFondo, parrafo } from '../estilos';
import { IconoCheck, IconoFlecha } from '../Iconos';
import { Reproductor } from '../Formacion';
import { useCatalogo, useProgreso } from '../useFormacion';
import { Opcion, Opciones, Pantalla, Puntos } from './ui';
import Rueda from './Rueda';
import { Arrastra, DeslizaTemperamentoCaracter, DeslizaTemperamentos, EligeReaccion, EligeVirtud } from './Juegos';
import { Cierre14, Cierre7 } from './Cierres';

const fraseGrande = { fontFamily: FONT_SERIF, fontSize: 25, lineHeight: 1.3, color: INK, margin: '12px 0 16px' };
const Continuar = ({ onClick, children = 'Continuar', disabled }) => (
  <button type="button" style={{ ...botonSobreClaro, opacity: disabled ? 0.45 : 1 }} disabled={disabled} onClick={onClick}>
    {children} <IconoFlecha width={18} height={18} />
  </button>
);

// ───────────── Juegos ─────────────

function DiaVideo({ dia, user, onFin }) {
  const { t } = useT();
  const cat = useCatalogo();
  const progreso = useProgreso(user.id);
  const [fase, setFase] = useState('video');
  const [temp, setTemp] = useState(undefined);
  const info = infoDia(dia);

  useEffect(() => {
    if (dia !== 1) return undefined;
    let vivo = true;
    fetchLatestTemperament().then((f) => { if (vivo) setTemp(f?.result ?? null); }).catch(() => { if (vivo) setTemp(null); });
    return () => { vivo = false; };
  }, [dia]);

  const encontrada = cat.cursos ? buscarLeccion(cat.cursos, info.leccion) : null;
  const fases = dia === 1 ? ['video', 'resultado', 'cuatro', 'reto'] : ['video', 'reto'];
  const avanzar = () => {
    const i = fases.indexOf(fase);
    if (i + 1 < fases.length) setFase(fases[i + 1]);
    else onFin({ video_visto: Boolean(progreso.vistas[info.leccion]) });
  };
  const etiqueta = `Día ${dia} · ${info.titulo}`;

  if (fase === 'video') {
    const visto = Boolean(progreso.vistas[info.leccion]);
    return (
      <Pantalla etiqueta={etiqueta}>
        <p style={fraseGrande}>
          {dia === 1 ? 'Hoy empieza tu camino. Primero, cinco minutos para entender qué es tu temperamento.' : 'Nueva semana, nuevo vídeo.'}
        </p>
        {cat.cargando && <p style={parrafo}>Cargando el vídeo…</p>}
        {cat.error && <p style={parrafo}>No he podido cargar el vídeo ahora mismo. <button type="button" onClick={cat.reintentar} style={{ ...botonContorno, padding: '6px 12px' }}>Reintentar</button></p>}
        {encontrada && (
          <>
            <Reproductor leccion={encontrada.leccion} onProgreso={(f) => { if (f >= 0.9) progreso.marcarVista(info.leccion); }} />
            <p style={{ fontFamily: FONT_SANS, fontSize: 13.5, color: MUTED, margin: '10px 0 0' }}>
              Vídeo {encontrada.leccion.id} · {encontrada.leccion.titulo}
            </p>
          </>
        )}
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center', marginTop: 20 }}>
          <Continuar onClick={() => { progreso.marcarVista(info.leccion); avanzar(); }}>{visto ? 'Continuar' : 'Ya lo he visto'}</Continuar>
          {!visto && <button type="button" onClick={avanzar} style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: FONT_SANS, fontSize: 14, color: MUTED }}>Lo veré después</button>}
        </div>
      </Pantalla>
    );
  }

  if (fase === 'resultado') {
    if (temp === undefined) return <Pantalla etiqueta={etiqueta}><p style={parrafo}>Un momento…</p></Pantalla>;
    const primario = temp?.primario;
    const secundario = temp?.secundario ?? null;
    if (!TEMP_COLORS[primario]) {
      return (
        <Pantalla etiqueta={etiqueta} pie={<Continuar onClick={avanzar} />}>
          <p style={fraseGrande}>Aún no tenemos el resultado de tu test de temperamento en tu cuenta.</p>
          <p style={parrafo}>Hazlo con tu sesión iniciada y aquí verás tu posición en la rueda.</p>
        </Pantalla>
      );
    }
    const nombres = Object.fromEntries(['COL', 'MEL', 'SAN', 'FLE'].map((k) => [k, t(`temperaments.${k}`)?.name ?? k]));
    const fila = (k, cual) => (
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, padding: '10px 0', borderTop: `1px solid ${LINE}` }}>
        <span style={{ width: 10, height: 10, borderRadius: '50%', background: TEMP_COLORS[k], flex: '0 0 10px', transform: 'translateY(-1px)' }} />
        <div>
          <div style={{ fontFamily: FONT_SANS, fontSize: 12.5, color: MUTED }}>Tu temperamento {cual}</div>
          <div style={{ fontFamily: FONT_SERIF, fontSize: 22, fontWeight: 700, color: NAVY }}>{nombres[k]} <span style={{ fontWeight: 500, fontStyle: 'italic', fontSize: 18, color: MUTED }}>· {LEMA[k]}</span></div>
        </div>
      </div>
    );
    return (
      <Pantalla etiqueta={etiqueta} pie={<Continuar onClick={avanzar} />}>
        <h2 style={{ fontFamily: FONT_SERIF, fontSize: 26, fontWeight: 700, color: INK, margin: '12px 0 16px' }}>Tu punto de partida</h2>
        <Rueda primario={primario} secundario={secundario} nombres={nombres} />
        <div style={{ marginTop: 18 }}>
          {fila(primario, 'primario')}
          {secundario && TEMP_COLORS[secundario] && fila(secundario, 'secundario')}
        </div>
      </Pantalla>
    );
  }

  if (fase === 'cuatro') {
    const primario = temp?.primario;
    return (
      <Pantalla etiqueta={etiqueta} pie={<Continuar onClick={avanzar} />}>
        <p style={fraseGrande}>¿Te parece que tienes los cuatro? Es un error con una vertiente positiva: significa que has estado desarrollando tu carácter.</p>
        {EJEMPLO_CUATRO[primario] && (
          <p style={{ ...parrafo, borderLeft: `3px solid ${GOLD}`, paddingLeft: 14, color: INK, fontStyle: 'italic' }}>{EJEMPLO_CUATRO[primario]}</p>
        )}
      </Pantalla>
    );
  }

  return (
    <Pantalla etiqueta={`Reto de la semana ${semanaDe(dia).numero}`} pie={<Continuar onClick={avanzar} />}>
      <h2 style={{ fontFamily: FONT_SERIF, fontSize: 28, fontWeight: 700, color: NAVY, margin: '12px 0 12px' }}>{semanaDe(dia).reto}</h2>
      <p style={{ ...parrafo, color: INK, fontSize: 16.5 }}>{RETO_PRESENTACION[dia]}</p>
    </Pantalla>
  );
}

function VerdadMito({ dia, onFin }) {
  const lista = VERDAD_MITO[dia];
  const [i, setI] = useState(0);
  const [respuestas, setRespuestas] = useState([]);
  const respondida = respuestas.length > i;
  const aciertos = respuestas.filter((r, k) => r === lista[k][1]).length;
  const etiqueta = `Día ${dia} · Verdad o mito`;

  if (i >= lista.length) {
    return (
      <Pantalla etiqueta={etiqueta} pie={<Continuar onClick={() => onFin({ respuestas, aciertos })} />}>
        <p style={{ ...fraseGrande, fontSize: 30, fontWeight: 700, color: NAVY }}>Has acertado {aciertos} de {lista.length}.</p>
      </Pantalla>
    );
  }

  const [afirmacion, verdad, explicacion] = lista[i];
  const elegida = respuestas[i];
  const acierto = respondida && elegida === verdad;
  return (
    <Pantalla etiqueta={etiqueta}>
      <Puntos total={lista.length} actual={i} />
      <p style={{ ...fraseGrande, fontSize: 27, margin: '22px 0 22px', minHeight: 70 }}>«{afirmacion}»</p>
      <Opciones columnas={2}>
        {[[true, 'Verdad'], [false, 'Mito']].map(([v, texto]) => (
          <Opcion key={texto} compacta activa={respondida && elegida === v} disabled={respondida}
                  onClick={() => setRespuestas((r) => [...r, v])}>{texto}</Opcion>
        ))}
      </Opciones>
      {respondida && (
        <div className="vl-entra" style={{ marginTop: 18 }}>
          <p style={{ fontFamily: FONT_SANS, fontSize: 15, fontWeight: 700, color: acierto ? '#3F7A56' : '#9C3A3A', margin: '0 0 4px' }}>
            {acierto ? '¡Bien!' : 'No exactamente.'} Es {verdad ? 'verdad' : 'un mito'}.
          </p>
          <p style={{ ...parrafo, color: INK }}>{explicacion}.</p>
          <div style={{ marginTop: 18 }}><Continuar onClick={() => setI((n) => n + 1)}>{i + 1 < lista.length ? 'Siguiente' : 'Ver resultado'}</Continuar></div>
        </div>
      )}
    </Pantalla>
  );
}

function PuntoPartida({ dia, user, lineaBase, onFin }) {
  const [paso, setPaso] = useState(0);
  const [r, setR] = useState({
    fallo: lineaBase?.fallo ?? null, me_ven: lineaBase?.me_ven ?? [], me_gustaria: lineaBase?.me_gustaria ?? [], linea: lineaBase?.linea ?? '',
  });
  const [error, setError] = useState(null);
  const [ocupado, setOcupado] = useState(false);
  const etiqueta = `Día ${dia} · Mi punto de partida`;

  async function guardar() {
    setOcupado(true);
    setError(null);
    try {
      await guardarLineaBase(user.id, { ...r, linea: r.linea.trim() || null });
      onFin({ hecho: true });
    } catch {
      setError('No he podido guardarlo. Inténtalo de nuevo.');
      setOcupado(false);
    }
  }

  if (paso === 0) {
    const q = PUNTO_PARTIDA.fallo;
    return (
      <Pantalla etiqueta={etiqueta}>
        <Puntos total={4} actual={0} />
        <h2 style={{ fontFamily: FONT_SERIF, fontSize: 26, fontWeight: 700, color: INK, margin: '16px 0 18px' }}>{q.pregunta}</h2>
        <Opciones>{q.opciones.map(([v, texto]) => <Opcion key={v} activa={r.fallo === v} onClick={() => { setR((x) => ({ ...x, fallo: v })); setTimeout(() => setPaso(1), 180); }}>{texto}</Opcion>)}</Opciones>
      </Pantalla>
    );
  }

  if (paso === 1 || paso === 2) {
    const campo = paso === 1 ? 'me_ven' : 'me_gustaria';
    const q = PUNTO_PARTIDA[campo];
    const elegidos = r[campo];
    const cambiar = (v) => setR((x) => {
      const e = x[campo];
      return { ...x, [campo]: e.includes(v) ? e.filter((y) => y !== v) : e.length < 3 ? [...e, v] : e };
    });
    return (
      <Pantalla etiqueta={etiqueta} pie={<Continuar disabled={!elegidos.length} onClick={() => setPaso(paso + 1)} />}>
        <Puntos total={4} actual={paso} />
        <h2 style={{ fontFamily: FONT_SERIF, fontSize: 26, fontWeight: 700, color: INK, margin: '16px 0 4px' }}>{q.pregunta}</h2>
        <p style={{ ...parrafo, fontSize: 14, marginBottom: 16 }}>Elige hasta 3.</p>
        <Opciones columnas={3}>{q.opciones.map((v) => <Opcion key={v} compacta activa={elegidos.includes(v)} onClick={() => cambiar(v)}>{v}</Opcion>)}</Opciones>
      </Pantalla>
    );
  }

  return (
    <Pantalla etiqueta={etiqueta} pie={(
      <>
        {error && <p role="alert" style={{ ...parrafo, color: '#9C3A3A', marginBottom: 12 }}>{error}</p>}
        <Continuar disabled={ocupado} onClick={guardar}>{ocupado ? 'Guardando…' : r.linea.trim() ? 'Guardar' : 'Seguir sin escribir'}</Continuar>
      </>
    )}>
      <Puntos total={4} actual={3} />
      <h2 style={{ fontFamily: FONT_SERIF, fontSize: 26, fontWeight: 700, color: INK, margin: '16px 0 6px' }}>{PUNTO_PARTIDA.linea}</h2>
      <p style={{ ...parrafo, fontSize: 14, marginBottom: 14 }}>Es opcional. Solo lo ves tú; lo releerás al final de la semana 1.</p>
      <textarea value={r.linea} maxLength={280} rows={3} onChange={(e) => setR((x) => ({ ...x, linea: e.target.value }))}
                style={{ width: '100%', fontFamily: FONT_SANS, fontSize: 16, padding: 12, borderRadius: 12, border: `1px solid ${LINE}`, color: INK, background: '#fff', resize: 'vertical' }} />
    </Pantalla>
  );
}

function Pronto({ dia, onFin }) {
  const info = infoDia(dia);
  return (
    <Pantalla etiqueta={`Día ${dia} · ${info.titulo}`} pie={<Continuar onClick={() => onFin({ pronto: true })}>Marcar como hecha</Continuar>}>
      <p style={fraseGrande}>Esta sesión llega muy pronto.</p>
      <p style={parrafo}>Mientras tanto, sigue con el reto de la semana y no te saltes el examen de la noche.</p>
    </Pantalla>
  );
}

// ───────────── La sesión ─────────────

export default function Sesion({ dia, user, camino, onCerrar, onExamen }) {
  const info = infoDia(dia);
  const semana = semanaDe(dia);
  const hecha = Boolean(camino.porDia[dia]?.sesion_en);
  const [paso, setPaso] = useState('recuerda');
  const [juego, setJuego] = useState(null);
  const [conQuien, setConQuien] = useState(camino.porDia[dia]?.con_quien ?? null);
  const [error, setError] = useState(null);
  const [ocupado, setOcupado] = useState(false);

  async function guardar(j, quien) {
    setOcupado(true);
    setError(null);
    try {
      await guardarSesion(user.id, dia, { juego: j, conQuien: quien });
      camino.recargar();
      setPaso('fin');
    } catch {
      setError('No he podido guardar tu sesión. Inténtalo de nuevo.');
    }
    setOcupado(false);
  }

  const finJuego = (j) => {
    setJuego(j);
    // Los cierres no tienen «¿con quién?».
    if (info.cierre) guardar(j, null);
    else setPaso('elige');
  };

  if (paso === 'recuerda') {
    return (
      <section className="vl-entra" style={{ background: heroFondo, color: PAPER, borderRadius: 22, padding: '26px 22px 24px', boxShadow: '0 18px 40px rgba(15,29,56,0.28)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ ...eyebrow, color: GOLD }}>Día {dia} · Semana {semana.numero}</div>
          <button type="button" onClick={onCerrar} style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: FONT_SANS, fontSize: 13.5, color: PAPER, opacity: 0.7 }}>Salir</button>
        </div>
        <p style={{ fontFamily: FONT_SERIF, fontSize: 27, lineHeight: 1.28, fontStyle: 'italic', margin: '18px 0 18px' }}>«{semana.frase}»</p>
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.18)', paddingTop: 14, marginBottom: 22 }}>
          <div style={{ fontFamily: FONT_SANS, fontSize: 12, opacity: 0.7, marginBottom: 4 }}>Tu reto de la semana</div>
          <div style={{ fontFamily: FONT_SANS, fontSize: 16, fontWeight: 600 }}>{semana.reto}</div>
        </div>
        {hecha && <p style={{ fontFamily: FONT_SANS, fontSize: 13.5, opacity: 0.8, margin: '0 0 14px' }}>Ya hiciste esta sesión. Puedes repetirla.</p>}
        <button type="button" style={botonPrimario} onClick={() => setPaso('juega')}>
          {info.titulo} · {info.tiempo} <IconoFlecha width={18} height={18} />
        </button>
      </section>
    );
  }

  if (paso === 'juega') {
    if (info.tipo === 'video') return <DiaVideo dia={dia} user={user} onFin={finJuego} />;
    if (info.tipo === 'verdad_mito') return <VerdadMito dia={dia} onFin={finJuego} />;
    if (info.tipo === 'punto_partida') return <PuntoPartida dia={dia} user={user} lineaBase={camino.lineaBase} onFin={finJuego} />;
    if (info.tipo === 'desliza') return dia === 2 ? <DeslizaTemperamentos dia={dia} onFin={finJuego} /> : <DeslizaTemperamentoCaracter dia={dia} onFin={finJuego} />;
    if (info.tipo === 'elige') return dia === 3 ? <EligeReaccion dia={dia} onFin={finJuego} /> : <EligeVirtud dia={dia} momentos={camino.perfil?.momentos} onFin={finJuego} />;
    if (info.tipo === 'arrastra') return <Arrastra dia={dia} onFin={finJuego} />;
    if (info.tipo === 'cierre') return dia === 7 ? <Cierre7 camino={camino} onFin={finJuego} /> : <Cierre14 camino={camino} onFin={finJuego} />;
    return <Pronto dia={dia} onFin={finJuego} />;
  }

  if (paso === 'elige') {
    return (
      <Pantalla etiqueta="Elige" pregunta={dia === 8 ? '¿A quién se lo contarás primero?' : '¿Con quién vas a hacer hoy el reto?'}
        pie={(
          <>
            {error && <p role="alert" style={{ ...parrafo, color: '#9C3A3A', marginBottom: 12 }}>{error}</p>}
            <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
              <Continuar disabled={ocupado} onClick={() => guardar(juego, conQuien)}>{ocupado ? 'Guardando…' : 'Terminar la sesión'}</Continuar>
              {!conQuien && <span style={{ fontFamily: FONT_SANS, fontSize: 13.5, color: MUTED }}>No es obligatorio.</span>}
            </div>
          </>
        )}>
        <Opciones>
          {CON_QUIEN.map(([v, texto]) => <Opcion key={v} activa={conQuien === v} onClick={() => setConQuien(conQuien === v ? null : v)}>{texto}</Opcion>)}
        </Opciones>
      </Pantalla>
    );
  }

  const siguiente = infoDia(dia + 1);
  return (
    <Pantalla etiqueta={`Día ${dia} · Hecho`}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '12px 0 14px' }}>
        <span style={{ width: 44, height: 44, borderRadius: '50%', background: NAVY, color: PAPER, display: 'grid', placeItems: 'center' }}><IconoCheck width={24} height={24} /></span>
        <p style={{ fontFamily: FONT_SERIF, fontSize: 26, fontWeight: 700, color: NAVY, margin: 0 }}>Sesión hecha</p>
      </div>
      {tieneExamen(dia) && <p style={{ ...parrafo, color: INK, marginBottom: 6 }}>Esta noche, 45 segundos para mirar tu día.</p>}
      <p style={{ ...parrafo, marginBottom: 20 }}>{siguiente ? `Mañana: ${conPunto(siguiente.titulo)}` : 'Has completado tus dos primeras semanas.'}</p>
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
        {tieneExamen(dia) && !camino.porDia[dia]?.examen_en && <button type="button" style={botonSobreClaro} onClick={onExamen}>Hacer el examen ahora</button>}
        <button type="button" style={botonContorno} onClick={onCerrar}>Volver a mi camino</button>
      </div>
    </Pantalla>
  );
}
