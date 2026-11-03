import { useCallback, useEffect, useState } from 'react';

const clave = (userId, moduloId) => `vl-modulo:${userId}:${moduloId}`;
const vacio = () => ({ completados: {}, pasoActual: null });

function leer(userId, moduloId) {
  try {
    const bruto = JSON.parse(localStorage.getItem(clave(userId, moduloId)));
    return bruto && typeof bruto.completados === 'object'
      ? { completados: bruto.completados, pasoActual: bruto.pasoActual ?? null }
      : vacio();
  } catch { return vacio(); }
}

export function useModuloProgreso(userId, moduloId) {
  const [estado, setEstado] = useState(() => leer(userId, moduloId));
  useEffect(() => { setEstado(leer(userId, moduloId)); }, [userId, moduloId]);

  const cambiar = useCallback((f) => {
    setEstado((previo) => {
      const nuevo = f(previo);
      try { localStorage.setItem(clave(userId, moduloId), JSON.stringify(nuevo)); } catch {}
      return nuevo;
    });
  }, [userId, moduloId]);

  return {
    completados: estado.completados,
    pasoActual: estado.pasoActual,
    completar: (pasoId, resultado) => cambiar((p) => ({
      completados: { ...p.completados, [pasoId]: { fecha: new Date().toISOString(), ...(resultado ?? {}) } },
      pasoActual: p.pasoActual,
    })),
    irA: (pasoId) => cambiar((p) => ({ ...p, pasoActual: pasoId })),
    reset: () => cambiar(() => vacio()),
  };
}
