import { useState } from 'react';
import { NAVY, NAVY_SOFT, PAPER, GOLD, GOLD_SOFT } from '../theme';
import { styles } from '../theme';
import { LocalLink } from '../i18n';

// Boton / link con dos variantes: primary y secondary.
// `to`         = ruta interna (LocalLink prefija con el idioma activo).
// `href`       = enlace externo o mailto: (si http(s), se abre en nueva pestana).
// `style`      = overrides de estilo base (ej. cambiar background a GOLD).
// `hoverStyle` = overrides aplicados SOLO en hover. Si no se da, se infiere
//                uno razonable: si el background actual es GOLD se va a
//                GOLD_SOFT; en otro caso se usa el hover por defecto de la
//                variante (NAVY_SOFT para primary, NAVY+PAPER para secondary).
//
// El hover se gestiona via estado React: en cuanto el raton sale, el estilo
// "final" se recalcula desde base+style, sin necesidad de "resetear" valores
// manualmente. Esto evita el bug en el que un boton con background custom
// se quedaba con el background por defecto tras mouseOut.
export default function CTA({ to, href, variant = 'primary', children, style, hoverStyle, target, rel }) {
  const [hovered, setHovered] = useState(false);
  const base = variant === 'primary' ? styles.buttonPrimary : styles.buttonSecondary;
  const merged = { ...base, ...style };

  // Hover por defecto: depende de la variante y del background actual.
  let defaultHover;
  if (variant === 'primary') {
    defaultHover = merged.background === GOLD
      ? { background: GOLD_SOFT }
      : { background: NAVY_SOFT };
  } else {
    defaultHover = { background: NAVY, color: PAPER };
  }
  const finalStyle = hovered
    ? { ...merged, ...defaultHover, ...hoverStyle }
    : merged;

  const interaction = {
    style: finalStyle,
    onMouseEnter: () => setHovered(true),
    onMouseLeave: () => setHovered(false),
    onFocus:      () => setHovered(true),
    onBlur:       () => setHovered(false),
  };

  if (to) return <LocalLink to={to} {...interaction}>{children}</LocalLink>;
  if (href) {
    const isExternal = /^https?:\/\//i.test(href);
    return (
      <a
        href={href}
        target={target ?? (isExternal ? '_blank' : undefined)}
        rel={rel ?? (isExternal ? 'noopener noreferrer' : undefined)}
        {...interaction}
      >
        {children}
      </a>
    );
  }
  return <button {...interaction}>{children}</button>;
}
