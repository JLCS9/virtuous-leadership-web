// Piezas comunes de las fichas de personas: avatar, etiqueta de estado, contenido de la ficha según
// el temperamento y el mapa de mis personas.
import { useT } from '../../i18n';
import { FICHA, TEMPS, TEXTO_CONFIANZA, combinacion } from '../../lib/personas.js';
import { GOLD, INK, LINE, MUTED, NAVY, PAPER, TEMP_COLORS, FONT_SANS, FONT_SERIF } from '../../theme';
import { eyebrow, parrafo } from '../estilos';

export function useNombresTemp() {
  const { t } = useT();
  return Object.fromEntries(TEMPS.map((k) => [k, t(`temperaments.${k}`)?.name ?? k]));
}

export function Avatar({ persona, tam = 44 }) {
  const color = TEMP_COLORS[persona.primario] ?? 'rgba(27,42,74,0.25)';
  const contenido = persona.avatar || persona.nombre.trim().charAt(0).toUpperCase();
  return (
    <span aria-hidden style={{
      width: tam, height: tam, flex: `0 0 ${tam}px`, borderRadius: '50%', display: 'grid', placeItems: 'center',
      background: PAPER, border: `3px solid ${color}`, fontFamily: FONT_SANS, fontWeight: 700, color: NAVY,
      fontSize: persona.avatar ? tam * 0.5 : tam * 0.4,
    }}>{contenido}</span>
  );
}

export function EtiquetaEstado({ persona }) {
  const nombres = useNombresTemp();
  if (!persona.primario) return <span style={{ fontFamily: FONT_SANS, fontSize: 12.5, color: MUTED }}>Sin estimar</span>;
  return (
    <span style={{ fontFamily: FONT_SANS, fontSize: 12.5, color: MUTED }}>
      <strong style={{ color: TEMP_COLORS[persona.primario] }}>{nombres[persona.primario]}</strong>
      {' · '}{persona.estado === 'confirmado' ? 'Confirmado' : `Estimado${persona.confianza ? ` (${TEXTO_CONFIANZA[persona.confianza].toLowerCase()})` : ''}`}
    </span>
  );
}

const fila = (titulo, contenido) => (
  <div style={{ borderTop: `1px solid ${LINE}`, padding: '12px 0' }}>
    <div style={{ ...eyebrow, color: MUTED, marginBottom: 6 }}>{titulo}</div>
    {contenido}
  </div>
);

/** Lema, lo que le sale fácil, lo que le cuesta, cómo tratarle, su virtud-desafío y «Tú y X». */
export function FichaContenido({ persona, miPrimario }) {
  const nombres = useNombresTemp();
  const f = FICHA[persona.primario];
  if (!f) return null;
  const combo = combinacion(miPrimario, persona.primario);
  return (
    <div>
      {fila('Lema', <p style={{ fontFamily: FONT_SERIF, fontSize: 22, color: NAVY, margin: 0 }}>{f.lema.charAt(0).toUpperCase() + f.lema.slice(1)}</p>)}
      {fila('Le sale fácil', <p style={{ ...parrafo, color: INK }}>{f.facil}</p>)}
      {fila('Le cuesta', <p style={{ ...parrafo, color: INK }}>{f.cuesta}</p>)}
      {fila('Cómo tratarle', <ul style={{ ...parrafo, color: INK, paddingLeft: 18, margin: 0 }}>{f.tratar.map((t) => <li key={t}>{t}</li>)}</ul>)}
      {fila('Su virtud-desafío', <p style={{ fontFamily: FONT_SERIF, fontSize: 20, fontWeight: 700, color: NAVY, margin: 0 }}>{f.virtud}</p>)}
      {combo && fila(`Tú y ${persona.nombre}`, (
        <>
          <div style={{ fontFamily: FONT_SANS, fontSize: 12.5, color: MUTED, marginBottom: 4 }}>
            {nombres[miPrimario]} y {nombres[persona.primario].toLowerCase()}
          </div>
          <p style={{ ...parrafo, color: INK, borderLeft: `3px solid ${GOLD}`, paddingLeft: 12 }}>{combo}</p>
        </>
      ))}
    </div>
  );
}

const ETIQUETA_MAPA = { familia: 'FAMILIA', amigos: 'AMIGOS', trabajo: 'TRABAJO', comunidad: 'COMUNIDAD' };

/** Mapa de mis personas: tú en el centro y tus fichas alrededor, por grupos, del color de su temperamento. */
export function MapaPersonas({ personas, nombreTu = 'Tú' }) {
  const T = 300;
  const C = T / 2;
  const grupos = ['familia', 'amigos', 'trabajo', 'comunidad'].filter((g) => personas.some((p) => p.grupo === g));
  const n = personas.length;
  if (!n) return null;
  // Cada grupo ocupa un sector; las personas se reparten dentro de su sector.
  const sector = (2 * Math.PI) / grupos.length;
  const puntos = [];
  grupos.forEach((g, gi) => {
    const delGrupo = personas.filter((p) => p.grupo === g);
    delGrupo.forEach((p, i) => {
      const ang = -Math.PI / 2 + gi * sector + ((i + 1) / (delGrupo.length + 1)) * sector;
      const r = delGrupo.length > 3 && i % 2 ? 80 : 100;
      puntos.push({ p, x: C + r * Math.cos(ang), y: C + r * Math.sin(ang) });
    });
  });
  // Con un solo grupo no hace falta etiqueta (y caería sobre el nombre de la persona).
  const etiquetas = grupos.length < 2 ? [] : grupos.map((g, gi) => {
    const ang = -Math.PI / 2 + (gi + 0.5) * sector;
    // Fuera del círculo de personas; a izquierda o derecha, alineada hacia fuera para no pisarlas.
    const cos = Math.cos(ang);
    return { g, x: C + 132 * cos, y: C + 132 * Math.sin(ang), ancla: Math.abs(cos) < 0.3 ? 'middle' : cos > 0 ? 'start' : 'end' };
  });
  return (
    <svg viewBox={`-76 -16 ${T + 152} ${T + 32}`} width="100%" style={{ maxWidth: 420, display: 'block', margin: '0 auto' }} role="img"
         aria-label={`Mapa de tus personas: ${personas.map((p) => p.nombre).join(', ')}`}>
      {grupos.length > 1 && grupos.map((g, gi) => {
        const ang = -Math.PI / 2 + gi * sector;
        return <line key={g} x1={C} y1={C} x2={C + 125 * Math.cos(ang)} y2={C + 125 * Math.sin(ang)} stroke={LINE} strokeDasharray="3 4" />;
      })}
      {puntos.map(({ p, x, y }) => <line key={`l${p.id}`} x1={C} y1={C} x2={x} y2={y} stroke="rgba(27,42,74,0.12)" />)}
      <circle cx={C} cy={C} r="26" fill={NAVY} />
      <text x={C} y={C} textAnchor="middle" dominantBaseline="central" fontFamily={FONT_SANS} fontSize="11" fontWeight="700" fill={PAPER}>{nombreTu}</text>
      {puntos.map(({ p, x, y }) => (
        <g key={p.id}>
          <circle cx={x} cy={y} r="17" fill={TEMP_COLORS[p.primario] ?? '#B9B3A5'} stroke={PAPER} strokeWidth="2" strokeDasharray={p.estado === 'confirmado' ? undefined : '0'} />
          <text x={x} y={y} textAnchor="middle" dominantBaseline="central" fontFamily={FONT_SANS} fontSize="12" fontWeight="700" fill={PAPER}>{p.nombre.trim().charAt(0).toUpperCase()}</text>
          <text x={x} y={y + 27} textAnchor="middle" fontFamily={FONT_SANS} fontSize="10.5" fill={INK}>{p.nombre.length > 12 ? `${p.nombre.slice(0, 11)}…` : p.nombre}</text>
        </g>
      ))}
      {etiquetas.map(({ g, x, y, ancla }) => (
        <text key={g} x={x} y={y} textAnchor={ancla} dominantBaseline="central" fontFamily={FONT_SANS} fontSize="10" fontWeight="700" letterSpacing="0.08em" fill={MUTED}>
          {ETIQUETA_MAPA[g] ?? g.toUpperCase()}
        </text>
      ))}
    </svg>
  );
}
