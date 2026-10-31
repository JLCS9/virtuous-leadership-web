// «Mi panel» — espacio privado del usuario. La cuenta se crea al terminar el
// test de temperamento (TestTBP.jsx → /api/account) y aquí se muestra su
// último resultado: perfil, virtud-desafío, fortaleza, debilidad y reto.
//
// Sin sesión: formulario de acceso (email + contraseña) con recuperación de
// contraseña. Sin cuentas configuradas (faltan VITE_SUPABASE_*): invita a
// hacer el test.
//
// Va SIN Layout (NO_LAYOUT_PAGES) con el mismo fondo y tipografías del test.
// SEO: noindex (página privada).

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useT, useLocalPath, LocalLink as Link, ROUTES } from '../i18n';
import SEO from '../components/SEO';
import { TestShell, ResultScreen } from '../TestTBP';
import { supabase, accountsEnabled } from '../account/supabase';
import { useSession } from '../account/useSession';
import { AccountError, signIn, sendPasswordReset, fetchLatestTemperament, fetchFirstName } from '../account/account';
import { Card, Title, Field, PrimaryButton, LinkButton, Notice, TopBar } from '../account/ui';
import { NAVY, MUTED, FONT_SANS, styles } from '../theme';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function MiPanel() {
  const { t } = useT();
  const session = useSession();

  return (
    <>
      <SEO title={`${t('panel.title')} | Virtuous Leadership`} description={t('panel.title')} path="/mi-panel" noindex={true} />
      <TestShell>
        {session === undefined ? null
          : session ? <Dashboard user={session.user} />
          : <LoginForm />}
      </TestShell>
    </>
  );
}

function Dashboard({ user }) {
  const { t } = useT();
  const lp = useLocalPath();
  const navigate = useNavigate();
  const [state, setState] = useState({ loading: true });

  useEffect(() => {
    let alive = true;
    Promise.all([fetchLatestTemperament(), fetchFirstName(user)])
      .then(([row, firstName]) => { if (alive) setState({ loading: false, row, firstName }); })
      .catch(() => { if (alive) setState({ loading: false, failed: true }); });
    return () => { alive = false; };
  }, [user]);

  async function logout() {
    // Solo este navegador: no cierra la sesión de la app móvil.
    await supabase.auth.signOut({ scope: 'local' });
  }

  const r = state.row?.result;

  return (
    <>
      <TopBar>
        {state.firstName && <span>{t('panel.greeting', { name: state.firstName })}</span>}
        <LinkButton onClick={logout}>{t('panel.logout')}</LinkButton>
      </TopBar>

      {state.loading ? (
        <p style={{ ...styles.para, textAlign: 'center', color: MUTED }}>{t('panel.loading')}</p>
      ) : state.failed ? (
        <Card><Notice>{t('panel.load_failed')}</Notice></Card>
      ) : !r ? (
        <Card>
          <Title eyebrow={t('panel.eyebrow')}>{t('panel.empty_title')}</Title>
          <p style={{ ...styles.para, marginTop: 12 }}>{t('panel.empty_intro')}</p>
          <div style={{ marginTop: 20 }}>
            <PrimaryButton onClick={() => navigate(lp('/tests/temperamento'))}>{t('panel.take_test')}</PrimaryButton>
          </div>
        </Card>
      ) : (
        <ResultScreen
          inPanel
          profileKey={r.profileKey}
          primario={r.primario}
          secondaryStrength={r.isPure ? null : Math.abs(r.scoreS2)}
          onRestart={() => navigate(lp('/tests/temperamento'))}
        />
      )}
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
