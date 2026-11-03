import { useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { supabase } from '../account/supabase';
import { NAVY, MUTED, PAPER, GOLD_REF, FONT_SLAB, FONT_BODY } from '../theme';
import { eyebrow, tarjeta, titulo } from './estilos';

export default function Perfil() {
  const { user } = useOutletContext();
  const [perfil, setPerfil] = useState(null);

  useEffect(() => {
    let vivo = true;
    supabase.from('profiles').select('first_name, last_name, birth_year, sex').eq('id', user.id).maybeSingle()
      .then(({ data }) => { if (vivo && data) setPerfil(data); });
    return () => { vivo = false; };
  }, [user.id]);

  const nombre = perfil?.first_name || user.user_metadata?.first_name || '';
  const apellido = perfil?.last_name || user.user_metadata?.last_name || '';
  const email = user.email;

  return (
    <div className="vl-cols">
      <section style={tarjeta} className="vl-ancho">
        <div style={eyebrow}>Mi perfil</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 18, marginTop: 12 }}>
          <div style={{
            width: 64, height: 64, borderRadius: '50%', background: NAVY,
            display: 'grid', placeItems: 'center', flex: '0 0 64px',
          }}>
            <span style={{ fontFamily: FONT_SLAB, fontSize: 26, fontWeight: 700, color: PAPER }}>
              {nombre ? nombre[0].toUpperCase() : '?'}
            </span>
          </div>
          <div>
            <h2 style={{ ...titulo(24), margin: 0 }}>{nombre}{apellido ? ` ${apellido}` : ''}</h2>
            {email && <p style={{ fontFamily: FONT_BODY, fontSize: 14, color: MUTED, margin: '4px 0 0' }}>{email}</p>}
          </div>
        </div>
      </section>

      {perfil && (
        <section style={tarjeta}>
          <div style={eyebrow}>Datos</div>
          <dl style={{ margin: '12px 0 0', display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '8px 16px', fontFamily: FONT_BODY, fontSize: 14.5 }}>
            {perfil.birth_year && (
              <>
                <dt style={{ color: MUTED, fontWeight: 500 }}>Año de nacimiento</dt>
                <dd style={{ color: NAVY, margin: 0 }}>{perfil.birth_year}</dd>
              </>
            )}
            {perfil.sex && (
              <>
                <dt style={{ color: MUTED, fontWeight: 500 }}>Sexo</dt>
                <dd style={{ color: NAVY, margin: 0 }}>{perfil.sex === 'Male' ? 'Hombre' : 'Mujer'}</dd>
              </>
            )}
          </dl>
        </section>
      )}
    </div>
  );
}
