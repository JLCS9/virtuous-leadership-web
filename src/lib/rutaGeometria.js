// Geometría del camino dibujado: el tramo en «S» entre dos bloques y un punto a una distancia dada
// sobre él. Pura, sin React. Los puntos son {x, y} en unidades del dibujo.

const MUESTRAS = 64;

// Una curva de Bézier cúbica en «S» de `a` a `b`: sale vertical de `a` y llega vertical a `b`.
const bezier = (a, b, t) => {
  const medio = (a.y + b.y) / 2;
  const u = 1 - t;
  return {
    x: u * u * u * a.x + 3 * u * u * t * a.x + 3 * u * t * t * b.x + t * t * t * b.x,
    y: u * u * u * a.y + 3 * u * u * t * medio + 3 * u * t * t * medio + t * t * t * b.y,
  };
};

/** Trazo SVG del tramo completo. */
export const dTramo = (a, b) => {
  const medio = (a.y + b.y) / 2;
  return `M ${a.x} ${a.y} C ${a.x} ${medio}, ${b.x} ${medio}, ${b.x} ${b.y}`;
};

// Puntos del tramo con la distancia acumulada hasta cada uno, para medir por longitud y no por `t`.
function muestrear(a, b) {
  const puntos = [];
  const acumulada = [];
  let total = 0;
  for (let i = 0; i <= MUESTRAS; i += 1) {
    const p = bezier(a, b, i / MUESTRAS);
    if (i > 0) total += Math.hypot(p.x - puntos[i - 1].x, p.y - puntos[i - 1].y);
    puntos.push(p);
    acumulada.push(total);
  }
  return { puntos, acumulada, total };
}

/** Longitud del tramo. */
export const longitudTramo = (a, b) => muestrear(a, b).total;

/** El punto a `distancia` del principio del tramo (se queda entre 0 y la longitud). */
export function puntoEnTramo(a, b, distancia) {
  const { puntos, acumulada, total } = muestrear(a, b);
  const d = Math.min(Math.max(distancia, 0), total);
  const i = acumulada.findIndex((x) => x >= d);
  if (i <= 0) return puntos[0];
  const antes = acumulada[i - 1];
  const f = acumulada[i] === antes ? 0 : (d - antes) / (acumulada[i] - antes);
  return { x: puntos[i - 1].x + f * (puntos[i].x - puntos[i - 1].x), y: puntos[i - 1].y + f * (puntos[i].y - puntos[i - 1].y) };
}

/** Trazo SVG del principio del tramo hasta `distancia`: el trozo ya recorrido. */
export function dParcial(a, b, distancia) {
  const { puntos, acumulada, total } = muestrear(a, b);
  const d = Math.min(Math.max(distancia, 0), total);
  const hasta = puntos.filter((_, i) => acumulada[i] <= d);
  const fin = puntoEnTramo(a, b, d);
  return `M ${a.x} ${a.y}` + [...hasta.slice(1), fin].map((p) => ` L ${p.x.toFixed(2)} ${p.y.toFixed(2)}`).join('');
}
