// childPersonalize.js — Motor de personalización del test de niños.
//
// Resuelve dos cosas sobre una plantilla:
//   1. Placeholders de género: {él/ella}, {el/la}, {los/las}, {o/a}, {os/as}.
//   2. Inyección opcional del nombre del niño/a en ítems concretos.
//
// El nombre NO está en las plantillas — el motor lo añade como prefijo en
// los ítems marcados como "puntos de inyección". Eso da personalización
// percibida sin saturar el test (48 preguntas con el nombre cansa).
//
// Si sex === 'X' (no especificado), se usa la forma masculina (genérico RAE).

// ──────────────────────────── placeholders ───────────────────────────────

// Mapa por sexo de las 5 variantes soportadas.
// 'X' (no especificado) → mismas formas que masculino.
const FORMS = {
  M: { 'él/ella': 'él',   'el/la': 'el', 'los/las': 'los', 'o/a': 'o', 'os/as': 'os' },
  F: { 'él/ella': 'ella', 'el/la': 'la', 'los/las': 'las', 'o/a': 'a', 'os/as': 'as' },
  X: { 'él/ella': 'él',   'el/la': 'el', 'los/las': 'los', 'o/a': 'o', 'os/as': 'os' },
};

// Regex que captura cualquiera de las 5 variantes.
// Las claves más largas van primero para evitar que 'el/la' se confunda
// con 'él/ella' (el segundo lleva tilde de todos modos, pero por si acaso).
const PLACEHOLDER_RE = /\{(él\/ella|los\/las|el\/la|os\/as|o\/a)\}/g;

/**
 * Aplica los placeholders de género a un texto.
 * @param {string} template
 * @param {'M'|'F'|'X'} sex
 */
export function applyGender(template, sex) {
  if (typeof template !== 'string') return '';
  const forms = FORMS[sex] || FORMS.M;
  return template.replace(PLACEHOLDER_RE, (_, key) => forms[key] || '');
}

// ──────────────────────────── inyección de nombre ────────────────────────

// IDs donde inyectamos el nombre del niño/a (1 por bloque temperamental
// de Stage 1). Si más adelante quieres más/menos, edita esta lista — el
// resto del motor lo respeta automáticamente.
export const NAME_INJECTION_IDS = new Set(['COL1', 'SAN1', 'MEL1', 'FLE1']);

/**
 * Capitaliza la primera letra (sin lower-casear el resto, así "MARÍA"
 * queda como "MARÍA" — respeta lo que el padre escribió). Trim por seguridad.
 */
function tidyName(name) {
  if (typeof name !== 'string') return '';
  const trimmed = name.trim();
  if (!trimmed) return '';
  return trimmed[0].toUpperCase() + trimmed.slice(1);
}

/**
 * Inserta el nombre al principio de la frase, en minúscula la inicial del
 * texto original (porque ahora viene tras el nombre, ya no es comienzo de
 * oración). Mantiene el resto tal cual.
 *
 * Ejemplos:
 *   prefixWithName('María', 'En grupos de niños, suele ser la que…')
 *     → 'María, en grupos de niños, suele ser la que…'
 *   prefixWithName('Juan', 'Cuando algo le molesta, se le nota en la cara…')
 *     → 'Juan, cuando algo le molesta, se le nota en la cara…'
 */
function prefixWithName(name, text) {
  if (!name || !text) return text;
  // Baja la primera letra del texto original (era inicio de frase).
  const lowered = text[0].toLowerCase() + text.slice(1);
  return `${name}, ${lowered}`;
}

// ──────────────────────────── render principal ───────────────────────────

/**
 * Renderiza un ítem del test según el set, el sexo, y opcionalmente
 * inyectando el nombre del niño/a.
 *
 * @param {object} item    — del JSON: { id, templates: {A,B}, personalize: {A,B}, ... }
 * @param {object} ctx     — { set: 'A'|'B', sex: 'M'|'F'|'X', name?: string }
 * @returns {string}
 */
export function renderItem(item, ctx) {
  if (!item || !item.templates) return '';
  const set = ctx.set === 'B' ? 'B' : 'A';
  const sex = ctx.sex || 'M';
  const template = item.templates[set] || item.templates.A || '';

  // 1. Aplica placeholders sólo si el ítem está marcado como personalizable
  //    en este set (microoptimización; aplicarlos siempre tampoco rompería
  //    nada porque no habría placeholders que reemplazar).
  const personalize = item.personalize && item.personalize[set];
  const withGender = personalize ? applyGender(template, sex) : template;

  // 2. Inyecta el nombre si el ítem está en la lista de puntos de inyección
  //    y hay nombre disponible.
  const cleanName = tidyName(ctx.name);
  if (cleanName && NAME_INJECTION_IDS.has(item.id)) {
    return prefixWithName(cleanName, withGender);
  }
  return withGender;
}
