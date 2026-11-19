// La tira de días: tu racha, qué día es hoy y los días alrededor. Un día con reto aceptado muestra
// su % de progreso como llenado circular (dorado completo = 100 %). Solo pinta: los datos vienen ya.
import { useT } from '../../i18n';
import { fechaCorta } from '../../lib/camino.js';
import { INK, LINE, MUTED, NAVY, PAPER, FONT_BODY, FONT_SLAB, GOLD_REF, GOLD_REF_DK } from '../tokens';

const primeraMayuscula = (s) => s.charAt(0).toUpperCase() + s.slice(1);

function BolaProgreso({ progreso, esHoy, futuro, dia, hecho, tam = 32 }) {
  const r = (tam - 3) / 2;
  const circ = 2 * Math.PI * r;
  const pct = Math.max(0, Math.min(1, progreso ?? 0));
  const completo = pct >= 1;

  if (futuro) {
    return (
      <span style={{ width: tam, maxWidth: tam, aspectRatio: '1 / 1', borderRadius: '50%', display: 'grid', placeItems: 'center', boxSizing: 'border-box', fontFamily: FONT_BODY, fontSize: 13, fontWeight: 700, color: 'rgba(107,107,107,0.6)', border: `1.5px dashed ${LINE}`, background: 'transparent' }}>
        {dia}
      </span>
    );
  }

  if (!hecho && pct === 0) {
    return (
      <span style={{ width: tam, maxWidth: tam, aspectRatio: '1 / 1', borderRadius: '50%', display: 'grid', placeItems: 'center', boxSizing: 'border-box', fontFamily: FONT_BODY, fontSize: 13, fontWeight: 700, color: esHoy ? PAPER : INK, background: esHoy ? NAVY : 'transparent', border: esHoy ? 'none' : `1.5px solid ${LINE}` }}>
        {dia}
      </span>
    );
  }

  return (
    <span style={{ width: tam, maxWidth: tam, aspectRatio: '1 / 1', position: 'relative', display: 'grid', placeItems: 'center' }}>
      <svg viewBox={`0 0 ${tam} ${tam}`} style={{ position: 'absolute', inset: 0, transform: 'rotate(-90deg)' }}>
        <circle cx={tam / 2} cy={tam / 2} r={r} fill="none" stroke={completo ? 'none' : 'rgba(197,165,90,0.18)'} strokeWidth={2.5} />
        {pct > 0 && (
          <circle cx={tam / 2} cy={tam / 2} r={r} fill={completo ? GOLD_REF : 'none'} stroke={GOLD_REF} strokeWidth={2.5}
            strokeDasharray={circ} strokeDashoffset={circ * (1 - pct)} strokeLinecap="round"
            style={{ transition: 'stroke-dashoffset 400ms ease' }} />
        )}
      </svg>
      <span style={{ position: 'relative', fontFamily: FONT_BODY, fontSize: 13, fontWeight: 700, color: completo ? PAPER : GOLD_REF_DK }}>
        {dia}
      </span>
    </span>
  );
}

export default function TiraDeDias({ tira, racha, hoy, diaSeleccionado, onSelectDia }) {
  const { t } = useT();
  const textoRacha = racha === 0 ? t('camino.tira.racha_cero') : racha === 1 ? t('camino.tira.racha_uno') : t('camino.tira.racha', { n: racha });

  return (
    <div style={{ margin: '10px 0 14px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 10, flexWrap: 'wrap', marginBottom: 12 }}>
        <div style={{ fontFamily: FONT_SLAB, fontSize: 18, fontWeight: 700, color: NAVY }}>
          <span aria-hidden style={{ marginRight: 6 }}>🔥</span>{textoRacha}
        </div>
        <div style={{ fontFamily: FONT_BODY, fontSize: 14, color: MUTED }}>{t('camino.tira.hoy_es', { fecha: fechaCorta(hoy) })}</div>
      </div>

      <ol aria-label={t('camino.tira.aria')} style={{ listStyle: 'none', margin: 0, padding: 0, display: 'grid', gridTemplateColumns: `repeat(${tira.length}, minmax(0, 1fr))`, gap: 2 }}>
        {tira.map((d) => {
          const esHoy = d.posicion === 'hoy';
          const futuro = d.posicion === 'futuro';
          const seleccionado = diaSeleccionado === d.fecha;
          const clicable = !futuro && onSelectDia;
          const fecha = primeraMayuscula(fechaCorta(d.fecha));
          return (
            <li
              key={d.fecha} aria-current={esHoy ? 'date' : undefined}
              aria-label={esHoy ? t('camino.tira.aria_hoy', { fecha: fechaCorta(d.fecha) }) : t(d.hecho ? 'camino.tira.aria_hecho' : 'camino.tira.aria_sin', { fecha })}
              onClick={clicable ? () => onSelectDia(seleccionado ? null : d.fecha) : undefined}
              style={{ display: 'grid', justifyItems: 'center', gap: 4, padding: '6px 0', cursor: clicable ? 'pointer' : 'default', background: seleccionado ? 'rgba(197,165,90,0.22)' : esHoy ? 'rgba(197,165,90,0.16)' : 'transparent', borderBottom: seleccionado ? `3px solid ${NAVY}` : esHoy ? `3px solid ${GOLD_REF}` : '3px solid transparent', borderRadius: '6px 6px 0 0' }}
            >
              <span aria-hidden style={{ fontFamily: FONT_BODY, fontSize: 12, fontWeight: 600, color: seleccionado ? NAVY : esHoy ? GOLD_REF_DK : MUTED }}>{t(`camino.tira.dias.${d.diaSemana}`)}</span>
              <BolaProgreso progreso={d.progreso ?? (d.hecho ? 1 : 0)} esHoy={esHoy} futuro={futuro} dia={d.dia} hecho={d.hecho} />
            </li>
          );
        })}
      </ol>
    </div>
  );
}
