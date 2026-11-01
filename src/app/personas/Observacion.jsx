// Observación rápida: cómo ha reaccionado esa persona, en 3 toques (qué pasó, cómo reaccionó, una
// línea opcional). Cada una suma 0,5 puntos; si cambia el primario estimado, se propone actualizar
// la ficha y decide el usuario.
import { useState } from 'react';
import { actualizarPersona, anotarObservacion, observacionesDe } from '../../account/personas';
import { PALABRAS_3P, SITUACIONES, propuestaPorObservaciones, textoPropuesta } from '../../lib/personas.js';
import { INK, LINE, FONT_SANS, FONT_SERIF } from '../../theme';
import { botonContorno, parrafo } from '../estilos';
import { Continuar } from '../camino/Juegos';
import { Opcion, Opciones, Pantalla, Puntos } from '../camino/ui';
import { useNombresTemp } from './comun';

const titular = { fontFamily: FONT_SERIF, fontSize: 26, fontWeight: 700, color: INK, margin: '16px 0 18px' };

export default function Observacion({ user, persona, onHecho, onSalir }) {
  const nombres = useNombresTemp();
  const [paso, setPaso] = useState(0);
  const [o, setO] = useState({ situacion: null, palabra: null, temperamento: null, linea: '' });
  const [estado, setEstado] = useState(null);
  const [propuesta, setPropuesta] = useState(null);
  const etiqueta = `Lo que he visto de ${persona.nombre}`;

  async function guardar() {
    setEstado('guardando');
    try {
      const nueva = await anotarObservacion(user.id, persona.id, { ...o, linea: o.linea.trim() });
      const p = propuestaPorObservaciones(persona, await observacionesDe(persona.id), nueva);
      if (p) { setPropuesta(p); setEstado(null); } else onHecho();
    } catch {
      setEstado('error');
    }
  }

  async function actualizar() {
    setEstado('guardando');
    try {
      await actualizarPersona(persona.id, { primario: propuesta, estado: 'estimado', secundario: persona.primario && persona.primario !== propuesta ? persona.primario : persona.secundario });
      onHecho();
    } catch {
      setEstado('error');
    }
  }

  if (propuesta) {
    return (
      <Pantalla etiqueta={etiqueta}>
        <p style={{ fontFamily: FONT_SERIF, fontSize: 24, lineHeight: 1.32, color: INK, margin: '14px 0 20px' }}>
          {textoPropuesta(persona.nombre, nombres[propuesta].toLowerCase())}
        </p>
        {estado === 'error' && <p role="alert" style={{ ...parrafo, color: '#9C3A3A', marginBottom: 12 }}>No he podido actualizar la ficha.</p>}
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <Continuar disabled={estado === 'guardando'} onClick={actualizar}>Sí, actualizar</Continuar>
          <button type="button" style={botonContorno} onClick={onHecho}>Dejarla como está</button>
        </div>
      </Pantalla>
    );
  }

  if (paso === 0) {
    return (
      <Pantalla etiqueta={etiqueta} onVolver={onSalir}>
        <Puntos total={3} actual={0} />
        <h2 style={titular}>¿Qué pasó?</h2>
        <Opciones columnas={2}>
          {SITUACIONES.map(([v, texto]) => <Opcion key={v} compacta activa={o.situacion === v} onClick={() => { setO((x) => ({ ...x, situacion: v })); setTimeout(() => setPaso(1), 160); }}>{texto}</Opcion>)}
        </Opciones>
      </Pantalla>
    );
  }
  if (paso === 1) {
    return (
      <Pantalla etiqueta={etiqueta} onVolver={onSalir}
        pie={<button type="button" onClick={() => setPaso(0)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: FONT_SANS, fontSize: 14, color: INK, padding: 0 }}>← Atrás</button>}>
        <Puntos total={3} actual={1} />
        <h2 style={titular}>¿Cómo reaccionó?</h2>
        <Opciones columnas={2}>
          {PALABRAS_3P.map(([texto, k]) => (
            <Opcion key={texto} compacta activa={o.palabra === texto} onClick={() => { setO((x) => ({ ...x, palabra: texto, temperamento: k })); setTimeout(() => setPaso(2), 160); }}>{texto}</Opcion>
          ))}
        </Opciones>
      </Pantalla>
    );
  }
  return (
    <Pantalla etiqueta={etiqueta} onVolver={onSalir} pie={(
      <>
        {estado === 'error' && <p role="alert" style={{ ...parrafo, color: '#9C3A3A', marginBottom: 12 }}>No he podido guardarlo. Inténtalo de nuevo.</p>}
        <Continuar disabled={estado === 'guardando'} onClick={guardar}>{estado === 'guardando' ? 'Guardando…' : o.linea.trim() ? 'Guardar' : 'Guardar sin escribir'}</Continuar>
      </>
    )}>
      <Puntos total={3} actual={2} />
      <h2 style={titular}>¿Quieres añadir una línea?</h2>
      <p style={{ ...parrafo, fontSize: 14, marginBottom: 12 }}>Es opcional. Solo la ves tú.</p>
      <textarea value={o.linea} maxLength={280} rows={3} onChange={(e) => setO((x) => ({ ...x, linea: e.target.value }))}
                style={{ width: '100%', fontFamily: FONT_SANS, fontSize: 16, padding: 12, borderRadius: 12, border: `1px solid ${LINE}`, color: INK, background: '#fff', resize: 'vertical' }} />
    </Pantalla>
  );
}
