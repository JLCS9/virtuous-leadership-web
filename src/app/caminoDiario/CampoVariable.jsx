// Campo de una variable del Camino. Las variables de persona se eligen SOLO entre las fichas de «Tu
// entorno» (si no hay ninguna del grupo, se invita a añadirla); el resto, texto libre. Solo pinta: el
// valor y la ficha elegida los lleva quien lo usa.
import { LocalLink as Link, useT } from '../../i18n';
import { TEXTO_GRUPO } from '../../lib/personas.js';
import { INK, LINE, MUTED, NAVY, PAPER, FONT_BODY } from '../../theme';
import { botonContorno } from '../estilos';
import { Avatar } from '../personas/comun';

export default function CampoVariable({ variable, personas = [], valor, personaId, etiqueta, onCambiar }) {
  const { t } = useT();

  if (variable.persona) {
    // Las variables de persona con grupo ofrecen las fichas de ese grupo; sin grupo, todas.
    const candidatas = personas.filter((p) => !variable.grupo || p.grupo === variable.grupo);
    return (
      <div style={{ display: 'grid', gap: 14 }}>
        {candidatas.length > 0 ? (
          <div role="group" aria-label={etiqueta ?? t('camino.campo.elige_ficha')} style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {candidatas.map((p) => {
              const activa = personaId === p.id;
              return (
                <button
                  key={p.id} type="button" aria-pressed={activa}
                  onClick={() => onCambiar(activa ? { valor: '', personaId: null } : { valor: p.nombre, personaId: p.id })}
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: 10, padding: '8px 18px 8px 8px', borderRadius: 0, cursor: 'pointer',
                    border: `1px solid ${activa ? NAVY : LINE}`, background: activa ? NAVY : PAPER, color: activa ? PAPER : INK,
                    fontFamily: FONT_BODY, fontSize: 18, fontWeight: 600, minHeight: 48,
                  }}
                >
                  <Avatar persona={p} tam={34} />{p.nombre}
                </button>
              );
            })}
          </div>
        ) : (
          <p style={{ fontFamily: FONT_BODY, fontSize: 18, lineHeight: 1.5, color: MUTED, margin: 0 }}>
            {variable.grupo ? t('camino.campo.sin_personas_grupo', { grupo: TEXTO_GRUPO[variable.grupo] ?? variable.grupo }) : t('camino.campo.sin_personas')}
          </p>
        )}
        {/* Un valor antiguo escrito a mano, de antes de que se eligiera de «Tu entorno». */}
        {!personaId && valor && (
          <p style={{ fontFamily: FONT_BODY, fontSize: 16, lineHeight: 1.5, color: MUTED, margin: 0 }}>{t('camino.campo.sin_ficha', { valor })}</p>
        )}
        <div><Link to="/app/personas/nueva" style={{ ...botonContorno, fontSize: 16, padding: '12px 20px' }}>{t('camino.campo.anadir')}</Link></div>
      </div>
    );
  }

  return (
    <div style={{ display: 'grid', gap: 6 }}>
      <input
        id={`campo-${variable.id}`} type="text" maxLength={120} value={valor} aria-label={etiqueta}
        onChange={(e) => onCambiar({ valor: e.target.value, personaId: null })}
        style={{
          fontFamily: FONT_BODY, fontSize: 18, color: INK, background: '#fff', border: `1px solid ${LINE}`, borderRadius: 0,
          padding: '14px 16px', minHeight: 52, width: '100%', boxSizing: 'border-box',
        }}
      />
      <span style={{ fontFamily: FONT_BODY, fontSize: 16, color: MUTED }}>{t('camino.campo.ejemplo', { ejemplo: variable.ejemplo })}</span>
    </div>
  );
}
