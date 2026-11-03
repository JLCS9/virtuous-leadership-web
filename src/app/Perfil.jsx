import { useEffect, useState, useCallback } from 'react';
import { useOutletContext } from 'react-router-dom';
import { leerPerfil, cambiarPassword, actualizarPerfil, borrarCuenta } from '../account/perfil';
import { supabase } from '../account/supabase';
import { olvidarAcceso } from '../account/useAcceso';
import { olvidarCatalogo } from '../formacion/useFormacion';
import { NAVY, MUTED, GOLD_REF, GOLD_REF_DK, FONT_SLAB, FONT_BODY, LINE, PAPER, BEIGE } from '../theme';
import { tarjeta, eyebrow, parrafo } from './estilos';

const TEMP_NOMBRE = { COL: 'Colérico', MEL: 'Melancólico', SAN: 'Sanguíneo', FLE: 'Flemático' };
const SEXO = { hombre: 'Hombre', mujer: 'Mujer' };
const GRUPO = { familia: 'Familia', trabajo: 'Trabajo', amigos: 'Amigos', comunidad: 'Comunidad' };
const ESTADO_PERSONA = { sin_estimar: 'Sin estimar', estimado: 'Estimado', confirmado: 'Confirmado', invitado: 'Invitado', registrado: 'Registrado' };
const IDIOMAS = { es: 'Español', en: 'English', fr: 'Français', ru: 'Русский' };

const TABS = [
  { key: 'config', label: 'Configuración' },
  { key: 'datos', label: 'Mis resultados' },
];

/* ─── Primitivas ─── */

function Fila({ label, valor }) {
  if (valor == null || valor === '') return null;
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', padding: '9px 0', borderBottom: `1px solid ${LINE}` }}>
      <span style={{ fontFamily: FONT_BODY, fontSize: 13, color: MUTED }}>{label}</span>
      <span style={{ fontFamily: FONT_BODY, fontSize: 14, color: NAVY, textAlign: 'right', maxWidth: '60%' }}>{valor}</span>
    </div>
  );
}

function Lapiz({ onClick }) {
  return (
    <button type="button" onClick={onClick} aria-label="Editar" style={{
      position: 'absolute', top: 18, right: 18, background: 'none', border: 'none',
      cursor: 'pointer', color: LINE, padding: 2, borderRadius: 0,
      transition: 'color 150ms ease', opacity: 0.7,
    }}
      onMouseEnter={e => { e.currentTarget.style.color = GOLD_REF; e.currentTarget.style.opacity = '1'; }}
      onMouseLeave={e => { e.currentTarget.style.color = LINE; e.currentTarget.style.opacity = '0.7'; }}
    >
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 3a2.83 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
        <path d="m15 5 4 4" />
      </svg>
    </button>
  );
}

function Seccion({ titulo, children, onEdit }) {
  return (
    <section style={{ ...tarjeta, position: 'relative' }}>
      <div style={eyebrow}>{titulo}</div>
      {onEdit && <Lapiz onClick={onEdit} />}
      <div style={{ marginTop: 10 }}>{children}</div>
    </section>
  );
}

function Campo({ label, tipo = 'text', value, onChange, opciones, placeholder }) {
  const base = { fontFamily: FONT_BODY, fontSize: 14, padding: '10px 12px', border: `1px solid ${LINE}`, borderRadius: 0, outline: 'none', width: '100%', background: '#fff' };
  return (
    <label style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      <span style={{ fontFamily: FONT_BODY, fontSize: 12, color: MUTED, fontWeight: 600 }}>{label}</span>
      {opciones ? (
        <select style={base} value={value ?? ''} onChange={e => onChange(e.target.value)}>
          {Object.entries(opciones).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
      ) : (
        <input type={tipo} style={base} value={value ?? ''} onChange={e => onChange(e.target.value)} placeholder={placeholder} />
      )}
    </label>
  );
}

/* ─── Modal overlay ─── */

function Modal({ titulo, children, onClose }) {
  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 100, display: 'grid', placeItems: 'center',
      background: 'rgba(15,29,56,0.55)',
    }} onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div style={{
        background: PAPER, borderRadius: 0, borderTop: `2px solid ${GOLD_REF}`,
        padding: '28px 24px', width: 'min(440px, 92vw)',
        maxHeight: '85vh', overflow: 'auto', boxShadow: '0 8px 32px rgba(15,29,56,0.22)',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
          <h3 style={{ fontFamily: FONT_SLAB, fontSize: 18, fontWeight: 700, color: NAVY, margin: 0 }}>{titulo}</h3>
          <button type="button" onClick={onClose} aria-label="Cerrar" style={{ background: 'none', border: 'none', fontSize: 20, color: MUTED, cursor: 'pointer', padding: 4, lineHeight: 1 }}>&times;</button>
        </div>
        {children}
      </div>
    </div>
  );
}

function BtnGuardar({ onClick, guardando }) {
  return (
    <button type="button" onClick={onClick} disabled={guardando} style={{
      fontFamily: FONT_BODY, fontSize: 14, fontWeight: 600, color: '#fff',
      background: GOLD_REF, border: 'none', borderRadius: 0, padding: '12px 24px',
      cursor: 'pointer', opacity: guardando ? 0.6 : 1, transition: 'opacity 150ms',
    }}>
      {guardando ? 'Guardando…' : 'Guardar'}
    </button>
  );
}

/* ─── Tab 1: Configuración ─── */

function TabConfig({ user, profile, consents, onRefresh }) {
  const [editando, setEditando] = useState(null);
  const [guardando, setGuardando] = useState(false);
  const [draft, setDraft] = useState({});
  const [pwdState, setPwdState] = useState({ pwd: '', estado: 'idle' });
  const [confirmBorrar, setConfirmBorrar] = useState(false);

  function abrir(seccion, datos) {
    setDraft(datos);
    setEditando(seccion);
    setGuardando(false);
  }

  async function guardar(campos) {
    setGuardando(true);
    try {
      await actualizarPerfil(user.id, campos);
      setEditando(null);
      onRefresh();
    } catch { setGuardando(false); }
  }

  async function guardarPwd() {
    if (pwdState.pwd.length < 6) return;
    setPwdState(s => ({ ...s, estado: 'guardando' }));
    try {
      await cambiarPassword(pwdState.pwd);
      setPwdState({ pwd: '', estado: 'ok' });
      setTimeout(() => { setPwdState({ pwd: '', estado: 'idle' }); setEditando(null); }, 1800);
    } catch { setPwdState(s => ({ ...s, estado: 'error' })); }
  }

  async function salir() {
    olvidarAcceso();
    olvidarCatalogo();
    await supabase.auth.signOut({ scope: 'local' });
  }

  async function eliminar() {
    try {
      await borrarCuenta();
      olvidarAcceso();
      olvidarCatalogo();
    } catch { /* redirect will happen anyway from auth state change */ }
  }

  return (
    <>
      <div className="vl-cols">
        {/* General */}
        <Seccion titulo="Configuración general" onEdit={() => abrir('general', { locale: profile.locale })}>
          <Fila label="Email" valor={user.email} />
          <Fila label="Idioma" valor={IDIOMAS[profile.locale]} />
          <div style={{ marginTop: 12 }}>
            <button type="button" onClick={() => { setPwdState({ pwd: '', estado: 'idle' }); setEditando('password'); }} style={{
              fontFamily: FONT_BODY, fontSize: 13, color: GOLD_REF_DK, background: 'none', border: 'none',
              cursor: 'pointer', padding: 0, textDecoration: 'underline',
            }}>Cambiar contraseña</button>
          </div>
        </Seccion>

        {/* Datos personales */}
        <Seccion titulo="Datos personales" onEdit={() => abrir('personal', {
          first_name: profile.first_name ?? '', last_name: profile.last_name ?? '',
          sex: profile.sex ?? '', birth_year: profile.birth_year ?? '', country: profile.country ?? '',
          spiritual: profile.spiritual ?? false,
        })}>
          <Fila label="Nombre" valor={[profile.first_name, profile.last_name].filter(Boolean).join(' ')} />
          <Fila label="Sexo" valor={SEXO[profile.sex]} />
          <Fila label="Año de nacimiento" valor={profile.birth_year} />
          <Fila label="País" valor={profile.country} />
          <Fila label="Vida espiritual" valor={profile.spiritual ? 'Sí' : 'No'} />
        </Seccion>

        {/* Consentimientos */}
        <Seccion titulo="Consentimientos">
          {consents.length > 0 ? consents.map((c, i) => (
            <Fila key={i}
              label={{ cuenta: 'Cuenta y resultados', newsletter: 'Boletín', tutor: 'Tutor' }[c.purpose] ?? c.purpose}
              valor={c.granted ? 'Aceptado' : 'Denegado'}
            />
          )) : <p style={{ ...parrafo, margin: 0, fontSize: 13 }}>Sin consentimientos registrados</p>}
        </Seccion>

        {/* Cuenta */}
        <Seccion titulo="Sesión y cuenta">
          <button type="button" onClick={salir} style={{
            fontFamily: FONT_BODY, fontSize: 14, fontWeight: 600, color: NAVY,
            background: 'none', border: `1.5px solid ${LINE}`, borderRadius: 0,
            padding: '10px 20px', cursor: 'pointer', width: '100%', marginBottom: 12,
          }}>Cerrar sesión</button>
          {!confirmBorrar ? (
            <button type="button" onClick={() => setConfirmBorrar(true)} style={{
              fontFamily: FONT_BODY, fontSize: 13, fontWeight: 600, color: '#dc2626',
              background: 'none', border: '1.5px solid #fca5a5', borderRadius: 0,
              padding: '9px 18px', cursor: 'pointer', width: '100%',
              transition: 'background 150ms ease',
            }}
              onMouseEnter={e => { e.currentTarget.style.background = '#fef2f2'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'none'; }}
            >Cancelar mi cuenta</button>
          ) : (
            <div style={{ background: '#fef2f2', border: '1px solid #fca5a5', borderRadius: 0, padding: 16 }}>
              <p style={{ fontFamily: FONT_BODY, fontSize: 13, color: '#991b1b', margin: '0 0 12px', lineHeight: 1.5 }}>
                <strong>¿Estás seguro?</strong> Se borrará tu cuenta y perderás todo tu progreso. Esta acción no se puede deshacer.
              </p>
              <div style={{ display: 'flex', gap: 8 }}>
                <button type="button" onClick={eliminar} style={{
                  fontFamily: FONT_BODY, fontSize: 13, fontWeight: 600, color: '#fff',
                  background: '#dc2626', border: 'none', borderRadius: 0, padding: '9px 18px', cursor: 'pointer',
                }}>Sí, borrar mi cuenta</button>
                <button type="button" onClick={() => setConfirmBorrar(false)} style={{
                  fontFamily: FONT_BODY, fontSize: 13, color: '#991b1b', background: 'none',
                  border: '1px solid #fca5a5', borderRadius: 0, padding: '9px 14px', cursor: 'pointer',
                }}>Cancelar</button>
              </div>
            </div>
          )}
        </Seccion>
      </div>

      {/* ── Modales de edición ── */}
      {editando === 'general' && (
        <Modal titulo="Configuración general" onClose={() => setEditando(null)}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <Campo label="Idioma" value={draft.locale} opciones={IDIOMAS} onChange={v => setDraft(d => ({ ...d, locale: v }))} />
            <BtnGuardar onClick={() => guardar({ locale: draft.locale })} guardando={guardando} />
          </div>
        </Modal>
      )}

      {editando === 'personal' && (
        <Modal titulo="Datos personales" onClose={() => setEditando(null)}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <Campo label="Nombre" value={draft.first_name} onChange={v => setDraft(d => ({ ...d, first_name: v }))} />
            <Campo label="Apellidos" value={draft.last_name} onChange={v => setDraft(d => ({ ...d, last_name: v }))} />
            <Campo label="Sexo" value={draft.sex} opciones={{ hombre: 'Hombre', mujer: 'Mujer' }} onChange={v => setDraft(d => ({ ...d, sex: v }))} />
            <Campo label="Año de nacimiento" tipo="number" value={draft.birth_year} onChange={v => setDraft(d => ({ ...d, birth_year: v ? Number(v) : null }))} />
            <Campo label="País" value={draft.country} onChange={v => setDraft(d => ({ ...d, country: v }))} placeholder="ES, MX, AR…" />
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontFamily: FONT_BODY, fontSize: 13, color: NAVY, cursor: 'pointer' }}>
              <input type="checkbox" checked={draft.spiritual ?? false} onChange={e => setDraft(d => ({ ...d, spiritual: e.target.checked }))} />
              Vida espiritual
            </label>
            <BtnGuardar onClick={() => guardar(draft)} guardando={guardando} />
          </div>
        </Modal>
      )}

      {editando === 'password' && (
        <Modal titulo="Cambiar contraseña" onClose={() => setEditando(null)}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <Campo label="Nueva contraseña" tipo="password" value={pwdState.pwd} onChange={v => setPwdState(s => ({ ...s, pwd: v }))} placeholder="Mínimo 6 caracteres" />
            <BtnGuardar onClick={guardarPwd} guardando={pwdState.estado === 'guardando'} />
            {pwdState.estado === 'ok' && <p style={{ fontFamily: FONT_BODY, fontSize: 13, color: '#2e7d32', margin: 0 }}>Contraseña actualizada</p>}
            {pwdState.estado === 'error' && <p style={{ fontFamily: FONT_BODY, fontSize: 13, color: '#c62828', margin: 0 }}>Error al cambiar la contraseña</p>}
          </div>
        </Modal>
      )}
    </>
  );
}

/* ─── Tab 2: Mis resultados ─── */

function BarraVirtud({ nombre, pct }) {
  return (
    <div style={{ padding: '7px 0', borderBottom: `1px solid ${LINE}` }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
        <span style={{ fontFamily: FONT_BODY, fontSize: 13, fontWeight: 600, color: NAVY }}>{nombre}</span>
        <span style={{ fontFamily: FONT_BODY, fontSize: 13, color: MUTED }}>{pct}%</span>
      </div>
      <div style={{ height: 6, borderRadius: 3, background: LINE, overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${pct}%`, background: GOLD_REF, borderRadius: 3, transition: 'width 600ms ease' }} />
      </div>
    </div>
  );
}

function SelectorHistorico({ items, idx, setIdx }) {
  if (items.length <= 1) return null;
  const fmt = d => new Date(d).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' });
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
      <select value={idx} onChange={e => setIdx(Number(e.target.value))} style={{
        fontFamily: FONT_BODY, fontSize: 12, color: NAVY, background: BEIGE,
        border: `1px solid ${LINE}`, borderRadius: 0, padding: '4px 8px', cursor: 'pointer',
      }}>
        {items.map((t, i) => (
          <option key={i} value={i}>{fmt(t.taken_at)}{i === 0 ? ' (último)' : ''}</option>
        ))}
      </select>
      <span style={{ fontFamily: FONT_BODY, fontSize: 11, color: MUTED }}>
        {items.length} {items.length === 1 ? 'vez' : 'veces'}
      </span>
    </div>
  );
}

function TabDatos({ tests, personas, camino }) {
  const tempTests = tests.filter(t => t.kind === 'temperament');
  const charTests = tests.filter(t => t.kind === 'character');
  const [tempIdx, setTempIdx] = useState(0);
  const [charIdx, setCharIdx] = useState(0);
  const tempTest = tempTests[tempIdx];
  const charTest = charTests[charIdx];
  const tempPerfil = tempTest?.result?.profile;
  const tempPartes = tempPerfil?.split('-') ?? [];
  const virtudes = charTest?.result?.virtues;
  const nombresV = { prudencia: 'Prudencia', fortaleza: 'Fortaleza', dominio: 'Dominio de sí', justicia: 'Justicia', magnanimidad: 'Magnanimidad', humildad: 'Humildad' };

  const sinDatos = !tempTest && !charTest && personas.length === 0 && !camino;
  if (sinDatos) {
    return (
      <div style={{ textAlign: 'center', padding: '48px 24px' }}>
        <p style={{ fontFamily: FONT_SLAB, fontSize: 18, fontWeight: 700, color: NAVY, margin: '0 0 8px' }}>Aún no tienes resultados</p>
        <p style={{ fontFamily: FONT_BODY, fontSize: 14, color: MUTED, margin: 0, lineHeight: 1.6 }}>
          Completa tu primer test para ver tus resultados aquí.
        </p>
      </div>
    );
  }

  return (
    <div className="vl-cols">
      {/* Temperamento */}
      {tempTest && (
        <Seccion titulo="Tu temperamento">
          <SelectorHistorico items={tempTests} idx={tempIdx} setIdx={setTempIdx} />
          <div style={{ fontFamily: FONT_SLAB, fontSize: 20, fontWeight: 700, color: NAVY, margin: '2px 0 10px' }}>
            {tempPartes.map(t => TEMP_NOMBRE[t.toUpperCase()] ?? t).join(' – ')}
          </div>
          {tempTest.result?.scores && (
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 6 }}>
              {Object.entries(tempTest.result.scores).sort((a, b) => b[1] - a[1]).map(([t, pts]) => (
                <span key={t} style={{ fontFamily: FONT_BODY, fontSize: 13, color: MUTED }}>
                  <strong style={{ color: NAVY }}>{TEMP_NOMBRE[t] ?? t}</strong> {pts}
                </span>
              ))}
            </div>
          )}
          <Fila label="Fecha" valor={new Date(tempTest.taken_at).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })} />
        </Seccion>
      )}

      {/* Virtudes */}
      {charTest && virtudes && (
        <Seccion titulo="Tus virtudes">
          <SelectorHistorico items={charTests} idx={charIdx} setIdx={setCharIdx} />
          {Object.entries(nombresV).map(([key, nom]) => {
            const v = virtudes[key];
            if (!v) return null;
            return <BarraVirtud key={key} nombre={nom} pct={Math.round((v.global ?? 0) * 100)} />;
          })}
          <Fila label="Fecha" valor={new Date(charTest.taken_at).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })} />
        </Seccion>
      )}

      {/* Personas */}
      {personas.length > 0 && (
        <Seccion titulo={`Tus personas (${personas.length})`}>
          {personas.map((p, i) => (
            <div key={i} style={{ padding: '9px 0', borderBottom: i < personas.length - 1 ? `1px solid ${LINE}` : 'none', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
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

      {/* Camino */}
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
    </div>
  );
}

/* ─── Componente principal ─── */

export default function Perfil() {
  const { user } = useOutletContext();
  const [data, setData] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [tab, setTab] = useState('config');

  const cargar = useCallback(() => {
    setCargando(true);
    leerPerfil(user.id).then(d => { setData(d); setCargando(false); })
      .catch(() => setCargando(false));
  }, [user.id]);

  useEffect(() => { cargar(); }, [cargar]);

  if (cargando && !data) {
    return <p style={{ fontFamily: FONT_BODY, fontSize: 15, color: MUTED, textAlign: 'center', padding: 40 }}>Cargando perfil…</p>;
  }
  if (!data?.profile) {
    return <p style={{ fontFamily: FONT_BODY, fontSize: 15, color: MUTED, textAlign: 'center', padding: 40 }}>No se pudo cargar el perfil.</p>;
  }

  const { profile, tests, personas, camino, consents } = data;

  return (
    <div style={{ maxWidth: 900 }}>
      {/* Tab bar */}
      <div style={{ display: 'flex', gap: 0, borderBottom: `2px solid ${LINE}`, marginBottom: 20 }}>
        {TABS.map(t => (
          <button key={t.key} type="button" onClick={() => setTab(t.key)} style={{
            fontFamily: FONT_BODY, fontSize: 14, fontWeight: tab === t.key ? 700 : 500,
            color: tab === t.key ? NAVY : MUTED, background: 'none', border: 'none',
            padding: '10px 20px', cursor: 'pointer', position: 'relative',
            borderBottom: tab === t.key ? `2px solid ${GOLD_REF}` : '2px solid transparent',
            marginBottom: -2, transition: 'color 200ms ease',
          }}>
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'config' && <TabConfig user={user} profile={profile} consents={consents} onRefresh={cargar} />}
      {tab === 'datos' && <TabDatos tests={tests} personas={personas} camino={camino} />}
    </div>
  );
}
