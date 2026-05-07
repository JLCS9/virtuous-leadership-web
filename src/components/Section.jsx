import { MAX_WIDTH } from '../theme';

// Wrapper de sección con padding vertical y centrado de contenido.
export default function Section({ children, background, paddingY = 64, narrow = false, style }) {
  return (
    <section style={{ background, padding: `${paddingY}px 0`, ...style }}>
      <div style={{
        maxWidth: narrow ? 760 : MAX_WIDTH,
        margin: '0 auto',
        padding: '0 24px',
      }}>
        {children}
      </div>
    </section>
  );
}
