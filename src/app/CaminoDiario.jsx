// Pestaña «Camino»: tus hábitos, el historial de tus días y lo que Virtus sabe de ti. Lo de cada día
// (la cita, el reto y el examen) vive en Hoy. Sin lógica propia: solo monta las tres secciones.
import { useT } from '../i18n';
import { parrafo, tarjeta } from './estilos';
import { usePersonas } from './usePersonas';
import { useCaminoDiario } from './useCaminoDiario';
import Historial from './caminoDiario/Historial';
import ListaHabitos from './caminoDiario/ListaHabitos';
import MisVariables from './caminoDiario/MisVariables';

export default function CaminoDiario() {
  const { t } = useT();
  const camino = useCaminoDiario();
  const personas = usePersonas();

  if (camino.error) return <section style={tarjeta}><p role="alert" style={parrafo}>{t('camino.error_cargar')}</p></section>;
  if (camino.cargando || personas.cargando) return null;

  return (
    <div style={{ display: 'grid', gap: 18 }} aria-label={t('camino.pagina.titulo')}>
      <ListaHabitos
        habitos={camino.habitos} marcas={camino.marcas} hoy={camino.hoy} userId={camino.userId}
        config={camino.configHabitos} onCambio={camino.recargar}
      />
      <Historial dias={camino.dias} />
      <MisVariables variables={camino.variables} personas={personas} userId={camino.userId} onCambio={camino.recargar} />
    </div>
  );
}
