// childPersonalize.js — Motor de personalización del test de niños.
//
// Banco unificado 6-17 y multi-idioma (ES/EN/FR/RU): cada ítem tiene UN solo
// `template` con posibles placeholders para resolver en tiempo de render:
//
//   1. Contexto por edad: {6-11: ejemplo escolar | 12-17: ejemplo adolescente}
//      Resuelto según ctx.set ('A' = 6-11, 'B' = 12-17).
//
//   2. Género: {X/Y} → X si masculino, Y si femenino.
//      Patrón genérico, válido en cualquier idioma:
//        ES: {él/ella}, {el/la}, {los/las}, {o/a}, {os/as}
//        EN: {he/she}, {his/her}, {him/her}, {himself/herself}
//        FR: {il/elle}, {le/la}, {lui/elle}, {ami/amie}, {silencieux/silencieuse}
//        RU: {он/она}, {его/её}, {ему/ей}, {сам/сама}
//      'X' (sexo no especificado) cae a la forma masculina.
//
//   3. Inyección de nombre (opcional, controlada por el motor — NO en plantilla)
//      Sólo se inyecta en ítems concretos (NAME_INJECTION_IDS) para no
//      saturar el test repitiendo el nombre en las 48 preguntas.
//
// Orden de resolución: GÉNERO → edad → inyección de nombre. (Antes era
// edad primero; cambió para soportar EN/FR/RU, donde un placeholder de
// género suele vivir dentro del contenido de la franja de edad — p.ej.
// '{6-11: cuando {he/she} juega ...}'. Si se resolviera la edad primero,
// el regex se confundiría con el `}` de '{he/she}'. Resolviendo género
// primero, esos placeholders desaparecen antes de procesar la edad.)
// El resultado es idéntico al orden anterior cuando los placeholders no
// se anidan (caso ES actual), así que es backward-compat.

// ──────────────────────────── edad ────────────────────────────

// Captura {6-11: ... | 12-17: ...}. Los textos internos pueden contener
// comas, guiones, paréntesis, etc., pero no `|` ni `}` (que sirven de
// delimitadores). Si en el futuro se quieren placeholders de edad anidados
// con placeholders de género, habría que reescribir como parser real;
// hoy los datos no anidan (gender placeholders viven FUERA de los age).
const AGE_PLACEHOLDER_RE = /\{6-11:\s*([^|}]*?)\s*\|\s*12-17:\s*([^}]*?)\s*\}/g;

/**
 * Resuelve los placeholders de contexto por edad.
 * @param {string} template
 * @param {'A'|'B'} ageGroup — A=6-11, B=12-17.
 */
export function applyAgeContext(template, ageGroup) {
  if (typeof template !== 'string') return '';
  const useChildVariant = ageGroup === 'A';
  return template.replace(AGE_PLACEHOLDER_RE, (_, p611, p1217) => {
    return useChildVariant ? p611 : p1217;
  });
}

// ──────────────────────────── género ────────────────────────────

// Regex genérica: captura {X/Y} donde X e Y no pueden contener `{`, `}`,
// `|` (reservados por el motor de edad) ni `/` (delimitador interno).
// Funciona para cualquier idioma — la forma correcta vive ya en el JSON
// del idioma, no en un mapa hardcodeado por idioma. Captura no-greedy
// para procesar múltiples placeholders independientemente.
const GENDER_PLACEHOLDER_RE = /\{([^|{}/]+?)\/([^|{}/]+?)\}/g;

/**
 * Aplica los placeholders de género a un texto.
 *   sex === 'F' → forma femenina (segunda mitad).
 *   sex === 'M' o 'X' o cualquier otro → forma masculina (primera mitad).
 * Lang-agnostic: el contenido del idioma vive en el JSON, no aquí.
 * @param {string} template
 * @param {'M'|'F'|'X'} sex
 */
export function applyGender(template, sex) {
  if (typeof template !== 'string') return '';
  const useFem = sex === 'F';
  return template.replace(GENDER_PLACEHOLDER_RE, (_, mascForm, femForm) =>
    useFem ? femForm : mascForm
  );
}

// ──────────────────────────── inyección de nombre ────────────────────────

// IDs donde inyectamos el nombre del niño/a (1 por bloque temperamental
// de Stage 1). Configurable: edita esta lista para cambiar dónde aparece
// el nombre durante el test.
export const NAME_INJECTION_IDS = new Set(['COL1', 'SAN1', 'MEL1', 'FLE1']);

function tidyName(name) {
  if (typeof name !== 'string') return '';
  const trimmed = name.trim();
  if (!trimmed) return '';
  return trimmed[0].toUpperCase() + trimmed.slice(1);
}

/**
 * Prefijo "Nombre, " + texto con primera letra minúscula.
 */
function prefixWithName(name, text) {
  if (!name || !text) return text;
  const lowered = text[0].toLowerCase() + text.slice(1);
  return `${name}, ${lowered}`;
}

// ──────────────────────────── render principal ───────────────────────────

/**
 * Renderiza un ítem del test resolviendo género, edad e inyección de
 * nombre en orden. (El orden GÉNERO primero permite que un placeholder
 * {X/Y} viva dentro del contenido de un placeholder de edad sin que el
 * regex de edad se confunda con el `}` interno.)
 *
 * @param {object} item   — del JSON: { id, template, ... }
 * @param {object} ctx    — { set: 'A'|'B', sex: 'M'|'F'|'X', name?: string }
 * @returns {string}
 */
export function renderItem(item, ctx) {
  if (!item || !item.template) return '';
  const set = ctx.set === 'B' ? 'B' : 'A';
  const sex = ctx.sex || 'M';

  // 1. Género primero (no-op si el template no tiene {X/Y}).
  let text = applyGender(item.template, sex);

  // 2. Contexto por edad sobre el texto ya con género resuelto.
  text = applyAgeContext(text, set);

  // 3. Inyección de nombre en ítems-objetivo
  const cleanName = tidyName(ctx.name);
  if (cleanName && NAME_INJECTION_IDS.has(item.id)) {
    text = prefixWithName(cleanName, text);
  }
  return text;
}
