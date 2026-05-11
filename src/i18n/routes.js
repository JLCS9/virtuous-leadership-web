// Mapa de rutas localizadas. Cada pagina tiene un pageId logico (estable en el
// codigo) y un slug por idioma (lo que aparece en la URL del navegador). Asi
// /es/colegios, /en/schools, /fr/ecoles y /ru/shkoly apuntan al mismo
// componente de React pero cada idioma tiene su URL indexable propia.
//
// Reglas:
// - Si un slug es vacio ('') se considera ruta raiz del idioma (home).
// - Los slugs no llevan barra inicial.
// - Para subrutas usar slash interno: 'tests/temperamento' -> /es/tests/temperamento.
// - El pageId 'test_temperamento' se renderiza SIN Layout (mini-app).
// - Anadir/cambiar slugs aqui es la unica fuente de verdad: rutas, useLocalPath,
//   SEO hreflang y sitemap derivan de este objeto.

export const ROUTES = {
  home:                  { es: '',                       en: '',                        fr: '',                         ru: '' },
  acreditacion_landing:  { es: 'acreditacion',           en: 'certification',           fr: 'accreditation',            ru: 'akkreditatsiya' },
  acreditacion_colegios: { es: 'acreditacion/colegios',  en: 'certification/schools',   fr: 'accreditation/ecoles',     ru: 'akkreditatsiya/shkoly' },
  programa_colegios:     { es: 'colegios',               en: 'schools',                 fr: 'ecoles',                   ru: 'shkoly' },
  universidades:         { es: 'universidades',          en: 'universities',            fr: 'universites',              ru: 'universitety' },
  edsup:                 { es: 'educacion-superior',     en: 'higher-education',        fr: 'enseignement-superieur',   ru: 'vysshee-obrazovanie' },
  tests:                 { es: 'tests',                  en: 'tests',                   fr: 'tests',                    ru: 'testy' },
  test_temperamento:     { es: 'tests/temperamento',     en: 'tests/temperament',       fr: 'tests/temperament',        ru: 'testy/temperament' },
  contacto:              { es: 'contacto',               en: 'contact',                 fr: 'contact',                  ru: 'kontakty' },
};

// Paginas que se renderizan SIN Layout (full-bleed mini-apps).
export const NO_LAYOUT_PAGES = new Set(['test_temperamento']);

// Reverse map: cualquier slug (de cualquier idioma) -> pageId.
// Permite que useLocalPath traduzca un path canonico ES (ej. '/colegios')
// al slug correcto del idioma actual (ej. '/en/schools'), y tambien
// que setLang sepa a que page corresponde el path actual al cambiar de
// idioma para reescribir la URL.
export const PATH_TO_PAGE = {};
for (const [pageId, slugs] of Object.entries(ROUTES)) {
  for (const slug of Object.values(slugs)) {
    const key = slug ? `/${slug}` : '/';
    // Si dos idiomas comparten el mismo slug (ej. 'tests' en ES y EN),
    // se sobrescribe con el mismo pageId — sin conflicto.
    PATH_TO_PAGE[key] = pageId;
  }
}

/**
 * Construye la URL final para `path` en el idioma `lang`.
 * - Si path es '' o '/', devuelve '/{lang}'.
 * - Si path coincide con un slug conocido (en cualquier idioma), traduce al slug
 *   del idioma destino.
 * - Si path no es interno (http, mailto, hash...), devuelve tal cual.
 * - Si no se reconoce el path, lo prefija con '/{lang}' tal cual (fallback).
 *
 * Se preserva search (?...) y hash (#...) si vienen pegados al path.
 */
export function pathForLang(path, lang) {
  if (!path) return `/${lang}`;
  if (/^(https?:|mailto:|tel:|#)/i.test(path)) return path;
  // Separa el path "limpio" del query/hash para hacer lookup
  const m = path.match(/^([^?#]*)([?#].*)?$/);
  const bare = m[1] || '/';
  const tail = m[2] || '';
  const normalizedBare = bare === '' ? '/' : bare.startsWith('/') ? bare : `/${bare}`;
  const pageId = PATH_TO_PAGE[normalizedBare];
  if (pageId) {
    const slug = ROUTES[pageId][lang];
    const newPath = slug ? `/${lang}/${slug}` : `/${lang}`;
    return newPath + tail;
  }
  // Fallback: simplemente prefijar con /{lang}
  return `/${lang}${normalizedBare === '/' ? '' : normalizedBare}${tail}`;
}

/**
 * Dado un pathname del navegador como '/en/schools' devuelve el pageId
 * ('programa_colegios') o null si no coincide.
 */
export function pageIdFromLocation(pathname) {
  // Quita el prefijo /:lang
  const m = pathname.match(/^\/[a-z]{2}(.*)$/);
  const rest = (m ? m[1] : pathname) || '';
  const key = rest === '' || rest === '/' ? '/' : rest;
  return PATH_TO_PAGE[key] || null;
}

/**
 * Devuelve un array de { lang, url } con la URL canonica en cada idioma
 * para una pagina logica (pageId). Util para hreflang y sitemap.
 */
export function alternateUrlsForPage(pageId, origin) {
  const slugs = ROUTES[pageId];
  if (!slugs) return [];
  return Object.entries(slugs).map(([lang, slug]) => ({
    lang,
    url: `${origin}/${lang}${slug ? `/${slug}` : ''}`,
  }));
}
