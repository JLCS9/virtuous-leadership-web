// Iconos de trazo (24×24) para la barra inferior y las tarjetas. Heredan el color del texto.
const base = { width: 24, height: 24, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.7, strokeLinecap: 'round', strokeLinejoin: 'round', 'aria-hidden': true };

export const IconoHoy = (p) => (
  <svg {...base} {...p}><circle cx="12" cy="12" r="4.2" /><path d="M12 2.8v2.2M12 19v2.2M2.8 12H5M19 12h2.2M5.5 5.5l1.6 1.6M16.9 16.9l1.6 1.6M18.5 5.5l-1.6 1.6M7.1 16.9l-1.6 1.6" /></svg>
);
export const IconoCamino = (p) => (
  <svg {...base} {...p}><circle cx="6" cy="18.5" r="2" /><circle cx="18" cy="5.5" r="2" /><path d="M7.6 17.2c3.4-1.6 1.4-5 4.4-6.3 2.4-1 3.6-1.9 4.4-3.9" /></svg>
);
export const IconoFormacion = (p) => (
  <svg {...base} {...p}><path d="M3 8.2 12 4l9 4.2-9 4.2-9-4.2Z" /><path d="M7 10.4v4.4c0 1.2 2.2 2.6 5 2.6s5-1.4 5-2.6v-4.4" /><path d="M21 8.2v5" /></svg>
);
export const IconoPlay = (p) => (
  <svg {...base} fill="currentColor" stroke="none" {...p}><path d="M8 5.6v12.8a.7.7 0 0 0 1.06.6l10.2-6.4a.7.7 0 0 0 0-1.2L9.06 5a.7.7 0 0 0-1.06.6Z" /></svg>
);
export const IconoCheck = (p) => (
  <svg {...base} strokeWidth={2.2} {...p}><path d="m5 12.5 4.5 4.5L19 7.5" /></svg>
);
export const IconoFlecha = (p) => (
  <svg {...base} {...p}><path d="M5 12h14M13 6l6 6-6 6" /></svg>
);
export const IconoChevron = (p) => (
  <svg {...base} {...p}><path d="m6 9 6 6 6-6" /></svg>
);
