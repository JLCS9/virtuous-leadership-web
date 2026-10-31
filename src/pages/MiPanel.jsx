import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useT, useLocalPath, LocalLink as Link, ROUTES } from '../i18n';
import SEO from '../components/SEO';
import { supabase, accountsEnabled } from '../account/supabase';
import { useSession } from '../account/useSession';
import { AccountError, signIn, sendPasswordReset } from '../account/account';
import {
  NAVY, GOLD, GOLD_DEEP,
  PAPER, BEIGE, MUTED,
  FONT_SANS,
  styles,
} from '../theme';
import { Card, Title, Field, PrimaryButton, LinkButton, Notice } from '../account/ui';
import RetosCard from '../account/RetosCard';
import { useAcceso } from '../account/useAcceso';
import { PanelHoy } from './PanelApp';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function MiPanel() {
  const { t, lang } = useT();
  const session = useSession();
  // Con la suscripción a Retos activa (y en ES), el panel es el de pestañas; sin ella, el de siempre.
  const acceso = useAcceso(Boolean(session) && lang === 'es');

  return (
    <>
      <SEO
        title={`${t('panel.title')} | Virtuous Leadership`}
        description={t('panel.seo_description')}
        path="/mi-panel"
        noindex={true}
      />
      {session === undefined ? (
        <Shell><Loading /></Shell>
      ) : session ? (
        acceso === true ? <PanelHoy />
          : acceso === undefined && lang === 'es' ? <Shell><Loading /></Shell>
          : <Shell><PanelHome session={session} /></Shell>
      ) : (
        <Shell><LoginForm /></Shell>
      )}
    </>
  );
}

function Shell({ children }) {
  return (
    <div style={{
      minHeight: '100vh',
      background: BEIGE,
      fontFamily: FONT_SANS,
      WebkitFontSmoothing: 'antialiased',
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
        * { box-sizing: border-box; margin: 0; }
        button:focus-visible { outline: 2px solid ${GOLD}; outline-offset: 2px; }
      `}</style>
      <main style={{ padding: '48px 24px' }}>
        {children}
      </main>
    </div>
  );
}

function Loading() {
  return <p style={{ ...styles.para, textAlign: 'center', color: MUTED }}>...</p>;
}

function PanelHome({ session }) {
  const { t } = useT();

  async function logout() {
    await supabase.auth.signOut({ scope: 'local' });
  }

  return (
    <>
      <RetosCard />
      <Card>
        <Title eyebrow={t('panel.eyebrow')}>{t('panel.title')}</Title>
        <p style={{ ...styles.para, marginTop: 12 }}>
          {session.user.email}
        </p>
        <div style={{ marginTop: 20 }}>
          <LinkButton onClick={logout}>{t('panel.logout')}</LinkButton>
        </div>
      </Card>
    </>
  );
}

function LoginForm() {
  const { t, lang } = useT();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const [resetSent, setResetSent] = useState(false);

  if (!accountsEnabled) {
    return (
      <Card>
        <Title eyebrow={t('panel.eyebrow')}>{t('panel.login_title')}</Title>
        <p style={{ ...styles.para, marginTop: 12 }}>{t('panel.no_accounts')}</p>
        <Link to="/tests/temperamento" style={{ fontFamily: FONT_SANS, color: NAVY }}>{t('panel.take_test')} →</Link>
      </Card>
    );
  }

  async function submit(e) {
    e.preventDefault();
    if (busy) return;
    setError(null);
    setResetSent(false);
    if (!EMAIL_RE.test(email.trim()) || !password) { setError(t('panel.errors.invalid')); return; }
    setBusy(true);
    try {
      await signIn(email.trim().toLowerCase(), password);
    } catch (err) {
      setError(t(err instanceof AccountError && err.code === 'invalid' ? 'panel.errors.invalid' : 'panel.errors.generic'));
      setBusy(false);
    }
  }

  async function forgot() {
    setError(null);
    if (!EMAIL_RE.test(email.trim())) { setError(t('panel.errors.email_for_reset')); return; }
    try {
      await sendPasswordReset(email.trim().toLowerCase(), `${window.location.origin}/${lang}/${ROUTES.restablecer[lang]}`);
      setResetSent(true);
    } catch {
      setError(t('panel.errors.generic'));
    }
  }

  return (
    <Card>
      <Title eyebrow={t('panel.eyebrow')}>{t('panel.login_title')}</Title>
      <p style={{ ...styles.para, marginTop: 12, marginBottom: 24 }}>{t('panel.login_intro')}</p>

      {error && <Notice>{error}</Notice>}
      {resetSent && <Notice tone="ok">{t('panel.reset_sent')}</Notice>}

      <form onSubmit={submit} noValidate>
        <Field id="login-email" label={t('panel.fields.email')} type="email" autoComplete="email"
               value={email} onChange={e => setEmail(e.target.value)} />
        <Field id="login-password" label={t('panel.fields.password')} type="password" autoComplete="current-password"
               value={password} onChange={e => setPassword(e.target.value)} />
        <PrimaryButton type="submit" busy={busy}>{busy ? t('panel.submitting') : t('panel.submit')}</PrimaryButton>
      </form>

      <div style={{ marginTop: 18, display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, fontFamily: FONT_SANS, fontSize: 14 }}>
        <LinkButton onClick={forgot}>{t('panel.forgot')}</LinkButton>
        <Link to="/tests/temperamento" style={{ color: NAVY }}>{t('panel.no_account')}</Link>
      </div>
    </Card>
  );
}
