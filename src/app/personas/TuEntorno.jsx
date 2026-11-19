// Tarjeta «Tu entorno»: el mapa de las personas y las fichas, con el acceso a añadir más.
// Se usa en Hoy y en la pestaña Camino. Rediseñado: lista compacta a 2 columnas en desktop.
import { useNavigate } from 'react-router-dom';
import { useLocalPath } from '../../i18n';
import { FONT_BODY, INK, LINE, MUTED, NAVY, PAPER, TEMP_COLORS, botonContorno, botonSobreClaro, eyebrow, parrafo, tarjeta, titulo } from '../tokens';
import { usePersonas } from '../usePersonas';
import { EsqueletoTarjeta } from '../Esqueleto';
import { MapaPersonas } from './comun';

function PersonaFila({ persona, onClick }) {
  const color = TEMP_COLORS[persona.primario] ?? 'rgba(27,42,74,0.25)';
  const inicial = persona.avatar || persona.nombre.trim().charAt(0).toUpperCase();
  return (
    <button type="button" onClick={onClick} style={{
      display: 'flex', alignItems: 'center', gap: 10, padding: '7px 10px',
      background: 'none', border: 'none', borderRadius: 10,
      cursor: 'pointer', textAlign: 'left', width: '100%',
    }}>
      <span aria-hidden style={{
        width: 32, height: 32, flex: '0 0 32px', borderRadius: '50%', display: 'grid', placeItems: 'center',
        background: persona.primario ? color : 'rgba(27,42,74,0.08)',
        fontFamily: FONT_BODY, fontWeight: 700, color: persona.primario ? PAPER : MUTED,
        fontSize: persona.avatar ? 15 : 13,
      }}>{inicial}</span>
      <span style={{ flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontFamily: FONT_BODY, fontSize: 14, fontWeight: 500, color: INK }}>
        {persona.nombre}
      </span>
    </button>
  );
}

export default function TuEntorno({ miPrimario }) {
  const { cargando, lista } = usePersonas();
  const navigate = useNavigate();
  const lp = useLocalPath();

  const irAPersona = (p) => navigate(lp(`/app/personas/${p.id}`));
  const irAPersonas = () => navigate(lp('/app/personas'));
  const irANueva = () => navigate(lp('/app/personas/nueva'));

  if (cargando) return <EsqueletoTarjeta alto={420} />;

  if (!lista.length) {
    return (
      <section style={tarjeta} aria-label="Tu entorno">
        <div style={eyebrow}>Tu entorno</div>
        <h2 style={{ ...titulo(24), margin: '10px 0 8px' }}>Las personas a tu alrededor</h2>
        <p style={{ ...parrafo, marginBottom: 16 }}>
          Crea fichas de las personas de tu familia, tus amigos, tu trabajo y tu comunidad, y descubre
          cómo relacionarte mejor con cada temperamento.
        </p>
        <button type="button" onClick={irANueva} style={botonSobreClaro}>Añadir persona</button>
      </section>
    );
  }

  return (
    <section style={tarjeta} aria-label="Tu entorno">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 12 }}>
        <div style={eyebrow}>Tu entorno</div>
        <span style={{ fontFamily: FONT_BODY, fontSize: 13, color: MUTED }}>{lista.length} {lista.length === 1 ? 'persona' : 'personas'}</span>
      </div>

      <div className="vl-mapa-personas-wrap" style={{ margin: '8px 0 0' }}>
        <MapaPersonas personas={lista} miPrimario={miPrimario} onElegirPersona={irAPersona} />
      </div>

      <style>{`
        .vl-entorno-lista { display: grid; grid-template-columns: minmax(0, 1fr); gap: 1px; margin-top: 8px; }
        @media (min-width: 520px) { .vl-entorno-lista { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
      `}</style>
      <div className="vl-entorno-lista">
        {lista.map((p) => (
          <PersonaFila key={p.id} persona={p} onClick={() => irAPersona(p)} />
        ))}
      </div>

      <div style={{ marginTop: 12, display: 'flex', gap: 12, flexWrap: 'wrap' }}>
        <button type="button" onClick={irANueva} style={{ ...botonContorno, fontSize: 13.5 }}>+ Añadir persona</button>
        <button type="button" onClick={irAPersonas} style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: FONT_BODY, fontSize: 13.5, color: NAVY, fontWeight: 600, padding: 0 }}>Ver todas →</button>
      </div>
    </section>
  );
}
