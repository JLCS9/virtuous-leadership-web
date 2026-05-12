// Bloque reutilizable "Proceso · Cuatro pasos del Liderazgo Virtuoso".
// Originalmente vivia en la Home. Ahora se reutiliza al final de las paginas
// /colegios, /universidades y /educacion-superior justo antes del CTA final.
// Lee los textos desde home.pasos_* del i18n para mantener una sola fuente.
import { useT } from '../i18n';
import Section from './Section';
import {
  GOLD, GOLD_DEEP, BEIGE, PAPER, LINE, styles,
} from '../theme';

export default function PasosBlock() {
  const { t } = useT();
  const pasos = t('home.pasos');
  return (
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
  );
}
