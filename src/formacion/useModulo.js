import { useCallback, useEffect, useRef, useState } from 'react';
import { supabase } from '../account/supabase';
import { trackCompletado, trackPaso } from '../lib/track';

const EVALUABLES = ['quiz', 'define', 'desliza'];
const UMBRAL = 0.70;

function calcularAprobado(tipo, resultado) {
  if (!EVALUABLES.includes(tipo)) return null;
  if (resultado?.aciertos == null || resultado?.total == null) return null;
  if (resultado.total === 0) return null;
  return (resultado.aciertos / resultado.total) >= UMBRAL;
}

// --- localStorage fallback (mismo comportamiento que antes) ---
const claveLS = (userId, cursoId) => `vl-modulo:${userId}:${cursoId}`;
const vacio = () => ({ completados: {}, pasoActual: null });

// Migración: las claves antiguas usaban "modulo1" en vez de "curso1".
const RENAME_MAP = { curso1: 'modulo1', curso2: 'modulo2', curso3: 'modulo3', curso4: 'modulo4', curso5: 'modulo5', curso7: 'modulo7' };
function migrarClaveLS(userId, cursoId) {
  const viejo = RENAME_MAP[cursoId];
  if (!viejo) return;
  try {
    const claveVieja = `vl-modulo:${userId}:${viejo}`;
    const claveNueva = claveLS(userId, cursoId);
    const datos = localStorage.getItem(claveVieja);
    if (datos && !localStorage.getItem(claveNueva)) {
      localStorage.setItem(claveNueva, datos);
      localStorage.removeItem(claveVieja);
    }
  } catch {}
}

function leerLS(userId, cursoId) {
  migrarClaveLS(userId, cursoId);
  try {
    const bruto = JSON.parse(localStorage.getItem(claveLS(userId, cursoId)));
    return bruto && typeof bruto.completados === 'object'
      ? { completados: bruto.completados, pasoActual: null }
      : vacio();
  } catch { return vacio(); }
}

function useModuloProgresoLS(userId, moduloId, cursoNum) {
  const [estado, setEstado] = useState(() => leerLS(userId, moduloId));
  useEffect(() => { setEstado(leerLS(userId, moduloId)); }, [userId, moduloId]);
  const estadoRef = useRef(estado);
  estadoRef.current = estado;
  const curso = cursoNum ?? moduloId;

  const cambiar = useCallback((f) => {
    setEstado((previo) => {
      const nuevo = f(previo);
      try { localStorage.setItem(claveLS(userId, moduloId), JSON.stringify(nuevo)); } catch {}
      return nuevo;
    });
  }, [userId, moduloId]);

  return {
    completados: estado.completados,
    pasoActual: estado.pasoActual,
    cargando: false,
    completar: (pasoId, resultado, paso) => {
      trackCompletado({
        curso, pasoId, tipo: paso?.tipo, modulo: paso?.modulo, resultado,
        previo: estadoRef.current.completados[pasoId],
      });
      cambiar((p) => ({
        completados: { ...p.completados, [pasoId]: { fecha: new Date().toISOString(), ...(resultado ?? {}) } },
        pasoActual: p.pasoActual,
      }));
    },
    irA: (pasoId, totalPasos) => {
      trackPaso({
        curso, pasoId, totalPasos,
        completados: Object.keys(estadoRef.current.completados).length,
      });
      cambiar((p) => ({ ...p, pasoActual: pasoId }));
    },
    reset: () => cambiar(() => vacio()),
  };
}

// --- Supabase ---
function useModuloProgresoBD(userId, cursoNum) {
  const [completados, setCompletados] = useState({});
  const [pasoActual, setPasoActual] = useState(null);
  const [cargando, setCargando] = useState(true);
  const completadosRef = useRef(completados);
  completadosRef.current = completados;

  useEffect(() => {
    let vivo = true;
    setCargando(true);

    Promise.all([
      supabase
        .from('respuestas')
        .select('contenido_id, respuesta, aprobado, created_at')
        .eq('user_id', userId)
        .eq('curso', cursoNum),
      supabase
        .from('progreso_curso')
        .select('paso_actual')
        .eq('user_id', userId)
        .eq('curso', cursoNum)
        .maybeSingle(),
    ]).then(([resps, prog]) => {
      if (!vivo) return;
      const mapa = {};
      for (const r of resps.data ?? []) {
        mapa[r.contenido_id] = {
          fecha: r.created_at,
          ...(r.respuesta ?? {}),
          aprobado: r.aprobado,
        };
      }
      setCompletados(mapa);
      if (prog.data?.paso_actual) setPasoActual(prog.data.paso_actual);
      setCargando(false);
    }).catch(() => {
      if (vivo) setCargando(false);
    });

    return () => { vivo = false; };
  }, [userId, cursoNum]);

  const completar = useCallback((pasoId, resultado, paso) => {
    const ahora = new Date().toISOString();
    const tipo = paso?.tipo ?? null;
    const modulo = paso?.modulo ?? 0;
    const aprobado = calcularAprobado(tipo, resultado);

    trackCompletado({
      curso: cursoNum, pasoId, tipo, modulo, resultado, aprobado,
      previo: completadosRef.current[pasoId],
    });

    setCompletados((prev) => ({
      ...prev,
      [pasoId]: { fecha: ahora, ...(resultado ?? {}), aprobado },
    }));

    supabase.from('respuestas').upsert({
      user_id: userId,
      contenido_id: pasoId,
      curso: cursoNum,
      modulo,
      respuesta: resultado ?? {},
      aprobado,
      completado: true,
      updated_at: ahora,
    }, { onConflict: 'user_id, contenido_id' }).then(({ error }) => {
      if (error) console.warn('[formacion] Error guardando respuesta:', error.message);
    });
  }, [userId, cursoNum]);

  const irA = useCallback((pasoId, totalPasos) => {
    setPasoActual(pasoId);
    const numCompletados = Object.keys(completadosRef.current).length;
    trackPaso({ curso: cursoNum, pasoId, totalPasos, completados: numCompletados });

    supabase.from('progreso_curso').upsert({
      user_id: userId,
      curso: cursoNum,
      paso_actual: pasoId,
      completados: numCompletados,
      total_pasos: totalPasos ?? 0,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'user_id, curso' }).then(({ error }) => {
      if (error) console.warn('[formacion] Error guardando progreso:', error.message);
    });
  }, [userId, cursoNum]);

  const reset = useCallback(() => {
    setCompletados({});
    setPasoActual(null);
  }, []);

  return { completados, pasoActual, cargando, completar, irA, reset };
}

// --- Hook público: elige BD o localStorage ---
// La decisión se toma a nivel de módulo (supabase es constante), así no se
// viola la regla de hooks de React (siempre se llama la misma implementación).
export const useModuloProgreso = supabase
  ? function useModuloProgreso(userId, _moduloId, cursoNum) { return useModuloProgresoBD(userId, cursoNum ?? 0); }
  : function useModuloProgreso(userId, moduloId, cursoNum) { return useModuloProgresoLS(userId, moduloId, cursoNum); };
