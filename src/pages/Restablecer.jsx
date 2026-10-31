// Restablecer contraseña — destino del email de recuperación de Supabase.
// supabase-js lee el token del enlace (detectSessionInUrl) y abre una sesión
// de recuperación; aquí el usuario elige la nueva contraseña y pasa a su panel.
//
// Va SIN Layout (NO_LAYOUT_PAGES). SEO: noindex.

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useT, useLocalPath, LocalLink as Link } from '../i18n';
import SEO from '../components/SEO';
import { TestShell } from '../TestTBP';
import { supabase } from '../account/supabase';
import { useSession } from '../account/useSession';
import { Card, Title, Field, PrimaryButton, Notice } from '../account/ui';
import { NAVY, MUTED, FONT_SANS, styles } from '../theme';

export default function Restablecer() {
  const { t } = useT();
  const lp = useLocalPath();
  const navigate = useNavigate();
  const session = useSession();
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  async function submit(e) {
    e.preventDefault();
    if (busy) return;
    if (password.length < 8) { setError(t('reset.errors.short')); return; }
    setBusy(true);
    setError(null);
    const { error: err } = await supabase.auth.updateUser({ password });
    if (err) { setError(t('reset.errors.generic')); setBusy(false); return; }
    navigate(lp('/mi-panel'));
  }

  return (
    <>
      <SEO title={`${t('reset.title')} | Virtuous Leadership`} description={t('reset.title')} path="/restablecer" noindex={true} />
      <TestShell>
        <Card>
          <Title eyebrow={t('panel.eyebrow')}>{t('reset.title')}</Title>
          {session === undefined ? (
            <p style={{ ...styles.para, color: MUTED }}>{t('panel.loading')}</p>
          ) : !session ? (
            <>
              <p style={{ ...styles.para, marginTop: 12 }}>{t('reset.invalid_link')}</p>
              <Link to="/mi-panel" style={{ fontFamily: FONT_SANS, color: NAVY }}>{t('reset.back')} →</Link>
            </>
          ) : (
            <>
              <p style={{ ...styles.para, marginTop: 12, marginBottom: 24 }}>{t('reset.intro')}</p>
              {error && <Notice>{error}</Notice>}
              <form onSubmit={submit} noValidate>
                <Field id="reset-password" label={t('reset.password')} type="password" autoComplete="new-password"
                       hint={t('gate.password_hint')} value={password} onChange={e => setPassword(e.target.value)} />
                <PrimaryButton type="submit" busy={busy}>{t('reset.submit')}</PrimaryButton>
              </form>
            </>
          )}
        </Card>
      </TestShell>
    </>
  );
}
