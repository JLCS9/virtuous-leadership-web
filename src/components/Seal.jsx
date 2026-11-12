// Logo / sello "VIRTUOUS LEADERSHIP".

import sealUrl from '../assets/vl-seal.webp';

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
