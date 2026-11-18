// Estado del Camino diario del usuario: sus variables, sus días y sus hábitos con las casillas
// recientes. Los valores ya resueltos con las fichas de «Tu entorno» se calculan donde se pintan:
// `valoresDe(variables, personas.porId)`. Los hábitos cambian de estado solos (prueba → activo,
// consolidado, en revisión) con las reglas de lib/habitos.js y los números de la biblioteca.
import { useCallback, useEffect, useMemo, useState } from 'react';
import { actualizarHabito, leerDias, leerHabitos, leerMarcas, leerVariables } from '../account/caminoDiario';
import { useSession } from '../account/useSession';
import biblioteca from '../data/camino-biblioteca.json';
import { fechaLocal, sumarDias } from '../lib/camino.js';
import { cambioDeEstado, fechasDe } from '../lib/habitos.js';

const CONFIG_HABITOS = biblioteca.habitos;
// Marcas que hacen falta: la ventana de consolidación y las semanas completas de revisión, con margen.
const DIAS_DE_MARCAS = 45;

export function useCaminoDiario() {
  const session = useSession();
  const userId = session?.user?.id;
  const [estado, setEstado] = useState({ cargando: true, variables: [], dias: [], habitos: [], marcas: [] });
  const [intento, setIntento] = useState(0);
  const hoy = fechaLocal();

  useEffect(() => {
    if (!userId) return undefined;
    let vivo = true;
    Promise.all([leerVariables(), leerDias(), leerHabitos(), leerMarcas(sumarDias(hoy, -DIAS_DE_MARCAS))])
      .then(([variables, dias, habitos, marcas]) => { if (vivo) setEstado({ cargando: false, variables, dias, habitos, marcas }); })
      .catch((error) => { if (vivo) setEstado((e) => ({ ...e, cargando: false, error })); });
    return () => { vivo = false; };
  }, [userId, intento, hoy]);

  const recargar = useCallback(() => setIntento((n) => n + 1), []);

  // Cambios de estado automáticos. Si falla el guardado no se reintenta en bucle: el estado no cambia.
  useEffect(() => {
    if (estado.cargando) return;
    const cambios = estado.habitos
      .map((h) => ({ h, c: cambioDeEstado(h, fechasDe(estado.marcas, h.id), hoy, CONFIG_HABITOS) }))
      .filter((x) => x.c);
    if (!cambios.length) return;
    Promise.all(cambios.map(({ h, c }) => actualizarHabito(h.id, c))).then(recargar).catch(() => {});
  }, [estado, hoy, recargar]);

  // Variables con fila, aunque la respuesta fuera «saltar»: las preguntas iniciales se dan por hechas.
  const respondidas = useMemo(() => new Set(estado.variables.map((v) => v.variable)), [estado.variables]);

  return {
    ...estado,
    recargar,
    userId,
    respondidas,
    hoy,
    configHabitos: CONFIG_HABITOS,
    diaDeHoy: estado.dias.find((d) => d.fecha === hoy) ?? null,
  };
}
