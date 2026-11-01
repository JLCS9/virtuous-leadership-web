// «¿Con quién?»: primero tus fichas, luego los grupos («Alguien de mi familia»…). Lo elige el usuario,
// nunca la app. El valor es 'p:<id>' para una ficha, o la clave del grupo.
import { CON_QUIEN } from '../../lib/camino.js';
import { claveFicha, idDeClave } from '../../lib/personas.js';
import { INK, LINE, NAVY, PAPER, FONT_SANS } from '../../theme';
import { Opcion, Opciones } from '../camino/ui';
import { Avatar } from './comun';

const TEXTO_CON_QUIEN = Object.fromEntries([...CON_QUIEN, ['solo', 'Solo']]);

/** Texto para mostrar un «con quién» guardado: el nombre de la ficha o el grupo. */
export function textoConQuien(clave, porId = {}) {
  const id = idDeClave(clave);
  if (id) return porId[id]?.nombre ?? 'Una persona';
  return TEXTO_CON_QUIEN[clave] ?? clave;
}

export default function EligeQuien({ personas = [], valor, onElegir, extra = [], conmutar = false }) {
  const elegir = (v) => onElegir(conmutar && valor === v ? null : v);
  return (
    <div style={{ display: 'grid', gap: 10 }}>
      {personas.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {personas.map((p) => {
            const v = claveFicha(p.id);
            const activa = valor === v;
            return (
              <button key={p.id} type="button" aria-pressed={activa} onClick={() => elegir(v)}
                      style={{
                        display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 14px 6px 6px', borderRadius: 999, cursor: 'pointer',
                        border: `1px solid ${activa ? NAVY : LINE}`, background: activa ? NAVY : PAPER, color: activa ? PAPER : INK,
                        fontFamily: FONT_SANS, fontSize: 15, fontWeight: 600,
                      }}>
                <Avatar persona={p} tam={32} />{p.nombre}
              </button>
            );
          })}
        </div>
      )}
      <Opciones>
        {[...CON_QUIEN, ...extra].map(([v, texto]) => <Opcion key={v} compacta={personas.length > 0} activa={valor === v} onClick={() => elegir(v)}>{texto}</Opcion>)}
      </Opciones>
    </div>
  );
}
