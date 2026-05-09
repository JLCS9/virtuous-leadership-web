import { Helmet } from 'react-helmet-async';

const SITE = 'https://virtuousleadership.com';

// Componente reusable: setea title, description, canonical, og y twitter por
// ruta. Pasarle `path` para construir el canonical y opcionalmente schema (JSON-LD).
export default function SEO({
  title,
  description,
  path = '/',
  image = `${SITE}/logo.png`,
  schema = null,           // string o object con JSON-LD adicional
  noindex = false,
}) {
  const url = `${SITE}${path}`;
  const fullTitle = title.includes('Virtuous Leadership')
    ? title
    : `${title} · Virtuous Leadership`;

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={url} />
      {noindex && <meta name="robots" content="noindex, nofollow" />}

      {/* Open Graph */}
      <meta property="og:url" content={url} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />

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
