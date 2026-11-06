import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../account/supabase';

// --- localStorage fallback (mismo comportamiento que antes) ---
const claveLS = (userId, moduloId) => `vl-notas:${userId}:${moduloId}`;

function leerNotasLS(userId, moduloId) {
  try {
    const raw = localStorage.getItem(claveLS(userId, moduloId));
    return raw ? JSON.parse(raw) : {};
  } catch { return {}; }
}

function useNotasLS(userId, moduloId) {
  const [notas, setNotas] = useState(() => leerNotasLS(userId, moduloId));

  const persistir = useCallback((nuevas) => {
    try { localStorage.setItem(claveLS(userId, moduloId), JSON.stringify(nuevas)); } catch {}
    setNotas(nuevas);
  }, [userId, moduloId]);

  return {
    notas,
    cargando: false,
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

// --- Supabase ---
function useNotasBD(userId) {
  const [notas, setNotas] = useState({});
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    let vivo = true;
    setCargando(true);

    supabase
      .from('notas_formacion')
      .select('id, contenido_id, texto, created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: true })
      .then(({ data, error }) => {
        if (!vivo) return;
        if (error) {
          console.warn('[formacion] Error cargando notas:', error.message);
          setCargando(false);
          return;
        }
        const mapa = {};
        for (const r of data ?? []) {
          if (!mapa[r.contenido_id]) mapa[r.contenido_id] = [];
          mapa[r.contenido_id].push({ id: r.id, texto: r.texto, fecha: r.created_at });
        }
        setNotas(mapa);
        setCargando(false);
      });

    return () => { vivo = false; };
  }, [userId]);

  const agregar = useCallback((pasoId, texto) => {
    const tempId = Date.now().toString(36);
    const fecha = new Date().toISOString();

    setNotas((prev) => ({
      ...prev,
      [pasoId]: [...(prev[pasoId] ?? []), { id: tempId, texto, fecha }],
    }));

    supabase.from('notas_formacion').insert({
      user_id: userId,
      contenido_id: pasoId,
      texto,
    }).select('id, created_at').single().then(({ data, error }) => {
      if (error) {
        console.warn('[formacion] Error guardando nota:', error.message);
        return;
      }
      setNotas((prev) => {
        const lista = (prev[pasoId] ?? []).map((n) =>
          n.id === tempId ? { id: data.id, texto, fecha: data.created_at } : n
        );
        return { ...prev, [pasoId]: lista };
      });
    });
  }, [userId]);

  const eliminar = useCallback((pasoId, notaId) => {
    setNotas((prev) => {
      const lista = (prev[pasoId] ?? []).filter((n) => n.id !== notaId);
      const nuevas = { ...prev };
      if (lista.length === 0) delete nuevas[pasoId];
      else nuevas[pasoId] = lista;
      return nuevas;
    });

    supabase.from('notas_formacion').delete().eq('id', notaId).then(({ error }) => {
      if (error) console.warn('[formacion] Error eliminando nota:', error.message);
    });
  }, []);

  return { notas, cargando, agregar, eliminar };
}

// --- Hook público: elige BD o localStorage ---
// La decisión se toma a nivel de módulo (supabase es constante), así no se
// viola la regla de hooks de React (siempre se llama la misma implementación).
export const useNotas = supabase
  ? function useNotas(userId) { return useNotasBD(userId); }
  : function useNotas(userId, moduloId) { return useNotasLS(userId, moduloId); };
