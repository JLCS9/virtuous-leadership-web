// «Descubre el temperamento de X»: crear la ficha (o rehacer el test de una que ya existe), las 8
// preguntas, el desempate si hace falta y el resultado. Al guardar, la ficha aparece en Mis personas.
import { useMemo, useState } from 'react';
import { crearPersona, guardarEstimacion } from '../../account/personas';
import {
  AVATARES, DESEMPATE, FICHA, INTRO, NO_SE, PREGUNTAS, RELACIONES, TEXTO_CONFIANZA, gruposPara, necesitaDesempate,
  ordenAleatorio, puntuar, textoResultado, textoSinResultado,
} from '../../lib/personas.js';
import { INK, LINE, MUTED, TEMP_COLORS, FONT_SANS, FONT_SERIF } from '../../theme';
import { parrafo } from '../estilos';
import { Continuar, useTemperamento } from '../camino/Juegos';
import { Opcion, Opciones, Pantalla, Puntos } from '../camino/ui';
import { FichaContenido, useNombresTemp } from './comun';

const titular = { fontFamily: FONT_SERIF, fontSize: 26, fontWeight: 700, color: INK, margin: '16px 0 18px' };
const etiquetaCampo = { display: 'block', fontFamily: FONT_SANS, fontSize: 13, fontWeight: 600, color: INK, margin: '18px 0 8px' };
const ROJO = '#9C3A3A';

function Datos({ estadoVida, menor, inicial, onListo, onSalir }) {
  const [d, setD] = useState(inicial ?? { nombre: '', grupo: null, relacion: null, avatar: null, estrella: false, me_cuesta: false });
  const valido = d.nombre.trim().length > 0 && d.grupo;
  const chipActivo = (activo) => ({
    fontFamily: FONT_SANS, fontSize: 14, borderRadius: 999, padding: '8px 13px', cursor: 'pointer',
    border: `1px solid ${activo ? '#1B2A4A' : LINE}`, background: activo ? '#1B2A4A' : '#FBF8F1', color: activo ? '#FBF8F1' : INK,
  });
  return (
    <Pantalla etiqueta="Crear ficha" onVolver={onSalir} pie={<Continuar disabled={!valido} onClick={() => onListo({ ...d, nombre: d.nombre.trim() })} />}>
      <h2 style={titular}>¿De quién quieres descubrir el temperamento?</h2>
      <label htmlFor="ficha-nombre" style={{ ...etiquetaCampo, marginTop: 0 }}>Nombre o apodo</label>
      <input id="ficha-nombre" value={d.nombre} maxLength={40} autoComplete="off" onChange={(e) => setD({ ...d, nombre: e.target.value })}
             style={{ width: '100%', fontFamily: FONT_SANS, fontSize: 17, padding: '12px 14px', borderRadius: 12, border: `1px solid ${LINE}`, color: INK, background: '#fff' }} />
      <p style={{ ...parrafo, fontSize: 12.5, marginTop: 6 }}>Sin apellidos. Solo tú verás esta ficha.</p>

      <span style={etiquetaCampo}>Grupo</span>
      <Opciones columnas={2}>
        {gruposPara(estadoVida).map(([g, texto]) => <Opcion key={g} compacta activa={d.grupo === g} onClick={() => setD({ ...d, grupo: g })}>{texto}</Opcion>)}
      </Opciones>

      <span style={etiquetaCampo}>Relación <span style={{ fontWeight: 400, color: MUTED }}>(opcional)</span></span>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
        {RELACIONES.map((r) => <button key={r} type="button" style={chipActivo(d.relacion === r)} onClick={() => setD({ ...d, relacion: d.relacion === r ? null : r })}>{r}</button>)}
      </div>

      <span style={etiquetaCampo}>Avatar <span style={{ fontWeight: 400, color: MUTED }}>(opcional; si no, su inicial)</span></span>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
        {AVATARES.map((a) => <button key={a} type="button" aria-label={`Avatar ${a}`} style={{ ...chipActivo(d.avatar === a), fontSize: 20, padding: '6px 10px' }} onClick={() => setD({ ...d, avatar: d.avatar === a ? null : a })}>{a}</button>)}
      </div>

      <span style={etiquetaCampo}>Solo para ti <span style={{ fontWeight: 400, color: MUTED }}>(nunca se muestra a nadie)</span></span>
      <div style={{ display: 'grid', gap: 8 }}>
        <Opcion activa={d.estrella} onClick={() => setD({ ...d, estrella: !d.estrella })}>★ Quiero trabajar mis virtudes con esta persona</Opcion>
        {!menor && <Opcion activa={d.me_cuesta} onClick={() => setD({ ...d, me_cuesta: !d.me_cuesta })}>Me cuesta</Opcion>}
      </div>
    </Pantalla>
  );
}

/**
 * persona: si existe, se rehace su test (sin pedir los datos). Si no, se crea la ficha al guardar.
 * onHecho(persona) al guardar.
 */
export default function CrearFicha({ user, estadoVida, menor, persona = null, onHecho, onSalir }) {
  const temp = useTemperamento();
  const nombres = useNombresTemp();
  const orden = useMemo(() => ordenAleatorio(), []);
  const [datos, setDatos] = useState(persona ? { nombre: persona.nombre } : null);
  const [paso, setPaso] = useState(persona ? 'intro' : 'datos');
  const [respuestas, setRespuestas] = useState([]);
  const [desempate, setDesempate] = useState({});
  const [estado, setEstado] = useState(null); // null · 'guardando' · 'error'

  const nombre = datos?.nombre ?? '';
  const etiqueta = `Descubre el temperamento de ${nombre}`;

  if (paso === 'datos') return <Datos estadoVida={estadoVida} menor={menor} onSalir={onSalir} onListo={(d) => { setDatos(d); setPaso('intro'); }} />;

  if (paso === 'intro') {
    return (
      <Pantalla etiqueta={etiqueta} onVolver={onSalir} pie={<Continuar onClick={() => setPaso(0)}>Empezar · 8 preguntas</Continuar>}>
        <p style={{ fontFamily: FONT_SERIF, fontSize: 24, lineHeight: 1.32, color: INK, margin: '14px 0 0' }}>{INTRO(nombre)}</p>
      </Pantalla>
    );
  }

  if (typeof paso === 'number') {
    const [pregunta, opciones] = PREGUNTAS[paso];
    const responder = (r) => {
      const nuevas = [...respuestas.slice(0, paso), r];
      setRespuestas(nuevas);
      setTimeout(() => {
        if (paso + 1 < PREGUNTAS.length) setPaso(paso + 1);
        else setPaso(necesitaDesempate(nuevas) ? 'rapidez' : 'resultado');
      }, 160);
    };
    const atras = paso > 0 ? <button type="button" onClick={() => setPaso(paso - 1)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: FONT_SANS, fontSize: 14, color: INK, padding: 0 }}>← Atrás</button> : null;
    return (
      <Pantalla etiqueta={etiqueta} onVolver={onSalir} pie={atras}>
        <Puntos total={PREGUNTAS.length} actual={paso} />
        <p style={{ ...parrafo, fontSize: 13, margin: '14px 0 0' }}>{nombre}…</p>
        <h2 style={{ ...titular, marginTop: 4 }}>{pregunta}</h2>
        <Opciones>
          {orden[paso].map((k) => <Opcion key={k} activa={respuestas[paso] === k} onClick={() => responder(k)}>{opciones[k]}</Opcion>)}
          <Opcion activa={respuestas[paso] === NO_SE} onClick={() => responder(NO_SE)}><span style={{ color: MUTED }}>No lo sé</span></Opcion>
        </Opciones>
      </Pantalla>
    );
  }

  if (paso === 'rapidez' || paso === 'duracion') {
    const q = DESEMPATE[paso];
    return (
      <Pantalla etiqueta={etiqueta} onVolver={onSalir}>
        <p style={{ ...parrafo, fontSize: 13.5, margin: '12px 0 0' }}>Dos preguntas más para afinar.</p>
        <h2 style={titular}>{q.pregunta(nombre)}</h2>
        <Opciones>
          {q.opciones.map(([v, texto]) => (
            <Opcion key={v} onClick={() => { setDesempate((x) => ({ ...x, [paso]: v })); setTimeout(() => setPaso(paso === 'rapidez' ? 'duracion' : 'resultado'), 160); }}>{texto}</Opcion>
          ))}
          <Opcion onClick={() => setPaso(paso === 'rapidez' ? 'duracion' : 'resultado')}><span style={{ color: MUTED }}>No lo sé</span></Opcion>
        </Opciones>
      </Pantalla>
    );
  }

  // Resultado.
  const r = puntuar(respuestas, desempate);
  async function guardar() {
    setEstado('guardando');
    const estimacion = { respuestas, desempate: Object.keys(desempate).length ? desempate : null, ...r };
    try {
      let guardada;
      if (persona) {
        await guardarEstimacion(user.id, persona.id, estimacion);
        guardada = { ...persona, primario: r.primario, secundario: r.secundario, confianza: r.confianza, puntos: r.puntos };
      } else {
        guardada = await crearPersona(user.id, datos, estimacion);
      }
      onHecho(guardada);
    } catch {
      setEstado('error');
    }
  }
  const pie = (
    <>
      {estado === 'error' && <p role="alert" style={{ ...parrafo, color: ROJO, marginBottom: 12 }}>No he podido guardar la ficha. Inténtalo de nuevo.</p>}
      <Continuar disabled={estado === 'guardando'} onClick={guardar}>{estado === 'guardando' ? 'Guardando…' : 'Guardar la ficha'}</Continuar>
    </>
  );

  if (!r.primario) {
    return (
      <Pantalla etiqueta={etiqueta} pie={pie}>
        <p style={{ fontFamily: FONT_SERIF, fontSize: 24, lineHeight: 1.32, color: INK, margin: '14px 0 10px' }}>{textoSinResultado(nombre)}</p>
        <p style={parrafo}>Guardamos la ficha sin temperamento. Cuando le observes, podrás anotar sus reacciones o volver a hacer el test.</p>
      </Pantalla>
    );
  }
  const f = FICHA[r.primario];
  return (
    <Pantalla etiqueta={etiqueta} pie={pie}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, margin: '12px 0 4px' }}>
        <span style={{ width: 14, height: 14, borderRadius: '50%', background: TEMP_COLORS[r.primario] }} />
        <span style={{ fontFamily: FONT_SERIF, fontSize: 30, fontWeight: 700, color: TEMP_COLORS[r.primario] }}>{nombres[r.primario]}</span>
        {r.secundario && <span style={{ fontFamily: FONT_SANS, fontSize: 14, color: MUTED }}>· secundario {nombres[r.secundario].toLowerCase()}</span>}
      </div>
      <div style={{ fontFamily: FONT_SANS, fontSize: 13, fontWeight: 600, color: MUTED, marginBottom: 12 }}>{TEXTO_CONFIANZA[r.confianza]}</div>
      <p style={{ ...parrafo, color: INK, fontSize: 16, marginBottom: 14 }}>{textoResultado(nombre, nombres[r.primario].toLowerCase(), f.lema)}</p>
      <FichaContenido persona={{ nombre, primario: r.primario }} miPrimario={temp?.primario} />
      <p style={{ ...parrafo, fontSize: 13.5, marginTop: 12 }}>Solo {nombre} puede confirmarlo. Pronto podrás invitarle a hacer el test.</p>
    </Pantalla>
  );
}
