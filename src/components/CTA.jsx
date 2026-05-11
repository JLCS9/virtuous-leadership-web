import { NAVY, NAVY_SOFT, PAPER, GOLD } from '../theme';
import { styles, hover } from '../theme';
import { LocalLink } from '../i18n';

// Botón / link con dos variantes: primary y secondary.
// `to` = ruta interna (LocalLink añade automáticamente el prefijo de idioma);
// si no existe, renderiza <a href>.
export default function CTA({ to, href, variant = 'primary', children, style, target, rel }) {
  const base = variant === 'primary' ? styles.buttonPrimary : styles.buttonSecondary;
  const handlers = variant === 'primary' ? hover.primary : hover.secondary;
  const props = {
    style: { ...base, ...style },
    onMouseOver: handlers.over,
    onMouseOut:  handlers.out,
  };

  if (to)   return <LocalLink to={to} {...props}>{children}</LocalLink>;
  if (href) {
    // Si es externo (http(s)://) abrir en nueva pestaña con seguridad por defecto.
    const isExternal = /^https?:\/\//i.test(href);
    return (
      <a
        href={href}
        target={target ?? (isExternal ? '_blank' : undefined)}
        rel={rel ?? (isExternal ? 'noopener noreferrer' : undefined)}
        {...props}
      >
        {children}
      </a>
    );
  }
  return <button {...props}>{children}</button>;
}
