// La mañana: la cita de hoy y UNA propuesta de reto cada vez. El usuario la acepta o pide otra, hasta
// que acepte; aceptar la guarda y es su compromiso del día. «Otra» recorre primero las tres formas del
// mismo reto (con una persona, como hábito, en una situación) y después pasa a otro reto.
import { useEffect, useRef, useState } from 'react';
import { guardarDia } from '../../account/caminoDiario';
import { useT } from '../../i18n';
import { opcionesDelReto } from '../../lib/retos.js';
import { INK, LINE, MUTED, NAVY, PAPER, FONT_BODY, FONT_SLAB, GOLD_REF } from '../../theme';
import { botonContorno, botonSobreClaro, eyebrow, fechaLarga, parrafo, tarjeta, titulo } from '../estilos';

const primeraMayuscula = (s) => s.charAt(0).toUpperCase() + s.slice(1);

/**
 * `proponerOtro()` devuelve el siguiente reto distinto de los ya propuestos hoy, o null. Lo calcula quien
 * monta el componente porque conoce los retos válidos, el temperamento y el historial.
 */
export default function Manana({ reto, cita, valores, defectos, diaDeHoy, hoy, userId, proponerOtro, onGuardado }) {
  const { t } = useT();
  const [error, setError] = useState(false);
  const [indice, setIndice] = useState(0);
  const fijado = useRef(false);

  // Al abrir la mañana se fijan el reto y la cita del día, para no perderlos si se recarga.
  useEffect(() => {
    if (diaDeHoy?.reto_id || fijado.current) return;
    fijado.current = true;
    guardarDia(userId, hoy, { reto_id: reto.id, cita_id: cita?.id ?? null, temperamento: reto.temperamento })
      .then(onGuardado)
      .catch(() => { fijado.current = false; setError(true); });
  }, [diaDeHoy, reto, cita, hoy, userId, onGuardado]);

  const opciones = opcionesDelReto(reto, valores, defectos);
  const aceptada = Boolean(diaDeHoy?.opcion);
  const propuesta = opciones[indice];

  async function aceptar() {
    setError(false);
    try {
      await guardarDia(userId, hoy, {
        reto_id: reto.id, cita_id: cita?.id ?? null, temperamento: reto.temperamento,
        opcion: propuesta.clave, texto: propuesta.texto, elegido_en: new Date().toISOString(),
      });
      onGuardado();
    } catch {
      setError(true);
    }
  }

  async function otra() {
    setError(false);
    if (indice < opciones.length - 1) { setIndice(indice + 1); return; }
    const siguiente = proponerOtro();
    if (!siguiente || siguiente.id === reto.id) { setIndice(0); return; }
    try {
      await guardarDia(userId, hoy, { reto_id: siguiente.id, temperamento: siguiente.temperamento });
      onGuardado(); // quien monta el componente lo vuelve a montar con el reto nuevo
    } catch {
      setError(true);
    }
  }

  const etiqueta = (clave) => t(`camino.manana.opciones.${clave}`);
  const mostrada = aceptada ? { clave: diaDeHoy.opcion, texto: diaDeHoy.texto } : propuesta;

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
      <p style={{ ...parrafo, fontSize: 18, marginBottom: 16 }}>{aceptada ? t('camino.manana.elegida') : t('camino.manana.propuesta')}</p>

      <div
        aria-live="polite"
        style={{
          padding: '16px 18px', display: 'grid', gap: 4, fontFamily: FONT_BODY, borderRadius: 0,
          border: `1px solid ${aceptada ? NAVY : LINE}`, background: aceptada ? NAVY : PAPER, color: aceptada ? PAPER : INK,
        }}
      >
        <span style={{ fontSize: 16, fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase', opacity: 0.8 }}>{etiqueta(mostrada.clave)}</span>
        <span style={{ fontSize: 20, lineHeight: 1.5 }}>{mostrada.texto}</span>
      </div>

      {aceptada ? (
        <p style={{ ...parrafo, fontSize: 16, marginTop: 16 }}>{t('camino.manana.noche')}</p>
      ) : (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginTop: 18 }}>
          <button type="button" onClick={aceptar} style={botonSobreClaro}>{t('camino.manana.aceptar')}</button>
          <button type="button" onClick={otra} style={botonContorno}>{t('camino.manana.otro')}</button>
        </div>
      )}
      {error && <p role="alert" style={{ ...parrafo, fontSize: 16, color: '#9b1c1c', marginTop: 14 }}>{t('camino.error_guardar')}</p>}
    </section>
  );
}
