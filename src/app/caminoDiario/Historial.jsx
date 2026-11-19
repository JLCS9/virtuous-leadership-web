// Los días que has vivido: el reto, lo que elegiste, si lo cumpliste y lo que escribiste. Del más
// reciente al más antiguo. Muestra los 5 últimos; «Ver más» los despliega todos.
import { useState } from 'react';
import biblioteca from '../../data/camino-biblioteca.json';
import { useT } from '../../i18n';
import { fechaCorta } from '../../lib/camino.js';
import { FONT_BODY, INK, LINE, MUTED, NAVY, eyebrow, parrafo, tarjeta } from '../tokens';

const RETOS = Object.fromEntries(biblioteca.retos.map((r) => [r.id, r]));
const primeraMayuscula = (s) => s.charAt(0).toUpperCase() + s.slice(1);
const MAX_VISIBLE = 5;

export default function Historial({ dias }) {
  const { t } = useT();
  const [expandido, setExpandido] = useState(false);
  const vividos = dias.filter((d) => d.reto_id).slice().reverse();
  const mostrados = expandido ? vividos : vividos.slice(0, MAX_VISIBLE);
  const hayMas = vividos.length > MAX_VISIBLE;

  return (
    <section style={tarjeta} aria-label={t('camino.pagina.historial.titulo')}>
      <div style={eyebrow}>{t('camino.pagina.historial.titulo')}</div>
      {vividos.length === 0 && <p style={{ ...parrafo, margin: '12px 0 0' }}>{t('camino.pagina.historial.vacio')}</p>}
      <ul style={{ listStyle: 'none', margin: '8px 0 0', padding: 0 }}>
        {mostrados.map((d) => (
          <li key={d.fecha} style={{ borderTop: `1px solid ${LINE}`, padding: '12px 0' }}>
            <div style={{ fontFamily: FONT_BODY, fontSize: 13.5, color: MUTED }}>{primeraMayuscula(fechaCorta(d.fecha))}</div>
            <div style={{ fontFamily: FONT_BODY, fontSize: 15, fontWeight: 600, color: INK, margin: '2px 0 3px' }}>{RETOS[d.reto_id]?.consigna ?? d.reto_id}</div>
            <div style={{ fontFamily: FONT_BODY, fontSize: 14.5, lineHeight: 1.5, color: INK }}>{d.texto ?? t('camino.pagina.historial.sin_opcion')}</div>
            <div style={{ fontFamily: FONT_BODY, fontSize: 13.5, color: MUTED, marginTop: 3 }}>
              {d.cumplido ? t(`camino.noche.cumplidos.${d.cumplido}`) : t('camino.pagina.historial.sin_examen')}
            </div>
            {d.reflexion && <div style={{ fontFamily: FONT_BODY, fontSize: 14, lineHeight: 1.5, color: MUTED, fontStyle: 'italic', marginTop: 3 }}>«{d.reflexion}»</div>}
          </li>
        ))}
      </ul>
      {hayMas && !expandido && (
        <button type="button" onClick={() => setExpandido(true)}
          style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: FONT_BODY, fontSize: 14, fontWeight: 600, color: NAVY, padding: '8px 0 0', display: 'block' }}>
          {t('camino.pagina.historial.ver_mas')} ({vividos.length - MAX_VISIBLE} más)
        </button>
      )}
    </section>
  );
}
