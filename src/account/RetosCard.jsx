// Entrada a «Retos diarios» (beta privada): solo versión ES y solo cuentas con
// suscripción activa a Retos. Para el resto no renderiza nada, así que se puede
// montar en cualquier página (Mi panel, landing de resultados) sin afectar al público.
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useT, useLocalPath } from '../i18n';
import { tieneAccesoRetos } from './retos';
import { Card, Title, PrimaryButton } from './ui';
import { styles } from '../theme';

export default function RetosCard() {
  const { t, lang } = useT();
  const lp = useLocalPath();
  const navigate = useNavigate();
  const [acceso, setAcceso] = useState(false);

  useEffect(() => {
    if (lang !== 'es') return undefined;
    let vivo = true;
    tieneAccesoRetos().then((ok) => { if (vivo) setAcceso(ok); }).catch(() => {});
    return () => { vivo = false; };
  }, [lang]);

  if (!acceso) return null;
  return (
    <div style={{ margin: '0 0 20px' }}>
      <Card>
        <Title eyebrow={t('retos.eyebrow')}>{t('retos.card_title')}</Title>
        <p style={{ ...styles.para, marginTop: 12, marginBottom: 20 }}>{t('retos.card_intro')}</p>
        <PrimaryButton onClick={() => navigate(lp('/mi-panel/retos'))}>{t('retos.card_cta')}</PrimaryButton>
      </Card>
    </div>
  );
}
