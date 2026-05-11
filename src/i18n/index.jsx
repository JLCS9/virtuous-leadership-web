import { createContext, useContext, useEffect, useMemo, useCallback } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import es from './es';
import en from './en';
import fr from './fr';
import ru from './ru';

const DICTS = { es, en, fr, ru };

export const LANGS = [
  { code: 'es', label: 'Español',  flag: '🇪🇸' },
  { code: 'en', label: 'English',  flag: '🇬🇧' },
  { code: 'fr', label: 'Français', flag: '🇫🇷' },
  { code: 'ru', label: 'Русский',  flag: '🇷🇺' },
];

export const SUPPORTED_LANGS = LANGS.map(l => l.code);
export const DEFAULT_LANG = 'es';
const STORAGE_KEY = 'vl-lang';

function getNested(obj, key) {
  return key.split('.').reduce((o, k) => (o == null ? undefined : o[k]), obj);
}

/**
 * Detecta el idioma inicial cuando el usuario llega a la raiz (sin /:lang/).
 * Prioridad: localStorage > navigator.language > DEFAULT_LANG.
 */
export function detectInitialLang() {
  if (typeof window === 'undefined') return DEFAULT_LANG;
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored && DICTS[stored]) return stored;
  } catch {}
  const browser = (navigator.language || DEFAULT_LANG).slice(0, 2);
  return DICTS[browser] ? browser : DEFAULT_LANG;
}

/**
 * Lee el idioma directamente del primer segmento del pathname.
 * Si el pathname no empieza con un idioma soportado, devuelve null
 * (caso de URL legacy o ruta sin prefijo: el caller debe redirigir).
 */
export function langFromPath(pathname) {
  const m = pathname.match(/^\/([a-z]{2})(?:\/|$)/);
  return m && SUPPORTED_LANGS.includes(m[1]) ? m[1] : null;
}

/**
 * Quita el prefijo /:lang/ del pathname. '/es/colegios' -> '/colegios'.
 * Si no hay prefijo de idioma, devuelve el pathname tal cual.
 */
export function stripLangFromPath(pathname) {
  return pathname.replace(/^\/[a-z]{2}(?=\/|$)/, '') || '/';
}

/**
 * Construye una URL relativa con el prefijo de idioma actual.
 * useLocalPath() → fn('/colegios') = '/es/colegios' (si lang activo es 'es').
 */
export function useLocalPath() {
  const { lang } = useT();
  return useCallback((p) => {
    if (!p) return `/${lang}/`;
    if (/^(https?:|mailto:|tel:|#)/i.test(p)) return p;          // externo
    const path = p.startsWith('/') ? p : `/${p}`;
    return `/${lang}${path === '/' ? '/' : path}`;
  }, [lang]);
}

const LangContext = createContext({
  lang: DEFAULT_LANG, setLang: () => {}, t: () => '', langs: LANGS,
});

export function I18nProvider({ children }) {
  const { pathname, search, hash } = useLocation();
  const navigate = useNavigate();
  const urlLang = langFromPath(pathname) || DEFAULT_LANG;
  const lang = DICTS[urlLang] ? urlLang : DEFAULT_LANG;

  // Mantener <html lang="..."> sincronizado y persistir la eleccion del usuario
  useEffect(() => {
    if (typeof document !== 'undefined') document.documentElement.lang = lang;
    try { localStorage.setItem(STORAGE_KEY, lang); } catch {}
  }, [lang]);

  // setLang: navega a la misma pagina con otro prefijo de idioma.
  const setLang = useCallback((newLang) => {
    if (!DICTS[newLang] || newLang === lang) return;
    const rest = stripLangFromPath(pathname);
    navigate(`/${newLang}${rest === '/' ? '/' : rest}${search}${hash}`, { replace: false });
  }, [lang, pathname, search, hash, navigate]);

  // t(key) → string | array | object dependiendo de la clave.
  // Si la clave no existe en el idioma actual, cae al espanol como fallback.
  // Si vars esta presente y el valor es string, sustituye {placeholders}.
  const value = useMemo(() => {
    const dict = DICTS[lang] || DICTS.es;
    const t = (key, vars) => {
      let val = getNested(dict, key);
      if (val == null) val = getNested(DICTS.es, key);
      if (typeof val === 'string' && vars) {
        return Object.keys(vars).reduce(
          (s, k) => s.replace(new RegExp(`\\{${k}\\}`, 'g'), vars[k]),
          val
        );
      }
      return val == null ? key : val;
    };
    return { lang, setLang, t, langs: LANGS };
  }, [lang, setLang]);

  return <LangContext.Provider value={value}>{children}</LangContext.Provider>;
}

export function useT() {
  return useContext(LangContext);
}

/**
 * Wrapper de <Link> que anade automaticamente el prefijo de idioma actual
 * a las rutas internas (las que empiezan por '/'). Rutas externas y mailto:
 * pasan tal cual.
 */
export function LocalLink({ to, ...props }) {
  const lp = useLocalPath();
  return <Link to={lp(to)} {...props} />;
}
