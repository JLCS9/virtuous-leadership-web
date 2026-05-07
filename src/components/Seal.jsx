// Logo / sello "VIRTUOUS LEADERSHIP".
// Importado directamente desde src/assets/logo.png — Vite lo procesa y le da hash.

import logoUrl from '../assets/logo.png';

export default function Seal({ size = 96 }) {
  return (
    <img
      src={logoUrl}
      alt="Virtuous Leadership"
      width={size}
      height={size}
      style={{ display: 'block', borderRadius: '50%' }}
    />
  );
}
