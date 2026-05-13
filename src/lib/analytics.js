// Helpers de Google Analytics 4 para una SPA con React Router.
//
// El tag de gtag.js se carga estaticamente desde index.html (asi GA Verify
// y los crawlers lo encuentran sin ejecutar JS de React). Ese tag se
// inicializa con send_page_view: false; el primer y todos los page_views
// los envia React desde PageTracker en cada cambio de ruta.
//
// Si en algun momento se quiere desactivar GA, basta con borrar las dos
// lineas <script> de index.html: window.gtag dejara de existir y las
// funciones de aqui pasan a ser no-ops automaticamente.

function gtag(...args) {
  if (typeof window === 'undefined' || typeof window.gtag !== 'function') return;
  window.gtag(...args);
}

export function trackPageview(path) {
  gtag('event', 'page_view', {
    page_path:     path,
    page_location: window.location.href,
    page_title:    document.title,
  });
}

// Para disparar eventos custom desde cualquier parte (formularios, clicks,
// finalizacion del test, etc.):
//   import { trackEvent } from '../lib/analytics';
//   trackEvent('test_completed', { profile: 'COL-MEL' });
export function trackEvent(name, params = {}) {
  gtag('event', name, params);
}

// Compatibilidad con la API anterior. Antes este modulo cargaba gtag.js
// dinamicamente; ahora lo hace index.html, asi que initAnalytics() ya no
// tiene que hacer nada.
export function initAnalytics() {}
export const isAnalyticsEnabled = () =>
  typeof window !== 'undefined' && typeof window.gtag === 'function';
