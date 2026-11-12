import { useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { BEIGE, INK, FONT_BODY, FONT_SLAB, GOLD_REF, GOLD_REF_DK, GOLD_REF_LT, LINE, MUTED } from '../theme';
import { useT } from '../i18n';
import Header from './Header';
import Footer from './Footer';

function useWidth() {
  const [w, setW] = useState(typeof window !== 'undefined' ? window.innerWidth : 1024);
  useEffect(() => {
    const h = () => setW(window.innerWidth);
    window.addEventListener('resize', h);
    return () => window.removeEventListener('resize', h);
  }, []);
  return w;
}

function ContactModal({ open, onClose }) {
  const { t } = useT();
  const closeRef = useRef(null);
  const w = useWidth();
  const tablet = w >= 760;
  const [form, setForm] = useState({});
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const id = setTimeout(() => closeRef.current && closeRef.current.focus(), 30);
    const onKey = (e) => { if (e.key === 'Escape') { onClose(); setSent(false); } };
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prev;
      clearTimeout(id);
      window.removeEventListener('keydown', onKey);
    };
  }, [open]);

  if (!open) return null;

  const handleClose = () => { onClose(); setSent(false); };

  const upd = (field) => (e) => setForm((prev) => ({
    ...prev, [field]: e.target.type === 'checkbox' ? e.target.checked : e.target.value,
  }));
  const handleSubmit = async (e) => {
    e.preventDefault();
    const url = import.meta.env.VITE_SUBMIT_CONTACT_URL;
    if (url) {
      setSending(true);
      try {
        await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            nombre: form.nombre || '',
            apellidos: form.apellidos || '',
            email: form.email || '',
            tel: form.tel || '',
            pais: form.pais || '',
            centro: form.centro || '',
            cargo: form.cargo || '',
            mensaje: form.mensaje || '',
            comercial: form.comercial || false,
          }),
        });
      } catch (err) {
        console.error('[contacto] submit error:', err);
      } finally {
        setSending(false);
      }
    }
    setSent(true);
    setForm({});
  };

  const fld = {
    display: 'block', width: '100%', boxSizing: 'border-box', padding: '12px 14px',
    border: `1px solid ${LINE}`, fontFamily: FONT_BODY, fontSize: 16, color: INK,
    background: '#fff', outline: 'none', borderRadius: 0,
  };

  return (
    <div role="dialog" aria-modal="true" aria-labelledby="contact-modal-title"
         onClick={(e) => { if (e.target === e.currentTarget) handleClose(); }}
         style={{
           position: 'fixed', inset: 0, zIndex: 100,
           background: 'rgba(15,30,51,.78)',
           display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20,
         }}>
      <div style={{
        position: 'relative', background: '#fff', width: '100%', maxWidth: 580,
        maxHeight: 'calc(100svh - 40px)', overflow: 'auto',
        padding: 'clamp(28px,5vw,48px)', boxSizing: 'border-box',
        boxShadow: '0 18px 50px rgba(15,30,51,0.20)',
        borderTop: `2px solid ${GOLD_REF}`,
      }}>
        <button type="button" ref={closeRef} aria-label="Cerrar" onClick={handleClose} style={{
          all: 'unset', position: 'absolute', top: 12, right: 12,
          width: 44, height: 44, display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer', color: MUTED,
        }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square" aria-hidden="true">
            <path d="M5 5l14 14M19 5L5 19" />
          </svg>
        </button>

        {sent ? (
          <div style={{ textAlign: 'center', padding: '24px 0' }}>
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke={GOLD_REF} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginBottom: 20 }}>
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
            <h2 style={{ margin: '0 0 12px', fontFamily: FONT_SLAB, fontWeight: 700, fontSize: 'clamp(22px,3vw,28px)', color: INK }}>
              {t('home.form_sent_title') || 'Mensaje enviado'}
            </h2>
            <p style={{ margin: '0 0 28px', fontSize: 16, lineHeight: 1.6, color: MUTED }}>
              {t('home.form_sent_text') || 'Gracias por contactarnos. Nos pondremos en contacto con usted a la mayor brevedad.'}
            </p>
            <button type="button" onClick={handleClose} style={{
              background: GOLD_REF, color: '#fff', fontFamily: FONT_BODY, fontWeight: 600,
              fontSize: 16, padding: '14px 32px', border: 'none', cursor: 'pointer',
            }}>{t('home.form_sent_close') || 'Cerrar'}</button>
          </div>
        ) : (
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
          <h2 id="contact-modal-title" style={{
            margin: '0 0 8px', paddingRight: 36, fontFamily: FONT_SLAB, fontWeight: 700,
            fontSize: 'clamp(24px,3vw,30px)', lineHeight: 1.15, color: INK,
          }}>{t('home.form_title') || 'Contacto'}</h2>
          <p style={{ margin: '0 0 24px', fontSize: 16, lineHeight: 1.6, color: MUTED }}>
            {t('home.form_subtitle') || 'Déjenos sus datos y nos pondremos en contacto.'}
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: tablet ? '1fr 1fr' : '1fr', gap: 16, marginBottom: 16 }}>
            <label style={{ display: 'block' }}>
              <span style={{ display: 'block', marginBottom: 6, fontSize: 14, fontWeight: 600, color: INK }}>{t('home.form_nombre') || 'Nombre'} *</span>
              <input type="text" required value={form.nombre || ''} onChange={upd('nombre')} style={fld} />
            </label>
            <label style={{ display: 'block' }}>
              <span style={{ display: 'block', marginBottom: 6, fontSize: 14, fontWeight: 600, color: INK }}>{t('home.form_apellidos') || 'Apellidos'} *</span>
              <input type="text" required value={form.apellidos || ''} onChange={upd('apellidos')} style={fld} />
            </label>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: tablet ? '1fr 1fr' : '1fr', gap: 16, marginBottom: 16 }}>
            <label style={{ display: 'block' }}>
              <span style={{ display: 'block', marginBottom: 6, fontSize: 14, fontWeight: 600, color: INK }}>Email *</span>
              <input type="email" required value={form.email || ''} onChange={upd('email')} style={fld} />
            </label>
            <label style={{ display: 'block' }}>
              <span style={{ display: 'block', marginBottom: 6, fontSize: 14, fontWeight: 600, color: INK }}>{t('home.form_tel') || 'Teléfono'} *</span>
              <input type="tel" required value={form.tel || ''} onChange={upd('tel')} style={fld} />
            </label>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: tablet ? '1fr 1fr' : '1fr', gap: 16, marginBottom: 16 }}>
            <label style={{ display: 'block' }}>
              <span style={{ display: 'block', marginBottom: 6, fontSize: 14, fontWeight: 600, color: INK }}>{t('home.form_pais') || 'País'} *</span>
              <input type="text" required value={form.pais || ''} onChange={upd('pais')} style={fld} />
            </label>
            <label style={{ display: 'block' }}>
              <span style={{ display: 'block', marginBottom: 6, fontSize: 14, fontWeight: 600, color: INK }}>{t('home.form_centro') || 'Centro / Institución'} *</span>
              <input type="text" required value={form.centro || ''} onChange={upd('centro')} style={fld} />
            </label>
          </div>

          <label style={{ display: 'block', marginBottom: 16 }}>
            <span style={{ display: 'block', marginBottom: 6, fontSize: 14, fontWeight: 600, color: INK }}>{t('home.form_cargo') || 'Cargo'} *</span>
            <input type="text" required value={form.cargo || ''} onChange={upd('cargo')} style={fld} />
          </label>

          <label style={{ display: 'block', marginBottom: 16 }}>
            <span style={{ display: 'block', marginBottom: 6, fontSize: 14, fontWeight: 600, color: INK }}>{t('home.form_mensaje') || 'Mensaje'}</span>
            <textarea rows={3} value={form.mensaje || ''} onChange={upd('mensaje')} style={{ ...fld, resize: 'vertical' }} />
          </label>

          <label style={{ display: 'flex', alignItems: 'flex-start', gap: 10, fontSize: 14, lineHeight: 1.5, cursor: 'pointer', marginBottom: 8 }}>
            <input type="checkbox" required checked={form.rgpd || false} onChange={upd('rgpd')} style={{ marginTop: 3, flexShrink: 0 }} />
            <span>{t('home.form_rgpd') || 'Acepto la política de privacidad y el tratamiento de mis datos personales.'}</span>
          </label>

          <label style={{ display: 'flex', alignItems: 'flex-start', gap: 10, fontSize: 14, lineHeight: 1.5, cursor: 'pointer', marginBottom: 12 }}>
            <input type="checkbox" checked={form.comercial || false} onChange={upd('comercial')} style={{ marginTop: 3, flexShrink: 0 }} />
            <span>{t('home.form_newsletter') || 'Acepto recibir información y comunicaciones sobre los programas de Liderazgo Virtuoso.'}</span>
          </label>

          <button type="submit" disabled={sending} style={{
            display: 'flex', width: '100%', justifyContent: 'center', alignItems: 'center',
            background: sending ? MUTED : GOLD_REF, color: '#fff', fontFamily: FONT_BODY, fontWeight: 600,
            fontSize: 16, padding: '16px 28px', border: 'none', cursor: sending ? 'wait' : 'pointer',
            transition: 'background 200ms ease', marginTop: 8,
            opacity: sending ? 0.7 : 1,
          }}
            onMouseOver={e => { if (!sending) e.currentTarget.style.background = GOLD_REF_LT; }}
            onMouseOut={e => { if (!sending) e.currentTarget.style.background = GOLD_REF; }}
          >{sending ? 'Enviando...' : (t('home.form_submit') || 'Enviar')}</button>
        </form>
        )}
      </div>
    </div>
  );
}

export default function Layout({ children }) {
  const { pathname, hash } = useLocation();
  const [contactOpen, setContactOpen] = useState(false);

  useEffect(() => {
    if (hash) {
      const id = hash.slice(1);
      const t = setTimeout(() => {
        const el = document.getElementById(id);
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        else window.scrollTo({ top: 0 });
      }, 80);
      return () => clearTimeout(t);
    } else {
      window.scrollTo({ top: 0 });
    }
  }, [pathname, hash]);

  useEffect(() => {
    const onOpen = () => setContactOpen(true);
    window.addEventListener('open-contact-modal', onOpen);
    return () => window.removeEventListener('open-contact-modal', onOpen);
  }, []);

  return (
    <div style={{
      minHeight: '100vh', background: BEIGE, color: INK, fontFamily: FONT_BODY,
      display: 'flex', flexDirection: 'column',
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Roboto+Slab:wght@400;700&family=Roboto:ital,wght@0,400;0,600;1,400&display=swap');
        html, body, #root { margin: 0; padding: 0; }
        * { box-sizing: border-box; }
        a { color: inherit; }
        button:focus-visible, a:focus-visible { outline: 2px solid ${GOLD_REF}; outline-offset: 2px; }
      `}</style>
      <Header />
      <main style={{ flex: 1 }}>
        {children}
      </main>
      <Footer />
      <ContactModal open={contactOpen} onClose={() => setContactOpen(false)} />
    </div>
  );
}
