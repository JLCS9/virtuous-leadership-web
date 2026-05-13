import { LocalLink as Link } from '../i18n';
import {
  NAVY, NAVY_DEEP, NAVY_SOFT, GOLD, GOLD_SOFT, GOLD_DEEP,
  PAPER, BEIGE, INK, MUTED, LINE,
  FONT_SERIF, FONT_SANS, styles,
} from '../theme';
import { useT } from '../i18n';
import Section from '../components/Section';
import CTA from '../components/CTA';
import { FactRow } from './AcreditacionColegios';
import classImg from '../assets/class.jpeg';

export default function AcreditacionUniversidades() {
  const { t } = useT();
  const conceptos  = t('universidades.conceptos');
  const modalidad  = t('universidades.modalidad');
  const heroTitle  = t('universidades.hero_title');

  return (
    <>
      <section style={{ background: BEIGE, borderBottom: `1px solid ${LINE}` }}>
        <div style={{ maxWidth: 980, margin: '0 auto', padding: '64px 24px', textAlign: 'center' }}>
          {t('universidades.eyebrow') && (
            <div style={styles.eyebrow}>{t('universidades.eyebrow')}</div>
          )}
          <h1 style={{ ...styles.h1, whiteSpace: 'pre-line', fontSize: 'clamp(26px, 4vw, 44px)' }}>
            {heroTitle}
          </h1>
          <p style={{ ...styles.paraLarge, maxWidth: 760, margin: '24px auto 0', whiteSpace: 'pre-line' }}>
            {t('universidades.hero_subtitle')}
          </p>
        </div>
        {/* Foto full-width tras el bloque hero */}
        <div style={{ width: '100%', lineHeight: 0 }}>
          <img src={classImg} alt=""
               loading="lazy"
               style={{
                 width: '100%',
                 aspectRatio: '10 / 4',
                 objectFit: 'cover',
                 objectPosition: 'center',
                 display: 'block',
               }} />
        </div>
      </section>


      {/* Contenido (era 'Conceptos clave') */}
      <Section background={PAPER} paddingY={88}>
        <div style={{ textAlign: 'center', maxWidth: 720, margin: '0 auto 48px' }}>
          {t('universidades.conceptos_eyebrow') && (
            <div style={styles.eyebrow}>{t('universidades.conceptos_eyebrow')}</div>
          )}
          <h2 style={{ ...styles.h2, fontSize: 'clamp(34px, 4.6vw, 52px)' }}>{t('universidades.conceptos_title')}</h2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 18 }}>
          {conceptos.map((c, i) => (
            <div key={i} style={{
              padding: '24px 26px', background: BEIGE,
              border: `1px solid ${LINE}`, borderTop: `3px solid ${GOLD}`,
            }}>
              <h3 style={{ ...styles.h3, fontSize: 20, marginBottom: 8 }}>{c.title}</h3>
              <p style={{ ...styles.para, fontSize: 15, margin: 0 }}>{c.text}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* Modalidad — fondo navy, mismo estilo que /colegios (FactRow filas).
          paddingBottom reducido (44 vs 88 del top) para acercar la CTA
          final: el hueco total entre el cuadro y "¿Quieres llevar..." pasa
          de 88+64=152px a 44+32=76px (la mitad). Como ambas secciones
          comparten fondo NAVY, no se nota la costura. Mismo recorte que en
          AcreditacionEducacionSuperior. */}
      <Section background={NAVY} paddingY={88} style={{ color: PAPER, paddingBottom: 44 }}>
        <div style={{ textAlign: 'center', maxWidth: 720, margin: '0 auto 32px' }}>
          <div style={{ ...styles.eyebrow, color: GOLD_SOFT }}>{t('universidades.modalidad_eyebrow')}</div>
          <h2 style={{ ...styles.h2, color: PAPER }}>{t('universidades.modalidad_title')}</h2>
        </div>
        <div style={{ background: NAVY_DEEP, border: `1px solid ${NAVY_SOFT}`, maxWidth: 820, margin: '0 auto' }}>
          {modalidad.map((m, i) => (
            <FactRow key={i} dark
                     label={m.label} value={m.value} detail={m.detail}
                     last={i === modalidad.length - 1} />
          ))}
        </div>
      </Section>

      {/* CTA final — paddingTop reducido (32 vs 64) para cerrar el hueco
          con la Modalidad. */}
      <Section background={NAVY} paddingY={64} style={{ color: PAPER, paddingTop: 32 }}>
        <div style={{ textAlign: 'center', maxWidth: 640, margin: '0 auto' }}>
          <h2 style={{ ...styles.h2, color: PAPER }}>{t('universidades.cta_title')}</h2>
          <p style={{ ...styles.paraLarge, color: '#D9DEE8' }}>{t('universidades.cta_text')}</p>
          <div style={{ marginTop: 24 }}>
            <CTA href={`mailto:${t('common.contact_email')}`} variant="primary"
                 style={{ background: GOLD, color: NAVY, borderColor: GOLD }}>
              {t('common.request_meeting')}
            </CTA>
          </div>
        </div>
      </Section>
    </>
  );
}
