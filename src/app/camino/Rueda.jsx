// La rueda de los cuatro temperamentos con tu posición (C, CM, MC, M…): se ilumina tu cuadrante y
// aparece tu punto. Se usa en el día 1.
import { RUEDA } from '../../lib/camino.js';
import { PAPER, TEMP_COLORS, FONT_SANS } from '../../theme';

const T = 240;
const C = T / 2;
const R = 100;
const rad = (g) => (g * Math.PI) / 180;
const punto = (g, r) => [C + r * Math.cos(rad(g)), C + r * Math.sin(rad(g))];

function sector(i) {
  const a0 = -90 + 90 * i;
  const [x0, y0] = punto(a0, R);
  const [x1, y1] = punto(a0 + 90, R);
  return `M${C},${C} L${x0},${y0} A${R},${R} 0 0 1 ${x1},${y1} Z`;
}

/** Ángulo de tu posición: el centro del cuadrante del primario, desplazado hacia el secundario. */
function angulo(primario, secundario) {
  const i = RUEDA.indexOf(primario);
  const centro = -45 + 90 * i;
  const j = RUEDA.indexOf(secundario);
  if (j === (i + 1) % 4) return centro + 28;
  if (j === (i + 3) % 4) return centro - 28;
  return centro;
}

export default function Rueda({ primario, secundario, nombres }) {
  const [px, py] = punto(angulo(primario, secundario), R * 0.78);
  return (
    <svg viewBox={`0 0 ${T} ${T}`} width="100%" style={{ maxWidth: 280, display: 'block', margin: '0 auto' }} role="img"
         aria-label={`Tu posición en la rueda: ${nombres[primario]}${secundario ? ` y ${nombres[secundario]}` : ''}`}>
      <style>{`
        @keyframes vl-ilumina { from { opacity: .18 } to { opacity: 1 } }
        @keyframes vl-punto { 0% { transform: scale(0) } 70% { transform: scale(1.25) } 100% { transform: scale(1) } }
        @media (prefers-reduced-motion: reduce) { .vl-rueda-anim { animation: none !important; } }
      `}</style>
      {RUEDA.map((k, i) => {
        const activo = k === primario || k === secundario;
        const [lx, ly] = punto(-45 + 90 * i, R * 0.47);
        return (
          <g key={k}>
            <path d={sector(i)} fill={TEMP_COLORS[k]} stroke={PAPER} strokeWidth="2"
                  className={activo ? 'vl-rueda-anim' : undefined}
                  style={{ opacity: activo ? (k === primario ? 1 : 0.7) : 0.18, animation: activo ? 'vl-ilumina 900ms ease both' : undefined }} />
            <text x={lx} y={ly} textAnchor="middle" dominantBaseline="central" fontFamily={FONT_SANS} fontSize="10.5" fontWeight="700" fill={activo ? PAPER : TEMP_COLORS[k]}>
              {nombres[k]}
            </text>
          </g>
        );
      })}
      <circle cx={C} cy={C} r={R * 0.22} fill={PAPER} />
      <g style={{ transformOrigin: `${px}px ${py}px`, animation: 'vl-punto 600ms 700ms ease both' }} className="vl-rueda-anim">
        <circle cx={px} cy={py} r="11" fill={PAPER} />
        <circle cx={px} cy={py} r="6" fill="#1B2A4A" />
      </g>
    </svg>
  );
}
