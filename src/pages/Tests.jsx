import { LocalLink as Link } from '../i18n';
import {
  NAVY, NAVY_DEEP, GOLD, GOLD_SOFT, GOLD_DEEP,
  PAPER, BEIGE, INK, MUTED, LINE,
  FONT_SERIF, FONT_SANS, styles,
} from '../theme';
import { useT } from '../i18n';
import Section from '../components/Section';
import SEO from '../components/SEO';
// Miniaturas por test (clave -> mapa por idioma). Cada test del catálogo
// usa su propia ilustración (el texto va embebido en la imagen, de ahí que
// cada idioma tenga su archivo). Si falta un idioma cae al ES.
//   'temperament' → sello "tt" (los 4 temperamentos)
//   'character'   → pirámide de las 6 virtudes
import ttEs from '../assets/tt.png';
import ttEn from '../assets/tt-en.png';
import ttFr from '../assets/tt-fr.png';
import ttRu from '../assets/tt-ru.png';
import pyramidEs from '../assets/piramida ES.png';
import pyramidEn from '../assets/Pyramid Eng.png';
import pyramidFr from '../assets/Pyramide FR.png';
import pyramidRu from '../assets/Pyramid Ruso.png';
const TEST_IMAGES = {
  temperament: { es: ttEs,      en: ttEn,      fr: ttFr,      ru: ttRu      },
  character:   { es: pyramidEs, en: pyramidEn, fr: pyramidFr, ru: pyramidRu },
};
// Fallback final si la card no declara `image` o el idioma no está mapeado.
const DEFAULT_IMG = ttEs;

const TESTS_SEO = {
  es: { title: 'Tests de autoconocimiento',   description: 'Test de temperamento gratis online basado en la teoría de Alexandre Havard. Descubre tu temperamento dominante y la virtud que más necesitas cultivar.' },
  en: { title: 'Self-knowledge tests',         description: 'Free online temperament test based on Alexandre Havard\'s theory. Discover your dominant temperament and the virtue you most need to cultivate.' },
  fr: { title: 'Tests de connaissance de soi', description: 'Test de tempérament gratuit en ligne basé sur la théorie d\'Alexandre Havard. Découvre ton tempérament dominant et la vertu que tu dois cultiver le plus.' },
  ru: { title: 'Тесты самопознания',           description: 'Бесплатный онлайн-тест темперамента, основанный на теории Александра Гавара. Узнайте свой доминирующий темперамент и добродетель, которую вам нужно развивать.' },
};

// Resuelve la miniatura de una card según su `image` (key 'temperament' /
// 'character' / etc.) y el idioma activo. Si no hay key o no está mapeada,
// usa el fallback (sello del test adulto) para no romper la card.
function imageForCard(card, lang) {
  if (!card.available) return null;
  const map = TEST_IMAGES[card.image];
  if (!map) return DEFAULT_IMG;
  return map[lang] || map.es || DEFAULT_IMG;
}

export default function Tests() {
  const { t, lang } = useT();
  const cards = t('tests.cards');
  const seo = TESTS_SEO[lang] || TESTS_SEO.es;

  return (
    <>
      <SEO title={seo.title} description={seo.description} path="/tests" />
      <section style={{ background: BEIGE, borderBottom: `1px solid ${LINE}` }}>
        <div style={{ maxWidth: 980, margin: '0 auto', padding: '64px 24px', textAlign: 'center' }}>
          <div style={styles.eyebrow}>{t('tests.eyebrow')}</div>
          <h1 style={styles.h1}>{t('tests.hero_title')}</h1>
          <p style={{ ...styles.paraLarge, maxWidth: 720, margin: '24px auto 0' }}>{t('tests.hero_subtitle')}</p>
        </div>
      </section>

      <Section background={PAPER} paddingY={88}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 24 }}>
          {cards.map((c, i) => (
            <TestCard
              key={i}
              available={c.available}
              to={c.to}
              label={c.label}
              title={c.title}
              text={c.text}
              cta={c.cta}
              comingSoon={t('common.coming_soon')}
              image={imageForCard(c, lang)}
            />
          ))}
        </div>
      </Section>
    </>
  );
}

function TestCard({ available, to, label, title, text, cta, image, comingSoon }) {
  const card = (
    <div style={{
      height: '100%',
      background: available ? PAPER : '#F8F5ED',
      border: `1px solid ${LINE}`,
      borderTop: `3px solid ${available ? GOLD : LINE}`,
      borderRadius: 2,
      transition: 'all 200ms ease',
      cursor: available ? 'pointer' : 'default',
      display: 'flex', flexDirection: 'column',
      opacity: available ? 1 : 0.7,
      overflow: 'hidden',
    }}>
      {image && (
        <div style={{
          aspectRatio: '16 / 10',
          background: BEIGE,
          borderBottom: `1px solid ${LINE}`,
          overflow: 'hidden',
        }}>
          <img src={image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
        </div>
      )}
      <div style={{ padding: '28px 28px', display: 'flex', flexDirection: 'column', flex: 1 }}>
        <div style={{ fontFamily: FONT_SANS, fontSize: 11, letterSpacing: '0.16em', textTransform: 'uppercase', color: GOLD_DEEP, fontWeight: 600 }}>
          {label}
          {!available && <span style={{ marginLeft: 8, color: MUTED }}>· {comingSoon}</span>}
        </div>
        <h3 style={{ ...styles.h3, fontSize: 22, marginTop: 10, marginBottom: 12 }}>{title}</h3>
        {/* whiteSpace: pre-line para que los \n del i18n se rendericen como
            saltos visibles dentro de la tarjeta (las descripciones tienen
            una primera linea de definicion y una segunda con la enumeracion
            de items). */}
        <p style={{ ...styles.para, margin: 0, fontSize: 15, flex: 1, whiteSpace: 'pre-line' }}>{text}</p>
        {available && cta && (
          <div style={{ marginTop: 22, fontFamily: FONT_SANS, fontSize: 13, color: NAVY, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
            {cta} →
          </div>
        )}
      </div>
    </div>
  );
  if (available && to) return (
    <Link to={to} style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}
          onMouseOver={e => { const el = e.currentTarget.firstChild; if (el) { el.style.transform = 'translateY(-3px)'; el.style.boxShadow = '0 16px 32px rgba(27,42,74,0.08)'; } }}
          onMouseOut={e => { const el = e.currentTarget.firstChild; if (el) { el.style.transform = 'none'; el.style.boxShadow = 'none'; } }}
    >
      {card}
    </Link>
  );
  return card;
}
