import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { LocalLink as Link, useLocalPath, useT } from '../i18n';
import { fetchLatestTemperament } from '../account/account';
import { CHALLENGE_VIRTUE } from '../account/challengeVirtues';
import { claveTemperamento } from '../lib/virtudes.js';
import { INK, MUTED, NAVY, PAPER, TEMP_COLORS, FONT_SLAB, FONT_BODY, GOLD_REF, LINE } from '../theme';
import { botonContorno, botonSobreClaro, eyebrow, parrafo, tarjeta, titulo } from './estilos';
import { IconoCheck } from './Iconos';
import MapaCaracter from './MapaCaracter';
import { usePersonas } from './usePersonas';
import { Avatar, EtiquetaEstado, MapaPersonas } from './personas/comun';

function useTemperamentoClave() {
  const [fila, setFila] = useState(undefined);
  useEffect(() => {
    let vivo = true;
    fetchLatestTemperament().then((r) => { if (vivo) setFila(r ?? null); }).catch(() => { if (vivo) setFila(null); });
    return () => { vivo = false; };
  }, []);
  return { fila, clave: claveTemperamento(fila?.result) };
}

function MiResultado({ fila, clave }) {
  const { t } = useT();
  if (fila === undefined) return null;
  if (!clave) {
    return (
      <section style={tarjeta}>
        <div style={eyebrow}>Tu test de temperamento</div>
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
      <div style={eyebrow}>Tu test de temperamento</div>
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

function BannerTestOk({ onClose }) {
  return (
    <div style={{ ...tarjeta, background: NAVY, color: PAPER, display: 'flex', alignItems: 'center', gap: 14, gridColumn: '1 / -1' }}>
      <IconoCheck width={20} height={20} />
      <div style={{ flex: 1 }}>
        <div style={{ fontFamily: FONT_SLAB, fontSize: 16, fontWeight: 600 }}>Resultado guardado</div>
        <div style={{ fontFamily: FONT_BODY, fontSize: 13, opacity: 0.8, marginTop: 4 }}>Tu test de temperamento se ha registrado. Esta es una versión interna del portal.</div>
      </div>
      <button type="button" onClick={onClose} style={{ background: 'none', border: 'none', color: PAPER, fontFamily: FONT_BODY, fontSize: 13, cursor: 'pointer', opacity: 0.7, padding: '4px 8px' }}>Cerrar</button>
    </div>
  );
}

function EntornoMagnanimo({ miPrimario }) {
  const { cargando, lista } = usePersonas();
  const navigate = useNavigate();
  const lp = useLocalPath();

  const irAPersona = (p) => navigate(lp(`/app/personas/${p.id}`));
  const irAPersonas = () => navigate(lp('/app/personas'));
  const irANueva = () => navigate(lp('/mi-panel/camino') + '?nueva=1');

  if (cargando) return null;

  const MAX_VISIBLES = 5;
  const visibles = lista.slice(0, MAX_VISIBLES);

  if (!lista.length) {
    return (
      <section style={tarjeta} aria-label="Tu entorno magnánimo">
        <div style={eyebrow}>Tu entorno magnánimo</div>
        <h2 style={{ ...titulo(24), margin: '10px 0 8px' }}>Personas magnánimas a tu alrededor</h2>
        <p style={{ ...parrafo, marginBottom: 16 }}>
          Havard nos invita a rodearnos de personas magnánimas. Aquí puedes crear fichas de las personas
          que te inspiran y conocer cómo relacionarte mejor con cada temperamento.
        </p>
        <button type="button" onClick={irANueva} style={botonSobreClaro}>Añadir persona</button>
      </section>
    );
  }

  return (
    <section style={tarjeta} aria-label="Tu entorno magnánimo">
      <div style={eyebrow}>Tu entorno magnánimo</div>

      <div className="vl-mapa-personas-wrap" style={{ margin: '8px 0 0' }}>
        <MapaPersonas personas={lista} miPrimario={miPrimario} />
      </div>

      <div style={{ marginTop: 14, display: 'grid', gap: 2 }}>
        {visibles.map((p) => (
          <button key={p.id} type="button" onClick={() => irAPersona(p)} style={{
            display: 'flex', alignItems: 'center', gap: 12, padding: '9px 4px',
            background: 'none', border: 'none', borderTop: `1px solid ${LINE}`,
            cursor: 'pointer', textAlign: 'left', width: '100%',
          }}>
            <Avatar persona={p} tam={36} />
            <span style={{ flex: 1, minWidth: 0 }}>
              <span style={{ display: 'block', fontFamily: FONT_BODY, fontSize: 14.5, fontWeight: 600, color: NAVY }}>{p.nombre}</span>
              <EtiquetaEstado persona={p} />
            </span>
          </button>
        ))}
      </div>

      <div style={{ marginTop: 14, display: 'flex', gap: 12, flexWrap: 'wrap' }}>
        <button type="button" onClick={irANueva} style={{ ...botonContorno, fontSize: 13.5 }}>+ Añadir persona</button>
        <button type="button" onClick={irAPersonas} style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: FONT_BODY, fontSize: 13.5, color: NAVY, fontWeight: 600, padding: 0 }}>Ver más →</button>
      </div>
    </section>
  );
}

export default function Hoy() {
  const [params, setParams] = useSearchParams();
  const [showBanner, setShowBanner] = useState(params.get('test') === 'ok');
  const { fila: tempFila, clave: tempClave } = useTemperamentoClave();

  function closeBanner() {
    setShowBanner(false);
    params.delete('test');
    setParams(params, { replace: true });
  }

  return (
    <div className="vl-hoy">
      <style>{`
        .vl-hoy { display: flex; flex-direction: column; gap: 18px; }
        @media (min-width: 860px) {
          .vl-hoy { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; align-items: stretch; }
          .vl-hoy-izq { display: flex; flex-direction: column; gap: 18px; }
          .vl-hoy-der { display: flex; flex-direction: column; overflow: hidden; }
          .vl-hoy-der > section { flex: 1; display: flex; flex-direction: column; min-height: 0; }
          .vl-hoy-der .vl-mapa-personas-wrap { flex: 1; position: relative; min-height: 0; }
          .vl-hoy-der .vl-mapa-personas-wrap svg { position: absolute; inset: 0; width: 100% !important; height: 100% !important; max-width: none !important; }
        }
      `}</style>
      {showBanner && <BannerTestOk onClose={closeBanner} />}
      <div className="vl-hoy-izq">
        <MiResultado fila={tempFila} clave={tempClave} />
        <MapaCaracter tempClave={tempClave} />
      </div>
      <div className="vl-hoy-der">
        <EntornoMagnanimo miPrimario={tempClave} />
      </div>
    </div>
  );
}
