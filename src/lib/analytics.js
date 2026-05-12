// Google Analytics 4 — integracion minima para una SPA con React Router.
//
// Como funciona:
// 1. El ID de medicion (G-XXXXXXXXXX) llega como variable de entorno
//    VITE_GA_ID. Vite la sustituye en tiempo de build. Si no esta definida,
//    las funciones aqui son no-ops: la pagina carga sin GA y sin warnings.
// 2. initAnalytics() inyecta gtag.js, inicializa window.gtag y deshabilita
//    el envio automatico del primer page_view (send_page_view: false).
//    Esto evita doble conteo: el primer page_view lo enviamos nosotros
//    desde PageTracker en cuanto el router monta la ruta inicial.
// 3. trackPageview(path) envia un evento 'page_view' a GA con el path y
//    el titulo actual de la pagina. Se llama desde PageTracker cada vez
//    que cambia la URL.
//
// Para activar GA:
//   - En produccion: define VITE_GA_ID en .env.production o en el build
//     de Docker (ARG VITE_GA_ID). El valor es publico (aparece en el HTML
//     servido al navegador), no es un secreto.
//   - En dev local: copia .env.example -> .env y rellenala.
//
// Privacidad: esta integracion NO maneja consentimiento de cookies. Si
// el sitio recibe trafico europeo y quieres cumplir GDPR estrictamente,
// envuelve initAnalytics() en una funcion que solo se llame tras aceptar
// el banner de cookies.

const GA_ID = import.meta.env.VITE_GA_ID;
let initialized = false;

export function initAnalytics() {
  if (!GA_ID || typeof window === 'undefined' || initialized) return;
  initialized = true;

  // Inyecta el script oficial de gtag.js
  const s = document.createElement('script');
  s.async = true;
  s.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(GA_ID)}`;
  document.head.appendChild(s);

  // Inicializa el dataLayer y la funcion gtag
  window.dataLayer = window.dataLayer || [];
  window.gtag = function () { window.dataLayer.push(arguments); };
  window.gtag('js', new Date());
  // send_page_view: false -> evita doble-conteo. El primer page_view lo
  // envia PageTracker cuando el router monta la ruta inicial.
  window.gtag('config', GA_ID, { send_page_view: false });
}

export function trackPageview(path) {
  if (!GA_ID || typeof window === 'undefined' || !window.gtag) return;
  window.gtag('event', 'page_view', {
    page_path:     path,
    page_location: window.location.href,
    page_title:    document.title,
  });
}

// Opcional: para disparar eventos custom desde cualquier parte (formularios,
// clicks, finalizacion del test, etc.).
//   import { trackEvent } from '../lib/analytics';
//   trackEvent('test_completed', { profile: 'COL-MEL' });
export function trackEvent(name, params = {}) {
  if (!GA_ID || typeof window === 'undefined' || !window.gtag) return;
  window.gtag('event', name, params);
}

export const isAnalyticsEnabled = () => Boolean(GA_ID);
