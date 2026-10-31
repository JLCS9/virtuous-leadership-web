// Lógica pura de las virtudes y del resultado del test de carácter para el panel. Sin React ni red.
//
// El test de carácter guarda en `test_results` (kind='character'), con la misma forma que la app
// móvil de Virtus:  result = { self: { magnanimidad, humildad, prudencia, fortaleza, dominio,
// justicia }  (porcentajes 0–100),  facets: { <virtud>: { passive, active } } | null }.

// Orden alrededor de la gráfica: primero las dos del corazón, luego las cuatro cardinales.
export const VIRTUDES = [
  { clave: 'magnanimidad', nombre: 'Magnanimidad', corta: 'Magnanimidad', codigo: 'M', color: '#9D8240' },
  { clave: 'humildad',     nombre: 'Humildad',     corta: 'Humildad',     codigo: 'H', color: '#1B2A4A' },
  { clave: 'prudencia',    nombre: 'Prudencia',    corta: 'Prudencia',    codigo: 'P', color: '#6B7A90' },
  { clave: 'fortaleza',    nombre: 'Fortaleza',    corta: 'Fortaleza',    codigo: 'C', color: '#6B7A90' },
  { clave: 'dominio',      nombre: 'Dominio de sí', corta: 'Dominio',     codigo: 'S', color: '#6B7A90' },
  { clave: 'justicia',     nombre: 'Justicia',     corta: 'Justicia',     codigo: 'J', color: '#6B7A90' },
];

// Umbrales del test de carácter (los mismos que characterScoring.js y la app): <40 bajo, <70 moderado.
export function etapa(porcentaje) {
  if (porcentaje < 40) return { clave: 'bajo', texto: 'Por construir' };
  if (porcentaje < 70) return { clave: 'moderado', texto: 'En camino' };
  return { clave: 'alto', texto: 'Muy presente' };
}

/** Normaliza el `result` guardado: {valores:{virtud:%}, facetas} o null si no sirve. */
export function resultadoCaracter(result) {
  const self = result?.self;
  if (!self || typeof self !== 'object') return null;
  const valores = {};
  for (const v of VIRTUDES) {
    const n = Number(self[v.clave]);
    if (!Number.isFinite(n)) return null;
    valores[v.clave] = Math.min(100, Math.max(0, n));
  }
  return { valores, facetas: result.facets && typeof result.facets === 'object' ? result.facets : null };
}

/** La virtud más y menos desarrollada (para el resumen en una frase). */
export function extremos(valores) {
  const orden = VIRTUDES.map((v) => ({ ...v, valor: valores[v.clave] })).sort((a, b) => b.valor - a.valor);
  return { mayor: orden[0], menor: orden[orden.length - 1] };
}

/**
 * Geometría de la gráfica de radar. Eje 0 arriba, en el sentido de las agujas del reloj.
 * Devuelve el polígono de los valores, los anillos de referencia y la posición de las etiquetas.
 */
export function geometriaRadar(valores, { tamano = 320, margen = 64 } = {}) {
  const c = tamano / 2;
  const radio = c - margen;
  const n = VIRTUDES.length;
  const punto = (i, fraccion) => {
    const ang = -Math.PI / 2 + (2 * Math.PI * i) / n;
    return [round(c + radio * fraccion * Math.cos(ang)), round(c + radio * fraccion * Math.sin(ang))];
  };
  return {
    centro: c,
    radio,
    ejes: VIRTUDES.map((v, i) => ({ clave: v.clave, fin: punto(i, 1), etiqueta: punto(i, 1.22) })),
    anillos: [0.25, 0.5, 0.75, 1].map((f) => VIRTUDES.map((_, i) => punto(i, f))),
    poligono: VIRTUDES.map((v, i) => punto(i, (valores[v.clave] ?? 0) / 100)),
  };
}

const round = (x) => Math.round(x * 100) / 100;

/** 'COL-SAN' desde un resultado de temperamento de la web ({profileKey}) o de la app ({type}). */
export function claveTemperamento(result) {
  const clave = result?.profileKey ?? result?.type ?? null;
  return typeof clave === 'string' && /^(COL|MEL|SAN|FLE)(-(COL|MEL|SAN|FLE))?$/.test(clave) ? clave : null;
}

/** Valores para guardar el resultado del test de carácter de la web con la forma de la app. */
export function resultadoParaGuardar(puntuacion) {
  // `puntuacion` es lo que devuelve scoreCharacter: {P,C,S,J,M,H}, cada uno {global, passive, active}.
  const porCodigo = Object.fromEntries(VIRTUDES.map((v) => [v.codigo, v.clave]));
  const self = {};
  const facets = {};
  for (const [codigo, clave] of Object.entries(porCodigo)) {
    const p = puntuacion?.[codigo];
    if (!p || !Number.isFinite(p.global)) return null;
    self[clave] = Math.round(p.global);
    facets[clave] = { passive: round(p.passive), active: round(p.active) };
  }
  return { self, facets };
}
