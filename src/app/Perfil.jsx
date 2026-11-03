import { useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { leerPerfil, cambiarPassword } from '../account/perfil';
import { NAVY, MUTED, GOLD_REF, FONT_SLAB, FONT_BODY, LINE } from '../theme';
import { tarjeta, eyebrow, parrafo, botonPrimario, botonContorno } from './estilos';

const TEMP_NOMBRE = { COL: 'Colérico', MEL: 'Melancólico', SAN: 'Sanguíneo', FLE: 'Flemático' };
const SEXO = { hombre: 'Hombre', mujer: 'Mujer' };
const GRUPO = { familia: 'Familia', trabajo: 'Trabajo', amigos: 'Amigos', comunidad: 'Comunidad' };
const ESTADO_PERSONA = { sin_estimar: 'Sin estimar', estimado: 'Estimado', confirmado: 'Confirmado', invitado: 'Invitado', registrado: 'Registrado' };

function Fila({ label, valor }) {
  if (valor == null || valor === '') return null;
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', padding: '10px 0', borderBottom: `1px solid ${LINE}` }}>
      <span style={{ fontFamily: FONT_BODY, fontSize: 13, color: MUTED, fontWeight: 600 }}>{label}</span>
      <span style={{ fontFamily: FONT_BODY, fontSize: 14, color: NAVY, textAlign: 'right', maxWidth: '60%' }}>{valor}</span>
    </div>
  );
}

function Seccion({ titulo, children }) {
  return (
    <section style={tarjeta}>
      <div style={eyebrow}>{titulo}</div>
      <div style={{ marginTop: 12 }}>{children}</div>
    </section>
  );
}

function CambiarPassword() {
  const [abierto, setAbierto] = useState(false);
  const [pwd, setPwd] = useState('');
  const [estado, setEstado] = useState('idle');

  async function guardar(e) {
    e.preventDefault();
    if (pwd.length < 6) return;
    setEstado('guardando');
    try {
      await cambiarPassword(pwd);
      setEstado('ok');
      setPwd('');
      setTimeout(() => { setEstado('idle'); setAbierto(false); }, 2000);
    } catch {
      setEstado('error');
    }
  }

  if (!abierto) {
    return <button type="button" style={botonContorno} onClick={() => setAbierto(true)}>Cambiar contraseña</button>;
  }

  return (
    <form onSubmit={guardar} style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 8 }}>
      <input
        type="password" value={pwd} onChange={(e) => setPwd(e.target.value)}
        placeholder="Nueva contraseña (mín. 6 car.)" minLength={6}
        style={{ fontFamily: FONT_BODY, fontSize: 14, padding: '10px 14px', border: `1px solid ${LINE}`, borderRadius: 8, outline: 'none' }}
      />
      <div style={{ display: 'flex', gap: 8 }}>
        <button type="submit" disabled={pwd.length < 6 || estado === 'guardando'}
          style={{ ...botonPrimario, opacity: pwd.length < 6 ? 0.5 : 1, fontSize: 13, padding: '10px 20px' }}>
          {estado === 'guardando' ? 'Guardando…' : 'Guardar'}
        </button>
        <button type="button" style={{ ...botonContorno, fontSize: 13, padding: '10px 16px' }} onClick={() => { setAbierto(false); setPwd(''); setEstado('idle'); }}>
          Cancelar
        </button>
      </div>
      {estado === 'ok' && <p style={{ ...parrafo, color: '#2e7d32', margin: 0, fontSize: 13 }}>Contraseña actualizada</p>}
      {estado === 'error' && <p style={{ ...parrafo, color: '#c62828', margin: 0, fontSize: 13 }}>Error al cambiar la contraseña</p>}
    </form>
  );
}

function PerfilVirtudes({ tests }) {
  const charTest = tests.find(t => t.kind === 'character');
  if (!charTest?.result?.virtues) return null;
  const virtudes = charTest.result.virtues;
  const nombres = { prudencia: 'Prudencia', fortaleza: 'Fortaleza', dominio: 'Dominio de sí', justicia: 'Justicia', magnanimidad: 'Magnanimidad', humildad: 'Humildad' };
  return (
    <div style={{ marginTop: 6 }}>
      {Object.entries(nombres).map(([key, nombre]) => {
        const v = virtudes[key];
        if (!v) return null;
        const pct = Math.round((v.global ?? 0) * 100);
        return (
          <div key={key} style={{ padding: '8px 0', borderBottom: `1px solid ${LINE}` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
              <span style={{ fontFamily: FONT_BODY, fontSize: 13, fontWeight: 600, color: NAVY }}>{nombre}</span>
              <span style={{ fontFamily: FONT_BODY, fontSize: 13, color: MUTED }}>{pct}%</span>
            </div>
            <div style={{ height: 6, borderRadius: 3, background: LINE, overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${pct}%`, background: GOLD_REF, borderRadius: 3, transition: 'width 600ms ease' }} />
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default function Perfil() {
  const { user } = useOutletContext();
  const [data, setData] = useState(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    let vivo = true;
    leerPerfil(user.id).then(d => { if (vivo) { setData(d); setCargando(false); } })
      .catch(() => { if (vivo) setCargando(false); });
    return () => { vivo = false; };
  }, [user.id]);

  if (cargando) {
    return <p style={{ fontFamily: FONT_BODY, fontSize: 15, color: MUTED, textAlign: 'center', padding: 40 }}>Cargando perfil…</p>;
  }
  if (!data?.profile) {
    return <p style={{ fontFamily: FONT_BODY, fontSize: 15, color: MUTED, textAlign: 'center', padding: 40 }}>No se pudo cargar el perfil.</p>;
  }

  const { profile, tests, personas, camino, consents } = data;
  const tempTest = tests.find(t => t.kind === 'temperament');
  const tempPerfil = tempTest?.result?.profile;
  const tempPartes = tempPerfil?.split('-') ?? [];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18, maxWidth: 720 }}>
      <h1 style={{ fontFamily: FONT_SLAB, fontSize: 28, fontWeight: 700, color: NAVY, margin: 0, lineHeight: 1.2 }}>
        {profile.first_name ?? 'Tu perfil'}
      </h1>

      {/* --- CONFIGURACIÓN DE CUENTA --- */}
      <Seccion titulo="Tu cuenta">
        <Fila label="Email" valor={user.email} />
        <Fila label="Idioma" valor={{ es: 'Español', en: 'English', fr: 'Français', ru: 'Русский' }[profile.locale]} />
        <div style={{ marginTop: 14 }}>
          <CambiarPassword />
        </div>
      </Seccion>

      {/* --- DATOS PERSONALES --- */}
      <Seccion titulo="Datos personales">
        <Fila label="Nombre" valor={[profile.first_name, profile.last_name].filter(Boolean).join(' ')} />
        <Fila label="Sexo" valor={SEXO[profile.sex]} />
        <Fila label="Año de nacimiento" valor={profile.birth_year} />
        <Fila label="País" valor={profile.country} />
        <Fila label="Vida espiritual" valor={profile.spiritual ? 'Sí' : 'No'} />
      </Seccion>

      {/* --- TEMPERAMENTO --- */}
      {tempTest && (
        <Seccion titulo="Tu temperamento">
          <div style={{ fontFamily: FONT_SLAB, fontSize: 22, fontWeight: 700, color: NAVY, margin: '4px 0 12px' }}>
            {tempPartes.map(t => TEMP_NOMBRE[t.toUpperCase()] ?? t).join(' – ')}
          </div>
          {tempTest.result?.scores && (
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              {Object.entries(tempTest.result.scores).sort((a, b) => b[1] - a[1]).map(([t, pts]) => (
                <div key={t} style={{ fontFamily: FONT_BODY, fontSize: 13, color: MUTED }}>
                  <strong style={{ color: NAVY }}>{TEMP_NOMBRE[t] ?? t}</strong> {pts}
                </div>
              ))}
            </div>
          )}
          <Fila label="Fecha" valor={new Date(tempTest.taken_at).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })} />
        </Seccion>
      )}

      {/* --- CARÁCTER --- */}
      {tests.some(t => t.kind === 'character') && (
        <Seccion titulo="Tus virtudes">
          <PerfilVirtudes tests={tests} />
          <Fila label="Fecha" valor={new Date(tests.find(t => t.kind === 'character').taken_at).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })} />
        </Seccion>
      )}

      {/* --- PERSONAS --- */}
      {personas.length > 0 && (
        <Seccion titulo={`Tus personas (${personas.length})`}>
          {personas.map((p, i) => (
            <div key={i} style={{ padding: '10px 0', borderBottom: i < personas.length - 1 ? `1px solid ${LINE}` : 'none', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontFamily: FONT_BODY, fontSize: 14, fontWeight: 600, color: NAVY }}>
                  {p.nombre} {p.estrella && '★'} {p.me_cuesta && '⚡'}
                </div>
                <div style={{ fontFamily: FONT_BODY, fontSize: 12, color: MUTED }}>
                  {GRUPO[p.grupo]} {p.relacion && `· ${p.relacion}`}
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                {p.primario && (
                  <div style={{ fontFamily: FONT_BODY, fontSize: 13, color: NAVY }}>
                    {TEMP_NOMBRE[p.primario]}{p.secundario ? ` – ${TEMP_NOMBRE[p.secundario]}` : ''}
                  </div>
                )}
                <div style={{ fontFamily: FONT_BODY, fontSize: 11, color: MUTED }}>{ESTADO_PERSONA[p.estado]}</div>
              </div>
            </div>
          ))}
        </Seccion>
      )}

      {/* --- CAMINO --- */}
      {camino && (
        <Seccion titulo="Tu camino">
          <Fila label="Objetivo" valor={camino.objetivo} />
          <Fila label="Estado de vida" valor={camino.estado_vida} />
          <Fila label="Vida interior" valor={camino.vida_interior === 'si' ? 'Sí' : camino.vida_interior === 'no' ? 'No' : camino.vida_interior} />
          <Fila label="Inicio" valor={camino.inicio ? new Date(camino.inicio + 'T00:00:00').toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' }) : null} />
          <Fila label="Hora mañana" valor={camino.hora_manana?.slice(0, 5)} />
          <Fila label="Hora examen" valor={camino.hora_examen?.slice(0, 5)} />
        </Seccion>
      )}

      {/* --- CONSENTIMIENTOS --- */}
      <Seccion titulo="Consentimientos">
        {consents.length > 0 ? consents.map((c, i) => (
          <Fila key={i}
            label={{ cuenta: 'Cuenta y resultados', newsletter: 'Boletín', tutor: 'Tutor' }[c.purpose] ?? c.purpose}
            valor={c.granted ? 'Aceptado' : 'Denegado'}
          />
        )) : <p style={{ ...parrafo, margin: 0 }}>Sin consentimientos registrados</p>}
      </Seccion>
    </div>
  );
}
