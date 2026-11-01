// Tu mapa de carácter: la gráfica de las seis virtudes según el test de carácter.
// Va en «Hoy», justo después del reto del día.
import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { LocalLink as Link } from '../i18n';
import { fetchLatestCharacter } from '../account/account';
import { extremos, resultadoCaracter } from '../lib/virtudes.js';
import { INK, NAVY, FONT_SANS } from '../theme';
import { botonSobreClaro, eyebrow, parrafo, tarjeta, titulo } from './estilos';
import { IconoFlecha } from './Iconos';
import { VirtudesBarras, VirtudesRadar } from './Radar';

// Solo en desarrollo: ?demo=1 pinta la gráfica con datos de ejemplo (en producción no existe).
const DEMO = { self: { magnanimidad: 72, humildad: 55, prudencia: 63, fortaleza: 48, dominio: 60, justicia: 70 } };

export default function MapaCaracter() {
  const [params] = useSearchParams();
  const [fila, setFila] = useState(undefined);
  useEffect(() => {
    let vivo = true;
    fetchLatestCharacter().then((r) => { if (vivo) setFila(r ?? null); }).catch(() => { if (vivo) setFila(null); });
    return () => { vivo = false; };
  }, []);

  const demo = import.meta.env.DEV && params.has('demo');
  const resultado = resultadoCaracter(demo ? DEMO : fila?.result);
  if (fila === undefined && !demo) return null;

  if (!resultado) {
    return (
      <section style={tarjeta} aria-label="Tus virtudes">
        <div style={eyebrow}>Tus virtudes</div>
        <h2 style={{ ...titulo(26), margin: '10px 0 8px' }}>Descubre qué virtudes has construido</h2>
        <p style={{ ...parrafo, marginBottom: 6 }}>El test de carácter mide las seis virtudes y dibuja aquí tu punto de partida. Son 68 preguntas y se hace una sola vez.</p>
        <p style={{ ...parrafo, fontSize: 13.5, marginBottom: 18 }}>Hazlo con tu sesión iniciada: así el resultado se guarda en tu cuenta.</p>
        <Link to="/tests/caracter" style={botonSobreClaro}>Hacer el test de carácter <IconoFlecha width={18} height={18} /></Link>
      </section>
    );
  }

  const { valores } = resultado;
  const { mayor, menor } = extremos(valores);
  const fecha = fila?.taken_at ? new Date(fila.taken_at).toLocaleDateString('es-ES', { day: 'numeric', month: 'long' }) : null;
  return (
    <section style={tarjeta} aria-label="Tus virtudes">
      <div style={eyebrow}>Tus virtudes{fecha ? ` · medido el ${fecha}` : ''}</div>
      <h2 style={{ ...titulo(26), margin: '10px 0 14px' }}>Tu mapa de carácter</h2>
      <VirtudesRadar valores={valores} />
      <p style={{ ...parrafo, margin: '14px 0 20px', color: INK, textAlign: 'center' }}>
        Tu virtud más presente es <strong>{mayor.nombre}</strong> ({Math.round(mayor.valor)} %). La que más puedes cultivar ahora es <strong>{menor.nombre}</strong> ({Math.round(menor.valor)} %).
      </p>
      <VirtudesBarras valores={valores} />
      <div style={{ marginTop: 18 }}>
        <Link to="/tests/caracter" style={{ fontFamily: FONT_SANS, fontSize: 14, color: NAVY, fontWeight: 600 }}>Repetir el test →</Link>
      </div>
    </section>
  );
}
