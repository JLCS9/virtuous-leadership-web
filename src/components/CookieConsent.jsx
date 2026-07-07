// Banner de consentimiento propio (sustituye a Cookiebot).
//
// Qué hace:
//   1. Muestra el banner si NO hay consentimiento guardado en la cookie.
//   2. Al elegir (Aceptar todo / Rechazar / Personalizar) escribe la cookie
//      `vl_consent` con el estado por categoría (granted/denied) y empuja al
//      dataLayer DOS eventos: `cookie_consent_statistics` y
//      `cookie_consent_marketing` (con su valor).
//   3. En CADA cambio de ruta, si ya hay consentimiento guardado, re-emite
//      esos dos eventos para que GTM re-sincronice el Consent Mode a partir
//      del valor de la cookie. Cambiar de idioma = cambio de ruta → se
//      re-emite y el banner NO vuelve a salir (la cookie es de dominio, no
//      depende del idioma).
//
// El `gtag('consent','update',...)` real lo hace GTM a partir de estos
// eventos (o del valor de la cookie). Aquí solo escribimos cookie + eventos.
// El `default` (denied) se fija en index.html antes de GTM.

import { useState, useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { useT, LocalLink } from '../i18n';
import {
  NAVY, GOLD, GOLD_DEEP, PAPER, INK, MUTED, LINE, FONT_SERIF, FONT_SANS,
} from '../theme';

const COOKIE_NAME = 'vl_consent';
const COOKIE_DAYS = 180;
const CONSENT_VERSION = 1;

// ─────────────────────────── cookie helpers ───────────────────────────

function readConsent() {
  if (typeof document === 'undefined') return null;
  const m = document.cookie.match(/(?:^|;\s*)vl_consent=([^;]+)/);
  if (!m) return null;
  try {
    const c = JSON.parse(decodeURIComponent(m[1]));
    if (!c || c.v !== CONSENT_VERSION) return null;
    return c;
  } catch {
    return null;
  }
}

function writeConsent({ statistics, marketing }) {
  const consent = {
    v: CONSENT_VERSION,
    necessary: 'granted',
    statistics,
    marketing,
    ts: new Date().toISOString(),
  };
  const value = encodeURIComponent(JSON.stringify(consent));
  const maxAge = COOKIE_DAYS * 24 * 60 * 60;
  const secure = typeof location !== 'undefined' && location.protocol === 'https:' ? '; Secure' : '';
  document.cookie = `${COOKIE_NAME}=${value}; path=/; max-age=${maxAge}; SameSite=Lax${secure}`;
  return consent;
}

// Empuja los DOS eventos al dataLayer. GTM los recoge para el Consent Mode.
function pushConsentEvents(consent) {
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({ event: 'cookie_consent_statistics', consent_statistics: consent.statistics });
  window.dataLayer.push({ event: 'cookie_consent_marketing',  consent_marketing:  consent.marketing });
}

// ─────────────────────────── toggle UI ───────────────────────────

function Toggle({ on, disabled, onChange }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      disabled={disabled}
      onClick={() => !disabled && onChange(!on)}
      style={{
        width: 40, height: 22, borderRadius: 999, border: 'none', padding: 0,
        background: on ? NAVY : LINE,
        position: 'relative', flexShrink: 0,
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.55 : 1,
        transition: 'background 160ms ease',
      }}
    >
      <span style={{
        position: 'absolute', top: 3, left: on ? 21 : 3,
        width: 16, height: 16, borderRadius: '50%', background: PAPER,
        boxShadow: '0 1px 2px rgba(0,0,0,0.25)', transition: 'left 160ms ease',
      }} />
    </button>
  );
}

function CategoryRow({ title, desc, on, disabled, alwaysLabel, onChange }) {
  return (
    <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start', padding: '10px 0', borderBottom: `1px solid ${LINE}` }}>
      <div style={{ flex: 1 }}>
        <div style={{ fontFamily: FONT_SANS, fontSize: 13, fontWeight: 600, color: NAVY }}>{title}</div>
        <div style={{ fontFamily: FONT_SANS, fontSize: 11.5, lineHeight: 1.45, color: MUTED, marginTop: 2 }}>{desc}</div>
      </div>
      {disabled
        ? <span style={{ fontFamily: FONT_SANS, fontSize: 11, color: GOLD_DEEP, fontWeight: 600, whiteSpace: 'nowrap', marginTop: 2 }}>{alwaysLabel}</span>
        : <Toggle on={on} onChange={onChange} />}
    </div>
  );
}

// ─────────────────────────── banner ───────────────────────────

export default function CookieConsent() {
  const { t } = useT();
  const location = useLocation();

  const [open, setOpen] = useState(false);      // banner visible
  const [view, setView] = useState('main');      // 'main' | 'custom'
  const [statistics, setStatistics] = useState(false);
  const [marketing, setMarketing] = useState(false);

  // Al montar: si no hay consentimiento → mostrar banner.
  useEffect(() => {
    if (!readConsent()) setOpen(true);
  }, []);

  // En cada cambio de ruta (incluye cambio de idioma): si hay consentimiento
  // guardado, re-emitimos los dos eventos para mantener GTM sincronizado.
  useEffect(() => {
    const c = readConsent();
    if (c) pushConsentEvents(c);
  }, [location]);

  // Permite reabrir el banner desde fuera (p.ej. "Configurar cookies" en el
  // footer): window.vlOpenCookieSettings() o el evento custom.
  useEffect(() => {
    const openSettings = () => {
      const c = readConsent();
      setStatistics(c ? c.statistics === 'granted' : false);
      setMarketing(c ? c.marketing === 'granted' : false);
      setView('custom');
      setOpen(true);
    };
    window.vlOpenCookieSettings = openSettings;
    window.addEventListener('vl:open-cookie-settings', openSettings);
    return () => window.removeEventListener('vl:open-cookie-settings', openSettings);
  }, []);

  const save = useCallback((stats, mkt) => {
    const consent = writeConsent({
      statistics: stats ? 'granted' : 'denied',
      marketing:  mkt   ? 'granted' : 'denied',
    });
    pushConsentEvents(consent);
    setOpen(false);
    setView('main');
  }, []);

  if (!open) return null;

  const isCustom = view === 'custom';

  return (
    <div
      role="dialog"
      aria-label={t('cookies_banner.title')}
      aria-modal="false"
      style={{
        position: 'fixed', bottom: 16, left: 16, zIndex: 2147483000,
        width: 'min(380px, calc(100% - 32px))',
        background: PAPER, border: `1px solid ${LINE}`, borderTop: `3px solid ${GOLD}`,
        borderRadius: 4, boxShadow: '0 10px 34px rgba(15,29,56,0.22)',
        fontFamily: FONT_SANS, padding: 18,
      }}
    >
      <div style={{ fontFamily: FONT_SERIF, fontSize: 17, fontWeight: 600, color: NAVY, marginBottom: 6 }}>
        {t('cookies_banner.title')}
      </div>
      <p style={{ fontFamily: FONT_SANS, fontSize: 12.5, lineHeight: 1.55, color: INK, margin: 0 }}>
        {t('cookies_banner.body')}{' '}
        <LocalLink to="/cookies" style={{ color: GOLD_DEEP, textDecoration: 'underline', whiteSpace: 'nowrap' }}>
          {t('cookies_banner.privacy_link')}
        </LocalLink>
      </p>

      {isCustom && (
        <div style={{ margin: '12px 0 2px 0' }}>
          <CategoryRow
            title={t('cookies_banner.cat_necessary')}
            desc={t('cookies_banner.cat_necessary_desc')}
            disabled
            alwaysLabel={t('cookies_banner.always_on')}
          />
          <CategoryRow
            title={t('cookies_banner.cat_statistics')}
            desc={t('cookies_banner.cat_statistics_desc')}
            on={statistics}
            onChange={setStatistics}
          />
          <CategoryRow
            title={t('cookies_banner.cat_marketing')}
            desc={t('cookies_banner.cat_marketing_desc')}
            on={marketing}
            onChange={setMarketing}
          />
        </div>
      )}

      {/* Botones: fila de 2 (Rechazar / Aceptar o Guardar) + enlace Personalizar */}
      <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
        <button type="button" onClick={() => save(false, false)} style={{ ...btnSecondary, flex: 1 }}>
          {t('cookies_banner.reject_all')}
        </button>
        {isCustom
          ? <button type="button" onClick={() => save(statistics, marketing)} style={{ ...btnPrimary, flex: 1 }}>
              {t('cookies_banner.save')}
            </button>
          : <button type="button" onClick={() => save(true, true)} style={{ ...btnPrimary, flex: 1 }}>
              {t('cookies_banner.accept_all')}
            </button>}
      </div>

      {!isCustom && (
        <button type="button" onClick={() => setView('custom')} style={btnLink}>
          {t('cookies_banner.customize')}
        </button>
      )}
    </div>
  );
}

// ─────────────────────────── estilos de botón (locales) ───────────────────────────

const btnBase = {
  fontFamily: FONT_SANS, fontSize: 12, letterSpacing: '0.05em', textTransform: 'uppercase',
  fontWeight: 600, padding: '10px 14px', borderRadius: 2, cursor: 'pointer',
  transition: 'all 160ms ease',
};
const btnPrimary   = { ...btnBase, color: PAPER, background: NAVY, border: `1px solid ${NAVY}` };
const btnSecondary = { ...btnBase, color: NAVY, background: 'transparent', border: `1px solid ${NAVY}` };
const btnLink = {
  display: 'block', width: '100%', marginTop: 10, padding: 4,
  fontFamily: FONT_SANS, fontSize: 12, color: MUTED, background: 'transparent',
  border: 'none', cursor: 'pointer', textDecoration: 'underline', textAlign: 'center',
};
