// Cierres de semana: día 7 (tus reacciones, mapa del camino, sobre sellado) y día 14 (primer espejo,
// tu semana, con quién has hecho el reto, mapa de mis personas y relectura de tu punto de partida).
// Resumen + 1 pregunta.
import { useState } from 'react';
import {
  CIERRE_14, CIERRE_7, PALABRA_TEMPERAMENTO, PUNTO_PARTIDA, SEMANA_DEL_TEMPERAMENTO,
  fechaCorta, fechaDelDia, resumenSemana1,
} from '../../lib/camino.js';
import { GOLD, INK, LINE, MUTED, NAVY, PAPER, TEMP_COLORS, FONT_SANS, FONT_SERIF } from '../../theme';
import { eyebrow, parrafo } from '../estilos';
import { useCatalogo } from '../useFormacion';
import { Continuar, useNombres, useTemperamento } from './Juegos';
import { Opcion, Opciones, Pantalla } from './ui';
import { idDeClave } from '../../lib/personas.js';
import { MapaPersonas } from '../personas/comun';
import { textoConQuien } from '../personas/EligeQuien';

function Bloque({ titulo, children }) {
  return (
    <div style={{ borderTop: `1px solid ${LINE}`, padding: '18px 0 4px' }}>
      <div style={{ ...eyebrow, color: MUTED, marginBottom: 10 }}>{titulo}</div>
      {children}
    </div>
  );
}

const chip = (color, texto) => (
  <span key={texto} style={{ display: 'inline-flex', alignItems: 'center', gap: 7, fontFamily: FONT_SANS, fontSize: 13.5, color: INK, padding: '6px 12px 6px 10px', borderRadius: 999, background: 'rgba(27,42,74,0.06)' }}>
    <span style={{ width: 9, height: 9, borderRadius: '50%', background: color }} />{texto}
  </span>
);

const cifra = (n, texto) => (
  <div key={texto} style={{ textAlign: 'center' }}>
    <div style={{ fontFamily: FONT_SERIF, fontSize: 34, fontWeight: 700, color: NAVY, lineHeight: 1 }}>{n}</div>
    <div style={{ fontFamily: FONT_SANS, fontSize: 12.5, color: MUTED, marginTop: 4 }}>{texto}</div>
  </div>
);

// ───────────── Día 7 ─────────────

export function Cierre7({ camino, personas, onFin }) {
  const temp = useTemperamento();
  const nombres = useNombres();
  const cat = useCatalogo();
  const [encajan, setEncajan] = useState(null);
  const { porDia, perfil } = camino;

  // Las palabras del examen, agrupadas por color de temperamento (el temperamento no se nombra).
  const palabras = [1, 2, 3, 4, 5, 6].map((d) => porDia[d]?.examen?.palabra).filter(Boolean);
  const grupos = ['COL', 'MEL', 'SAN', 'FLE'].map((k) => [k, palabras.filter((p) => PALABRA_TEMPERAMENTO[p] === k)]).filter(([, ps]) => ps.length);
  const semanaTuya = SEMANA_DEL_TEMPERAMENTO[temp?.primario];
  const curso1 = cat.cursos?.find((c) => c.numero === 1);

  return (
    <Pantalla etiqueta="Día 7 · Cierre de la semana"
      pie={<Continuar disabled={!encajan} onClick={() => onFin({ encajan, palabras })}>Cerrar la semana</Continuar>}>
      <h2 style={{ fontFamily: FONT_SERIF, fontSize: 28, fontWeight: 700, color: NAVY, margin: '12px 0 16px' }}>Tu primera semana</h2>

      <Bloque titulo={CIERRE_7.reacciones}>
        {grupos.length === 0 ? (
          <p style={parrafo}>Esta semana no has anotado reacciones en el examen de la noche.</p>
        ) : (
          <div style={{ display: 'grid', gap: 8 }}>
            {grupos.map(([k, ps]) => <div key={k} style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>{ps.map((p, j) => <span key={`${p}${j}`}>{chip(TEMP_COLORS[k], p)}</span>)}</div>)}
          </div>
        )}
      </Bloque>

      <Bloque titulo={CIERRE_7.encajan}>
        <Opciones columnas={3}>
          {CIERRE_7.encajanOpciones.map(([v, texto]) => <Opcion key={v} compacta activa={encajan === v} onClick={() => setEncajan(v)}>{texto}</Opcion>)}
        </Opciones>
        {encajan === 'no' && <p className="vl-entra" style={{ ...parrafo, color: INK, marginTop: 12 }}>{CIERRE_7.encajanNo}</p>}
      </Bloque>

      <Bloque titulo="El mapa de tu camino">
        <div style={{ display: 'grid', gap: 4 }}>
          {Array.from({ length: 10 }, (_, s) => {
            const tuya = s === semanaTuya;
            const titulo = curso1?.lecciones.find((l) => l.id === `1.${s}`)?.titulo;
            return (
              <div key={s} style={{ display: 'flex', gap: 10, alignItems: 'baseline', padding: '7px 10px', borderRadius: 10, background: tuya ? 'rgba(197,165,90,0.16)' : s <= 1 ? 'rgba(27,42,74,0.05)' : 'transparent', border: tuya ? `1px solid ${GOLD}` : '1px solid transparent' }}>
                <span style={{ fontFamily: FONT_SANS, fontSize: 12.5, fontWeight: 700, color: s === 0 ? NAVY : MUTED, minWidth: 70 }}>Semana {s}{s === 0 ? ' ✓' : ''}</span>
                <span style={{ fontFamily: FONT_SANS, fontSize: 14, color: INK }}>
                  {tuya ? <strong>Tu lección{temp?.primario ? `: ${nombres[temp.primario].toLowerCase()}` : ''}</strong> : titulo ?? ''}
                </span>
              </div>
            );
          })}
        </div>
      </Bloque>

      <Bloque titulo="Sobre sellado">
        <div style={{ display: 'flex', gap: 14, alignItems: 'center', padding: 14, borderRadius: 14, background: NAVY, color: PAPER }}>
          <span aria-hidden style={{ fontSize: 30 }}>✉️</span>
          <span style={{ fontFamily: FONT_SERIF, fontSize: 19 }}>{CIERRE_7.sobre}</span>
        </div>
      </Bloque>

      <Bloque titulo="Tus personas">
        <p style={{ ...parrafo, color: INK }}>
          Llevas {personas?.lista.length ?? 0} {personas?.lista.length === 1 ? 'ficha' : 'fichas'}. {CIERRE_7.personas}
        </p>
      </Bloque>

      <Bloque titulo="Próximo paso">
        <p style={{ ...parrafo, color: INK }}>{CIERRE_7.avance(fechaCorta(fechaDelDia(perfil.inicio, 8)))}</p>
      </Bloque>
    </Pantalla>
  );
}

// ───────────── Día 14 ─────────────

export function Cierre14({ camino, personas, onFin }) {
  const { porDia, perfil, lineaBase, racha } = camino;
  const [espejo, setEspejo] = useState(null);
  const [enQue, setEnQue] = useState('');
  const [lectura, setLectura] = useState({}); // fallo | me_ven | me_gustaria → 'T' | 'C'
  const semana = resumenSemana1(porDia);

  const grupos = {};
  for (const d of [8, 9, 10, 11, 12, 13]) {
    const q = porDia[d]?.examen?.con_quien ?? porDia[d]?.con_quien;
    if (q && q !== 'solo') grupos[q] = (grupos[q] ?? 0) + 1;
  }
  const respuestasBase = lineaBase ? [
    ['fallo', PUNTO_PARTIDA.fallo.pregunta, PUNTO_PARTIDA.fallo.opciones.find(([v]) => v === lineaBase.fallo)?.[1]],
    ['me_ven', PUNTO_PARTIDA.me_ven.pregunta, lineaBase.me_ven?.join(', ')],
    ['me_gustaria', PUNTO_PARTIDA.me_gustaria.pregunta, lineaBase.me_gustaria?.join(', ')],
  ].filter(([, , r]) => r) : [];

  return (
    <Pantalla etiqueta="Día 14 · Cierre: primer espejo"
      pie={<Continuar disabled={!espejo} onClick={() => onFin({ espejo, en_que: enQue.trim() || null, lectura, semana })}>Cerrar la semana</Continuar>}>
      <h2 style={{ fontFamily: FONT_SERIF, fontSize: 28, fontWeight: 700, color: NAVY, margin: '12px 0 16px' }}>Tu primer espejo</h2>

      <Bloque titulo={CIERRE_14.espejo}>
        <Opciones columnas={2}>
          {[['si', 'Sí'], ['no', 'No']].map(([v, texto]) => <Opcion key={v} compacta activa={espejo === v} onClick={() => setEspejo(v)}>{texto}</Opcion>)}
        </Opciones>
        {espejo === 'si' && (
          <div className="vl-entra" style={{ marginTop: 12 }}>
            <label htmlFor="espejo-en-que" style={{ fontFamily: FONT_SANS, fontSize: 13.5, fontWeight: 600, color: INK }}>{CIERRE_14.espejoEnQue} <span style={{ fontWeight: 400, color: MUTED }}>(opcional)</span></label>
            <textarea id="espejo-en-que" value={enQue} maxLength={280} rows={2} onChange={(e) => setEnQue(e.target.value)}
                      style={{ width: '100%', marginTop: 6, fontFamily: FONT_SANS, fontSize: 16, padding: 12, borderRadius: 12, border: `1px solid ${LINE}`, color: INK, background: '#fff', resize: 'vertical' }} />
          </div>
        )}
      </Bloque>

      <Bloque titulo="Tu semana">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: 8 }}>
          {cifra(semana.contado, 'se lo contaste')}
          {cifra(semana.reconocieron, 'te reconocieron')}
          {cifra(semana.retos, 'retos hechos')}
          {cifra(racha, racha === 1 ? 'día de racha' : 'días de racha')}
        </div>
      </Bloque>

      <Bloque titulo="Con quién has hecho el reto">
        {Object.keys(grupos).length === 0 ? (
          <p style={parrafo}>Esta semana no has anotado con quién hiciste el reto.</p>
        ) : (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {Object.entries(grupos).map(([g, n]) => chip(TEMP_COLORS[personas?.porId[idDeClave(g)]?.primario] ?? NAVY, `${textoConQuien(g, personas?.porId)} · ${n}`))}
          </div>
        )}
      </Bloque>

      <Bloque titulo="El mapa de mis personas">
        {personas?.lista.length ? <MapaPersonas personas={personas.lista} /> : (
          <p style={parrafo}>Aún no tienes fichas. Crea la de alguien cercano desde «Mis personas», en tu camino.</p>
        )}
      </Bloque>

      {respuestasBase.length > 0 && (
        <Bloque titulo={`Tu punto de partida · ${CIERRE_14.lineaBase}`}>
          <div style={{ display: 'grid', gap: 12 }}>
            {respuestasBase.map(([clave, pregunta, respuesta]) => (
              <div key={clave}>
                <div style={{ fontFamily: FONT_SANS, fontSize: 12.5, color: MUTED }}>{pregunta}</div>
                <div style={{ fontFamily: FONT_SERIF, fontSize: 19, color: INK, margin: '2px 0 8px' }}>{respuesta}</div>
                <Opciones columnas={2}>
                  {[['T', 'Temperamento'], ['C', 'Carácter']].map(([v, texto]) => (
                    <Opcion key={v} compacta activa={lectura[clave] === v} onClick={() => setLectura((l) => ({ ...l, [clave]: v }))}>{texto}</Opcion>
                  ))}
                </Opciones>
              </div>
            ))}
          </div>
          {lineaBase.linea && <p style={{ ...parrafo, fontStyle: 'italic', marginTop: 12 }}>Tu línea: «{lineaBase.linea}»</p>}
        </Bloque>
      )}

      <Bloque titulo="Próximo paso">
        <p style={{ ...parrafo, color: INK }}>{CIERRE_14.avance(fechaCorta(fechaDelDia(perfil.inicio, 15)))}</p>
      </Bloque>
    </Pantalla>
  );
}
