// «Lo que Virtus sabe de ti»: las variables con las que se personalizan los retos, editables cuando
// cambie la vida del usuario. Sin respuesta, el reto usa el texto por defecto de la biblioteca.
import { useState } from 'react';
import { guardarVariable } from '../../account/caminoDiario';
import biblioteca from '../../data/camino-biblioteca.json';
import { useT } from '../../i18n';
import { valoresDe } from '../../lib/retos.js';
import { FONT_BODY, INK, LINE, MUTED, botonContorno, botonSobreClaro, eyebrow, parrafo, tarjeta } from '../tokens';
import CampoVariable from './CampoVariable';

export default function MisVariables({ variables, personas, userId, onCambio }) {
  const { t } = useT();
  const [editando, setEditando] = useState(null); // { id, valor, personaId }
  const [estado, setEstado] = useState(null); // null · 'guardando' · 'error'
  const valores = valoresDe(variables, personas.porId);
  const filaDe = (id) => variables.find((v) => v.variable === id);

  async function guardar() {
    setEstado('guardando');
    try {
      await guardarVariable(userId, { variable: editando.id, valor: editando.valor, personaId: editando.personaId, origen: 'manual' });
    } catch {
      setEstado('error');
      return;
    }
    setEstado(null);
    setEditando(null);
    onCambio();
  }

  return (
    <section style={tarjeta} aria-label={t('camino.pagina.variables.titulo')}>
      <div style={eyebrow}>{t('camino.pagina.variables.titulo')}</div>
      <p style={{ ...parrafo, fontSize: 16, margin: '10px 0 6px' }}>{t('camino.pagina.variables.intro')}</p>
      <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
        {biblioteca.variables.map((v) => {
          const abierta = editando?.id === v.id;
          return (
            <li key={v.id} style={{ borderTop: `1px solid ${LINE}`, padding: '14px 0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontFamily: FONT_BODY, fontSize: 16, color: MUTED }}>{v.descripcion}</div>
                  <div style={{ fontFamily: FONT_BODY, fontSize: 16, color: valores[v.id] ? INK : MUTED }}>
                    {valores[v.id] ?? t('camino.pagina.variables.sin_respuesta')}
                  </div>
                </div>
                {!abierta && (
                  <button type="button" style={botonContorno}
                          onClick={() => setEditando({ id: v.id, valor: valores[v.id] ?? '', personaId: filaDe(v.id)?.persona_id ?? null })}>
                    {t('camino.pagina.variables.cambiar')}
                  </button>
                )}
              </div>
              {abierta && (
                <div style={{ marginTop: 12, display: 'grid', gap: 14 }}>
                  <CampoVariable variable={v} personas={personas.lista} etiqueta={v.descripcion} valor={editando.valor} personaId={editando.personaId}
                                 onCambiar={({ valor, personaId }) => setEditando({ id: v.id, valor, personaId })} />
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
                    <button type="button" disabled={estado === 'guardando'} onClick={guardar} style={botonSobreClaro}>{t('camino.pagina.variables.guardar')}</button>
                    <button type="button" onClick={() => { setEditando(null); setEstado(null); }} style={botonContorno}>{t('camino.pagina.variables.cancelar')}</button>
                  </div>
                  {estado === 'error' && <p role="alert" style={{ ...parrafo, fontSize: 16, color: '#9b1c1c' }}>{t('camino.error_guardar')}</p>}
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
}
