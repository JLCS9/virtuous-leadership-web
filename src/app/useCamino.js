// Estado del Camino de la persona: su perfil (onboarding), lo hecho cada día y su línea base.
import { useCallback, useEffect, useState } from 'react';
import { leerCamino } from '../account/camino';
import { diaDelCamino, fechaLocal, racha } from '../lib/camino.js';

export function useCamino() {
  const [estado, setEstado] = useState({ cargando: true });
  const [intento, setIntento] = useState(0);

  useEffect(() => {
    let vivo = true;
    setEstado((e) => (e.datos ? e : { cargando: true }));
    leerCamino()
      .then((datos) => { if (vivo) setEstado({ cargando: false, datos }); })
      .catch((error) => { if (vivo) setEstado({ cargando: false, error }); });
    return () => { vivo = false; };
  }, [intento]);

  const recargar = useCallback(() => setIntento((n) => n + 1), []);
  const datos = estado.datos;
  const hoy = fechaLocal();
  const porDia = Object.fromEntries((datos?.dias ?? []).map((d) => [d.dia, d]));

  return {
    cargando: estado.cargando,
    error: estado.error,
    recargar,
    perfil: datos?.perfil ?? null,
    lineaBase: datos?.lineaBase ?? null,
    porDia,
    // ≤0: aún no empieza · 1…14: en curso · >14: terminado
    diaHoy: datos?.perfil ? diaDelCamino(datos.perfil.inicio, hoy) : null,
    racha: racha(datos?.dias ?? [], hoy),
  };
}
