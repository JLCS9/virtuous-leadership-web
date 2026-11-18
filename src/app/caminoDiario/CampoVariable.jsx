// Campo de una variable del Camino: una persona de «Tu entorno» o texto libre. Solo pinta: el valor
// y la ficha elegida los lleva quien lo usa. Escribir a mano quita la ficha elegida.
import { useT } from '../../i18n';
import { INK, LINE, MUTED, NAVY, PAPER, FONT_BODY } from '../../theme';
import { Avatar } from '../personas/comun';

export default function CampoVariable({ variable, personas = [], valor, personaId, etiqueta, onCambiar }) {
  const { t } = useT();
  // Las variables de persona con grupo ofrecen las fichas de ese grupo; sin grupo, todas.
  const candidatas = variable.persona ? personas.filter((p) => !variable.grupo || p.grupo === variable.grupo) : [];

  return (
    <div style={{ display: 'grid', gap: 14 }}>
      {candidatas.length > 0 && (
        <div role="group" aria-label={t('camino.campo.elige_ficha')} style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
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
      )}
      <div style={{ display: 'grid', gap: 6 }}>
        {candidatas.length > 0 && (
          <label htmlFor={`campo-${variable.id}`} style={{ fontFamily: FONT_BODY, fontSize: 16, color: MUTED }}>{t('camino.campo.otra_persona')}</label>
        )}
        <input
          id={`campo-${variable.id}`} type="text" maxLength={120} value={valor} aria-label={candidatas.length ? undefined : etiqueta}
          onChange={(e) => onCambiar({ valor: e.target.value, personaId: null })}
          style={{
            fontFamily: FONT_BODY, fontSize: 18, color: INK, background: '#fff', border: `1px solid ${LINE}`, borderRadius: 0,
            padding: '14px 16px', minHeight: 52, width: '100%', boxSizing: 'border-box',
          }}
        />
        <span style={{ fontFamily: FONT_BODY, fontSize: 16, color: MUTED }}>{t('camino.campo.ejemplo', { ejemplo: variable.ejemplo })}</span>
      </div>
    </div>
  );
}
