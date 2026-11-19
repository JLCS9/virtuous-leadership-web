// Tu camino de virtudes, dibujado como una escena que se mueve. Va del amanecer (donde estás) a la noche
// estrellada (lo que aún no toca), por unas colinas en capas. Empieza por la virtud-desafío: el tramo ya
// recorrido brilla en dorado y un viajero con farol camina hasta tu punto; lo que aún no toca queda en la
// penumbra, con candado y sin nombre (solo se ve el nombre de donde estás). Sin plazos en pantalla.
//
// Movimiento: el viajero y el rastro dorado avanzan al entrar, el sol respira, las nubes se mecen, las
// estrellas titilan, el camino «fluye» hacia delante y las capas se desplazan un poco con el ratón
// (paralaje). Con «reducir movimiento» del sistema todo queda quieto. Solo pinta: los bloques ya vienen de
// lib/rutaVirtudes.js.
import { useEffect, useMemo, useRef, useState } from 'react';
import { LocalLink as Link, useT } from '../../i18n';
import { dParcial, dTramo, longitudTramo, puntoEnTramo } from '../../lib/rutaGeometria.js';
import { progresoDeLaRuta } from '../../lib/rutaVirtudes.js';
import { NAVY, FONT_BODY, FONT_SLAB, GOLD_REF, GOLD_REF_DK } from '../../theme';
import { botonSobreClaro, eyebrow, parrafo, tarjeta, titulo } from '../estilos';
import TiraDeDias from './TiraDeDias';

// Geometría del dibujo, en unidades del viewBox (se escala al ancho disponible). Los bloques van en
// zigzag entre dos alturas para que el camino serpentee sobre las colinas. Por debajo de ~760 px de ancho el
// dibujo se desplaza a un lado en vez de encogerse, para que el texto siga siendo legible (≥16 px).
const ANCHO = 950;
const ALTO = 300;
const X0 = 100;
const PASO = 150; // distancia horizontal entre bloques
const RADIO = 34;
const Y = [186, 238]; // alturas alternas de los bloques
const ANCHO_MINIMO = 760;
const punto = (i) => ({ x: X0 + i * PASO, y: Y[i % 2] });

// Estrellas: posiciones fijas (sin azar en cada render), más densas hacia la noche, a la derecha.
const ESTRELLAS = Array.from({ length: 34 }, (_, i) => {
  const a = (((i * 9301 + 49297) % 233280) / 233280);
  const b = (((i * 7919 + 1237) % 10007) / 10007);
  const c = (((i * 4421 + 17) % 1009) / 1009);
  return { x: 440 + a * 500, y: 8 + b * 150, r: 0.7 + c * 1.2, retraso: (i * 0.37) % 4, duracion: 2.4 + (i % 4) * 0.7 };
});
const PINOS = [[34, 262, 1], [160, 276, 0.8], [338, 270, 1.1], [478, 276, 0.9], [612, 264, 1], [726, 280, 0.8], [892, 272, 1]];
const NUBES = [[120, 70, 1.1, '-4s'], [330, 112, 0.8, '-12s'], [470, 54, 0.9, '-8s']];

const reducirMovimiento = () => typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

// De 0 a `objetivo` con una salida suave: así el viajero camina hasta su sitio al entrar.
function useProgresoAnimado(objetivo, ms = 1500) {
  const [valor, setValor] = useState(0);
  useEffect(() => {
    if (reducirMovimiento()) { setValor(objetivo); return undefined; }
    let marco;
    const t0 = performance.now();
    const paso = (t) => {
      const k = Math.min(1, (t - t0) / ms);
      setValor(objetivo * (1 - (1 - k) ** 3));
      if (k < 1) marco = requestAnimationFrame(paso);
    };
    marco = requestAnimationFrame(paso);
    return () => cancelAnimationFrame(marco);
  }, [objetivo, ms]);
  return valor;
}

function Pino({ x, y, escala }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${escala})`} aria-hidden>
      <rect x="-2" y="10" width="4" height="8" fill="rgba(12,21,43,0.55)" />
      <path d="M0 -26 L10 -4 L5 -4 L12 12 L-12 12 L-5 -4 L-10 -4 Z" fill="rgba(12,21,43,0.5)" />
    </g>
  );
}

function Nube({ x, y, escala, retraso }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${escala})`} aria-hidden>
      <g className="vl-nube" style={{ animationDelay: retraso }}>
        <ellipse cx="-24" cy="3" rx="24" ry="10" />
        <ellipse cx="0" cy="-4" rx="28" ry="14" />
        <ellipse cx="26" cy="3" rx="22" ry="9" />
      </g>
    </g>
  );
}

function Candado({ x, y }) {
  return (
    <g transform={`translate(${x - 11} ${y - 13})`} fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <rect x="2" y="11" width="18" height="14" rx="2" fill="#fff" stroke="none" />
      <path d="M6 11V8a5 5 0 0 1 10 0v3" />
    </g>
  );
}

function Nodo({ bloque, i, nombre, t }) {
  const { x, y } = punto(i);
  const { estado } = bloque;
  const visible = estado === 'actual' || estado === 'completada'; // solo se ve el nombre de donde estás

  const relleno = estado === 'actual' || estado === 'completada' ? NAVY : 'rgba(20,31,61,0.62)';
  const borde = estado === 'bloqueada' ? 'rgba(255,255,255,0.55)' : GOLD_REF;
  const marca = estado === 'completada' ? '✓' : String(i + 1);

  return (
    <g>
      {estado === 'actual' && <circle className="vl-halo" cx={x} cy={y} r={RADIO + 10} fill="url(#vl-luz)" />}
      {estado === 'actual' && <circle cx={x} cy={y} r={RADIO + 5} fill="none" stroke="rgba(246,227,161,0.7)" strokeWidth="1.5" />}
      <circle cx={x} cy={y} r={RADIO} fill={relleno} stroke={borde} strokeWidth={estado === 'actual' ? 4 : 2.5} />
      {estado === 'bloqueada'
        ? <Candado x={x} y={y} />
        : <text x={x} y={y + 9} textAnchor="middle" fontFamily={FONT_SLAB} fontWeight="700" fontSize="28" fill="#fff">{marca}</text>}
      {visible && (
        <>
          <text x={x} y={y - RADIO - 56} textAnchor="middle" fontFamily={FONT_SLAB} fontWeight="700" fontSize="27" fill={NAVY}>{nombre}</text>
          <text x={x} y={y - RADIO - 30} textAnchor="middle" fontFamily={FONT_BODY} fontWeight="600" fontSize="20" fill={GOLD_REF_DK}>
            {estado === 'actual' ? t('camino.ruta.desafio') : t('camino.ruta.completada')}
          </text>
        </>
      )}
    </g>
  );
}

// El viajero: una figura con capa y un farol que ilumina el camino.
function Viajero({ x, y }) {
  return (
    <g transform={`translate(${x} ${y}) scale(1.4)`} aria-hidden>
      <ellipse cx="0" cy="3" rx="11" ry="3.5" fill="rgba(12,21,43,0.28)" />
      <g className="vl-viajero">
        <circle cx="13" cy="-9" r="30" fill="url(#vl-luz)" className="vl-farol" />
        <path d="M-8 -8 Q0 -13 8 -8 L10 3 L-10 3 Z" fill={NAVY} />
        <path d="M-8 -8 Q0 -13 8 -8" fill="none" stroke={GOLD_REF} strokeWidth="1.6" />
        <circle cx="0" cy="-16" r="5.2" fill="#F4E0B5" stroke={NAVY} strokeWidth="1.4" />
        <path d="M7 -6 L13 -9" stroke={NAVY} strokeWidth="1.6" strokeLinecap="round" />
        <circle cx="14" cy="-8" r="3.6" fill="#FFE08A" stroke={GOLD_REF_DK} strokeWidth="1" />
      </g>
    </g>
  );
}

function Senda({ bloques, t, nombre }) {
  const contenedor = useRef(null);
  const puntos = useMemo(() => bloques.map((_, i) => punto(i)), [bloques]);

  // El viajero va por el primer tramo, de un borde de bloque al del siguiente, y camina hasta su sitio.
  const { fraccion } = progresoDeLaRuta(bloques);
  const f = useProgresoAnimado(fraccion);
  const [a, b] = [puntos[0], puntos[1]];
  const largo = longitudTramo(a, b);
  const recorrido = RADIO + f * (largo - 2 * RADIO);
  // El viajero se queda un poco antes del bloque al que llega, para no tapar su número.
  const viajero = puntoEnTramo(a, b, recorrido - 22 * f);
  const tramoRecorrido = dParcial(a, b, recorrido);
  const chispas = f > 0.04 ? [1, 2, 3, 4, 5].map((k) => puntoEnTramo(a, b, RADIO + ((recorrido - RADIO) * k) / 6)) : [];

  // Si el dibujo no cabe, se desplaza para dejar al viajero a la vista.
  useEffect(() => {
    const c = contenedor.current;
    const svg = c?.querySelector('svg');
    if (!c || !svg) return;
    const x = (viajero.x / ANCHO) * svg.getBoundingClientRect().width;
    c.scrollLeft = Math.max(0, x - c.clientWidth / 2);
    // Solo al entrar y cuando cambia el tramo final, no en cada fotograma de la animación.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fraccion]);

  // Paralaje: las capas se desplazan un poco con el ratón. Es solo decoración: el camino no se mueve.
  const alMover = (e) => {
    if (reducirMovimiento() || e.pointerType === 'touch') return;
    const r = e.currentTarget.getBoundingClientRect();
    contenedor.current?.style.setProperty('--vl-px', String(((e.clientX - r.left) / r.width) * 2 - 1));
  };
  const alSalir = () => contenedor.current?.style.setProperty('--vl-px', '0');

  const actual = bloques.find((x) => x.estado === 'actual') ?? bloques.find((x) => x.estado === 'completada');

  return (
    <div
      ref={contenedor} onPointerMove={alMover} onPointerLeave={alSalir}
      style={{ overflowX: 'auto', borderRadius: 20, boxShadow: '0 1px 2px rgba(20,32,60,0.06), 0 8px 24px rgba(20,32,60,0.10)' }}
    >
      <svg
        viewBox={`0 0 ${ANCHO} ${ALTO}`} role="img"
        style={{ display: 'block', width: '100%', minWidth: ANCHO_MINIMO, maxWidth: 1100, margin: '0 auto', height: 'auto' }}
        aria-label={t(actual.estado === 'completada' ? 'camino.ruta.resumen_completada' : 'camino.ruta.resumen', { nombre: nombre(actual.virtud) })}
      >
        <style>{`
          .vl-par { transition: transform 450ms ease-out; }
          .vl-par-1 { transform: translateX(calc(var(--vl-px, 0) * -8px)); }
          .vl-par-2 { transform: translateX(calc(var(--vl-px, 0) * -5px)); }
          .vl-par-3 { transform: translateX(calc(var(--vl-px, 0) * -13px)); }
          .vl-par-4 { transform: translateX(calc(var(--vl-px, 0) * -3px)); }
          .vl-nube { fill: rgba(255,255,255,0.42); animation: vl-nube 28s ease-in-out infinite alternate; }
          @keyframes vl-nube { from { transform: translateX(-14px); } to { transform: translateX(52px); } }
          .vl-estrella { animation: vl-titila var(--t, 3s) ease-in-out infinite; animation-delay: var(--d, 0s); }
          @keyframes vl-titila { 0%, 100% { opacity: 0.2; } 50% { opacity: 1; } }
          .vl-sol { transform-box: fill-box; transform-origin: center; animation: vl-sol 6s ease-in-out infinite; }
          @keyframes vl-sol { 0%, 100% { transform: scale(1); opacity: 0.85; } 50% { transform: scale(1.1); opacity: 1; } }
          .vl-flujo { animation: vl-flujo 1.4s linear infinite; }
          @keyframes vl-flujo { to { stroke-dashoffset: -26; } }
          .vl-viajero { animation: vl-flota 1.1s ease-in-out infinite; }
          @keyframes vl-flota { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-3px); } }
          .vl-farol, .vl-halo { transform-box: fill-box; transform-origin: center; animation: vl-farol 2.4s ease-in-out infinite; }
          @keyframes vl-farol { 0%, 100% { transform: scale(1); opacity: 0.75; } 50% { transform: scale(1.18); opacity: 1; } }
          .vl-bruma { animation: vl-bruma 16s ease-in-out infinite alternate; }
          @keyframes vl-bruma { from { transform: translateX(-30px); } to { transform: translateX(30px); } }
          @media (prefers-reduced-motion: reduce) {
            .vl-par { transition: none; }
            .vl-nube, .vl-estrella, .vl-sol, .vl-flujo, .vl-viajero, .vl-farol, .vl-halo, .vl-bruma { animation: none; }
            .vl-estrella { opacity: 0.8; }
          }
        `}</style>
        <defs>
          {/* El cielo va del amanecer (a la izquierda, donde estás) a la noche (a la derecha, lo que aún no toca). */}
          <linearGradient id="vl-cielo" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2={ANCHO} y2="0">
            <stop offset="0" stopColor="#F9E7BE" />
            <stop offset="0.2" stopColor="#F2CF9B" />
            <stop offset="0.4" stopColor="#B4B7D2" />
            <stop offset="0.62" stopColor="#5A6892" />
            <stop offset="0.82" stopColor="#2A3A63" />
            <stop offset="1" stopColor="#121D3B" />
          </linearGradient>
          <linearGradient id="vl-velo" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#fff" stopOpacity="0.22" />
            <stop offset="0.6" stopColor="#fff" stopOpacity="0" />
          </linearGradient>
          <radialGradient id="vl-sol-luz">
            <stop offset="0" stopColor="#FFE9A8" stopOpacity="0.85" />
            <stop offset="0.45" stopColor="#FFD28A" stopOpacity="0.35" />
            <stop offset="1" stopColor="#FFD28A" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="vl-luz">
            <stop offset="0" stopColor="#FFE9A8" stopOpacity="0.9" />
            <stop offset="0.5" stopColor="#F6D77A" stopOpacity="0.35" />
            <stop offset="1" stopColor="#F6D77A" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="vl-colina-1" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2={ANCHO} y2="0">
            <stop offset="0" stopColor="#E3C894" /><stop offset="0.45" stopColor="#8794B8" /><stop offset="1" stopColor="#25345A" />
          </linearGradient>
          <linearGradient id="vl-colina-2" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2={ANCHO} y2="0">
            <stop offset="0" stopColor="#BFA36B" /><stop offset="0.45" stopColor="#5C6B93" /><stop offset="1" stopColor="#18274A" />
          </linearGradient>
          <linearGradient id="vl-colina-3" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2={ANCHO} y2="0">
            <stop offset="0" stopColor="#8E794C" /><stop offset="0.5" stopColor="#3F4D75" /><stop offset="1" stopColor="#0C152B" />
          </linearGradient>
          <filter id="vl-difumina" x="-30%" y="-80%" width="160%" height="260%"><feGaussianBlur stdDeviation="7" /></filter>
          <filter id="vl-brillo" x="-20%" y="-60%" width="140%" height="220%"><feGaussianBlur stdDeviation="3.5" result="b" /><feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
        </defs>

        {/* Cielo */}
        <rect width={ANCHO} height={ALTO} fill="url(#vl-cielo)" />
        <rect width={ANCHO} height={ALTO} fill="url(#vl-velo)" />

        {/* Estrellas (lo que aún no toca) y sol naciente (donde estás) */}
        <g className="vl-par vl-par-4" aria-hidden>
          {ESTRELLAS.map((e, i) => (
            <circle key={i} className="vl-estrella" cx={e.x} cy={e.y} r={e.r} fill="#fff" style={{ '--d': `${e.retraso}s`, '--t': `${e.duracion}s` }} />
          ))}
        </g>
        <g className="vl-par vl-par-1" aria-hidden>
          <circle className="vl-sol" cx="56" cy="204" r="118" fill="url(#vl-sol-luz)" />
          <circle cx="56" cy="204" r="30" fill="#FFE6A3" />
          {NUBES.map(([x, y, e, r], i) => <Nube key={i} x={x} y={y} escala={e} retraso={r} />)}
        </g>

        {/* Colinas en tres capas */}
        <g className="vl-par vl-par-2" aria-hidden>
          <path d="M-20 215 C 90 165 200 175 290 205 C 380 235 470 160 580 175 C 690 190 780 150 970 200 L970 310 L-20 310 Z" fill="url(#vl-colina-1)" />
        </g>
        <g className="vl-par vl-par-3" aria-hidden>
          <path d="M-20 247 C 110 205 210 225 320 245 C 430 265 520 215 640 230 C 760 245 840 215 970 237 L970 310 L-20 310 Z" fill="url(#vl-colina-2)" />
          {PINOS.map(([x, y, e]) => <Pino key={x} x={x} y={y - 18} escala={e} />)}
        </g>

        {/* La senda: borde, firme y rayas; dorada y brillante hasta donde has llegado, con las rayas fluyendo hacia delante */}
        {puntos.slice(0, -1).map((p, k) => {
          const d = dTramo(p, puntos[k + 1]);
          return (
            <g key={k} fill="none" strokeLinecap="round" aria-hidden>
              <path d={d} stroke="rgba(18,29,59,0.5)" strokeWidth="27" />
              <path d={d} stroke="rgba(255,255,255,0.30)" strokeWidth="20" />
              <path d={d} stroke="rgba(255,255,255,0.75)" strokeWidth="2.5" strokeDasharray="2 11" />
            </g>
          );
        })}
        {f > 0 && (
          <g fill="none" strokeLinecap="round" strokeLinejoin="round" aria-hidden filter="url(#vl-brillo)">
            <path d={tramoRecorrido} stroke={GOLD_REF} strokeWidth="27" />
            <path d={tramoRecorrido} stroke="#F8E7AE" strokeWidth="20" />
            <path className="vl-flujo" d={tramoRecorrido} stroke={GOLD_REF_DK} strokeWidth="2.5" strokeDasharray="2 11" />
          </g>
        )}
        {chispas.map((c, i) => (
          <circle key={i} className="vl-estrella" cx={c.x} cy={c.y - 10 - (i % 2) * 7} r="2" fill="#FFF3C4" style={{ '--d': `${i * 0.45}s`, '--t': '1.8s' }} aria-hidden />
        ))}

        {/* Bruma sobre lo que aún no toca */}
        <g aria-hidden filter="url(#vl-difumina)">
          <ellipse className="vl-bruma" cx="600" cy="236" rx="150" ry="16" fill="rgba(255,255,255,0.13)" />
          <ellipse className="vl-bruma" cx="810" cy="214" rx="130" ry="14" fill="rgba(255,255,255,0.10)" style={{ animationDelay: '-6s' }} />
        </g>

        {bloques.map((bl, i) => <Nodo key={bl.virtud} bloque={bl} i={i} nombre={nombre(bl.virtud)} t={t} />)}
        <Viajero x={viajero.x} y={viajero.y} />

        {/* Primer plano */}
        <path d="M-20 283 C 140 262 260 277 400 285 C 540 293 700 270 970 287 L970 310 L-20 310 Z" fill="url(#vl-colina-3)" aria-hidden />
      </svg>
    </div>
  );
}

export default function RutaVirtudes({ bloques, tira, racha, hoy }) {
  const { t } = useT();
  const nombre = (virtud) => t(`camino.habitos.virtudes.${virtud}`);

  if (!bloques.length) {
    return (
      <section style={tarjeta} aria-label={t('camino.ruta.titulo')}>
        <div style={eyebrow}>{t('camino.ruta.eyebrow')}</div>
        <p style={{ ...parrafo, margin: '12px 0 16px' }}>{t('camino.ruta.sin_test')}</p>
        <Link to="/tests/temperamento" style={botonSobreClaro}>{t('camino.ruta.hacer_test')}</Link>
      </section>
    );
  }

  const actual = bloques.find((x) => x.estado === 'actual') ?? bloques.find((x) => x.estado === 'completada');

  return (
    <section style={{ ...tarjeta, position: 'relative', minWidth: 0 }} aria-label={t('camino.ruta.titulo')}>
      <div style={eyebrow}>{t('camino.ruta.eyebrow')}</div>
      <h2 style={{ ...titulo(28), margin: '8px 0 0' }}>{t('camino.ruta.titulo')}</h2>
      <TiraDeDias tira={tira} racha={racha} hoy={hoy} />
      <Senda bloques={bloques} t={t} nombre={nombre} />
      <p style={{ ...parrafo, fontSize: 15, marginTop: 12 }}>{t('camino.ruta.intro')}</p>

      {/* Lo mismo para quien no ve el dibujo, sin desvelar las virtudes que aún no toca. */}
      <ol style={{ position: 'absolute', width: 1, height: 1, overflow: 'hidden', clip: 'rect(0 0 0 0)', margin: -1, padding: 0 }}>
        <li>{nombre(actual.virtud)}: {t(actual.estado === 'completada' ? 'camino.ruta.completada' : 'camino.ruta.desafio')}</li>
        <li>{t('camino.ruta.otras_cerradas')}</li>
      </ol>
    </section>
  );
}
