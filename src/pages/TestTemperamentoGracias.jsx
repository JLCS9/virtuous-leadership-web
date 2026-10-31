import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LocalLink as Link, useT, useLocalPath } from '../i18n';
import SEO from '../components/SEO';
import { supabase, accountsEnabled } from '../account/supabase';
import { useSession } from '../account/useSession';
import { fetchLatestTemperament, fetchFirstName } from '../account/account';
import { CHALLENGE_VIRTUE } from '../account/challengeVirtues';
import {
  NAVY, NAVY_SOFT, GOLD, GOLD_DEEP,
  PAPER, BEIGE, INK, MUTED, LINE,
  FONT_SERIF, FONT_SANS, TEMP_COLORS,
  styles,
} from '../theme';
import { Card, Title, PrimaryButton } from '../account/ui';
import RetosCard from '../account/RetosCard';

const PAGE_PATH_FALLBACK = '/tests/temperamento/gracias';

const VIMEO_IDS = {
  es: '1097779558',
  en: '1097779135',
  fr: '1107663493',
};

const CTA_URLS = {
  es: 'https://alexhavard.com/es/landing-sesion-alex-havard-corta/',
  en: 'https://alexhavard.com/landing-session-alex-havard-corta/',
  fr: 'https://alexhavard.com/fr/landing-seance-alex-havard-corta/',
};

export default function TestTemperamentoGracias() {
  const { t } = useT();
  const session = useSession();

  if (!accountsEnabled) {
    return <FallbackGracias />;
  }

  return (
    <>
      <SEO
        title={`${t('test_gracias.title')} | Virtuous Leadership`}
        description={t('test_gracias.intro')}
        path={PAGE_PATH_FALLBACK}
        noindex={false}
      />
      {session === undefined ? (
        <Shell><Loading /></Shell>
      ) : session ? (
        <ResultsLanding user={session.user} />
      ) : (
        <FallbackGracias />
      )}
    </>
  );
}

function Shell({ children }) {
  return (
    <div style={{
      minHeight: '100vh',
      background: BEIGE,
      fontFamily: FONT_SANS,
      WebkitFontSmoothing: 'antialiased',
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;0,700;1,400&family=Inter:wght@400;500;600;700&display=swap');
        * { box-sizing: border-box; margin: 0; }
        .vl-vimeo-wrap { position: relative; width: 100%; aspect-ratio: 16/9; background: ${NAVY}; }
        .vl-vimeo-wrap iframe { position: absolute; inset: 0; width: 100%; height: 100%; border: none; }
      `}</style>
      <main style={{ padding: '48px 24px' }}>
        {children}
      </main>
    </div>
  );
}

function Loading() {
  return <p style={{ ...styles.para, textAlign: 'center', color: MUTED }}>...</p>;
}

function ResultsLanding({ user }) {
  const { t, lang } = useT();
  const navigate = useNavigate();
  const lp = useLocalPath();
  const [state, setState] = useState({ loading: true });

  useEffect(() => {
    let alive = true;
    Promise.all([fetchLatestTemperament(), fetchFirstName(user)])
      .then(([row, firstName]) => { if (alive) setState({ loading: false, row, firstName }); })
      .catch(() => { if (alive) setState({ loading: false, failed: true }); });
    return () => { alive = false; };
  }, [user]);

  if (state.loading) return <Shell><Loading /></Shell>;

  if (state.failed || !state.row?.result) {
    return (
      <Shell>
        <Card>
          <Title eyebrow={t('panel.eyebrow')}>{state.failed ? t('panel.load_failed') : t('panel.empty_title')}</Title>
          {!state.failed && <p style={{ ...styles.para, marginTop: 12 }}>{t('panel.empty_intro')}</p>}
          <div style={{ marginTop: 20 }}>
            <PrimaryButton onClick={() => navigate(lp('/tests/temperamento'))}>{t('panel.take_test')}</PrimaryButton>
          </div>
        </Card>
      </Shell>
    );
  }

  const r = state.row.result;
  const profile = t(`result.profiles.${r.profileKey}`);
  const tempPrimario = t(`temperaments.${r.primario}`);
  const isPure = !r.profileKey.includes('-');
  const parts = r.profileKey.split('-');
  const secundario = parts[1] ? t(`temperaments.${parts[1]}`) : null;

  const virtueKey = CHALLENGE_VIRTUE[r.profileKey];
  const virtue = t(`result.challenge_defs.${virtueKey}`);

  const vimeoId = VIMEO_IDS[lang] || VIMEO_IDS.es;

  const tempLabel = isPure
    ? tempPrimario.name.toLowerCase()
    : `${tempPrimario.name.toLowerCase()}-${secundario.name.toLowerCase()}`;

  const primColor = TEMP_COLORS[r.primario] || NAVY;
  const secColor = parts[1] ? (TEMP_COLORS[parts[1]] || NAVY) : null;

  return (
    <div style={{
      minHeight: '100vh',
      background: BEIGE,
      fontFamily: FONT_SANS,
      WebkitFontSmoothing: 'antialiased',
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;0,700;1,400&family=Inter:wght@400;500;600;700&display=swap');
        * { box-sizing: border-box; margin: 0; }
        .vl-vimeo-wrap { position: relative; width: 100%; aspect-ratio: 16/9; background: ${NAVY}; }
        .vl-vimeo-wrap iframe { position: absolute; inset: 0; width: 100%; height: 100%; border: none; }
      `}</style>

      <main style={{ maxWidth: 760, margin: '0 auto', padding: '0 24px' }}>

        {/* 01 Resultado */}
        <section style={{
          padding: 'clamp(48px, 8vw, 64px) 0 clamp(40px, 6vw, 56px)',
          display: 'flex', flexDirection: 'column', gap: 20,
        }}>
          <div style={{ ...styles.eyebrow, color: GOLD_DEEP, marginBottom: 0 }}>
            {t('result.subtitle')}
          </div>

          <h1 style={{
            fontFamily: FONT_SERIF,
            fontSize: 'clamp(22px, 4vw, 26px)',
            fontWeight: 700,
            lineHeight: 1.3,
            color: NAVY,
            margin: 0,
          }}>
            {t('landing.result_heading', { name: state.firstName, temperament: tempLabel })}
          </h1>

          <div style={{
            fontFamily: FONT_SERIF,
            fontSize: 'clamp(32px, 7vw, 44px)',
            fontWeight: 700,
            lineHeight: 1.1,
            color: NAVY,
            letterSpacing: '-0.01em',
            paddingTop: 8,
          }}>
            {profile.name}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, paddingTop: 12 }}>
            <div style={{ display: 'flex', width: 160, height: 3 }}>
              <div style={{ flex: 1, background: primColor }} />
              {secColor && <div style={{ flex: 1, background: secColor }} />}
            </div>
            <div style={{
              display: 'flex', gap: 10, alignItems: 'center',
              fontFamily: FONT_SANS, fontSize: 15, fontWeight: 500, lineHeight: 1,
              color: INK,
            }}>
              <span>{tempPrimario.name}</span>
              {secundario && <><span style={{ color: GOLD_DEEP }}>·</span><span>{secundario.name}</span></>}
            </div>
          </div>
        </section>

        {/* Retos diarios (beta privada): solo se pinta con suscripción activa a Retos y en ES */}
        <RetosCard />

        {/* 02 Tu temperamento */}
        <section style={{
          display: 'flex', flexDirection: 'column', gap: 16,
          paddingBottom: 'clamp(48px, 8vw, 72px)',
        }}>
          <StrengthCard title={t('landing.strengths_title')} text={profile.fortaleza} />
          <StrengthCard title={t('landing.weakness_title')} text={profile.debilidad} />
        </section>
      </main>

      {/* 03 Virtud-desafío */}
      {virtue && (
        <section style={{
          background: NAVY,
          color: PAPER,
          padding: 'clamp(48px, 8vw, 72px) 24px',
        }}>
          <div style={{ maxWidth: 712, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 22 }}>
            <div style={{
              fontFamily: FONT_SANS, fontSize: 12, fontWeight: 600,
              letterSpacing: '0.18em', textTransform: 'uppercase',
              color: GOLD,
            }}>
              {t('result.challenge_card_eyebrow')}
            </div>

            <div style={{
              fontFamily: FONT_SERIF, fontSize: 'clamp(40px, 9vw, 60px)',
              fontWeight: 700, lineHeight: 1, color: PAPER, letterSpacing: '-0.01em',
            }}>
              {virtue.name}
            </div>

            <div style={{ width: 80, height: 2, background: GOLD }} />

            <p style={{
              fontFamily: FONT_SANS, fontSize: 'clamp(16px, 2.5vw, 18px)',
              lineHeight: 1.6, color: PAPER, margin: 0,
            }}>
              {virtue.def}
            </p>

            {profile.reto && (
              <p style={{
                fontFamily: FONT_SERIF, fontStyle: 'italic',
                fontSize: 'clamp(17px, 2.8vw, 20px)', lineHeight: 1.55,
                color: PAPER, margin: 0, paddingTop: 8,
              }}>
                {profile.reto}
              </p>
            )}
          </div>
        </section>
      )}

      {/* 04 Quote + eyebrow + título + descripción + vídeo */}
      <main style={{ maxWidth: 760, margin: '0 auto', padding: '0 24px' }}>
        <section style={{
          padding: 'clamp(56px, 10vw, 88px) 0',
          display: 'flex', flexDirection: 'column', gap: 28,
        }}>
          <div style={{
            padding: 'clamp(40px, 7vw, 56px) 0 clamp(80px, 11vw, 96px)',
            display: 'flex', flexDirection: 'column', gap: 18,
          }}>
            <div style={{
              fontFamily: FONT_SERIF, fontSize: 72, lineHeight: 0.6,
              color: GOLD_DEEP, height: 32,
            }}>"</div>
            <blockquote style={{
              fontFamily: FONT_SERIF,
              fontSize: 'clamp(26px, 5.5vw, 36px)',
              lineHeight: 1.4,
              color: NAVY,
              margin: 0,
            }}>
              <span dangerouslySetInnerHTML={{ __html: t('landing.quote_text') }} />
            </blockquote>
          </div>

          <div style={{
            fontFamily: FONT_SANS, fontSize: 13, fontWeight: 600,
            letterSpacing: '0.16em', textTransform: 'uppercase',
            color: GOLD_DEEP, paddingTop: 16,
          }}>
            {t('landing.video_eyebrow')}
          </div>
          <h2 style={{
            fontFamily: FONT_SERIF,
            fontSize: 'clamp(24px, 4.5vw, 32px)',
            fontWeight: 700,
            lineHeight: 1.25,
            color: NAVY,
            margin: 0,
          }}>
            {t('landing.video_title')}
          </h2>
          <p style={{
            fontFamily: FONT_SANS,
            fontSize: 'clamp(15px, 2.3vw, 17px)',
            lineHeight: 1.6,
            color: INK,
            margin: 0,
          }}>
            {t('landing.video_description')}
          </p>

          <div className="vl-vimeo-wrap" style={{ marginTop: 8 }}>
            <iframe
              src={`https://player.vimeo.com/video/${vimeoId}?badge=0&autopause=0&player_id=0`}
              allow="autoplay; fullscreen; picture-in-picture"
              title={t('landing.video_caption')}
            />
          </div>
          <div style={{
            fontFamily: FONT_SANS, fontSize: 14, lineHeight: 1.5, color: MUTED,
          }}>
            <span style={{ color: NAVY, fontWeight: 500 }}>Alexandre Havard</span>
            {' · '}
            {t('landing.video_caption')}
          </div>
        </section>
      </main>

      {/* 05 Tu siguiente paso */}
      <section style={{
        background: NAVY,
        padding: 'clamp(64px, 10vw, 80px) 24px',
      }}>
        <div style={{
          maxWidth: 760, margin: '0 auto',
          display: 'flex', flexDirection: 'column', gap: 22,
        }}>
          <div style={{
            fontFamily: FONT_SANS, fontSize: 13, fontWeight: 600,
            letterSpacing: '0.16em', textTransform: 'uppercase',
            color: GOLD,
          }}>
            {t('landing.next_step_title')}
          </div>
          <h2 style={{
            fontFamily: FONT_SERIF,
            fontSize: 'clamp(24px, 5vw, 30px)',
            fontWeight: 700,
            lineHeight: 1.25,
            color: PAPER,
            margin: 0,
          }}>
            {t('landing.next_step_heading').split('\n').map((line, i, arr) =>
              i < arr.length - 1 ? <span key={i}>{line}<br /></span> : line
            )}
          </h2>
          <p style={{
            fontFamily: FONT_SANS,
            fontSize: 'clamp(15px, 2.3vw, 17px)',
            lineHeight: 1.6,
            color: PAPER,
            margin: 0,
          }}>
            {t('landing.next_step_description')}
          </p>
          <div style={{ paddingTop: 8, display: 'flex' }}>
            <a
              href={CTA_URLS[lang] || CTA_URLS.es}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'inline-block',
                fontFamily: FONT_SANS,
                fontSize: 14,
                fontWeight: 600,
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                color: NAVY,
                background: GOLD,
                padding: '15px 32px',
                textDecoration: 'none',
                whiteSpace: 'nowrap',
                transition: 'background 0.2s',
              }}
              onMouseOver={e => (e.currentTarget.style.background = GOLD_DEEP)}
              onMouseOut={e => (e.currentTarget.style.background = GOLD)}
            >
              {t('landing.next_step_cta')}
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}

function StrengthCard({ title, text }) {
  return (
    <div style={{
      background: PAPER, border: `1px solid ${LINE}`,
      padding: '28px 24px', display: 'flex', flexDirection: 'column', gap: 14,
    }}>
      <div style={{ width: 24, height: 2, background: GOLD_DEEP }} />
      <h2 style={{
        fontFamily: FONT_SERIF, fontSize: 20, fontWeight: 700,
        lineHeight: 1.3, color: NAVY, margin: 0,
      }}>
        {title}
      </h2>
      <p style={{
        fontFamily: FONT_SANS, fontSize: 'clamp(15px, 2.2vw, 17px)',
        lineHeight: 1.6, color: INK, margin: 0,
      }}>
        {text}
      </p>
    </div>
  );
}

function FallbackGracias() {
  const { t } = useT();

  return (
    <>
      <SEO
        title={`${t('test_gracias.title')} | Virtuous Leadership`}
        description={t('test_gracias.intro')}
        path={PAGE_PATH_FALLBACK}
        noindex={true}
      />
      <main style={{
        minHeight: '100vh',
        background: BEIGE,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '48px 24px',
        boxSizing: 'border-box',
      }}>
        <div style={{ maxWidth: 720, width: '100%', textAlign: 'center' }}>
          <div style={{ ...styles.eyebrow, color: GOLD_DEEP, marginBottom: 18 }}>
            {t('test_gracias.eyebrow')}
          </div>
          <h1 style={{
            ...styles.h2,
            fontSize: 'clamp(28px, 4.4vw, 44px)',
            margin: '0 auto',
            maxWidth: 640,
            lineHeight: 1.2,
          }}>
            {t('test_gracias.intro')}
          </h1>
          <div style={{
            marginTop: 36,
            padding: '24px 28px',
            background: PAPER,
            border: `1px solid ${LINE}`,
            borderLeft: `3px solid ${GOLD}`,
            borderRadius: 2,
            textAlign: 'center',
            maxWidth: 580,
            marginLeft: 'auto',
            marginRight: 'auto',
          }}>
            <div style={{ fontSize: 20, lineHeight: 1, marginBottom: 12 }} aria-hidden="true">
              📧
            </div>
            <p style={{ ...styles.para, margin: 0, fontSize: 15, color: INK }}>
              {t('test_gracias.email_note')}
            </p>
          </div>
          <div style={{
            marginTop: 40,
            display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap',
          }}>
            <Link to="/" style={{ ...styles.buttonPrimary, textDecoration: 'none' }}
                  onMouseOver={e => (e.currentTarget.style.background = NAVY_SOFT)}
                  onMouseOut={e => (e.currentTarget.style.background = NAVY)}>
              {t('test_gracias.cta_home')}
            </Link>
            <Link to="/tests" style={{ ...styles.buttonSecondary, textDecoration: 'none' }}
                  onMouseOver={e => { e.currentTarget.style.background = NAVY; e.currentTarget.style.color = PAPER; }}
                  onMouseOut={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = NAVY; }}>
              {t('test_gracias.cta_other_tests')}
            </Link>
          </div>
        </div>
      </main>
    </>
  );
}
