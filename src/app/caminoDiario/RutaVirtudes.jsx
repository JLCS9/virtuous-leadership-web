// El camino de las seis virtudes dibujado con curvas: un bloque por virtud, empezando por la
// virtud-desafío. Las demás están bloqueadas hasta pasar un mes con ella. Solo pinta: los bloques
// ya vienen calculados de lib/rutaVirtudes.js.
import { LocalLink as Link, useT } from '../../i18n';
import { INK, LINE, MUTED, NAVY, PAPER, FONT_BODY, FONT_SLAB, GOLD_REF, GOLD_REF_DK } from '../../theme';
import { botonSobreClaro, eyebrow, parrafo, tarjeta, titulo } from '../estilos';

// Geometría del dibujo, en unidades del viewBox (se escala al ancho disponible).
// El viewBox es estrecho a propósito: en un móvil se escala poco y el texto sigue siendo legible (≥16 px).
const ANCHO = 320;
const PASO = 140; // distancia vertical entre bloques
const MARGEN = 56; // hasta el centro del primer bloque
const RADIO = 34;
const X = [76, 244]; // los bloques van en zigzag entre la izquierda y la derecha

const punto = (i) => ({ x: X[i % 2], y: MARGEN + i * PASO });

// Un tramo de camino de un bloque al siguiente: una «S» suave.
function tramo(a, b) {
  const medio = (a.y + b.y) / 2;
  return `M ${a.x} ${a.y} C ${a.x} ${medio}, ${b.x} ${medio}, ${b.x} ${b.y}`;
}

function Candado({ x, y, color }) {
  return (
    <g transform={`translate(${x - 11} ${y - 13})`} fill="none" stroke={color} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <rect x="2" y="11" width="18" height="14" rx="2" fill={color} stroke="none" />
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
  const circunferencia = 2 * Math.PI * (RADIO + 6);
  const avance = bloque.dia / bloque.total;

  const fondo = estado === 'bloqueada' ? LINE : estado === 'disponible' ? PAPER : NAVY;
  const borde = estado === 'bloqueada' ? '#BDB6A4' : estado === 'disponible' ? NAVY : GOLD_REF;
  const contenido = estado === 'bloqueada' ? null : estado === 'completada' ? '✓' : String(i + 1);
  const colorNumero = estado === 'disponible' ? NAVY : PAPER;

  const detalle = {
    actual: bloque.dia > 0 ? t('camino.ruta.dia', { dia: bloque.dia, total: bloque.total }) : t('camino.ruta.empieza'),
    completada: t('camino.ruta.completada'),
    bloqueada: bloque.faltan === 1 ? t('camino.ruta.se_abre_uno') : t('camino.ruta.se_abre', { n: bloque.faltan }),
    disponible: t('camino.ruta.disponible'),
  }[estado];

  return (
    <g>
      {estado === 'actual' && (
        <>
          <circle cx={x} cy={y} r={RADIO + 6} fill="none" stroke="rgba(27,42,74,0.14)" strokeWidth="5" />
          <circle
            cx={x} cy={y} r={RADIO + 6} fill="none" stroke={GOLD_REF} strokeWidth="5" strokeLinecap="round"
            strokeDasharray={`${circunferencia * avance} ${circunferencia}`} transform={`rotate(-90 ${x} ${y})`}
          />
        </>
      )}
      <circle cx={x} cy={y} r={RADIO} fill={fondo} stroke={borde} strokeWidth="3" />
      {contenido && (
        <text x={x} y={y + 9} textAnchor="middle" fontFamily={FONT_SLAB} fontWeight="700" fontSize="28" fill={colorNumero}>{contenido}</text>
      )}
      {estado === 'bloqueada' && <Candado x={x} y={y} color="#8B8472" />}

      <text x={tx} y={y - 8} textAnchor={ancla} fontFamily={FONT_SLAB} fontWeight="700" fontSize="25" fill={estado === 'bloqueada' ? MUTED : NAVY}>{nombre}</text>
      {estado === 'actual' && (
        <text x={tx} y={y + 15} textAnchor={ancla} fontFamily={FONT_BODY} fontWeight="600" fontSize="20" fill={GOLD_REF_DK}>{t('camino.ruta.desafio')}</text>
      )}
      <text x={tx} y={y + (estado === 'actual' ? 39 : 18)} textAnchor={ancla} fontFamily={FONT_BODY} fontSize="20" fill={estado === 'bloqueada' ? MUTED : INK}>{detalle}</text>
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

  const alto = MARGEN * 2 + (bloques.length - 1) * PASO - 20;

  return (
    <section style={{ ...tarjeta, position: 'relative' }} aria-label={t('camino.ruta.titulo')}>
      <div style={eyebrow}>{t('camino.ruta.eyebrow')}</div>
      <h2 style={{ ...titulo(28), margin: '10px 0 6px' }}>{t('camino.ruta.titulo')}</h2>
      <p style={{ ...parrafo, fontSize: 18, marginBottom: 8 }}>{t('camino.ruta.intro')}</p>

      <svg
        viewBox={`0 0 ${ANCHO} ${alto}`} role="img" aria-label={t('camino.ruta.resumen', { primera: nombre(bloques[0].virtud), ultima: nombre(bloques[bloques.length - 1].virtud) })}
        style={{ display: 'block', width: '100%', maxWidth: 420, margin: '0 auto', height: 'auto' }}
      >
        {/* El camino: un borde, el firme y la línea discontinua del centro; dorado hasta donde ya se ha llegado. */}
        {bloques.slice(0, -1).map((b, i) => {
          const d = tramo(punto(i), punto(i + 1));
          const recorrido = b.estado === 'completada';
          return (
            <g key={b.virtud} fill="none" strokeLinecap="round">
              <path d={d} stroke={recorrido ? GOLD_REF : '#CFC8B4'} strokeWidth="24" />
              <path d={d} stroke={recorrido ? '#E7D9A5' : '#E8E3D5'} strokeWidth="18" />
              <path d={d} stroke={recorrido ? GOLD_REF : '#C2BBA6'} strokeWidth="3" strokeDasharray="2 12" />
            </g>
          );
        })}
        {bloques.map((b, i) => <Nodo key={b.virtud} bloque={b} i={i} nombre={nombre(b.virtud)} t={t} />)}
      </svg>

      {/* Lo mismo para quien no ve el dibujo. */}
      <ol style={{ position: 'absolute', width: 1, height: 1, overflow: 'hidden', clip: 'rect(0 0 0 0)', margin: -1, padding: 0 }}>
        {bloques.map((b) => <li key={b.virtud}>{nombre(b.virtud)}: {t(`camino.ruta.${b.estado === 'actual' ? 'desafio' : b.estado}`)}</li>)}
      </ol>
    </section>
  );
}
