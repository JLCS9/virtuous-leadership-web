import { useState, useEffect } from 'react';
import { LocalLink as Link } from '../i18n';
import {
  NAVY, NAVY_DEEP, PAPER, INK, MUTED, BRUMA,
  FONT_SLAB, FONT_BODY, GOLD_REF, GOLD_REF_LT, GOLD_REF_DK,
} from '../theme';
import { useT } from '../i18n';
import SEO from '../components/SEO';
import alexImg from '../assets/alex-perfil.webp';
import heroImg from '../assets/empresas/hero-rome.webp';

import ttEs from '../assets/tt.webp';
import ttEn from '../assets/tt-en.png';
import ttFr from '../assets/tt-fr.png';
import ttRu from '../assets/tt-ru.webp';
import pyramidEs from '../assets/piramida ES.webp';
import pyramidEn from '../assets/Pyramid Eng.webp';
import pyramidFr from '../assets/Pyramide FR.webp';
import pyramidRu from '../assets/Pyramid Ruso.webp';
import heartEs from '../assets/HRW-es.webp';
import heartEn from '../assets/HRW-en.webp';
import heartFr from '../assets/HRW-fr.webp';
import heartRu from '../assets/HRW-ru.webp';

const TT_IMGS = { es: ttEs, en: ttEn, fr: ttFr, ru: ttRu };
const PYRAMID_IMGS = { es: pyramidEs, en: pyramidEn, fr: pyramidFr, ru: pyramidRu };
const HEART_IMGS = { es: heartEs, en: heartEn, fr: heartFr, ru: heartRu };

const SLAB = FONT_SLAB;
const SANS = FONT_BODY;
const C = {
  blueDeep: NAVY,
  blueNight: NAVY_DEEP,
  blueMid: '#2d5285',
  gold: GOLD_REF,
  goldLight: GOLD_REF_LT,
  goldDark: GOLD_REF_DK,
  cream: PAPER,
  white: '#ffffff',
  plomo: MUTED,
  bruma: BRUMA,
  piedra: '#b8c0cc',
  pizarra: INK,
  page: '#f5f6f9',
};

const HOME_SEO = {
  es: { title: 'Certificación en Liderazgo Virtuoso', description: 'Programa de certificación en liderazgo virtuoso para instituciones educativas.' },
  en: { title: 'Virtuous Leadership Certification', description: 'Virtuous leadership certification program for educational institutions.' },
  fr: { title: 'Certification en Leadership Vertueux', description: 'Programme de certification en leadership vertueux pour les institutions éducatives.' },
  ru: { title: 'Сертификация Нравственного лидерства', description: 'Программа сертификации нравственного лидерства для образовательных учреждений.' },
};

function useWidth() {
  const [w, setW] = useState(() => (typeof window === 'undefined' ? 1200 : window.innerWidth));
  useEffect(() => {
    const on = () => setW(window.innerWidth);
    window.addEventListener('resize', on);
    return () => window.removeEventListener('resize', on);
  }, []);
  return w;
}

function SupTitle({ raw }) {
  const idx = raw.indexOf('®');
  if (idx === -1) return raw;
  return <>{raw.slice(0, idx)}<sup style={{ fontSize: '0.4em', verticalAlign: 'super', lineHeight: 1 }}>®</sup>{raw.slice(idx + 1)}</>;
}

export default function Home() {
  const { t, lang } = useT();
  const w = useWidth();
  const isMobile = w < 760;
  const tablet = w >= 760;
  const wide = w >= 1000;
  const seo = HOME_SEO[lang] || HOME_SEO.es;

  const [cardIdx, setCardIdx] = useState(0);

  const openModal = () => window.dispatchEvent(new Event('open-contact-modal'));

  const heroStats = t('home.hero_stats');

  const TESTS = [
    { img: TT_IMGS[lang] || TT_IMGS.es, desc: t('home.test_temperament_desc'), link: t('home.test_temperament_link'), to: '/tests/temperamento', blend: false },
    { img: PYRAMID_IMGS[lang] || PYRAMID_IMGS.es, desc: t('home.test_character_desc'), link: t('home.test_character_link'), to: '/tests/caracter', blend: true },
    { img: HEART_IMGS[lang] || HEART_IMGS.es, desc: t('home.test_heart_desc'), link: t('home.test_heart_link'), to: '/tests/corazon', blend: false },
  ];

  return (
    <>
      <SEO title={seo.title} description={seo.description} path="/" />
      {/* Hero — empresas-style image treatment */}
      <section style={{
        position: 'relative',
        minHeight: isMobile ? 'auto' : 'calc(100svh - 81px)',
        background: C.blueNight, color: '#fff',
        display: 'flex', flexDirection: 'column', justifyContent: 'center',
        overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', top: 0, right: 0, bottom: 0, width: isMobile ? '100%' : '52%' }}>
          <img src={heroImg} alt="" style={{
            display: 'block', width: '100%', height: '100%', objectFit: 'cover',
            objectPosition: isMobile ? '62% 30%' : '50% 40%',
            mixBlendMode: 'screen', filter: 'grayscale(1) contrast(1.05)',
          }} />
        </div>
        <div aria-hidden="true" style={{
          position: 'absolute', inset: 0, pointerEvents: 'none',
          background: isMobile
            ? 'rgba(15,30,51,.68)'
            : 'linear-gradient(90deg, #0f1e33 0%, #0f1e33 44%, rgba(15,30,51,.35) 62%, rgba(15,30,51,0) 80%)',
        }} />

        <div style={{
          position: 'relative', maxWidth: 1200, margin: '0 auto', width: '100%',
          padding: isMobile ? '72px 24px 56px' : '112px 48px 96px',
        }}>
          <div style={{ maxWidth: 640, display: 'flex', flexDirection: 'column', gap: 20 }}>
            <span style={{
              fontFamily: SANS, fontWeight: 600, fontSize: 14, letterSpacing: '0.16em',
              textTransform: 'uppercase', color: C.goldLight,
            }}>{t('home.hero_eyebrow')}</span>
            <h1 style={{
              margin: 0, fontFamily: SLAB, fontWeight: 700,
              fontSize: isMobile ? 'clamp(28px,8vw,38px)' : 'clamp(42px,6.4vw,80px)',
              lineHeight: 1.05, letterSpacing: '-0.01em', color: '#fff',
              textWrap: 'balance',
            }}><SupTitle raw={t('home.hero_title')} /></h1>
            <p style={{
              margin: 0, fontSize: 18, lineHeight: 1.6, color: C.cream,
              maxWidth: '56ch', textWrap: 'pretty',
            }}>{t('home.hero_intro')}</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, paddingTop: 8 }}>
              <button type="button" onClick={openModal} data-gtm="home-contact-hero" style={{
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                background: C.gold, color: '#fff', fontFamily: SANS, fontWeight: 600,
                fontSize: 16, padding: '16px 32px', border: 'none', cursor: 'pointer',
                transition: 'background 200ms ease',
              }}
                onMouseOver={e => { e.currentTarget.style.background = C.goldLight; }}
                onMouseOut={e => { e.currentTarget.style.background = C.gold; }}
              >{t('home.hero_cta')}</button>
            </div>
            <ul style={{
              display: 'flex', flexWrap: 'wrap', gap: '16px 36px',
              margin: '24px 0 0', padding: 0, listStyle: 'none',
            }}>
              {(heroStats || []).map((s, i) => (
                <li key={i} style={{
                  borderLeft: `1px solid ${C.goldLight}`, paddingLeft: 16,
                  fontSize: 15, color: C.cream, lineHeight: 1.3,
                }}>
                  <strong style={{
                    fontFamily: SLAB, fontWeight: 700, fontSize: 24,
                    color: C.goldLight, fontVariantNumeric: 'tabular-nums', display: 'block',
                  }}>{s.n}</strong>
                  {s.label}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Tests de autoconocimiento — 3 filas en columna */}
      <section style={{ background: C.page, padding: 'clamp(64px,10vw,112px) 0' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 clamp(20px,5.4vw,48px)' }}>
          <span style={{
            fontFamily: SANS, fontWeight: 600, fontSize: 14, letterSpacing: '0.16em',
            textTransform: 'uppercase', color: C.goldDark, display: 'block', marginBottom: 12,
          }}>{t('home.test_eyebrow')}</span>
          <h2 style={{
            margin: '0 0 16px', fontFamily: SLAB, fontWeight: 700,
            fontSize: 'clamp(28px,4vw,48px)', lineHeight: 1.1, color: C.blueDeep,
          }}>{t('home.test_title')}</h2>
          <p style={{
            margin: '0 0 40px', fontFamily: SANS, fontSize: 16, lineHeight: 1.65,
            color: C.pizarra, maxWidth: 800,
          }}>{t('home.test_intro')}</p>

          <div style={{ display: 'grid', gridTemplateColumns: wide ? 'repeat(3, 1fr)' : '1fr', gap: 24 }}>
            {TESTS.map((test, i) => (
              <Link key={i} to={test.to} style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center',
                textAlign: 'center',
                background: C.white, padding: '40px 24px',
                textDecoration: 'none', color: 'inherit',
                borderTop: `3px solid ${C.gold}`,
                transition: 'box-shadow 200ms ease',
                boxShadow: '0 1px 4px rgba(26,48,79,0.06)',
              }}
                onMouseOver={e => { e.currentTarget.style.boxShadow = '0 4px 20px rgba(26,48,79,0.12)'; }}
                onMouseOut={e => { e.currentTarget.style.boxShadow = '0 1px 4px rgba(26,48,79,0.06)'; }}
              >
                <div style={{
                  width: 100, height: 100,
                  borderRadius: '50%', overflow: 'hidden',
                  background: C.page, flexShrink: 0, marginBottom: 20,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <img src={test.img} alt="" loading="lazy" style={{
                    width: '86%', height: '86%', objectFit: 'contain',
                    ...(test.blend ? { mixBlendMode: 'multiply' } : {}),
                  }} />
                </div>
                <p style={{
                  margin: '0 0 16px', fontFamily: SANS, fontSize: 15,
                  lineHeight: 1.6, color: C.pizarra, flex: 1,
                }}>{test.desc}</p>
                <span style={{
                  fontFamily: SANS, fontWeight: 600, fontSize: 14,
                  color: C.gold,
                }}>{test.link} →</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Certifica a tu centro */}
      <section style={{ background: C.blueDeep, color: '#fff', padding: 'clamp(72px,10vw,120px) 0' }}>
        <div style={{
          maxWidth: 1200, margin: '0 auto', padding: '0 clamp(20px,5.4vw,48px)',
        }}>
          <div style={{
            display: 'grid', gridTemplateColumns: wide ? '1fr 1fr' : '1fr',
            gap: wide ? 64 : 40, alignItems: 'center',
          }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <span style={{
                fontFamily: SANS, fontWeight: 600, fontSize: 14, letterSpacing: '0.16em',
                textTransform: 'uppercase', color: C.goldLight,
              }}>{t('home.certify_eyebrow')}</span>
              <h2 style={{
                margin: 0, fontFamily: SLAB, fontWeight: 700,
                fontSize: 'clamp(28px,4vw,48px)', lineHeight: 1.1, color: '#fff',
              }}>{t('home.certify_title')}</h2>
              <p style={{
                margin: 0, fontSize: 18, lineHeight: 1.7, color: C.cream,
                maxWidth: '52ch', textWrap: 'pretty',
              }}>{t('home.certify_text')}</p>
            </div>
            <div style={{
              borderLeft: wide ? `2px solid ${C.goldLight}` : 'none',
              borderTop: wide ? 'none' : `2px solid ${C.goldLight}`,
              paddingLeft: wide ? 'clamp(24px,3vw,48px)' : 0,
              paddingTop: wide ? 0 : 32,
            }}>
              <p style={{
                margin: 0, fontFamily: SLAB, fontStyle: 'italic', fontWeight: 400,
                fontSize: 'clamp(20px,2.5vw,28px)', lineHeight: 1.45,
                color: C.goldLight,
              }}>
                «{t('home.certify_quote')}»
              </p>
            </div>
          </div>

          {/* Cómo se pone en marcha — 4 pasos */}
          <div style={{
            marginTop: 'clamp(48px,6vw,80px)', paddingTop: 'clamp(40px,5vw,64px)',
            borderTop: `1px solid rgba(255,255,255,0.12)`,
          }}>
            <h3 style={{
              margin: '0 0 32px', fontFamily: SLAB, fontWeight: 700,
              fontSize: 'clamp(22px,3vw,32px)', lineHeight: 1.2, color: '#fff',
            }}>{t('home.certify_steps_title')}</h3>
            <div style={{
              display: 'grid',
              gridTemplateColumns: wide ? 'repeat(4,1fr)' : tablet ? 'repeat(2,1fr)' : '1fr',
              gap: 'clamp(20px,3vw,32px)',
            }}>
              {(t('home.certify_steps') || []).map((step, i) => (
                <div key={i} style={{
                  borderLeft: `2px solid ${C.gold}`, paddingLeft: 20,
                  display: 'flex', flexDirection: 'column', gap: 8,
                }}>
                  <span style={{
                    fontFamily: SLAB, fontWeight: 700, fontSize: 32,
                    color: C.gold, lineHeight: 1, fontVariantNumeric: 'tabular-nums',
                  }}>0{i + 1}</span>
                  <span style={{
                    fontFamily: SANS, fontWeight: 600, fontSize: 16, color: '#fff',
                  }}>{step.title}</span>
                  <span style={{
                    fontFamily: SANS, fontSize: 15, lineHeight: 1.55, color: C.cream,
                  }}>{step.text}</span>
                </div>
              ))}
            </div>
            <div style={{ paddingTop: 'clamp(28px,4vw,40px)' }}>
              <button type="button" onClick={openModal} data-gtm="home-contact-certify" style={{
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                background: C.gold, color: '#fff', fontFamily: SANS, fontWeight: 600,
                fontSize: 16, padding: '16px 32px', border: 'none', cursor: 'pointer',
                transition: 'background 200ms ease',
              }}
                onMouseOver={e => { e.currentTarget.style.background = C.goldLight; }}
                onMouseOut={e => { e.currentTarget.style.background = C.gold; }}
              >{t('home.certify_cta')}</button>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonios — stats + slider */}
      {(() => {
        const stats = t('home.exp_stats') || [];
        const cards = t('home.exp_cards') || [];
        const perPage = w >= 700 ? 2 : 1;
        const maxIdx = Math.max(0, cards.length - perPage);
        const visible = cards.slice(cardIdx, cardIdx + perPage);
        return (
          <section style={{ background: C.page, padding: 'clamp(64px,10vw,112px) 0' }}>
            <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 clamp(20px,5.4vw,48px)' }}>
              {/* Stats row */}
              <div style={{
                display: 'grid', gridTemplateColumns: tablet ? '1fr 1fr 1.6fr' : '1fr',
                gap: 'clamp(24px,4vw,40px)', marginBottom: 'clamp(40px,6vw,64px)',
              }}>
                {stats.map((s, i) => (
                  <div key={i} style={{
                    borderLeft: `2px solid ${C.gold}`, paddingLeft: 24,
                    display: 'flex', flexDirection: 'column', gap: 10,
                  }}>
                    {s.n != null ? (
                      <span style={{
                        fontFamily: SLAB, fontWeight: 700,
                        fontSize: 'clamp(48px,6vw,80px)', lineHeight: 0.9,
                        color: C.gold, fontVariantNumeric: 'tabular-nums',
                      }}>{s.n}{s.suffix || ''}</span>
                    ) : (
                      <span style={{
                        fontFamily: SLAB, fontWeight: 700,
                        fontSize: 'clamp(17px,1.7vw,22px)', lineHeight: 1.3,
                        color: C.blueDeep,
                      }}>{s.title}</span>
                    )}
                    <span style={{ fontFamily: SANS, fontSize: 16, lineHeight: 1.5, color: C.pizarra }}>{s.text}</span>
                  </div>
                ))}
              </div>

              {/* Testimonial carousel */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: perPage === 2 ? 'repeat(2,1fr)' : '1fr',
                  gap: 20,
                }}>
                  {visible.map((c) => (
                    <figure key={c.author} style={{
                      margin: 0, background: C.white, borderTop: `2px solid ${C.gold}`,
                      padding: 'clamp(24px,3vw,32px)',
                      display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: 24,
                    }}>
                      <blockquote style={{
                        margin: 0, fontFamily: SANS, fontSize: 15, lineHeight: 1.65,
                        color: C.pizarra, textWrap: 'pretty',
                      }}>{c.quote}</blockquote>
                      <figcaption style={{
                        display: 'flex', alignItems: 'center', gap: 12,
                        fontFamily: SANS, fontSize: 15, fontWeight: 600, color: C.blueDeep,
                      }}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                          <circle cx="12" cy="12" r="10" stroke={C.gold} strokeWidth="2" />
                          <path d="M8 12l3 3 5-5" stroke={C.gold} strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        <span>{c.author}</span>
                      </figcaption>
                    </figure>
                  ))}
                </div>
                {cards.length > perPage && (
                  <div style={{ display: 'flex', justifyContent: 'center', gap: 12 }}>
                    <button type="button" aria-label="Anterior" onClick={() => setCardIdx((p) => Math.max(0, p - 1))}
                      style={{
                        width: 40, height: 40, border: `1px solid ${C.bruma}`, background: 'none',
                        cursor: cardIdx === 0 ? 'default' : 'pointer', opacity: cardIdx === 0 ? 0.3 : 1,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={C.blueDeep} strokeWidth="1.5" strokeLinecap="square"><path d="M15 18l-6-6 6-6" /></svg>
                    </button>
                    <button type="button" aria-label="Siguiente" onClick={() => setCardIdx((p) => Math.min(maxIdx, p + 1))}
                      style={{
                        width: 40, height: 40, border: `1px solid ${C.bruma}`, background: 'none',
                        cursor: cardIdx >= maxIdx ? 'default' : 'pointer', opacity: cardIdx >= maxIdx ? 0.3 : 1,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={C.blueDeep} strokeWidth="1.5" strokeLinecap="square"><path d="M9 18l6-6-6-6" /></svg>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </section>
        );
      })()}

      {/* Sobre Alexandre Havard */}
      <section style={{ background: C.page, padding: 'clamp(32px,6vw,80px) 0 clamp(64px,10vw,112px) 0' }}>
        <div style={{
          maxWidth: 1200, margin: '0 auto', padding: '0 clamp(20px,5.4vw,48px)',
          display: 'grid', gridTemplateColumns: '1fr', gap: 40, alignItems: 'center',
        }} className="home-alex-grid">
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <div style={{
              width: 'min(360px, 90%)',
              aspectRatio: '4 / 5',
              borderRadius: 2,
              overflow: 'hidden',
              boxShadow: '0 16px 40px rgba(26,48,79,0.10)',
              background: C.bruma,
            }}>
              <img src={alexImg} alt="Alexandre Havard" loading="lazy"
                   style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
            </div>
          </div>
          <div>
            <span style={{
              fontFamily: SANS, fontWeight: 600, fontSize: 14, letterSpacing: '0.16em',
              textTransform: 'uppercase', color: C.goldDark, display: 'block', marginBottom: 12,
            }}>{t('home.alex_eyebrow')}</span>
            <h2 style={{
              margin: '0 0 8px', fontFamily: SLAB, fontWeight: 700,
              fontSize: 'clamp(26px,3.4vw,36px)', lineHeight: 1.2, color: C.blueDeep,
            }}>{t('home.alex_title')}</h2>
            <p style={{
              fontFamily: SLAB, fontStyle: 'italic',
              fontSize: 'clamp(18px,2vw,22px)', lineHeight: 1.5,
              color: C.blueMid, margin: '12px 0 24px 0',
            }}>{t('home.alex_subtitle')}</p>
            <p style={{ fontFamily: SANS, fontSize: 16, lineHeight: 1.65, color: C.pizarra, margin: '12px 0' }}>{t('home.alex_p0')}</p>
            <p style={{ fontFamily: SANS, fontSize: 16, lineHeight: 1.65, color: C.pizarra, margin: '12px 0' }}>
              {t('home.alex_p1_pre')}
              <em>{t('home.alex_p1_book')}</em>
              {t('home.alex_p1_post')}
            </p>
            <p style={{ fontFamily: SANS, fontSize: 16, lineHeight: 1.65, color: C.pizarra, margin: '12px 0' }}>{t('home.alex_p2')}</p>
            <div style={{ marginTop: 24 }}>
              <a href="https://alexhavard.com" target="_blank" rel="noopener noreferrer" style={{
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                background: C.gold, color: '#fff', fontFamily: SANS, fontWeight: 600,
                fontSize: 16, padding: '14px 28px', border: 'none', cursor: 'pointer',
                textDecoration: 'none', transition: 'background 200ms ease',
              }}
                onMouseOver={e => { e.currentTarget.style.background = C.goldLight; }}
                onMouseOut={e => { e.currentTarget.style.background = C.gold; }}
              >{t('home.alex_cta')}</a>
            </div>
          </div>
        </div>
        <style>{`
          @media (min-width: 820px) { .home-alex-grid { grid-template-columns: 1fr 1.4fr !important; gap: 64px !important; } }
        `}</style>
      </section>

      {/* Modal de contacto */}
    </>
  );
}
