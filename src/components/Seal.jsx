// Logo / sello "VIRTUOUS LEADERSHIP".
// Importado directamente desde src/assets/logo.png — Vite lo procesa y le da hash.

import sealUrl from '../assets/vl-seal.png';

export default function Seal({ size = 96 }) {
  return (
    <img
      src={sealUrl}
      alt="Virtuous Leadership"
      width={size}
      height={size}
      style={{ display: 'block' }}
    />
  );
}
