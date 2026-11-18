// Lo principal de Hoy: la mañana (cita + reto) o, la primera vez, las preguntas iniciales. Decide qué
// toca y delega en `PreguntasIniciales` o `Manana`; aquí no hay contenido ni reglas, solo montaje.
import { useState } from 'react';
import biblioteca from '../../data/camino-biblioteca.json';
import { useT } from '../../i18n';
import { ofrecerAlta, textoDeHabito, virtudDeReto } from '../../lib/habitos.js';
import {
  citaDelDia, defectosDe, filtrarValidos, partesTemperamento, preguntasIniciales, preguntasPendientes, retoDelDia, sustituir, valoresDe,
} from '../../lib/retos.js';
import { parrafo, tarjeta } from '../estilos';
import { usePersonas } from '../usePersonas';
import { useCaminoDiario } from '../useCaminoDiario';
import HabitosHoy from './HabitosHoy';
import Manana from './Manana';
import Noche from './Noche';
import PreguntasIniciales from './PreguntasIniciales';

// En producción solo se enseña lo «Aprobado» en la biblioteca; en desarrollo, también lo «Pendiente».
const CONTENIDO = { incluirPendientes: import.meta.env.DEV };
const RETOS = filtrarValidos(biblioteca.retos, CONTENIDO);
const CITAS = filtrarValidos(biblioteca.citas, CONTENIDO);
const DEFECTOS = defectosDe(biblioteca.variables);
const VARIABLES = Object.fromEntries(biblioteca.variables.map((v) => [v.id, v]));

export default function CaminoHoy({ tempClave }) {
  const { t } = useT();
  const camino = useCaminoDiario();
  const personas = usePersonas();
  const [propuestos, setPropuestos] = useState([]); // retos que se han propuesto hoy y no se han aceptado

  if (camino.error) {
    return <section style={{ ...tarjeta, gridColumn: '1 / -1' }}><p role="alert" style={parrafo}>{t('camino.error_cargar')}</p></section>;
  }
  if (camino.cargando || personas.cargando) return null;

  const habitos = (
    <HabitosHoy
      habitos={camino.habitos} marcas={camino.marcas} hoy={camino.hoy} userId={camino.userId}
      config={camino.configHabitos} onCambio={camino.recargar}
    />
  );
  const partes = partesTemperamento(tempClave);
  if (!partes || !RETOS.length) return habitos;

  const pendientes = preguntasPendientes(preguntasIniciales(biblioteca.preguntas_iniciales, partes.primario, CONTENIDO), camino.respondidas);
  if (pendientes.length) {
    return (
      <>
        <div style={{ gridColumn: '1 / -1' }}>
          <PreguntasIniciales
            preguntas={pendientes} variables={VARIABLES} personas={personas.lista} userId={camino.userId} onTerminado={camino.recargar}
          />
        </div>
        {habitos}
      </>
    );
  }

  const reto = retoDelDia({ retos: RETOS, clave: tempClave, historial: camino.dias, fecha: camino.hoy });
  if (!reto) return habitos;
  const cita = citaDelDia({ citas: CITAS, reto, historial: camino.dias, fecha: camino.hoy });

  // El siguiente reto distinto de los ya propuestos hoy (la fila de hoy no cuenta: fijaría el actual).
  const proponerOtro = () => {
    const ya = [...new Set([...propuestos, reto.id])];
    setPropuestos(ya);
    return retoDelDia({ retos: RETOS, clave: tempClave, historial: camino.dias.filter((d) => d.fecha !== camino.hoy), fecha: camino.hoy, excluir: ya });
  };
  const valores = valoresDe(camino.variables, personas.porId);
  const variable = VARIABLES[reto.noche.variable];
  const ofrece = ofrecerAlta({ dia: camino.diaDeHoy, reto, habitos: camino.habitos, config: camino.configHabitos });
  const virtud = virtudDeReto(reto.virtud);

  return (
    <>
      <Manana
        key={reto.id} reto={reto} cita={cita} valores={valores} defectos={DEFECTOS}
        diaDeHoy={camino.diaDeHoy} hoy={camino.hoy} userId={camino.userId} onGuardado={camino.recargar}
        proponerOtro={proponerOtro}
      />
      <Noche
        reto={reto} diaDeHoy={camino.diaDeHoy} hoy={camino.hoy} userId={camino.userId} variable={variable}
        filaVariable={camino.variables.find((v) => v.variable === variable.id)} valorActual={valores[variable.id]}
        personas={personas.lista} onGuardado={camino.recargar}
        habito={ofrece && virtud ? { texto: textoDeHabito(sustituir(reto.opciones.habito, valores, DEFECTOS)), virtud } : null}
      />
      {habitos}
    </>
  );
}
