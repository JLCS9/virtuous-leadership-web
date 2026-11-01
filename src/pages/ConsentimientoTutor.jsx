// Autorización del padre, madre o tutor — destino del email que recibe el
// tutor cuando un menor de 14 años hace el test de temperamento.
// El enlace lleva ?token=…; al pulsar «Autorizar», la API desbloquea la cuenta
// del menor y registra el consentimiento (consents, purpose 'tutor').
//
// Va SIN Layout (NO_LAYOUT_PAGES). SEO: noindex.

import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useT, LocalLink as Link } from '../i18n';
import SEO from '../components/SEO';
import { TestShell } from '../TestTBP';
import { confirmGuardian } from '../account/account';
import { Card, Title, PrimaryButton, Notice } from '../account/ui';
import { NAVY, FONT_SANS, styles } from '../theme';

export default function ConsentimientoTutor() {
  const { t } = useT();
  const [params] = useSearchParams();
  const token = params.get('token') || '';
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState(null);

  async function confirm() {
    if (busy) return;
    setBusy(true);
    setStatus(await confirmGuardian(token));
    setBusy(false);
  }

  const done = status === 'ok' || status === 'already';

  return (
    <>
      <SEO title={`${t('guardian.title')} | Virtuous Leadership`} description={t('guardian.title')} path="/consentimiento-tutor" noindex={true} />
      <TestShell>
        <Card>
          <Title eyebrow={t('guardian.eyebrow')}>{t('guardian.title')}</Title>
          {!token ? (
            <p style={{ ...styles.para, marginTop: 12 }}>{t('guardian.invalid')}</p>
          ) : done ? (
            <>
              <Notice tone="ok">{t('guardian.done')}</Notice>
              <Link to="/mi-panel" style={{ fontFamily: FONT_SANS, color: NAVY }}>{t('guardian.go_panel')} →</Link>
            </>
          ) : (
            <>
              <p style={{ ...styles.para, marginTop: 12 }}>{t('guardian.intro')}</p>
              <ul style={{ ...styles.para, paddingLeft: 20 }}>
                {t('guardian.points').map(p => <li key={p}>{p}</li>)}
              </ul>
              <p
                style={{ ...styles.para, fontSize: 13 }}
                dangerouslySetInnerHTML={{ __html: t('guardian.privacy') }}
              />
              {status && <Notice>{t(status === 'expired' ? 'guardian.expired' : status === 'invalid' ? 'guardian.invalid' : 'guardian.failed')}</Notice>}
              <PrimaryButton onClick={confirm} busy={busy}>{t('guardian.submit')}</PrimaryButton>
              <p style={{ ...styles.para, fontSize: 13, marginTop: 16 }}>{t('guardian.decline')}</p>
            </>
          )}
        </Card>
      </TestShell>
    </>
  );
}
