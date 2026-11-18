// El camino de las virtudes dibujado: una senda con curvas que baja por un paisaje suave. Empieza por
// la virtud-desafío; el tramo ya recorrido se pinta de dorado y un viajero marca dónde estás. Lo que
// aún no toca queda tras la niebla, con candado y sin nombre: solo se ve el nombre de donde estás.
// Sin plazos en pantalla. Solo pinta: los bloques ya vienen de lib/rutaVirtudes.js.
import { LocalLink as Link, useT } from '../../i18n';
import { dParcial, dTramo, longitudTramo, puntoEnTramo } from '../../lib/rutaGeometria.js';
import { progresoDeLaRuta } from '../../lib/rutaVirtudes.js';
import { LINE, NAVY, PAPER, FONT_BODY, FONT_SLAB, GOLD_REF, GOLD_REF_DK } from '../../theme';
import { botonSobreClaro, eyebrow, parrafo, tarjeta, titulo } from '../estilos';

// Geometría del dibujo, en unidades del viewBox (se escala al ancho disponible). El viewBox es estrecho a
// propósito: en un móvil se escala poco y el texto sigue siendo legible (≥16 px).
const ANCHO = 320;
const PASO = 150; // distancia vertical entre bloques
const MARGEN = 64; // hasta el centro del primer bloque
const RADIO = 34;
const X = [76, 244]; // los bloques van en zigzag entre la izquierda y la derecha
const punto = (i) => ({ x: X[i % 2], y: MARGEN + i * PASO });

const CAMINO = { borde: '#C9C1AB', firme: '#ECE7D8', rayas: '#BDB59F' };
const RECORRIDO = { borde: GOLD_REF, firme: '#F3E7B8', rayas: GOLD_REF_DK };

function Arbol({ x, y, escala = 1 }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${escala})`} aria-hidden>
      <rect x="-2.5" y="6" width="5" height="14" rx="2" fill="#A89B7E" />
      <circle cx="0" cy="-2" r="13" fill="#9DB08B" />
      <circle cx="-8" cy="6" r="9" fill="#8FA47D" />
      <circle cx="8" cy="6" r="9" fill="#A6B795" />
    </g>
  );
}

function Candado({ x, y }) {
  return (
    <g transform={`translate(${x - 11} ${y - 13})`} fill="none" stroke="#8B8472" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <rect x="2" y="11" width="18" height="14" rx="2" fill="#8B8472" stroke="none" />
      <path d="M6 11V8a5 5 0 0 1 10 0v3" />
    </g>
  );
}

function Nodo({ bloque, i, nombre, t }) {
  const { x, y } = punto(i);
  const { estado } = bloque;
  const derecha = x < ANCHO / 2; // el texto va hacia el lado con más sitio
  const tx = derecha ? x + RADIO + 12 : x - RADIO - 12;
  const ancla = derecha ? 'start' : 'end';
  const visible = estado === 'actual' || estado === 'completada'; // solo se ve el nombre de donde estás

  const relleno = estado === 'bloqueada' ? LINE : estado === 'disponible' ? PAPER : NAVY;
  const borde = estado === 'bloqueada' ? '#BDB6A4' : estado === 'disponible' ? NAVY : GOLD_REF;
  const marca = estado === 'completada' ? '✓' : String(i + 1);

  return (
    <g>
      {estado === 'actual' && <circle className="vl-ruta-halo" cx={x} cy={y} r={RADIO + 9} fill={GOLD_REF} opacity="0.22" />}
      <circle cx={x} cy={y} r={RADIO} fill={relleno} stroke={borde} strokeWidth={estado === 'actual' ? 4 : 3} />
      {estado === 'bloqueada'
        ? <Candado x={x} y={y} />
        : <text x={x} y={y + 9} textAnchor="middle" fontFamily={FONT_SLAB} fontWeight="700" fontSize="28" fill={estado === 'disponible' ? NAVY : PAPER}>{marca}</text>}
      {visible && (
        <>
          <text x={tx} y={y - 6} textAnchor={ancla} fontFamily={FONT_SLAB} fontWeight="700" fontSize="26" fill={NAVY}>{nombre}</text>
          <text x={tx} y={y + 20} textAnchor={ancla} fontFamily={FONT_BODY} fontWeight="600" fontSize="20" fill={GOLD_REF_DK}>
            {estado === 'actual' ? t('camino.ruta.desafio') : t('camino.ruta.completada')}
          </text>
        </>
      )}
    </g>
  );
}

export default function RutaVirtudes({ bloques }) {
  const { t } = useT();
  const nombre = (virtud) => t(`camino.habitos.virtudes.${virtud}`);

  if (!bloques.length) {
    return (
      <section style={tarjeta} aria-label={t('camino.ruta.titulo')}>
        <div style={eyebrow}>{t('camino.ruta.eyebrow')}</div>
        <p style={{ ...parrafo, margin: '12px 0 16px' }}>{t('camino.ruta.sin_test')}</p>
        <Link to="/tests/temperamento" style={botonSobreClaro}>{t('camino.ruta.hacer_test')}</Link>
      </section>
    );
  }

  const puntos = bloques.map((_, i) => punto(i));
  const alto = MARGEN * 2 + (bloques.length - 1) * PASO - 14;

  // El viajero va por el primer tramo, de un borde de bloque al del siguiente.
  const { fraccion } = progresoDeLaRuta(bloques);
  const [a, b] = [puntos[0], puntos[1]];
  const recorrido = RADIO + fraccion * (longitudTramo(a, b) - 2 * RADIO);
  const viajero = puntoEnTramo(a, b, recorrido);
  const tramoRecorrido = fraccion >= 1 ? dTramo(a, b) : dParcial(a, b, recorrido);

  const actual = bloques.find((x) => x.estado === 'actual') ?? bloques.find((x) => x.estado === 'completada');
  const arboles = bloques.slice(0, -1).flatMap((_, k) => {
    const y = MARGEN + k * PASO + PASO / 2;
    return [{ x: 26, y: y - 6, escala: 1 }, { x: 294, y: y + 12, escala: 0.85 }, { x: 52, y: y + 40, escala: 0.6 }];
  });

  return (
    <section style={{ ...tarjeta, position: 'relative' }} aria-label={t('camino.ruta.titulo')}>
      <div style={eyebrow}>{t('camino.ruta.eyebrow')}</div>
      <h2 style={{ ...titulo(28), margin: '10px 0 6px' }}>{t('camino.ruta.titulo')}</h2>
      <p style={{ ...parrafo, fontSize: 18, marginBottom: 8 }}>{t('camino.ruta.intro')}</p>

      <svg
        viewBox={`0 0 ${ANCHO} ${alto}`} role="img" style={{ display: 'block', width: '100%', maxWidth: 420, margin: '0 auto', height: 'auto', border: `1px solid ${LINE}` }}
        aria-label={t(actual.estado === 'completada' ? 'camino.ruta.resumen_completada' : 'camino.ruta.resumen', { nombre: nombre(actual.virtud) })}
      >
        <style>{`
          .vl-ruta-halo, .vl-ruta-viajero { transform-box: fill-box; transform-origin: center; animation: vl-ruta-pulso 2.4s ease-in-out infinite; }
          @keyframes vl-ruta-pulso { 0%, 100% { transform: scale(1); opacity: 0.3; } 50% { transform: scale(1.35); opacity: 0.08; } }
          @media (prefers-reduced-motion: reduce) { .vl-ruta-halo, .vl-ruta-viajero { animation: none; } }
        `}</style>
        <defs>
          <linearGradient id="vl-ruta-suelo" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor={PAPER} />
            <stop offset="1" stopColor="#F1EDDF" />
          </linearGradient>
          <linearGradient id="vl-ruta-niebla" gradientUnits="userSpaceOnUse" x1="0" y1={viajero.y + 50} x2="0" y2={viajero.y + 330}>
            <stop offset="0" stopColor={PAPER} stopOpacity="0" />
            <stop offset="1" stopColor={PAPER} stopOpacity="0.78" />
          </linearGradient>
        </defs>

        {/* El paisaje: suelo, lomas suaves y árboles. */}
        <rect x="0" y="0" width={ANCHO} height={alto} fill="url(#vl-ruta-suelo)" />
        <g fill="#EEE8D6" aria-hidden>
          <ellipse cx="-24" cy="210" rx="96" ry="64" />
          <ellipse cx="346" cy="420" rx="100" ry="72" />
          <ellipse cx="-18" cy="640" rx="92" ry="66" />
          <ellipse cx="344" cy="800" rx="96" ry="64" />
        </g>
        {arboles.map((ar) => <Arbol key={`${ar.x}-${ar.y}`} {...ar} />)}

        {/* La senda: borde, firme y línea discontinua; dorada hasta donde has llegado. */}
        {puntos.slice(0, -1).map((p, k) => {
          const d = dTramo(p, puntos[k + 1]);
          return (
            <g key={k} fill="none" strokeLinecap="round" aria-hidden>
              <path d={d} stroke={CAMINO.borde} strokeWidth="26" />
              <path d={d} stroke={CAMINO.firme} strokeWidth="19" />
              <path d={d} stroke={CAMINO.rayas} strokeWidth="2.5" strokeDasharray="2 11" />
            </g>
          );
        })}
        {fraccion > 0 && (
          <g fill="none" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <path d={tramoRecorrido} stroke={RECORRIDO.borde} strokeWidth="26" />
            <path d={tramoRecorrido} stroke={RECORRIDO.firme} strokeWidth="19" />
            <path d={tramoRecorrido} stroke={RECORRIDO.rayas} strokeWidth="2.5" strokeDasharray="2 11" />
          </g>
        )}

        {bloques.map((bl, i) => <Nodo key={bl.virtud} bloque={bl} i={i} nombre={nombre(bl.virtud)} t={t} />)}

        {/* Lo que aún no toca queda tras la niebla. */}
        <rect x="0" y={viajero.y + 50} width={ANCHO} height={alto} fill="url(#vl-ruta-niebla)" pointerEvents="none" />

        {/* El viajero: dónde estás en el camino. */}
        <g transform={`translate(${viajero.x} ${viajero.y})`} aria-hidden>
          <circle className="vl-ruta-viajero" r="17" fill={GOLD_REF} opacity="0.3" />
          <circle r="10" fill={GOLD_REF} stroke="#fff" strokeWidth="3.5" />
        </g>
      </svg>

      {/* Lo mismo para quien no ve el dibujo, sin desvelar las virtudes que aún no toca. */}
      <ol style={{ position: 'absolute', width: 1, height: 1, overflow: 'hidden', clip: 'rect(0 0 0 0)', margin: -1, padding: 0 }}>
        <li>{nombre(actual.virtud)}: {t(actual.estado === 'completada' ? 'camino.ruta.completada' : 'camino.ruta.desafio')}</li>
        <li>{t('camino.ruta.otras_cerradas')}</li>
      </ol>
    </section>
  );
}
