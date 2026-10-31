// Gráfica de las seis virtudes a partir del test de carácter: radar + barras. SVG, sin librerías.
import { GOLD_DEEP, INK, LINE, MUTED, FONT_SANS } from '../theme';
import { VIRTUDES, etapa, geometriaRadar } from '../lib/virtudes.js';

const TAMANO = 400;

export function VirtudesRadar({ valores }) {
  const g = geometriaRadar(valores, { tamano: TAMANO, margen: 94 });
  const puntos = g.poligono.map((p) => p.join(',')).join(' ');
  const resumen = VIRTUDES.map((v) => `${v.nombre} ${Math.round(valores[v.clave])} %`).join(', ');
  return (
    <svg viewBox={`0 0 ${TAMANO} ${TAMANO}`} role="img" aria-label={`Gráfica de tus virtudes: ${resumen}`}
         style={{ width: '100%', maxWidth: 400, display: 'block', margin: '0 auto' }}>
      {g.anillos.map((anillo, i) => (
        <polygon key={i} points={anillo.map((p) => p.join(',')).join(' ')} fill="none" stroke={LINE} strokeWidth={i === 3 ? 1.4 : 1} />
      ))}
      {g.ejes.map((e) => <line key={e.clave} x1={g.centro} y1={g.centro} x2={e.fin[0]} y2={e.fin[1]} stroke={LINE} strokeWidth="1" />)}
      <polygon points={puntos} fill="rgba(197,165,90,0.30)" stroke={GOLD_DEEP} strokeWidth="2.2" strokeLinejoin="round" />
      {g.poligono.map(([x, y], i) => <circle key={i} cx={x} cy={y} r="4.2" fill={GOLD_DEEP} stroke="#FBF8F1" strokeWidth="1.5" />)}
      {g.ejes.map((e, i) => {
        const [x, y] = e.etiqueta;
        const ancla = x < g.centro - 8 ? 'end' : x > g.centro + 8 ? 'start' : 'middle';
        const v = VIRTUDES[i];
        return (
          <text key={e.clave} x={x} y={y} textAnchor={ancla} fontFamily={FONT_SANS} fill={INK}>
            <tspan x={x} dy="-0.2em" fontSize="13" fontWeight="600">{v.corta}</tspan>
            <tspan x={x} dy="1.35em" fontSize="12" fill={MUTED}>{Math.round(valores[v.clave])} %</tspan>
          </text>
        );
      })}
    </svg>
  );
}

export function VirtudesBarras({ valores }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      {VIRTUDES.map((v) => {
        const valor = Math.round(valores[v.clave]);
        const e = etapa(valor);
        return (
          <div key={v.clave}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', fontFamily: FONT_SANS, fontSize: 14, color: INK, marginBottom: 6 }}>
              <span style={{ fontWeight: 600 }}>{v.nombre}</span>
              <span style={{ color: MUTED, fontSize: 13 }}>{e.texto} · {valor} %</span>
            </div>
            <div style={{ height: 8, borderRadius: 999, background: 'rgba(27,42,74,0.09)', overflow: 'hidden' }} role="presentation">
              <div style={{ width: `${valor}%`, height: '100%', borderRadius: 999, background: v.color, transition: 'width 600ms ease' }} />
            </div>
          </div>
        );
      })}
    </div>
  );
}
