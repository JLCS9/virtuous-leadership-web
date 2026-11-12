import { useParams, useNavigate } from 'react-router-dom';
import { useT } from '../i18n';
import SEO from '../components/SEO';
import selloImg from '../assets/colegios/sello-institucion-certificada.webp';

const C = {
  blueDeep: '#1a304f',
  blueNight: '#0f1e33',
  gold: '#a58b26',
  goldLight: '#c9ab42',
  goldDark: '#786622',
  cream: '#faf7ee',
  page: '#f5f6f9',
  bruma: '#e0e5ee',
  pizarra: '#2e3744',
};
const SLAB = "'Roboto Slab', Georgia, serif";
const SANS = "'Roboto', system-ui, sans-serif";

export default function ColegiosGracias() {
  const { flow } = useParams();
  const navigate = useNavigate();
  const { t, lang } = useT();
  const k = (key) => t(`colegios_cert.${key}`);

  const isConv = flow === 'conversacion';
  const title = isConv ? k('thanks_conv_title') : k('thanks_det_title');
  const text = isConv ? k('thanks_conv_text') : k('thanks_det_text');
  const ctaEyebrow = isConv ? k('thanks_conv_cta_eyebrow') : k('thanks_det_cta_eyebrow');
  const ctaText = isConv ? k('thanks_conv_cta_text') : k('thanks_det_cta_text');

  return (
    <div style={{ fontFamily: SANS, color: C.pizarra, background: C.page, minHeight: '100vh' }}>
      <SEO title={title} noindex />
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Roboto+Slab:wght@400;700&family=Roboto:ital,wght@0,400;0,600;1,400&display=swap');`}</style>

      <div style={{
        maxWidth: 680, margin: '0 auto', padding: 'clamp(80px,12vw,160px) 24px clamp(64px,10vw,120px)',
        display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: 32,
      }}>
        <img src={selloImg} alt="" aria-hidden="true" style={{ width: 80, height: 80, objectFit: 'contain' }} />

        <h1 style={{
          margin: 0, fontFamily: SLAB, fontWeight: 700,
          fontSize: 'clamp(28px,4vw,42px)', lineHeight: 1.1, color: C.blueDeep,
        }}>{title}</h1>

        <p style={{ margin: 0, fontSize: 18, lineHeight: 1.65, maxWidth: '52ch' }}>{text}</p>

        <div style={{
          marginTop: 24, padding: 'clamp(28px,4vw,40px)', background: '#fff',
          border: `1px solid ${C.bruma}`, borderTop: `2px solid ${C.gold}`,
          display: 'flex', flexDirection: 'column', gap: 16, textAlign: 'left', width: '100%', boxSizing: 'border-box',
        }}>
          <span style={{
            fontFamily: SANS, fontWeight: 600, fontSize: 12, letterSpacing: '0.16em',
            textTransform: 'uppercase', color: C.goldDark,
          }}>{ctaEyebrow}</span>
          <p style={{ margin: 0, fontSize: 16, lineHeight: 1.6 }}>{ctaText}</p>
          <button
            type="button"
            onClick={() => navigate(`/${lang}/colegios`, { state: { openModal: isConv ? 'details' : 'conversation' } })}
            style={{
              alignSelf: 'flex-start', display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              background: C.gold, color: '#fff', fontFamily: SANS, fontWeight: 600, fontSize: 16,
              padding: '14px 26px', border: 'none', cursor: 'pointer',
            }}
          >
            {isConv ? k('cta_presentation') : k('cta_conversation')}
          </button>
        </div>

        <button
          type="button"
          onClick={() => navigate(`/${lang}/colegios`)}
          style={{
            marginTop: 8, background: 'transparent', border: `1px solid ${C.blueDeep}`,
            color: C.blueDeep, fontFamily: SANS, fontWeight: 600, fontSize: 15,
            padding: '12px 24px', cursor: 'pointer',
          }}
        >
          Volver a la página de la Certificación
        </button>
      </div>
    </div>
  );
}
