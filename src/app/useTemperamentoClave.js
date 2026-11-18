// El último test de temperamento del usuario: la fila y su clave ('SAN-COL'). `fila` es undefined mientras
// carga y null si no hay resultado.
import { useEffect, useState } from 'react';
import { fetchLatestTemperament } from '../account/account';
import { claveTemperamento } from '../lib/virtudes.js';

export function useTemperamentoClave() {
  const [fila, setFila] = useState(undefined);
  useEffect(() => {
    let vivo = true;
    fetchLatestTemperament().then((r) => { if (vivo) setFila(r ?? null); }).catch(() => { if (vivo) setFila(null); });
    return () => { vivo = false; };
  }, []);
  return { fila, clave: claveTemperamento(fila?.result) };
}
