// Pagina /colegios — version "Programa".
// Estructura especifica de Programas:
//   Hero (eyebrow + h1 + subtitle + foto gente.jpeg full-width corta) — SIN sello
//   Contenido (reusa universidades.conceptos — 7 tarjetas)
//   Modalidad (reusa universidades.modalidad — FactRow * N)
//   Testimonios (carousel)
//   CTA final (cta_title + cta_text + boton, mismo layout que /universidades
//   y /educacion-superior; copia propia en colegios_prog)
//
// Hero foto, Modalidad y Contenido se mantienen en sync con /universidades y
// /educacion-superior leyendo de la rama 'universidades' del i18n; las 3
// paginas de programa muestran exactamente lo mismo en esos bloques. Los
// textos especificos de colegios (hero, testimonios, CTA final) siguen en
// colegios_prog. La lista numerada "Proximos pasos" se retiro: las claves
// proceso_* siguen en i18n por si se quiere reactivar.
//
// Las secciones Objetivos y "Que incluye la acreditacion" NO se muestran aqui
// — viven en la pagina /acreditacion/colegios. Si en algun momento se quiere
// añadirlas aqui, copiar los bloques desde AcreditacionColegios.jsx.
import {
  NAVY, NAVY_DEEP, NAVY_SOFT, GOLD, GOLD_SOFT,
  PAPER, BEIGE, LINE,
  styles,
} from '../theme';
import { useT } from '../i18n';
import Section from '../components/Section';
import CTA from '../components/CTA';
import { TestimoniosCarousel, FactRow } from './AcreditacionColegios';
import genteImg from '../assets/gente.jpeg';

export default function ColegiosPrograma() {
  const { t } = useT();
  const k = (key) => t(`colegios_prog.${key}`);
  // El cuadro de Modalidad y el bloque "Contenido" (conceptos) se reusan tal
  // cual desde la rama 'universidades' del i18n, asi /colegios, /universidades
  // y /educacion-superior muestran exactamente la misma tabla y las mismas 7
  // tarjetas, sin riesgo de divergir.
  const modalidad         = t('universidades.modalidad');
  const modalidadEyebrow  = t('universidades.modalidad_eyebrow');
  const modalidadTitle    = t('universidades.modalidad_title');
  const conceptos         = t('universidades.conceptos');
  const conceptosEyebrow  = t('universidades.conceptos_eyebrow');
  const conceptosTitle    = t('universidades.conceptos_title');
  const testimonios       = k('testimonios');
  const heroTitle         = k('hero_title');

  return (
    <>
      {/* Hero — sin sello */}
      <section style={{ background: BEIGE, borderBottom: `1px solid ${LINE}` }}>
        <div style={{ maxWidth: 980, margin: '0 auto', padding: '64px 24px', textAlign: 'center' }}>
          {k('eyebrow') && (
            <div style={styles.eyebrow}>{k('eyebrow')}</div>
          )}
          <h1 style={{ ...styles.h1, whiteSpace: 'pre-line', fontSize: 'clamp(26px, 4vw, 44px)' }}>{heroTitle}</h1>
          <p style={{ ...styles.paraLarge, maxWidth: 720, margin: '24px auto 0', whiteSpace: 'pre-line' }}>
            {k('hero_subtitle')}
          </p>
        </div>
        {/* Foto 'gente' full-width tras el hero (específica de colegios) */}
        <div style={{ width: '100%', lineHeight: 0 }}>
          <img src={genteImg} alt=""
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


      {/* Contenido — bloque clonado de /universidades (eyebrow + 7 tarjetas
          con borde superior dorado). Las descripciones viven en
          universidades.conceptos para mantener las 3 paginas de programa en
          sync. */}
      <Section background={PAPER} paddingY={88}>
        <div style={{ textAlign: 'center', maxWidth: 720, margin: '0 auto 48px' }}>
          {conceptosEyebrow && (
            <div style={styles.eyebrow}>{conceptosEyebrow}</div>
          )}
          <h2 style={{ ...styles.h2, fontSize: 'clamp(34px, 4.6vw, 52px)' }}>{conceptosTitle}</h2>
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

      {/* Modalidad — fondo navy. Reusa universidades.modalidad para que el
          cuadro sea identico al de /universidades. */}
      <Section background={NAVY} paddingY={88} style={{ color: PAPER }}>
        <div style={{ textAlign: 'center', maxWidth: 720, margin: '0 auto 32px' }}>
          <div style={{ ...styles.eyebrow, color: GOLD_SOFT }}>{modalidadEyebrow}</div>
          <h2 style={{ ...styles.h2, color: PAPER }}>{modalidadTitle}</h2>
        </div>
        <div style={{ background: NAVY_DEEP, border: `1px solid ${NAVY_SOFT}`, maxWidth: 820, margin: '0 auto' }}>
          {modalidad.map((m, i) => (
            <FactRow key={i} dark
                     label={m.label} value={m.value} detail={m.detail}
                     last={i === modalidad.length - 1} />
          ))}
        </div>
      </Section>


      {/* Testimonios. El eyebrow se omite si esta vacio para evitar dejar
          espacio vertical de un <div> sin texto (ej. version EN). */}
      <Section background={PAPER} paddingY={72}>
        <div style={{ textAlign: 'center', maxWidth: 720, margin: '0 auto 32px' }}>
          {k('testimonios_eyebrow') && (
            <div style={styles.eyebrow}>{k('testimonios_eyebrow')}</div>
          )}
          <h2 style={styles.h2}>{k('testimonios_title')}</h2>
        </div>
        <TestimoniosCarousel items={testimonios} />
      </Section>

      {/* CTA final — clon del bloque de /universidades y /educacion-superior:
          title + subtitulo + boton. Sustituye al antiguo "Proximos pasos"
          (lista numerada) para que las 3 paginas de programa cierren
          identico, cambiando solo la copia. */}
      <Section background={NAVY} paddingY={64} style={{ color: PAPER }}>
        <div style={{ textAlign: 'center', maxWidth: 640, margin: '0 auto' }}>
          <h2 style={{ ...styles.h2, color: PAPER }}>{k('cta_title')}</h2>
          <p style={{ ...styles.paraLarge, color: '#D9DEE8' }}>{k('cta_text')}</p>
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
