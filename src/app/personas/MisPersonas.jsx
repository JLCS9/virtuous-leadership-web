// «Mis personas»: la lista y el mapa de tus fichas, y la ficha de cada persona con lo que has visto
// de ella. Todo es privado: solo lo ve la propia cuenta, y se puede borrar una a una o todo a la vez.
import { useCallback, useEffect, useState } from 'react';
import { borrarObservacion, borrarPersona, borrarTodasLasPersonas, actualizarPersona, leerPersona } from '../../account/personas';
import { GRUPOS, TEXTO_GRUPO, TEXTO_SITUACION, textoSinResultado } from '../../lib/personas.js';
import { INK, LINE, MUTED, NAVY, FONT_SANS, FONT_SERIF } from '../../theme';
import { botonContorno, botonSobreClaro, eyebrow, parrafo, tarjeta, titulo } from '../estilos';
import { IconoFlecha } from '../Iconos';
import { useTemperamento } from '../camino/Juegos';
import { Opcion } from '../camino/ui';
import { Avatar, EtiquetaEstado, FichaContenido, MapaPersonas } from './comun';

const ROJO = '#9C3A3A';
const volverBtn = (onVolver, texto = '← Mi camino') => (
  <button type="button" onClick={onVolver} style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: FONT_SANS, fontSize: 14, color: NAVY, padding: 0, fontWeight: 600 }}>{texto}</button>
);

/** Botón de borrar en dos pasos: «Borrar» → «¿Seguro? Sí, borrar». */
function BorrarConfirmando({ texto, confirmar, onBorrar }) {
  const [seguro, setSeguro] = useState(false);
  const estilo = { background: 'none', border: 'none', cursor: 'pointer', fontFamily: FONT_SANS, fontSize: 13.5, color: ROJO, padding: 4 };
  if (!seguro) return <button type="button" style={estilo} onClick={() => setSeguro(true)}>{texto}</button>;
  return (
    <span style={{ fontFamily: FONT_SANS, fontSize: 13.5, color: INK }}>
      {confirmar}{' '}
      <button type="button" style={{ ...estilo, fontWeight: 700 }} onClick={onBorrar}>Sí, borrar</button>
      <button type="button" style={{ ...estilo, color: MUTED }} onClick={() => setSeguro(false)}>No</button>
    </span>
  );
}

export function ListaPersonas({ personas, onAbrir, compacta = false }) {
  if (!personas.length) return null;
  return (
    <div style={{ display: 'grid', gap: 4 }}>
      {personas.map((p) => (
        <button key={p.id} type="button" onClick={() => onAbrir(p)}
                style={{ display: 'flex', alignItems: 'center', gap: 12, padding: compacta ? '8px 4px' : '10px 4px', background: 'none', border: 'none', borderTop: `1px solid ${LINE}`, cursor: 'pointer', textAlign: 'left' }}>
          <Avatar persona={p} tam={compacta ? 36 : 42} />
          <span style={{ flex: 1, minWidth: 0 }}>
            <span style={{ display: 'block', fontFamily: FONT_SANS, fontSize: 15.5, fontWeight: 600, color: INK }}>
              {p.nombre}{p.estrella ? ' ★' : ''}{p.relacion ? <span style={{ fontWeight: 400, color: MUTED }}> · {p.relacion}</span> : null}
            </span>
            <EtiquetaEstado persona={p} />
          </span>
          <IconoFlecha width={16} height={16} style={{ color: MUTED }} />
        </button>
      ))}
    </div>
  );
}

/** Tarjeta de «Mis personas» en la pestaña Camino. */
export function TarjetaPersonas({ personas, onVer, onCrear }) {
  return (
    <section style={tarjeta} aria-label="Mis personas">
      <div style={eyebrow}>Mis personas</div>
      <h2 style={{ ...titulo(24), margin: '10px 0 6px' }}>{personas.length ? `${personas.length} ${personas.length === 1 ? 'ficha' : 'fichas'}` : 'Descubre a tu gente'}</h2>
      {!personas.length && <p style={{ ...parrafo, marginBottom: 16 }}>Crea la ficha de alguien cercano y descubre su temperamento con 8 preguntas.</p>}
      {personas.length > 0 && <div style={{ margin: '8px 0 16px' }}><ListaPersonas personas={personas.slice(0, 4)} onAbrir={(p) => onVer(p.id)} compacta /></div>}
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        <button type="button" style={botonSobreClaro} onClick={onCrear}>Crear ficha</button>
        {personas.length > 0 && <button type="button" style={botonContorno} onClick={() => onVer(null)}>Ver todas</button>}
      </div>
    </section>
  );
}

export function MisPersonas({ user, personas, onAbrir, onCrear, onVolver, onCambio }) {
  async function borrarTodas() {
    await borrarTodasLasPersonas(user.id);
    onCambio();
  }
  return (
    <section style={tarjeta}>
      {volverBtn(onVolver)}
      <div style={{ ...eyebrow, marginTop: 16 }}>Mis personas</div>
      <h1 style={{ ...titulo(30), margin: '8px 0 6px' }}>Tu gente</h1>
      <p style={{ ...parrafo, marginBottom: 16 }}>Las personas con las que practicarás las virtudes. Solo tú ves estas fichas.</p>
      {personas.length > 0 && <MapaPersonas personas={personas} />}
      {GRUPOS.map(([g]) => {
        const delGrupo = personas.filter((p) => p.grupo === g);
        if (!delGrupo.length) return null;
        return (
          <div key={g} style={{ marginTop: 18 }}>
            <div style={{ ...eyebrow, color: MUTED, marginBottom: 6 }}>{TEXTO_GRUPO[g]}</div>
            <ListaPersonas personas={delGrupo} onAbrir={(p) => onAbrir(p.id)} />
          </div>
        );
      })}
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center', marginTop: 22 }}>
        <button type="button" style={botonSobreClaro} onClick={onCrear}>Crear ficha</button>
        {personas.length > 0 && <BorrarConfirmando texto="Borrar todas las fichas" confirmar="Se borrarán todas tus fichas y lo que has anotado." onBorrar={borrarTodas} />}
      </div>
    </section>
  );
}

export function Ficha({ id, menor, onVolver, onObservar, onRehacer, onCambio }) {
  const temp = useTemperamento();
  const [estado, setEstado] = useState({ cargando: true });
  const cargar = useCallback(() => {
    leerPersona(id).then((d) => setEstado({ ...d })).catch(() => setEstado({ error: true }));
  }, [id]);
  useEffect(cargar, [cargar]);

  if (estado.cargando) return <section style={tarjeta}><p style={parrafo}>Cargando la ficha…</p></section>;
  if (estado.error || !estado.persona) {
    return <section style={tarjeta}>{volverBtn(onVolver, '← Mis personas')}<p style={{ ...parrafo, marginTop: 14 }}>No he encontrado esta ficha.</p></section>;
  }
  const { persona: p, observaciones } = estado;
  async function marcar(campo) {
    const nueva = await actualizarPersona(p.id, { [campo]: !p[campo] });
    setEstado((e) => ({ ...e, persona: nueva }));
    onCambio();
  }
  async function borrarFicha() { await borrarPersona(p.id); onCambio(); onVolver(); }
  async function borrarObs(obsId) { await borrarObservacion(obsId); cargar(); }

  return (
    <section style={tarjeta}>
      {volverBtn(onVolver, '← Mis personas')}
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, margin: '18px 0 10px' }}>
        <Avatar persona={p} tam={60} />
        <div>
          <h1 style={{ ...titulo(30), margin: 0 }}>{p.nombre}</h1>
          <div style={{ fontFamily: FONT_SANS, fontSize: 13.5, color: MUTED, margin: '2px 0' }}>{TEXTO_GRUPO[p.grupo]}{p.relacion ? ` · ${p.relacion}` : ''}</div>
          <EtiquetaEstado persona={p} />
        </div>
      </div>

      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', margin: '6px 0 14px' }}>
        <Opcion compacta activa={p.estrella} onClick={() => marcar('estrella')}>★ Colaborador privilegiado</Opcion>
        {!menor && <Opcion compacta activa={p.me_cuesta} onClick={() => marcar('me_cuesta')}>Me cuesta</Opcion>}
      </div>

      {p.primario ? <FichaContenido persona={p} miPrimario={temp?.primario} /> : (
        <p style={{ ...parrafo, color: INK, borderTop: `1px solid ${LINE}`, paddingTop: 14 }}>{textoSinResultado(p.nombre)}</p>
      )}

      <div style={{ borderTop: `1px solid ${LINE}`, padding: '14px 0 4px' }}>
        <div style={{ ...eyebrow, color: MUTED, marginBottom: 8 }}>Lo que he visto de {p.nombre}</div>
        {observaciones.length === 0 && <p style={{ ...parrafo, fontSize: 14 }}>Aún no has anotado ninguna reacción.</p>}
        {observaciones.map((o) => (
          <div key={o.id} style={{ display: 'flex', gap: 10, alignItems: 'baseline', padding: '8px 0', borderTop: `1px dashed ${LINE}` }}>
            <span style={{ fontFamily: FONT_SANS, fontSize: 12.5, color: MUTED, minWidth: 64 }}>{new Date(o.creado_en).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}</span>
            <span style={{ flex: 1, fontFamily: FONT_SANS, fontSize: 14.5, color: INK }}>
              {TEXTO_SITUACION[o.situacion]}: <strong>{o.palabra.toLowerCase()}</strong>
              {o.linea && <span style={{ display: 'block', fontFamily: FONT_SERIF, fontStyle: 'italic', fontSize: 16, color: MUTED }}>«{o.linea}»</span>}
            </span>
            <BorrarConfirmando texto="Borrar" confirmar="" onBorrar={() => borrarObs(o.id)} />
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 16 }}>
        <button type="button" style={botonSobreClaro} onClick={() => onObservar(p)}>Anotar una reacción</button>
        {p.estado !== 'confirmado' && <button type="button" style={botonContorno} onClick={() => onRehacer(p)}>{p.primario ? 'Rehacer el test' : 'Hacer el test'}</button>}
      </div>
      <div style={{ marginTop: 18 }}>
        <BorrarConfirmando texto="Borrar esta ficha" confirmar={`Se borrará la ficha de ${p.nombre} y todo lo anotado.`} onBorrar={borrarFicha} />
      </div>
    </section>
  );
}
