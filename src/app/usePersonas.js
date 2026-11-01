// Las fichas de personas de la cuenta (y si es menor de 18, para ocultar la marca «me cuesta»).
import { useCallback, useEffect, useState } from 'react';
import { anioNacimiento, listarPersonas } from '../account/personas';
import { esMenorDe18 } from '../lib/personas.js';
import { useSession } from '../account/useSession';

export function usePersonas() {
  const session = useSession();
  const userId = session?.user?.id;
  const [estado, setEstado] = useState({ cargando: true, lista: [] });
  const [intento, setIntento] = useState(0);

  useEffect(() => {
    if (!userId) return undefined;
    let vivo = true;
    Promise.all([listarPersonas(), anioNacimiento(userId)])
      .then(([lista, anio]) => { if (vivo) setEstado({ cargando: false, lista, menor: esMenorDe18(anio) }); })
      .catch((error) => { if (vivo) setEstado({ cargando: false, lista: [], error }); });
    return () => { vivo = false; };
  }, [userId, intento]);

  const recargar = useCallback(() => setIntento((n) => n + 1), []);
  return { ...estado, recargar, porId: Object.fromEntries(estado.lista.map((p) => [p.id, p])) };
}
