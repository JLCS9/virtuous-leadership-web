import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { LocalLink as Link, useLocalPath } from '../i18n';
import { fetchLatestCharacter } from '../account/account';
import { extremos, resultadoCaracter } from '../lib/virtudes.js';
import { INK, MUTED, NAVY, FONT_BODY, FONT_SLAB, GOLD_REF } from '../theme';
import { botonSobreClaro, eyebrow, parrafo, tarjeta, titulo } from './estilos';
import { IconoFlecha } from './Iconos';
import { VirtudesRadar } from './Radar';

const DEMO = { self: { magnanimidad: 72, humildad: 55, prudencia: 63, fortaleza: 48, dominio: 60, justicia: 70 } };

const TEXTO_VIRTUD = {
  magnanimidad: {
    bien: 'Reconoces tu dignidad y tu vocación trascendente, y te mueves a la acción con ambición noble.',
    cultivar: 'Es la virtud de las almas contemplativas que se dirigen a la acción. Trabajar la magnanimidad es atreverte a luchar por grandes cosas.',
  },
  humildad: {
    bien: 'Vives en la verdad sobre ti mismo y sirves a los demás ayudándoles a crecer como personas.',
    cultivar: 'Es el hábito de vivir en la verdad sobre uno mismo. Cultivar la humildad es conocerte mejor y ponerte al servicio de los demás.',
  },
  prudencia: {
    bien: 'Contemplas las situaciones en su complejidad y tomas decisiones conforme a esa percepción.',
    cultivar: 'Es el arte de tomar buenas decisiones. Cultivar la prudencia es mejorar tu deliberación y la firmeza de tus decisiones.',
  },
  fortaleza: {
    bien: 'Sabes asumir riesgos con audacia y mantener el rumbo con resistencia, incluso ante la adversidad.',
    cultivar: 'Tiene dos dimensiones: la audacia y la resistencia. Cultivar la fortaleza es atreverte a más y mantenerte firme en lo difícil.',
  },
  dominio: {
    bien: 'Sometes tus bajas pasiones y estimulas las nobles, poniéndolas al servicio de tu misión.',
    cultivar: 'Es dirigir nuestras pasiones. Cultivar el dominio de sí es mortificar lo que te frena y estimular lo que te impulsa.',
  },
  justicia: {
    bien: 'Practicas la comunión interpersonal con sinceridad y amor, y construyes el bien común.',
    cultivar: 'Es dar a cada uno lo suyo. Cultivar la justicia es crecer en sinceridad, amor y compromiso con el bien común.',
  },
};

export default function MapaCaracter() {
  const [params] = useSearchParams();
  const [fila, setFila] = useState(undefined);
  const navigate = useNavigate();
  const lp = useLocalPath();
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
  const textoMayor = TEXTO_VIRTUD[mayor.clave];
  const textoMenor = TEXTO_VIRTUD[menor.clave];

  return (
    <section style={tarjeta} aria-label="Tus virtudes">
      <div style={eyebrow}>Tu mapa de carácter{fecha ? ` · ${fecha}` : ''}</div>

      <div className="vl-caracter-grid">
        <style>{`
          .vl-caracter-grid { margin-top: 8px; }
          @media (min-width: 860px) {
            .vl-caracter-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; align-items: start; }
          }
        `}</style>

        <div>
          <VirtudesRadar valores={valores} />
        </div>

        <div style={{ marginTop: 12 }}>
          <p style={{ fontFamily: FONT_BODY, fontSize: 14.5, color: INK, margin: '0 0 4px', lineHeight: 1.5 }}>
            Tu virtud más fuerte es <strong style={{ color: NAVY }}>{mayor.nombre}</strong> ({Math.round(mayor.valor)}%).
          </p>
          {textoMayor && (
            <p style={{ fontFamily: FONT_BODY, fontSize: 13.5, color: MUTED, margin: '0 0 16px', lineHeight: 1.5 }}>
              {textoMayor.bien}
            </p>
          )}

          <p style={{ fontFamily: FONT_BODY, fontSize: 14.5, color: INK, margin: '0 0 4px', lineHeight: 1.5 }}>
            Lo que más puedes cultivar ahora es <strong style={{ color: NAVY }}>{menor.nombre}</strong> ({Math.round(menor.valor)}%).
          </p>
          {textoMenor && (
            <p style={{ fontFamily: FONT_BODY, fontSize: 13.5, color: MUTED, margin: '0 0 4px', lineHeight: 1.5 }}>
              {textoMenor.cultivar}
            </p>
          )}

          <button type="button" onClick={() => navigate(lp('/mi-panel/caracter'))} style={{
            display: 'flex', alignItems: 'center', gap: 6, marginTop: 16,
            background: 'none', border: 'none', cursor: 'pointer', padding: 0,
            fontFamily: FONT_BODY, fontSize: 14, fontWeight: 600, color: NAVY,
          }}>
            Ver más →
          </button>
        </div>
      </div>
    </section>
  );
}
