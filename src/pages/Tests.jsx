import { Link } from 'react-router-dom';
import {
  NAVY, NAVY_DEEP, GOLD, GOLD_SOFT, GOLD_DEEP,
  PAPER, BEIGE, INK, MUTED, LINE,
  FONT_SERIF, FONT_SANS, styles,
} from '../theme';
import { useT } from '../i18n';
import Section from '../components/Section';
import SEO from '../components/SEO';
import ttImg from '../assets/tt.png';

const TESTS_SEO = {
  es: { title: 'Tests de autoconocimiento', description: 'Test de temperamento gratis online basado en la teoría de Alexandre Havard. Building character a través del autoconocimiento.' },
  en: { title: 'Self-knowledge tests',       description: 'Free online temperament test based on Alexandre Havard\'s theory. Building character through self-knowledge.' },
  fr: { title: 'Tests de connaissance de soi', description: 'Test de tempérament gratuit en ligne basé sur la théorie d\'Alexandre Havard. Building character par la connaissance de soi.' },
};

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
              image={c.available ? ttImg : null}
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
        <p style={{ ...styles.para, margin: 0, fontSize: 15, flex: 1 }}>{text}</p>
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
