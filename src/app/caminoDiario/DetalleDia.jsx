// Resumen de un día pasado: el reto (aceptado/completado), los hábitos marcados y la reflexión
// de la noche. Se muestra debajo de la tira de días al pulsar un día.
import biblioteca from '../../data/camino-biblioteca.json';
import { useT } from '../../i18n';
import { fechaCorta } from '../../lib/camino.js';
import { FONT_BODY, GOLD_REF, INK, LINE, MUTED, NAVY, PAPER, eyebrow, parrafo } from '../tokens';
import { IconoCheck } from '../Iconos';

const RETOS = Object.fromEntries(biblioteca.retos.map((r) => [r.id, r]));
const primeraMayuscula = (s) => s.charAt(0).toUpperCase() + s.slice(1);

function Bloque({ titulo, children }) {
  return (
    <div style={{ flex: '1 1 200px', minWidth: 0 }}>
      <div style={{ fontFamily: FONT_BODY, fontSize: 11.5, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', color: MUTED, marginBottom: 6 }}>{titulo}</div>
      {children}
    </div>
  );
}

export default function DetalleDia({ dia, habitos, marcas }) {
  const { t } = useT();
  if (!dia) return null;

  const reto = RETOS[dia.reto_id];
  const habitosDelDia = habitos?.filter((h) => h.estado === 'activo' || h.estado === 'consolidado') ?? [];
  const marcasDelDia = marcas?.filter((m) => m.fecha === dia.fecha) ?? [];
  const marcadosIds = new Set(marcasDelDia.map((m) => m.habito_id));

  return (
    <div className="vl-entra" style={{ background: 'rgba(27,42,74,0.03)', borderRadius: 12, padding: '14px 16px', marginTop: 6 }}>
      <div style={{ fontFamily: FONT_BODY, fontSize: 13, fontWeight: 600, color: NAVY, marginBottom: 10 }}>
        {primeraMayuscula(fechaCorta(dia.fecha))}
      </div>

      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
        <Bloque titulo="Reto">
          {reto ? (
            <div>
              <div style={{ fontFamily: FONT_BODY, fontSize: 14, fontWeight: 600, color: INK, lineHeight: 1.4 }}>{reto.consigna}</div>
              {dia.texto && <div style={{ fontFamily: FONT_BODY, fontSize: 13.5, color: INK, marginTop: 3 }}>{dia.texto}</div>}
              <div style={{ fontFamily: FONT_BODY, fontSize: 13, color: dia.cumplido ? GOLD_REF : MUTED, fontWeight: 600, marginTop: 4 }}>
                {dia.cumplido ? t(`camino.noche.cumplidos.${dia.cumplido}`) : t('camino.pagina.historial.sin_examen')}
              </div>
            </div>
          ) : (
            <div style={{ fontFamily: FONT_BODY, fontSize: 13.5, color: MUTED }}>Sin reto</div>
          )}
        </Bloque>

        {habitosDelDia.length > 0 && (
          <Bloque titulo="Hábitos">
            <div style={{ display: 'grid', gap: 3 }}>
              {habitosDelDia.map((h) => {
                const marcado = marcadosIds.has(h.id);
                return (
                  <div key={h.id} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ width: 18, height: 18, borderRadius: 4, display: 'grid', placeItems: 'center', background: marcado ? NAVY : 'transparent', border: marcado ? `1px solid ${NAVY}` : `1.5px solid ${LINE}` }}>
                      {marcado && <IconoCheck width={12} height={12} />}
                    </span>
                    <span style={{ fontFamily: FONT_BODY, fontSize: 13.5, color: marcado ? INK : MUTED }}>{h.texto}</span>
                  </div>
                );
              })}
            </div>
          </Bloque>
        )}

        {dia.reflexion && (
          <Bloque titulo="Reflexión">
            <div style={{ fontFamily: FONT_BODY, fontSize: 13.5, fontStyle: 'italic', color: INK, lineHeight: 1.5 }}>«{dia.reflexion}»</div>
          </Bloque>
        )}
      </div>
    </div>
  );
}
