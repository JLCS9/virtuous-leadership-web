import { createContext, useContext, useState, useEffect, useMemo } from 'react';
import es from './es';
import en from './en';
import fr from './fr';

const DICTS = { es, en, fr };

export const LANGS = [
  { code: 'es', label: 'Español',  flag: '🇪🇸' },
  { code: 'en', label: 'English',  flag: '🇬🇧' },
  { code: 'fr', label: 'Français', flag: '🇫🇷' },
];

const STORAGE_KEY = 'vl-lang';

function getNested(obj, key) {
  return key.split('.').reduce((o, k) => (o == null ? undefined : o[k]), obj);
}

function detectInitial() {
  if (typeof window === 'undefined') return 'es';
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored && DICTS[stored]) return stored;
  } catch {}
  const browser = (navigator.language || 'es').slice(0, 2);
  return DICTS[browser] ? browser : 'es';
}

const LangContext = createContext({
  lang: 'es', setLang: () => {}, t: () => '', langs: LANGS,
});

export function I18nProvider({ children }) {
  const [lang, setLangState] = useState(detectInitial);

  useEffect(() => {
    if (typeof document !== 'undefined') document.documentElement.lang = lang;
  }, [lang]);

  function setLang(newLang) {
    if (!DICTS[newLang]) return;
    setLangState(newLang);
    try { localStorage.setItem(STORAGE_KEY, newLang); } catch {}
  }

  // t(key) → string | array | object dependiendo de la clave.
  // Si la clave no existe en el idioma actual, cae al español como fallback.
  // Si vars está presente y el valor es string, sustituye {placeholders}.
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
  }, [lang]);

  return <LangContext.Provider value={value}>{children}</LangContext.Provider>;
}

export function useT() {
  return useContext(LangContext);
}
