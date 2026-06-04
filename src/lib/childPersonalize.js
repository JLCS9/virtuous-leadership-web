// childPersonalize.js — Motor de personalización del test de niños.
//
// Banco unificado 6-17: cada ítem tiene UN solo `template` con posibles
// placeholders para resolver en tiempo de render:
//
//   1. Contexto por edad: {6-11: ejemplo escolar | 12-17: ejemplo adolescente}
//      Resuelto según ctx.set ('A' = 6-11, 'B' = 12-17).
//
//   2. Género: {él/ella}, {el/la}, {los/las}, {o/a}, {os/as}
//      Resuelto según ctx.sex ('M' = masculino, 'F' = femenino;
//      'X' u otros caen a masculino RAE genérico).
//
//   3. Inyección de nombre (opcional, controlada por el motor — NO en plantilla)
//      Sólo se inyecta en ítems concretos (NAME_INJECTION_IDS) para no
//      saturar el test repitiendo el nombre en las 48 preguntas.
//
// Orden de resolución: edad → género → inyección de nombre. Las
// substituciones se hacen sobre la misma string secuencialmente.

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

// Mapa por sexo de las 5 variantes soportadas.
// 'X' (no especificado) → mismas formas que masculino.
const FORMS = {
  M: { 'él/ella': 'él',   'el/la': 'el', 'los/las': 'los', 'o/a': 'o', 'os/as': 'os' },
  F: { 'él/ella': 'ella', 'el/la': 'la', 'los/las': 'las', 'o/a': 'a', 'os/as': 'as' },
  X: { 'él/ella': 'él',   'el/la': 'el', 'los/las': 'los', 'o/a': 'o', 'os/as': 'os' },
};

// Regex que captura cualquiera de las 5 variantes de género.
// Las claves más largas van primero para evitar que 'el/la' se confunda
// con 'él/ella'.
const GENDER_PLACEHOLDER_RE = /\{(él\/ella|los\/las|el\/la|os\/as|o\/a)\}/g;

/**
 * Aplica los placeholders de género a un texto.
 * @param {string} template
 * @param {'M'|'F'|'X'} sex
 */
export function applyGender(template, sex) {
  if (typeof template !== 'string') return '';
  const forms = FORMS[sex] || FORMS.M;
  return template.replace(GENDER_PLACEHOLDER_RE, (_, key) => forms[key] || '');
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
 * Renderiza un ítem del test resolviendo edad, género y opcional inyección
 * de nombre en orden.
 *
 * @param {object} item   — del JSON: { id, template, ... }
 * @param {object} ctx    — { set: 'A'|'B', sex: 'M'|'F'|'X', name?: string }
 * @returns {string}
 */
export function renderItem(item, ctx) {
  if (!item || !item.template) return '';
  const set = ctx.set === 'B' ? 'B' : 'A';
  const sex = ctx.sex || 'M';

  // 1. Contexto por edad
  let text = applyAgeContext(item.template, set);

  // 2. Género (no-op si el template no tiene placeholders de género)
  text = applyGender(text, sex);

  // 3. Inyección de nombre en ítems-objetivo
  const cleanName = tidyName(ctx.name);
  if (cleanName && NAME_INJECTION_IDS.has(item.id)) {
    text = prefixWithName(cleanName, text);
  }
  return text;
}
