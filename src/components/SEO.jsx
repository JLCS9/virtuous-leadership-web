import { Helmet } from 'react-helmet-async';
import { useT, SUPPORTED_LANGS, DEFAULT_LANG } from '../i18n';

const SITE = 'https://virtuousleadership.com';

/**
 * Componente reusable: setea title, description, canonical, hreflang, og
 * y twitter por ruta. Pasarle `path` (sin prefijo de idioma) para construir
 * los enlaces. Internamente añade el idioma activo al canonical y emite
 * un <link rel="alternate" hreflang="..."> por cada idioma soportado +
 * uno con hreflang="x-default" apuntando al fallback (español).
 */
export default function SEO({
  title,
  description,
  path = '/',            // path SIN prefijo de idioma — ej. '/colegios'
  image = `${SITE}/logo.png`,
  schema = null,
  noindex = false,
}) {
  const { lang } = useT();
  const clean = path.startsWith('/') ? path : `/${path}`;
  const url = `${SITE}/${lang}${clean === '/' ? '' : clean}`;
  const fullTitle = title.includes('Virtuous Leadership')
    ? title
    : `${title} · Virtuous Leadership`;

  return (
    <Helmet>
      <html lang={lang} />
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={url} />
      {noindex && <meta name="robots" content="noindex, nofollow" />}

      {/* hreflang: una entrada por idioma + x-default al fallback */}
      {SUPPORTED_LANGS.map(code => (
        <link
          key={code}
          rel="alternate"
          hrefLang={code}
          href={`${SITE}/${code}${clean === '/' ? '' : clean}`}
        />
      ))}
      <link
        rel="alternate"
        hrefLang="x-default"
        href={`${SITE}/${DEFAULT_LANG}${clean === '/' ? '' : clean}`}
      />

      {/* Open Graph */}
      <meta property="og:url" content={url} />
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
