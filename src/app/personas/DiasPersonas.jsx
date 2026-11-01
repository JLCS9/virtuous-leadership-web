// Sesiones de los días 5 («Descubre el temperamento de X») y 12 («Mis personas»). Las fichas y las
// observaciones se hacen aquí mismo, sin salir de la sesión.
import { useState } from 'react';
import { combinacion, idDeClave } from '../../lib/personas.js';
import { INK, LINE, MUTED, FONT_SANS, FONT_SERIF } from '../../theme';
import { botonContorno, botonSobreClaro, eyebrow, parrafo } from '../estilos';
import { Continuar, useTemperamento } from '../camino/Juegos';
import { Pantalla } from '../camino/ui';
import CrearFicha from './CrearFicha';
import Observacion from './Observacion';
import { ListaPersonas } from './MisPersonas';
import { Avatar, useNombresTemp } from './comun';
import { textoConQuien } from './EligeQuien';

const fraseGrande = { fontFamily: FONT_SERIF, fontSize: 25, lineHeight: 1.3, color: INK, margin: '12px 0 16px' };
const RECONOCIO = { si: 'Sí', en_parte: 'En parte', no: 'No' };

export function Dia5({ dia, user, personas, estadoVida, onFin }) {
  const [creando, setCreando] = useState(false);
  const lista = personas.lista;
  if (creando) {
    return (
      <CrearFicha user={user} estadoVida={estadoVida} menor={personas.menor} onSalir={() => setCreando(false)}
                  onHecho={(p) => { personas.recargar(); onFin({ ficha: p.id }); }} />
    );
  }
  return (
    <Pantalla etiqueta={`Día ${dia} · Descubre el temperamento de X`}>
      <p style={fraseGrande}>Ya sabes reconocer los cuatro temperamentos. ¿Te atreves con alguien que conoces bien?</p>
      {lista.length > 0 && (
        <div style={{ marginBottom: 18 }}>
          <div style={{ ...eyebrow, color: MUTED, marginBottom: 4 }}>Tu primera ficha</div>
          <ListaPersonas personas={lista.slice(0, 1)} onAbrir={() => {}} compacta />
        </div>
      )}
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
        <button type="button" style={botonSobreClaro} onClick={() => setCreando(true)}>{lista.length ? 'Descubre el de otra persona' : 'Crear ficha'}</button>
        <button type="button" onClick={() => onFin({ ficha: null })} style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: FONT_SANS, fontSize: 14, color: MUTED }}>Ahora no</button>
      </div>
    </Pantalla>
  );
}

export function Dia12({ dia, user, camino, personas, onFin }) {
  const temp = useTemperamento();
  const nombres = useNombresTemp();
  const [sub, setSub] = useState(null); // null · { crear: true } · { observar: persona }
  const [observadas, setObservadas] = useState([]);
  const { porDia, perfil } = camino;
  const { lista, porId } = personas;

  // A quién se lo contaste (exámenes de la semana 1).
  const contados = [8, 9, 10, 11].map((d) => ({ dia: d, ...porDia[d]?.examen }))
    .filter((e) => e.reto && e.reto !== 'no' && e.con_quien && e.con_quien !== 'solo');
  const fichasContadas = [...new Set(contados.map((e) => idDeClave(e.con_quien)).filter((id) => porId[id]))].map((id) => porId[id]);
  const sinFicha = contados.some((e) => !idDeClave(e.con_quien));
  const paraObservar = fichasContadas.length ? fichasContadas : lista;
  const conTemperamento = lista.filter((p) => p.primario);

  if (sub?.crear) {
    return (
      <CrearFicha user={user} estadoVida={perfil.estado_vida} menor={personas.menor} onSalir={() => setSub(null)}
                  onHecho={() => { personas.recargar(); setSub(null); }} />
    );
  }
  if (sub?.observar) {
    const p = sub.observar;
    return (
      <Observacion user={user} persona={p} onSalir={() => setSub(null)}
                   onHecho={() => { personas.recargar(); setObservadas((o) => [...o, p.id]); setSub(null); }} />
    );
  }

  const bloque = (titulo, hijos) => (
    <div style={{ borderTop: `1px solid ${LINE}`, padding: '16px 0 6px' }}>
      <div style={{ ...eyebrow, color: MUTED, marginBottom: 10 }}>{titulo}</div>
      {hijos}
    </div>
  );

  return (
    <Pantalla etiqueta={`Día ${dia} · Mis personas`}
      pie={<Continuar onClick={() => onFin({ contados: contados.length, observadas: observadas.length })}>Continuar</Continuar>}>
      <h2 style={{ fontFamily: FONT_SERIF, fontSize: 28, fontWeight: 700, color: '#1B2A4A', margin: '12px 0 14px' }}>Aprender a leer a los demás</h2>

      {bloque('A quién se lo has contado', contados.length === 0 ? (
        <p style={parrafo}>Esta semana no has anotado a quién se lo contaste. Puedes hacerlo en el examen de la noche.</p>
      ) : (
        <div style={{ display: 'grid', gap: 6 }}>
          {contados.map((e) => (
            <div key={e.dia} style={{ display: 'flex', justifyContent: 'space-between', gap: 10, fontFamily: FONT_SANS, fontSize: 15, color: INK }}>
              <span>{textoConQuien(e.con_quien, porId)}</span>
              <span style={{ color: MUTED }}>¿Te reconoció? <strong style={{ color: INK }}>{RECONOCIO[e.reconocio] ?? '—'}</strong></span>
            </div>
          ))}
        </div>
      ))}

      {(sinFicha || lista.length === 0) && bloque('¿Descubres su temperamento?', (
        <>
          <p style={{ ...parrafo, marginBottom: 12 }}>Crea la ficha de alguien a quien se lo contaste y responde 8 preguntas sobre cómo reacciona.</p>
          <button type="button" style={botonSobreClaro} onClick={() => setSub({ crear: true })}>Crear ficha</button>
        </>
      ))}

      {paraObservar.length > 0 && bloque('¿Qué reacción le has visto esta semana?', (
        <div style={{ display: 'grid', gap: 8 }}>
          {paraObservar.map((p) => (
            <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <Avatar persona={p} tam={36} />
              <span style={{ flex: 1, fontFamily: FONT_SANS, fontSize: 15, fontWeight: 600, color: INK }}>{p.nombre}</span>
              {observadas.includes(p.id)
                ? <span style={{ fontFamily: FONT_SANS, fontSize: 13.5, color: '#3F7A56', fontWeight: 600 }}>Anotado ✓</span>
                : <button type="button" style={{ ...botonContorno, padding: '8px 14px', fontSize: 13 }} onClick={() => setSub({ observar: p })}>Anotar</button>}
            </div>
          ))}
        </div>
      ))}

      {temp?.primario && conTemperamento.length > 0 && bloque('Tú y tus personas', (
        <div style={{ display: 'grid', gap: 14 }}>
          {conTemperamento.map((p) => (
            <div key={p.id} style={{ display: 'flex', gap: 10 }}>
              <Avatar persona={p} tam={36} />
              <div>
                <div style={{ fontFamily: FONT_SANS, fontSize: 13, color: MUTED }}>
                  Tú, {nombres[temp.primario].toLowerCase()} · {p.nombre}, {nombres[p.primario].toLowerCase()}{p.estado === 'confirmado' ? '' : ' (estimado)'}
                </div>
                <p style={{ ...parrafo, color: INK, marginTop: 2 }}>{combinacion(temp.primario, p.primario)}</p>
              </div>
            </div>
          ))}
        </div>
      ))}
    </Pantalla>
  );
}
