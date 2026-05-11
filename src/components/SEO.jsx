import { Helmet } from 'react-helmet-async';
import { useT, SUPPORTED_LANGS, DEFAULT_LANG, ROUTES, pageIdFromLocation } from '../i18n';
import { useLocation } from 'react-router-dom';

const SITE = 'https://virtuousleadership.com';

/**
 * Componente reusable: setea title, description, canonical, hreflang, og
 * y twitter por ruta. El path se infiere automaticamente del pathname
 * actual: si la URL corresponde a una pagina conocida, los alternates se
 * construyen con el slug de cada idioma; si no, se cae al path tal cual.
 */
export default function SEO({
  title,
  description,
  path,                  // opcional — si no se provee, se infiere del pathname
  image = `${SITE}/logo.png`,
  schema = null,
  noindex = false,
}) {
  const { lang } = useT();
  const location = useLocation();
  const pageId = pageIdFromLocation(location.pathname);

  // Canonical: usar el path lang-prefixed actual (o construirlo si nos pasan path).
  const canonical = pageId
    ? `${SITE}/${lang}${ROUTES[pageId][lang] ? `/${ROUTES[pageId][lang]}` : ''}`
    : path
      ? `${SITE}/${lang}${path.startsWith('/') ? path : `/${path}`}`
      : `${SITE}${location.pathname}`;

  // Hreflang alternates: si conocemos el pageId, emitimos uno por idioma con
  // su slug correspondiente. Si no (page legacy), caemos a usar el path
  // suministrado o el pathname actual.
  function altUrl(targetLang) {
    if (pageId) {
      const slug = ROUTES[pageId][targetLang];
      return `${SITE}/${targetLang}${slug ? `/${slug}` : ''}`;
    }
    if (path) {
      return `${SITE}/${targetLang}${path.startsWith('/') ? path : `/${path}`}`;
    }
    // Fallback: cambia el prefijo de idioma del pathname actual
    return `${SITE}${location.pathname.replace(/^\/[a-z]{2}/, `/${targetLang}`)}`;
  }

  const fullTitle = title.includes('Virtuous Leadership')
    ? title
    : `${title} · Virtuous Leadership`;

  return (
    <Helmet>
      <html lang={lang} />
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={canonical} />
      {noindex && <meta name="robots" content="noindex, nofollow" />}

      {/* hreflang: una entrada por idioma + x-default al fallback */}
      {SUPPORTED_LANGS.map(code => (
        <link key={code} rel="alternate" hrefLang={code} href={altUrl(code)} />
      ))}
      <link rel="alternate" hrefLang="x-default" href={altUrl(DEFAULT_LANG)} />

      {/* Open Graph */}
      <meta property="og:url" content={canonical} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      <meta property="og:locale" content={lang} />

      {/* Twitter */}
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />

      {schema && (
        <script type="application/ld+json">
          {typeof schema === 'string' ? schema : JSON.stringify(schema)}
        </script>
      )}
    </Helmet>
  );
}
