// Examen de la noche: 45 segundos, tres toques. ¿Hiciste el reto? ¿Con quién? ¿Cómo te fue?
// Semana 0: la palabra de tu reacción más fuerte (su temperamento nunca se muestra).
// Semana 1: «¿Te reconoció?» y cómo te fue. Con vida interior: «¿Quieres dar gracias…?», un toque.
import { useState } from 'react';
import { guardarExamen } from '../../account/camino';
import { EXAMEN, PALABRAS, semanaDe } from '../../lib/camino.js';
import { INK, LINE, NAVY, PAPER, FONT_SANS, FONT_SERIF } from '../../theme';
import { botonContorno, botonSobreClaro, parrafo } from '../estilos';
import { IconoCheck } from '../Iconos';
import { Opcion, Opciones, Pantalla, Puntos } from './ui';
import { idDeClave } from '../../lib/personas.js';
import EligeQuien from '../personas/EligeQuien';
import Observacion from '../personas/Observacion';

function pasosDe(semana, r, vidaInterior) {
  const p = ['reto'];
  if (r.reto && r.reto !== 'no') p.push('con_quien');
  if (semana === 1 && r.reto && r.reto !== 'no' && r.con_quien && r.con_quien !== 'solo') p.push('reconocio');
  p.push(semana === 0 ? 'palabra' : 'animo');
  if (vidaInterior) p.push('gracias');
  return p;
}

export default function Examen({ dia, user, camino, personas, onCerrar }) {
  const semana = semanaDe(dia).numero;
  const vidaInterior = camino.perfil?.vida_interior === 'si';
  const [r, setR] = useState({});
  const [i, setI] = useState(0);
  const [estado, setEstado] = useState(null); // null · 'guardando' · 'hecho' · 'error'
  const [observando, setObservando] = useState(false);

  const pasos = pasosDe(semana, r, vidaInterior);
  const clave = pasos[i];

  async function guardar(final) {
    setEstado('guardando');
    try {
      await guardarExamen(user.id, dia, final);
      camino.recargar();
      setEstado('hecho');
    } catch {
      setEstado('error');
    }
  }

  function responder(campo, valor) {
    const nuevo = { ...r, [campo]: valor };
    if (campo === 'reto' && valor === 'no') { delete nuevo.con_quien; delete nuevo.reconocio; }
    if (campo === 'con_quien' && valor === 'solo') delete nuevo.reconocio;
    setR(nuevo);
    const p = pasosDe(semana, nuevo, vidaInterior);
    const j = p.indexOf(campo);
    if (j + 1 < p.length) setTimeout(() => setI(j + 1), 160);
    else guardar(nuevo);
  }

  // Si lo hizo con alguien que tiene ficha: «¿Quieres anotar cómo reaccionó?».
  const ficha = personas?.porId[idDeClave(r.con_quien)] ?? null;
  if (estado === 'hecho' && observando && ficha) {
    return <Observacion user={user} persona={ficha} onSalir={() => setObservando(false)} onHecho={() => { personas.recargar(); setObservando('hecho'); }} />;
  }
  if (estado === 'hecho') {
    return (
      <Pantalla etiqueta={`Día ${dia} · Examen de la noche`}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '12px 0 14px' }}>
          <span style={{ width: 44, height: 44, borderRadius: '50%', background: NAVY, color: PAPER, display: 'grid', placeItems: 'center' }}><IconoCheck width={24} height={24} /></span>
          <p style={{ fontFamily: FONT_SERIF, fontSize: 26, fontWeight: 700, color: NAVY, margin: 0 }}>Buenas noches</p>
        </div>
        <p style={{ ...parrafo, marginBottom: 20 }}>Has mirado tu día. Mañana, un paso más.</p>
        {ficha && observando !== 'hecho' && (
          <div style={{ borderTop: `1px solid ${LINE}`, padding: '16px 0 18px' }}>
            <p style={{ ...parrafo, color: INK, marginBottom: 12 }}>¿Quieres anotar cómo reaccionó {ficha.nombre}?</p>
            <button type="button" style={botonSobreClaro} onClick={() => setObservando(true)}>Anotar su reacción</button>
          </div>
        )}
        <button type="button" style={botonContorno} onClick={onCerrar}>Volver a mi camino</button>
      </Pantalla>
    );
  }

  const atras = i > 0 ? <button type="button" onClick={() => setI(i - 1)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: FONT_SANS, fontSize: 14, color: INK, padding: 0 }}>← Atrás</button> : null;
  const pie = (
    <>
      {estado === 'error' && (
        <p role="alert" style={{ ...parrafo, color: '#9C3A3A', marginBottom: 12 }}>
          No he podido guardar tu examen. <button type="button" style={{ ...botonSobreClaro, padding: '6px 14px' }} onClick={() => guardar(r)}>Reintentar</button>
        </p>
      )}
      {estado === 'guardando' ? <span style={parrafo}>Guardando…</span> : atras}
    </>
  );
  const titulo = (texto) => <h2 style={{ fontFamily: FONT_SERIF, fontSize: 26, fontWeight: 700, color: INK, margin: '16px 0 18px' }}>{texto}</h2>;

  return (
    <Pantalla etiqueta={`Día ${dia} · Examen de la noche`} onVolver={onCerrar} pie={pie}>
      {i === 0 && <p style={{ fontFamily: FONT_SERIF, fontSize: 20, fontStyle: 'italic', color: INK, margin: '10px 0 4px' }}>{EXAMEN.intro}</p>}
      <Puntos total={pasos.length} actual={i} />
      {clave === 'con_quien' && (
        <>
          {titulo(EXAMEN.con_quien.pregunta)}
          <EligeQuien personas={personas?.lista} valor={r.con_quien} onElegir={(v) => responder('con_quien', v)} extra={[['solo', 'Solo']]} />
        </>
      )}
      {(clave === 'reto' || clave === 'reconocio') && (
        <>
          {titulo(EXAMEN[clave].pregunta)}
          <Opciones columnas={3}>
            {EXAMEN[clave].opciones.map(([v, texto]) => (
              <Opcion key={v} compacta activa={r[clave] === v} onClick={() => responder(clave, v)}>{texto}</Opcion>
            ))}
          </Opciones>
        </>
      )}
      {clave === 'palabra' && (
        <>
          {titulo(EXAMEN.palabra.pregunta)}
          <Opciones columnas={2}>
            {PALABRAS.map(([texto]) => <Opcion key={texto} compacta activa={r.palabra === texto} onClick={() => responder('palabra', texto)}>{texto}</Opcion>)}
          </Opciones>
        </>
      )}
      {clave === 'animo' && (
        <>
          {titulo(EXAMEN.animo.pregunta)}
          <Opciones columnas={5}>
            {EXAMEN.animo.opciones.map(([v, emoji, texto]) => (
              <Opcion key={v} compacta activa={r.animo === v} onClick={() => responder('animo', v)}>
                <span aria-label={texto} role="img" style={{ fontSize: 26 }}>{emoji}</span>
              </Opcion>
            ))}
          </Opciones>
        </>
      )}
      {clave === 'gracias' && (
        <>
          {titulo(EXAMEN.gracias)}
          <Opciones columnas={2}>
            <Opcion compacta onClick={() => responder('gracias', true)}>Doy gracias</Opcion>
            <Opcion compacta onClick={() => responder('gracias', false)}>Hoy no</Opcion>
          </Opciones>
        </>
      )}
    </Pantalla>
  );
}
