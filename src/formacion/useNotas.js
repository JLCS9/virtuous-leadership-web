import { useCallback, useState } from 'react';

const clave = (userId, moduloId) => `vl-notas:${userId}:${moduloId}`;

function leerNotas(userId, moduloId) {
  try {
    const raw = localStorage.getItem(clave(userId, moduloId));
    return raw ? JSON.parse(raw) : {};
  } catch { return {}; }
}

export function useNotas(userId, moduloId) {
  const [notas, setNotas] = useState(() => leerNotas(userId, moduloId));

  const persistir = useCallback((nuevas) => {
    try { localStorage.setItem(clave(userId, moduloId), JSON.stringify(nuevas)); } catch {}
    setNotas(nuevas);
  }, [userId, moduloId]);

  return {
    notas,
    agregar(pasoId, texto) {
      const entrada = { id: Date.now().toString(36), texto, fecha: new Date().toISOString() };
      persistir({ ...notas, [pasoId]: [...(notas[pasoId] ?? []), entrada] });
    },
    eliminar(pasoId, notaId) {
      const lista = (notas[pasoId] ?? []).filter((n) => n.id !== notaId);
      const nuevas = { ...notas };
      if (lista.length === 0) delete nuevas[pasoId];
      else nuevas[pasoId] = lista;
      persistir(nuevas);
    },
  };
}
