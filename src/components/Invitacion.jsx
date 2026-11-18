// Invitación al test de temperamento desde «Tu entorno» de otra persona (enlace con ?inv=<token>).
// Montado en la raíz (App.jsx), fuera del test, para no tocar su flujo:
//   1. Recuerda el token del enlace.
//   2. En la página del test pregunta UNA vez si quiere compartir su resultado con quien le invita.
//      Es una decisión expresa: sin un «sí» no se comparte nada.
//   3. Si dijo que sí, en cuanto hay sesión y resultado guardado avisa al servidor, que marca la
//      ficha como verificada. Se reintenta al cambiar de página (el resultado se guarda al final
//      del test) y un par de veces más por si el guardado va con retraso.
import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useT, pageIdFromLocation } from '../i18n';
import { useSession } from '../account/useSession';
import {
  aceptarInvitacion, capturarInvitacion, decidirInvitacion, infoInvitacion, leerInvitacion, olvidarInvitacion,
} from '../account/invitacion';
import { NAVY, PAPER, INK, MUTED, LINE, FONT_SLAB, FONT_BODY } from '../theme';

const REINTENTOS_MS = [5000, 15000];

export default function Invitacion() {
  const { t } = useT();
  const { pathname, search } = useLocation();
  const session = useSession();
  const [inv, setInv] = useState(() => leerInvitacion());
  const [info, setInfo] = useState(null);

  useEffect(() => { setInv(capturarInvitacion(search)); }, [search]);

  const token = inv?.token;
  const pendiente = Boolean(inv) && inv.compartir === null;
  const aceptada = inv?.compartir === true;
  const enTest = pageIdFromLocation(pathname) === 'test_temperamento';
  const userId = session?.user?.id;

  // Decisión pendiente: quién invita (y si el enlace sigue valiendo).
  useEffect(() => {
    if (!pendiente || !enTest) return undefined;
    let vivo = true;
    infoInvitacion(token).then((d) => {
      if (!vivo || !d) return;
      if (d.status === 'ok') setInfo(d);
      else { olvidarInvitacion(); setInv(null); }
    });
    return () => { vivo = false; };
  }, [token, pendiente, enTest]);

  // Dijo que sí: compartir en cuanto haya sesión y resultado.
  useEffect(() => {
    if (!aceptada || !userId) return undefined;
    let vivo = true;
    const esperas = [];
    const intentar = (n) => aceptarInvitacion(token).then((estado) => {
      if (!vivo) return;
      if (estado && estado !== 'sin_resultado') { olvidarInvitacion(); setInv(null); return; }
      if (n < REINTENTOS_MS.length) esperas.push(setTimeout(() => intentar(n + 1), REINTENTOS_MS[n]));
    });
    intentar(0);
    return () => { vivo = false; esperas.forEach(clearTimeout); };
  }, [token, aceptada, userId, pathname]);

  if (!pendiente || !enTest || !info) return null;

  const decidir = (compartir) => { setInv(decidirInvitacion(compartir)); setInfo(null); };
  const de = info.de;
  const boton = {
    width: '100%', minHeight: 52, fontFamily: FONT_BODY, fontSize: 17, fontWeight: 600, cursor: 'pointer',
    borderRadius: 0, padding: '14px 18px', border: `1.5px solid ${NAVY}`,
  };

  return (
    <div role="dialog" aria-modal="true" aria-labelledby="vl-inv-titulo"
         style={{ position: 'fixed', inset: 0, zIndex: 300, display: 'grid', placeItems: 'center', padding: 16, background: 'rgba(15,29,56,0.55)' }}>
      <div style={{ background: PAPER, width: '100%', maxWidth: 480, maxHeight: '90vh', overflow: 'auto', padding: '28px 24px', border: `1px solid ${LINE}` }}>
        <h2 id="vl-inv-titulo" style={{ fontFamily: FONT_SLAB, fontSize: 30, lineHeight: 1.15, fontWeight: 600, color: NAVY, margin: '0 0 12px' }}>
          {de ? t('invitacion.titulo', { nombre: de }) : t('invitacion.titulo_sin_nombre')}
        </h2>
        <p style={{ fontFamily: FONT_BODY, fontSize: 17, lineHeight: 1.55, color: INK, margin: '0 0 20px' }}>
          {de ? t('invitacion.texto', { nombre: de }) : t('invitacion.texto_sin_nombre')}
        </p>
        <div style={{ display: 'grid', gap: 10 }}>
          <button type="button" onClick={() => decidir(true)} style={{ ...boton, color: PAPER, background: NAVY }}>{t('invitacion.compartir')}</button>
          <button type="button" onClick={() => decidir(false)} style={{ ...boton, color: NAVY, background: 'transparent' }}>{t('invitacion.no_compartir')}</button>
        </div>
        <p style={{ fontFamily: FONT_BODY, fontSize: 16, lineHeight: 1.45, color: MUTED, margin: '16px 0 0' }}>{de ? t('invitacion.nota', { nombre: de }) : t('invitacion.nota_sin_nombre')}</p>
      </div>
    </div>
  );
}
