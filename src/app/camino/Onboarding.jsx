// «Personaliza tu camino»: unas preguntas con botones, una vez, antes del día 1. Todo se puede
// cambiar después. La primera vez pregunta también si quieres crear ya la primera ficha de persona.
import { useState } from 'react';
import { guardarPerfil } from '../../account/camino';
import { DIAS_SEMANA, ONBOARDING, calcularInicio, diaIso, fechaCorta, fechaLocal, textoCierreOnboarding } from '../../lib/camino.js';
import { INK, LINE, FONT_SANS, FONT_SERIF } from '../../theme';
import { botonPrimario, botonSobreClaro, parrafo } from '../estilos';
import { IconoFlecha } from '../Iconos';
import { Opcion, Opciones, Pantalla, Puntos } from './ui';

const PASOS = ['entrada', 'momentos', 'estado_vida', 'objetivo', 'vida_interior', 'ficha', 'agenda'];

export default function Onboarding({ user, perfil, onHecho, onSalir }) {
  const [paso, setPaso] = useState(0);
  const [r, setR] = useState(() => ({
    momentos: perfil?.momentos ?? [],
    estado_vida: perfil?.estado_vida ?? null,
    objetivo: perfil?.objetivo ?? null,
    vida_interior: perfil?.vida_interior ?? null,
    dia_video: perfil?.dia_video ?? diaIso(fechaLocal()),
    hora_examen: (perfil?.hora_examen ?? '21:30').slice(0, 5),
  }));
  const [quiereFicha, setQuiereFicha] = useState(null);
  const [guardado, setGuardado] = useState(null);
  // Al editar el perfil ya creado no se vuelve a preguntar por la primera ficha.
  const pasos = perfil ? PASOS.filter((x) => x !== 'ficha') : PASOS;
  const [ocupado, setOcupado] = useState(false);
  const [error, setError] = useState(null);

  const siguiente = () => setPaso((p) => p + 1);
  const elegir = (campo, valor) => { setR((x) => ({ ...x, [campo]: valor })); setTimeout(siguiente, 180); };

  async function guardar() {
    setOcupado(true);
    setError(null);
    try {
      // Si ya tenía camino, cambiar el día del vídeo no lo reinicia.
      const inicio = perfil?.inicio ?? calcularInicio(r.dia_video);
      setGuardado(await guardarPerfil(user.id, { ...r, inicio }));
    } catch {
      setError('No he podido guardar tus respuestas. Inténtalo de nuevo.');
    }
    setOcupado(false);
  }

  if (guardado) {
    const empiezaHoy = guardado.inicio === fechaLocal();
    return (
      <Pantalla etiqueta="Tu camino">
        <p style={{ fontFamily: FONT_SERIF, fontSize: 26, lineHeight: 1.3, color: INK, margin: '10px 0 22px' }}>
          {textoCierreOnboarding(empiezaHoy ? 'hoy' : `el ${fechaCorta(guardado.inicio)}`)}
        </p>
        <button type="button" style={botonSobreClaro} onClick={() => onHecho(guardado, quiereFicha === true)}>
          {quiereFicha === true ? 'Crear la ficha' : empiezaHoy ? 'Empezar el día 1' : 'Ver mi camino'} <IconoFlecha width={18} height={18} />
        </button>
      </Pantalla>
    );
  }

  const clave = pasos[paso];
  const volver = paso > 0 ? <button type="button" onClick={() => setPaso((p) => p - 1)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: FONT_SANS, fontSize: 14, color: INK, padding: 0 }}>← Atrás</button> : null;

  if (clave === 'entrada') {
    return (
      <Pantalla etiqueta="Personaliza tu camino" onVolver={onSalir}>
        <p style={{ fontFamily: FONT_SERIF, fontSize: 27, lineHeight: 1.28, color: INK, margin: '12px 0 10px' }}>{ONBOARDING.entrada}</p>
        <p style={{ ...parrafo, marginBottom: 22 }}>Son unas pocas preguntas, unos dos minutos. Podrás cambiarlas cuando quieras.</p>
        <button type="button" style={botonSobreClaro} onClick={siguiente}>Empezar <IconoFlecha width={18} height={18} /></button>
      </Pantalla>
    );
  }

  const cabecera = <Puntos total={pasos.length - 1} actual={paso - 1} />;

  if (clave === 'momentos') {
    const q = ONBOARDING.momentos;
    const cambiar = (v) => setR((x) => ({ ...x, momentos: x.momentos.includes(v) ? x.momentos.filter((m) => m !== v) : [...x.momentos, v] }));
    return (
      <Pantalla etiqueta="Personaliza tu camino" onVolver={onSalir}
        pie={<div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>{volver}<button type="button" style={{ ...botonSobreClaro, opacity: r.momentos.length ? 1 : 0.45 }} disabled={!r.momentos.length} onClick={siguiente}>Continuar</button></div>}>
        {cabecera}
        <h2 style={{ fontFamily: FONT_SERIF, fontSize: 26, fontWeight: 700, color: INK, margin: '16px 0 4px' }}>{q.pregunta}</h2>
        <p style={{ ...parrafo, fontSize: 14, marginBottom: 16 }}>{q.ayuda}</p>
        <Opciones columnas={2}>
          {q.opciones.map(([v, texto]) => <Opcion key={v} activa={r.momentos.includes(v)} onClick={() => cambiar(v)}>{texto}</Opcion>)}
        </Opciones>
      </Pantalla>
    );
  }

  if (clave === 'ficha') {
    return (
      <Pantalla etiqueta="Personaliza tu camino" onVolver={onSalir} pie={volver}>
        {cabecera}
        <h2 style={{ fontFamily: FONT_SERIF, fontSize: 26, fontWeight: 700, color: INK, margin: '16px 0 8px' }}>¿Hay alguien cuyo temperamento te gustaría descubrir?</h2>
        <p style={{ ...parrafo, fontSize: 14, marginBottom: 16 }}>Ocho preguntas sobre cómo reacciona. Lo harás al terminar.</p>
        <Opciones>
          <Opcion activa={quiereFicha === true} onClick={() => { setQuiereFicha(true); setTimeout(siguiente, 180); }}>Crear ficha</Opcion>
          <Opcion activa={quiereFicha === false} onClick={() => { setQuiereFicha(false); setTimeout(siguiente, 180); }}>Ahora no</Opcion>
        </Opciones>
      </Pantalla>
    );
  }

  if (clave === 'agenda') {
    return (
      <Pantalla etiqueta="Personaliza tu camino" onVolver={onSalir}
        pie={(
          <>
            {error && <p role="alert" style={{ ...parrafo, color: '#9C3A3A', marginBottom: 12 }}>{error}</p>}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              {volver}
              <button type="button" style={botonPrimario} disabled={ocupado} onClick={guardar}>{ocupado ? 'Guardando…' : 'Listo'}</button>
            </div>
          </>
        )}>
        {cabecera}
        <h2 style={{ fontFamily: FONT_SERIF, fontSize: 26, fontWeight: 700, color: INK, margin: '16px 0 16px' }}>{ONBOARDING.agenda.pregunta}</h2>
        <div style={{ fontFamily: FONT_SANS, fontSize: 13, fontWeight: 600, color: INK, marginBottom: 8 }}>Tu vídeo de cada semana, el…</div>
        <Opciones columnas={4}>
          {DIAS_SEMANA.map((nombre, i) => (
            <Opcion key={nombre} compacta activa={r.dia_video === i + 1} onClick={() => setR((x) => ({ ...x, dia_video: i + 1 }))}>
              {nombre.slice(0, 3)}{i + 1 === diaIso(fechaLocal()) ? ' · hoy' : ''}
            </Opcion>
          ))}
        </Opciones>
        <label htmlFor="hora-examen" style={{ display: 'block', fontFamily: FONT_SANS, fontSize: 13, fontWeight: 600, color: INK, margin: '20px 0 8px' }}>Tu examen de la noche, a las…</label>
        <input id="hora-examen" type="time" value={r.hora_examen} step={300}
               onChange={(e) => setR((x) => ({ ...x, hora_examen: e.target.value || '21:30' }))}
               style={{ fontFamily: FONT_SANS, fontSize: 18, padding: '10px 14px', borderRadius: 12, border: `1px solid ${LINE}`, color: INK, background: '#fff' }} />
        {!perfil && (
          <p style={{ ...parrafo, fontSize: 14, marginTop: 16 }}>
            {r.dia_video === diaIso(fechaLocal()) ? 'Tu camino empieza hoy mismo.' : `Tu camino empezará el ${fechaCorta(calcularInicio(r.dia_video))}.`}
          </p>
        )}
      </Pantalla>
    );
  }

  const q = ONBOARDING[clave];
  return (
    <Pantalla etiqueta="Personaliza tu camino" onVolver={onSalir} pie={volver}>
      {cabecera}
      <h2 style={{ fontFamily: FONT_SERIF, fontSize: 26, fontWeight: 700, color: INK, margin: '16px 0 18px' }}>{q.pregunta}</h2>
      <Opciones>
        {q.opciones.map(([v, texto]) => <Opcion key={v} activa={r[clave] === v} onClick={() => elegir(clave, v)}>{texto}</Opcion>)}
      </Opciones>
    </Pantalla>
  );
}
