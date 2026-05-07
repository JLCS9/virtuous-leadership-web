import { Link } from 'react-router-dom';
import { NAVY, NAVY_SOFT, PAPER, GOLD } from '../theme';
import { styles, hover } from '../theme';

// Botón / link con dos variantes: primary y secondary.
// `to` = ruta interna; si no existe, renderiza <a href>.
export default function CTA({ to, href, variant = 'primary', children, style }) {
  const base = variant === 'primary' ? styles.buttonPrimary : styles.buttonSecondary;
  const handlers = variant === 'primary' ? hover.primary : hover.secondary;
  const props = {
    style: { ...base, ...style },
    onMouseOver: handlers.over,
    onMouseOut:  handlers.out,
  };

  if (to)   return <Link to={to} {...props}>{children}</Link>;
  if (href) return <a href={href} {...props}>{children}</a>;
  return <button {...props}>{children}</button>;
}
