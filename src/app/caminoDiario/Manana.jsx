// La mañana: la cita de hoy, el reto y sus tres opciones. Se elige una con un toque y se guarda al
// momento (se puede cambiar el mismo día). El reto y la cita de hoy se fijan al abrir y ya no cambian.
import { useEffect, useRef, useState } from 'react';
import { guardarDia } from '../../account/caminoDiario';
import { useT } from '../../i18n';
import { opcionesDelReto } from '../../lib/retos.js';
import { INK, LINE, MUTED, NAVY, PAPER, FONT_BODY, FONT_SLAB, GOLD_REF } from '../../theme';
import { eyebrow, fechaLarga, parrafo, tarjeta, titulo } from '../estilos';

const primeraMayuscula = (s) => s.charAt(0).toUpperCase() + s.slice(1);

export default function Manana({ reto, cita, valores, defectos, diaDeHoy, hoy, userId, onGuardado }) {
  const { t } = useT();
  const [error, setError] = useState(false);
  const fijado = useRef(false);

  // Al abrir la mañana se fijan el reto y la cita del día.
  useEffect(() => {
    if (diaDeHoy?.reto_id || fijado.current) return;
    fijado.current = true;
    guardarDia(userId, hoy, { reto_id: reto.id, cita_id: cita?.id ?? null, temperamento: reto.temperamento })
      .then(onGuardado)
      .catch(() => { fijado.current = false; setError(true); });
  }, [diaDeHoy, reto, cita, hoy, userId, onGuardado]);

  const opciones = opcionesDelReto(reto, valores, defectos);

  async function elegir(o) {
    setError(false);
    try {
      await guardarDia(userId, hoy, {
        reto_id: reto.id, cita_id: cita?.id ?? null, temperamento: reto.temperamento,
        opcion: o.clave, texto: o.texto, elegido_en: new Date().toISOString(),
      });
      onGuardado();
    } catch {
      setError(true);
    }
  }

  return (
    <section style={{ ...tarjeta, gridColumn: '1 / -1' }} aria-label={t('camino.manana.eyebrow')}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 12, flexWrap: 'wrap' }}>
        <div style={eyebrow}>{t('camino.manana.eyebrow')}</div>
        <div style={{ fontFamily: FONT_BODY, fontSize: 16, color: MUTED }}>{primeraMayuscula(fechaLarga())}</div>
      </div>

      {cita && (
        <figure style={{ margin: '18px 0 0', padding: '0 0 0 18px', borderLeft: `3px solid ${GOLD_REF}` }}>
          <blockquote style={{ margin: 0, fontFamily: FONT_SLAB, fontSize: 22, lineHeight: 1.4, color: NAVY }}>«{cita.texto}»</blockquote>
          <figcaption style={{ fontFamily: FONT_BODY, fontSize: 16, color: MUTED, marginTop: 8 }}>
            {cita.origen === 'citado' ? t('camino.manana.cita_citado', { autor: cita.autor }) : cita.autor}
          </figcaption>
        </figure>
      )}

      <h2 style={{ ...titulo(30), margin: '24px 0 6px' }}>{reto.consigna}</h2>
      <p style={{ ...parrafo, fontSize: 18, marginBottom: 16 }}>{t('camino.manana.elige')}</p>

      <div style={{ display: 'grid', gap: 10 }}>
        {opciones.map((o) => {
          const activa = diaDeHoy?.opcion === o.clave;
          return (
            <button
              key={o.clave} type="button" aria-pressed={activa} onClick={() => elegir(o)}
              style={{
                textAlign: 'left', cursor: 'pointer', borderRadius: 0, padding: '16px 18px', minHeight: 56,
                border: `1px solid ${activa ? NAVY : LINE}`, background: activa ? NAVY : PAPER, color: activa ? PAPER : INK,
                fontFamily: FONT_BODY, display: 'grid', gap: 4,
              }}
            >
              <span style={{ fontSize: 16, fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase', opacity: 0.8 }}>
                {t(`camino.manana.opciones.${o.clave}`)}
              </span>
              <span style={{ fontSize: 18, lineHeight: 1.5 }}>{activa && diaDeHoy.texto ? diaDeHoy.texto : o.texto}</span>
            </button>
          );
        })}
      </div>

      {error && <p role="alert" style={{ ...parrafo, fontSize: 16, color: '#9b1c1c', marginTop: 14 }}>{t('camino.error_guardar')}</p>}
      {diaDeHoy?.opcion && (
        <p style={{ ...parrafo, fontSize: 16, marginTop: 16 }}>{t('camino.manana.elegida')} {t('camino.manana.noche')}</p>
      )}
    </section>
  );
}
