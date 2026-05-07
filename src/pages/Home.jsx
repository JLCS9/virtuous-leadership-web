import { Link } from 'react-router-dom';
import {
  NAVY, NAVY_SOFT, NAVY_DEEP, GOLD, GOLD_SOFT, GOLD_DEEP,
  BEIGE, PAPER, INK, MUTED, LINE,
  FONT_SERIF, FONT_SANS, MAX_WIDTH, styles,
} from '../theme';
import { useT } from '../i18n';
import Section from '../components/Section';
import CTA from '../components/CTA';
import Seal from '../components/Seal';
import alexImg from '../assets/alex.png';
import ttImg from '../assets/tt.png';

export default function Home() {
  const { t } = useT();
  const stats     = t('home.stats');
  const pasos     = t('home.pasos');
  const audiences = t('home.audiences');
  const pillarMag = t('home.pillars.magnanimity');
  const pillarHum = t('home.pillars.humility');

  return (
    <>
      {/* Hero */}
      <section style={{
        position: 'relative',
        background: `
          radial-gradient(ellipse 60% 50% at 78% 45%, rgba(197, 165, 90, 0.10) 0%, transparent 65%),
          radial-gradient(ellipse 50% 40% at 15% 105%, rgba(27, 42, 74, 0.06) 0%, transparent 60%),
          linear-gradient(180deg, ${PAPER} 0%, ${BEIGE} 100%)
        `,
        borderBottom: `1px solid ${LINE}`,
        overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute', inset: 0, pointerEvents: 'none',
          backgroundImage: 'radial-gradient(circle, rgba(27,42,74,0.05) 1px, transparent 1px)',
          backgroundSize: '28px 28px', opacity: 0.5,
        }} />

        <div style={{
          position: 'relative',
          maxWidth: MAX_WIDTH, margin: '0 auto', padding: '64px 24px 80px',
          display: 'grid', gridTemplateColumns: '1fr', gap: 48, alignItems: 'center',
        }} className="hero-grid">
          <div>
            <div style={styles.eyebrow}>{t('home.eyebrow_official')}</div>
            <h1 style={{
              ...styles.h1,
              fontFamily: FONT_SERIF,
              fontSize: 'clamp(28px, 5.4vw, 60px)',
              whiteSpace: 'nowrap',
            }}>
              {t('home.hero_title')}
            </h1>
            <p style={styles.paraLarge}>{t('home.hero_subtitle')}</p>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginTop: 8 }}>
              <CTA to="/acreditacion" variant="primary">{t('home.cta_know_system')}</CTA>
              <CTA href={`mailto:${t('common.contact_email')}`} variant="secondary">{t('home.cta_contact')}</CTA>
            </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', position: 'relative' }}>
            <div style={{
              position: 'absolute',
              width: 360, height: 360, borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(197,165,90,0.18) 0%, transparent 65%)',
              filter: 'blur(8px)',
            }} />
            <Seal size={300} />
          </div>
        </div>
        <style>{`
          @media (min-width: 820px) {
            .hero-grid { grid-template-columns: 1.2fr 1fr !important; gap: 72px !important; padding: 96px 24px 112px !important; }
          }
        `}</style>
      </section>

      {/* Stats */}
      <section style={{ background: NAVY, color: PAPER }}>
        <div style={{
          maxWidth: 1280, margin: '0 auto', padding: '44px 32px',
          display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)',
          gap: 32, textAlign: 'center', alignItems: 'center',
        }} className="stats-grid">
          {stats.map((s, i) => (
            <div key={i} style={{
              borderLeft: i === 0 ? 'none' : `1px solid rgba(197,165,90,0.18)`,
              padding: '0 8px',
            }} className="stats-item">
              <div style={{ fontFamily: FONT_SERIF, fontSize: 'clamp(34px, 4.4vw, 52px)', fontWeight: 700, color: PAPER, lineHeight: 1 }}>
                {s.n}
              </div>
              <div style={{ fontFamily: FONT_SANS, fontSize: 13, letterSpacing: '0.14em', textTransform: 'uppercase', color: GOLD, marginTop: 12, fontWeight: 600 }}>
                {s.label}
              </div>
            </div>
          ))}
        </div>
        <style>{`
          @media (max-width: 640px) {
            .stats-grid { grid-template-columns: repeat(2, 1fr) !important; gap: 28px !important; padding: 36px 24px !important; }
            .stats-item { border-left: none !important; }
          }
        `}</style>
      </section>

      {/* ¿Qué es? */}
      <Section background={BEIGE} paddingY={88}>
        <div style={{ textAlign: 'center', maxWidth: 720, margin: '0 auto 56px' }}>
          <div style={styles.eyebrow}>{t('home.system_eyebrow')}</div>
          <h2 style={styles.h2}>{t('home.system_title')}</h2>
          <p style={styles.paraLarge}>{t('home.system_quote')}</p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 32 }}>
          <Pillar {...pillarMag} color={GOLD_DEEP} />
          <Pillar {...pillarHum} color={NAVY} />
        </div>
      </Section>

      {/* 4 pasos */}
      <Section background={PAPER} paddingY={88}>
        <div style={{ textAlign: 'center', maxWidth: 720, margin: '0 auto 56px' }}>
          <div style={styles.eyebrow}>{t('home.pasos_eyebrow')}</div>
          <h2 style={styles.h2}>{t('home.pasos_title')}</h2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 24 }}>
          {pasos.map((p, i) => (
            <div key={i} style={{
              padding: '32px 28px', background: BEIGE,
              border: `1px solid ${LINE}`, borderRadius: 2,
              borderTop: `3px solid ${GOLD}`,
            }}>
              <div style={{ fontFamily: 'ui-monospace, Menlo, monospace', fontSize: 13, letterSpacing: '0.16em', color: GOLD_DEEP, fontWeight: 700 }}>
                {p.n}
              </div>
              <h3 style={{ ...styles.h3, fontSize: 24, marginTop: 12, marginBottom: 14 }}>{p.title}</h3>
              <p style={{ ...styles.para, fontSize: 15, lineHeight: 1.65, margin: 0 }}>{p.text}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* Audiencias */}
      <Section background={NAVY} paddingY={88} style={{ color: PAPER }}>
        <div style={{ textAlign: 'center', maxWidth: 720, margin: '0 auto 48px' }}>
          <div style={{ ...styles.eyebrow, color: GOLD_SOFT }}>{t('home.audiences_eyebrow')}</div>
          <h2 style={{ ...styles.h2, color: PAPER }}>{t('home.audiences_title')}</h2>
          <p style={{ ...styles.paraLarge, color: '#D9DEE8' }}>{t('home.audiences_subtitle')}</p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 20 }}>
          {audiences.map((a, i) => (
            <Link key={i} to={a.to} style={{
              display: 'block', padding: '36px 30px',
              background: NAVY_DEEP, border: `1px solid ${NAVY_SOFT}`, borderRadius: 2,
              textDecoration: 'none', transition: 'all 200ms ease',
              borderLeft: `3px solid ${GOLD}`,
            }}
              onMouseOver={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.borderLeftColor = GOLD_SOFT; e.currentTarget.style.boxShadow = '0 12px 24px rgba(0,0,0,0.2)'; }}
              onMouseOut={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.borderLeftColor = GOLD; e.currentTarget.style.boxShadow = 'none'; }}
            >
              <div style={{ fontFamily: FONT_SANS, fontSize: 12, letterSpacing: '0.16em', textTransform: 'uppercase', color: GOLD_SOFT, fontWeight: 600 }}>
                {a.eyebrow}
              </div>
              <h3 style={{ ...styles.h3, color: PAPER, fontSize: 26, marginTop: 10, marginBottom: 16 }}>{a.title}</h3>
              <p style={{ ...styles.para, color: '#C8CFDC', fontSize: 15, lineHeight: 1.65, margin: 0 }}>{a.text}</p>
              <div style={{ marginTop: 22, fontFamily: FONT_SANS, fontSize: 14, color: GOLD, fontWeight: 600, letterSpacing: '0.04em' }}>
                {t('home.audiences_cta')}
              </div>
            </Link>
          ))}
        </div>
      </Section>

      {/* Sobre Alexandre Havard */}
      <Section background={PAPER} paddingY={88}>
        <div style={{
          display: 'grid', gridTemplateColumns: '1fr', gap: 40, alignItems: 'center',
        }} className="alex-grid">
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <div style={{
              width: 'min(360px, 90%)',
              aspectRatio: '4 / 5',
              borderRadius: 2,
              overflow: 'hidden',
              border: `1px solid ${LINE}`,
              boxShadow: '0 16px 40px rgba(27,42,74,0.10)',
              background: BEIGE,
            }}>
              <img src={alexImg} alt="Alexandre Havard"
                   style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
            </div>
          </div>
          <div>
            <div style={styles.eyebrow}>{t('home.alex_eyebrow')}</div>
            <h2 style={styles.h2}>{t('home.alex_title')}</h2>
            <p style={{ ...styles.paraLarge, marginTop: 16 }}>{t('home.alex_subtitle')}</p>
            <p style={{ ...styles.para, fontSize: 16 }}>{t('home.alex_p1')}</p>
            <p style={{ ...styles.para, fontSize: 16 }}>{t('home.alex_p2')}</p>
            <div style={{ marginTop: 16 }}>
              <Link to="/acreditacion#alex" style={{
                fontFamily: FONT_SANS, fontSize: 14, color: NAVY, fontWeight: 600,
                letterSpacing: '0.06em', textTransform: 'uppercase', textDecoration: 'none',
                borderBottom: `2px solid ${GOLD}`, paddingBottom: 2,
              }}>
                {t('home.alex_link')}
              </Link>
            </div>
          </div>
        </div>
        <style>{`
          @media (min-width: 820px) { .alex-grid { grid-template-columns: 1fr 1.4fr !important; gap: 64px !important; } }
        `}</style>
      </Section>

      {/* Test de temperamento — destacado */}
      <Section background={BEIGE} paddingY={88}>
        <div style={{
          display: 'grid', gridTemplateColumns: '1fr', gap: 32, alignItems: 'center',
          padding: '40px 32px', background: PAPER, borderRadius: 2, border: `1px solid ${LINE}`,
        }} className="test-card-grid">
          <div>
            <div style={styles.eyebrow}>{t('home.test_eyebrow')}</div>
            <h2 style={styles.h2}>{t('home.test_title')}</h2>
            <p style={{ ...styles.para, marginTop: 12, fontSize: 17 }}>{t('home.test_text')}</p>
            <div style={{ marginTop: 20 }}>
              <CTA to="/tests/temperamento" variant="primary">{t('home.test_cta')}</CTA>
            </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <img src={ttImg} alt={t('home.test_title')}
                 style={{ width: '100%', maxWidth: 360, height: 'auto', display: 'block', borderRadius: 2 }} />
          </div>
        </div>
        <style>{`
          @media (min-width: 820px) {
            .test-card-grid { grid-template-columns: 1.4fr 1fr !important; padding: 56px !important; }
          }
        `}</style>
      </Section>
    </>
  );
}

function Pillar({ badge, sub, title, text, color }) {
  return (
    <div style={{
      padding: '40px 36px',
      background: PAPER, border: `1px solid ${LINE}`, borderRadius: 2,
      borderTop: `4px solid ${color}`,
    }}>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 18 }}>
        <span style={{ fontFamily: FONT_SERIF, fontSize: 28, fontWeight: 700, color, letterSpacing: '0.02em', textTransform: 'uppercase' }}>
          {badge}
        </span>
        <span style={{ fontFamily: FONT_SERIF, fontSize: 17, color: MUTED, fontStyle: 'italic' }}>· {sub}</span>
      </div>
      <h3 style={{ ...styles.h3, fontSize: 26, marginBottom: 14 }}>{title}</h3>
      <p style={{ ...styles.para, fontSize: 16, margin: 0 }}>{text}</p>
    </div>
  );
}
