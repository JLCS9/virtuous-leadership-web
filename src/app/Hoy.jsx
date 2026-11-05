import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { LocalLink as Link, useT } from '../i18n';
import { fetchLatestTemperament } from '../account/account';
import { CHALLENGE_VIRTUE } from '../account/challengeVirtues';
import { claveTemperamento } from '../lib/virtudes.js';
import { INK, MUTED, NAVY, PAPER, TEMP_COLORS, FONT_SLAB, FONT_BODY, GOLD_REF, GOLD_REF_LT } from '../theme';
import { botonPrimario, botonSobreClaro, botonContorno, eyebrow, heroFondo, parrafo, tarjeta, titulo } from './estilos';
import { IconoCheck, IconoFlecha } from './Iconos';
import { useCamino } from './useCamino';
import { usePersonas } from './usePersonas';
import { textoConQuien } from './personas/EligeQuien';
import { idDeClave, sugerenciaDelDia } from '../lib/personas.js';
import { TOTAL_DIAS, fechaCorta, infoDia, semanaDe, siguientePaso } from '../lib/camino.js';
import MapaCaracter from './MapaCaracter';

function Hero({ children }) {
  return (
    <section style={{ background: heroFondo, color: PAPER, borderRadius: 0, padding: '28px 24px 26px', position: 'relative', overflow: 'hidden', boxShadow: '0 8px 24px rgba(15,29,56,0.22)' }}>
      <span aria-hidden style={{ position: 'absolute', top: 0, left: 24, width: 56, height: 3, background: GOLD_REF }} />
      {children}
    </section>
  );
}

function PopupFormacion({ onCerrar }) {
  return createPortal(
    <div onClick={onCerrar} style={{ position: 'fixed', inset: 0, zIndex: 9999, display: 'grid', placeItems: 'center', background: 'rgba(15,29,56,0.22)' }}>
      <div onClick={(e) => e.stopPropagation()} style={{ ...tarjeta, maxWidth: 400, width: '90%', textAlign: 'center', boxShadow: '0 8px 32px rgba(15,29,56,0.22)' }}>
        <div style={{ ...eyebrow, marginBottom: 12 }}>Próximamente</div>
        <h2 style={{ ...titulo(24), margin: '0 0 14px', lineHeight: 1.25 }}>Solo se han editado temas de la formación</h2>
        <p style={{ ...parrafo, fontSize: 15, margin: '0 0 24px' }}>Esta sección se activará próximamente. Por ahora, explora los cursos en Formación.</p>
        <button type="button" onClick={onCerrar} style={{ ...botonSobreClaro, width: '100%', justifyContent: 'center' }}>Entendido</button>
      </div>
    </div>,
    document.body,
  );
}

function RetoDeLaSemana() {
  const camino = useCamino();
  const personas = usePersonas();
  const [popup, setPopup] = useState(false);
  const etiqueta = { ...eyebrow, color: GOLD_REF_LT, marginTop: 6 };
  const abrirPopup = (e) => { e.preventDefault(); setPopup(true); };

  if (camino.cargando) {
    return <Hero><div style={etiqueta}>Tu reto de la semana</div><p style={{ fontFamily: FONT_SLAB, fontSize: 24, margin: '14px 0 0', opacity: 0.75 }}>Preparando tu camino…</p></Hero>;
  }
  if (camino.error) {
    return (
      <Hero>
        <div style={etiqueta}>Tu reto de la semana</div>
        <p role="alert" style={{ fontFamily: FONT_BODY, fontSize: 15, lineHeight: 1.5, margin: '14px 0 18px', opacity: 0.92 }}>No he podido cargar tu camino ahora mismo.</p>
        <button type="button" style={botonPrimario} onClick={camino.recargar}>Reintentar</button>
      </Hero>
    );
  }
  if (!camino.perfil) {
    return (
      <>
        {popup && <PopupFormacion onCerrar={() => setPopup(false)} />}
        <div onClick={abrirPopup} style={{ cursor: 'pointer' }}>
          <Hero>
            <div style={etiqueta}>Antes de empezar</div>
            <p style={{ fontFamily: FONT_SLAB, fontSize: 27, lineHeight: 1.25, margin: '14px 0 8px' }}>Personaliza tu camino.</p>
            <p style={{ fontFamily: FONT_BODY, fontSize: 15, lineHeight: 1.5, margin: '0 0 20px', opacity: 0.8 }}>Tu temperamento ya lo conocemos. Ahora cuéntanos un poco de tu vida para que el camino sea tuyo. Son dos minutos.</p>
            <span style={botonPrimario}>Empezar <IconoFlecha width={18} height={18} /></span>
          </Hero>
        </div>
      </>
    );
  }

  const { diaHoy } = camino;
  if (diaHoy > TOTAL_DIAS) {
    return (
      <>
        {popup && <PopupFormacion onCerrar={() => setPopup(false)} />}
        <div onClick={abrirPopup} style={{ cursor: 'pointer' }}>
          <Hero>
            <div style={etiqueta}>Tu camino</div>
            <p style={{ fontFamily: FONT_SLAB, fontSize: 27, lineHeight: 1.25, margin: '14px 0 8px' }}>Has completado tus dos primeras semanas.</p>
            <p style={{ fontFamily: FONT_BODY, fontSize: 15, lineHeight: 1.5, margin: 0, opacity: 0.8 }}>La semana 2 llega muy pronto.</p>
          </Hero>
        </div>
      </>
    );
  }

  const empezado = diaHoy >= 1;
  const semana = semanaDe(empezado ? diaHoy : 1);
  const paso = siguientePaso(camino);
  const conQuien = empezado ? camino.porDia[diaHoy]?.con_quien : null;
  const sugerencia = empezado && !infoDia(diaHoy)?.cierre ? sugerenciaDelDia(personas.lista, camino.porDia, diaHoy) : null;
  return (
    <>
      {popup && <PopupFormacion onCerrar={() => setPopup(false)} />}
      <div onClick={abrirPopup} style={{ cursor: 'pointer' }}>
        <Hero>
          <div style={etiqueta}>{empezado ? `Día ${diaHoy} · Tu reto de la semana` : `Empieza el ${fechaCorta(camino.perfil.inicio)}`}</div>
          <p style={{ fontFamily: FONT_SLAB, fontSize: 29, lineHeight: 1.22, margin: '16px 0 10px', fontWeight: 600 }}>{semana.reto}</p>
          <p style={{ fontFamily: FONT_BODY, fontSize: 14.5, lineHeight: 1.5, margin: '0 0 8px', opacity: 0.85 }}>{semana.retoTexto}</p>
          <p style={{ fontFamily: FONT_BODY, fontSize: 14.5, lineHeight: 1.5, margin: '0 0 22px', opacity: 0.72, fontStyle: 'italic' }}>«{semana.frase}»</p>
          {conQuien ? (
            <p style={{ fontFamily: FONT_BODY, fontSize: 14, margin: '-8px 0 20px', opacity: 0.9 }}>Hoy, con: <strong>{idDeClave(conQuien) ? textoConQuien(conQuien, personas.porId) : textoConQuien(conQuien).toLowerCase()}</strong></p>
          ) : sugerencia && (
            <p style={{ fontFamily: FONT_BODY, fontSize: 14, margin: '-8px 0 20px', opacity: 0.9 }}>
              Hoy podrías hacerlo con <strong>{sugerencia.persona.nombre}</strong>{sugerencia.consejo ? `: ${sugerencia.consejo.charAt(0).toLowerCase()}${sugerencia.consejo.slice(1)}.` : '.'}
            </p>
          )}
          {(paso && paso.tipo !== 'hecho') ? (
            <span style={botonPrimario}>
              {paso.tipo === 'examen' ? 'Hacer el examen de la noche' : paso.atrasada ? `Hacer el día ${paso.dia}` : 'Tu sesión de hoy'} <IconoFlecha width={18} height={18} />
            </span>
          ) : empezado && (
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontFamily: FONT_BODY, fontSize: 14.5, fontWeight: 600, color: GOLD_REF_LT }}>
              <IconoCheck width={18} height={18} /> Hoy está hecho
            </span>
          )}
        </Hero>
      </div>
    </>
  );
}

function MiResultado() {
  const { t } = useT();
  const [fila, setFila] = useState(undefined);
  useEffect(() => {
    let vivo = true;
    fetchLatestTemperament().then((r) => { if (vivo) setFila(r ?? null); }).catch(() => { if (vivo) setFila(null); });
    return () => { vivo = false; };
  }, []);

  if (fila === undefined) return null;
  const clave = claveTemperamento(fila?.result);
  if (!clave) {
    return (
      <section style={tarjeta}>
        <div style={eyebrow}>Tu resultado</div>
        <p style={{ ...parrafo, margin: '10px 0 16px' }}>Aún no tienes un resultado del test de temperamento.</p>
        <Link to="/tests/temperamento" style={botonContorno}>Hacer el test</Link>
      </section>
    );
  }

  const perfil = t(`result.profiles.${clave}`);
  const partes = clave.split('-');
  const color1 = TEMP_COLORS[partes[0]];
  const color2 = partes[1] ? TEMP_COLORS[partes[1]] : null;
  const desafio = t(`result.challenge_defs.${CHALLENGE_VIRTUE[clave]}`);
  const nombres = partes.map((p) => t(`temperaments.${p}`)?.name).filter(Boolean);

  return (
    <section style={tarjeta} aria-label="Tu resultado del test de temperamento">
      <div style={eyebrow}>Tu resultado</div>
      <h2 style={{ ...titulo(30), margin: '10px 0 6px', letterSpacing: '-0.005em' }}>{perfil?.name ?? clave}</h2>
      <div style={{ display: 'flex', gap: 6, alignItems: 'center', margin: '4px 0 16px', flexWrap: 'wrap' }}>
        {nombres.map((n, i) => (
          <span key={n} style={{ display: 'inline-flex', alignItems: 'center', gap: 7, fontFamily: FONT_BODY, fontSize: 13, fontWeight: 600, color: INK, padding: '5px 12px 5px 10px', borderRadius: 0, background: 'rgba(27,42,74,0.06)' }}>
            <span style={{ width: 9, height: 9, borderRadius: '50%', background: i === 0 ? color1 : color2 }} />
            {n}
          </span>
        ))}
      </div>
      <div style={{ display: 'flex', height: 4, borderRadius: 0, overflow: 'hidden', maxWidth: 160, marginBottom: 20 }} aria-hidden>
        <div style={{ flex: 1, background: color1 }} />{color2 && <div style={{ flex: 1, background: color2 }} />}
      </div>

      {desafio?.name && (
        <div style={{ borderLeft: `3px solid ${GOLD_REF}`, paddingLeft: 14, marginBottom: 18 }}>
          <div style={{ ...eyebrow, color: MUTED }}>Tu virtud-desafío</div>
          <div style={{ fontFamily: FONT_SLAB, fontSize: 22, fontWeight: 700, color: NAVY, margin: '4px 0 4px' }}>{desafio.name}</div>
          <p style={{ ...parrafo, fontSize: 14.5 }}>{desafio.def}</p>
        </div>
      )}

      {[['Tu fortaleza', perfil?.fortaleza], ['Tu punto débil', perfil?.debilidad]].map(([titulillo, texto]) => texto && (
        <details key={titulillo} style={{ borderTop: '1px solid rgba(27,42,74,0.10)', padding: '12px 0' }}>
          <summary style={{ cursor: 'pointer', fontFamily: FONT_BODY, fontSize: 14, fontWeight: 600, color: NAVY, listStyle: 'none' }}>{titulillo}</summary>
          <p style={{ ...parrafo, marginTop: 10, fontSize: 14.5 }}>{texto}</p>
        </details>
      ))}
      <div style={{ marginTop: 6 }}>
        <Link to="/tests/temperamento/gracias" style={{ fontFamily: FONT_BODY, fontSize: 14, color: NAVY, fontWeight: 600 }}>Ver mi resultado completo →</Link>
      </div>
    </section>
  );
}

export default function Hoy() {
  return (
    <div className="vl-hoy">
      <style>{`
        .vl-hoy { display: flex; flex-direction: column; gap: 18px; }
        @media (min-width: 860px) {
          .vl-hoy { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; align-items: start; }
          .vl-hoy-izq { display: flex; flex-direction: column; gap: 18px; }
        }
      `}</style>
      <div className="vl-hoy-izq">
        <RetoDeLaSemana />
        <MiResultado />
      </div>
      <MapaCaracter />
    </div>
  );
}
