// Pestaña «Camino»: tu entorno y tu último test de carácter arriba, el camino de las seis virtudes
// debajo, y después tus hábitos, el historial de tus días y lo que Virtus sabe de ti. Lo de cada día
// (la cita, el reto y el examen) vive en Hoy. Sin lógica propia: solo monta las secciones.
import { useSearchParams } from 'react-router-dom';
import { CHALLENGE_VIRTUE } from '../account/challengeVirtues';
import { useT } from '../i18n';
import { sumarDias } from '../lib/camino.js';
import { RUTA, bloquesDeLaRuta, inicioDeLaRuta, virtudDeDesafio } from '../lib/rutaVirtudes.js';
import { parrafo, tarjeta } from './estilos';
import MapaCaracter from './MapaCaracter';
import { usePersonas } from './usePersonas';
import { useCaminoDiario } from './useCaminoDiario';
import { useTemperamentoClave } from './useTemperamentoClave';
import Historial from './caminoDiario/Historial';
import ListaHabitos from './caminoDiario/ListaHabitos';
import MisVariables from './caminoDiario/MisVariables';
import RutaVirtudes from './caminoDiario/RutaVirtudes';
import TuEntorno from './personas/TuEntorno';

export default function CaminoDiario() {
  const { t } = useT();
  const camino = useCaminoDiario();
  const personas = usePersonas();
  const { fila, clave } = useTemperamentoClave();
  const [params] = useSearchParams();

  if (camino.error) return <section style={tarjeta}><p role="alert" style={parrafo}>{t('camino.error_cargar')}</p></section>;
  if (camino.cargando || personas.cargando || fila === undefined) return null;

  // Solo en desarrollo: `?avance=0.5` enseña el camino con la mitad recorrida (0 a 1; 1 o más, completado).
  const avance = import.meta.env.DEV ? Number(params.get('avance')) : NaN;
  const inicio = Number.isFinite(avance) && params.has('avance')
    ? sumarDias(camino.hoy, -Math.round(avance * RUTA.dias_por_virtud))
    : inicioDeLaRuta(camino.dias);
  const bloques = bloquesDeLaRuta({ desafio: virtudDeDesafio(CHALLENGE_VIRTUE[clave]), inicio, hoy: camino.hoy });

  return (
    <div style={{ display: 'grid', gap: 18 }} aria-label={t('camino.pagina.titulo')}>
      <style>{`
        .vl-camino-arriba { display: grid; gap: 18px; }
        @media (min-width: 860px) { .vl-camino-arriba { grid-template-columns: 1fr 1fr; align-items: start; gap: 24px; } }
      `}</style>
      <div className="vl-camino-arriba">
        <TuEntorno miPrimario={clave} />
        <MapaCaracter tempClave={clave} />
      </div>
      <RutaVirtudes bloques={bloques} />
      <ListaHabitos
        habitos={camino.habitos} marcas={camino.marcas} hoy={camino.hoy} userId={camino.userId}
        config={camino.configHabitos} onCambio={camino.recargar}
      />
      <Historial dias={camino.dias} />
      <MisVariables variables={camino.variables} personas={personas} userId={camino.userId} onCambio={camino.recargar} />
    </div>
  );
}
