// Camino · los 14 primeros días.
// BD v3: perfil_camino, actividad_diaria, ejercicios+preguntas_respuestas_ejercicios (onboarding).
// RLS: cada cuenta solo lee y escribe sus filas.
import { supabase } from './supabase';

export class CaminoError extends Error {}

const comprobar = ({ data, error }) => {
  if (error) throw new CaminoError(error.message);
  return data;
};

const ahora = () => new Date().toISOString();
const parseFecha = (s) => { const [y, m, d] = s.split('-').map(Number); return new Date(y, m - 1, d); };
const DIA_MS = 86400000;
const diaNumero = (inicio, fecha) => Math.round((parseFecha(fecha) - parseFecha(inicio)) / DIA_MS) + 1;
const fechaDeDia = (inicio, dia) => {
  const d = parseFecha(inicio);
  d.setDate(d.getDate() + dia - 1);
  const p = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
};

const LINEA_BASE_MAP = {
  'Mi fallo principal': 'fallo',
  'Cómo me ven los demás': 'me_ven',
  'Cómo me gustaría ser': 'me_gustaria',
};
const ONBOARDING_IDS = {
  fallo: '64c9372c-08fc-4fd9-b0e7-656ce4f67a1f',
  me_ven: 'c611caac-6ac0-460a-9ee9-a7acdac8c72d',
  me_gustaria: 'e1db0dde-8e65-4143-964a-26af56d9bcab',
};
const ONBOARDING_PREGUNTAS = {
  fallo: 'Cuando algo me sale mal, yo…',
  me_ven: 'Los que me quieren dicen que soy…',
  me_gustaria: 'Me gustaría que dijeran que soy…',
};

export async function leerCamino() {
  const perfil = await supabase.from('perfil_camino').select('*').maybeSingle();
  const perfilData = comprobar(perfil);

  let dias = [];
  if (perfilData?.inicio) {
    const actividad = await supabase.from('actividad_diaria').select('*').order('fecha');
    if (!actividad.error && actividad.data?.length) {
      dias = actividad.data.map((row) => ({ ...row, dia: diaNumero(perfilData.inicio, row.fecha) }));
    }
  }

  let lineaBase = null;
  const resp = await supabase
    .from('preguntas_respuestas_ejercicios')
    .select('respuesta, ejercicios!inner(titulo)')
    .eq('ejercicios.categoria', 'onboarding')
    .order('creado_en', { ascending: false });
  if (!resp.error && resp.data?.length) {
    lineaBase = {};
    for (const row of resp.data) {
      const campo = LINEA_BASE_MAP[row.ejercicios.titulo];
      if (campo && !(campo in lineaBase)) lineaBase[campo] = row.respuesta;
    }
    if (!Object.keys(lineaBase).length) lineaBase = null;
  }

  return { perfil: perfilData, dias, lineaBase };
}

const PERFIL_CAMPOS = new Set([
  'momentos', 'estado_vida', 'objetivo', 'vida_interior',
  'ritmo', 'hora_manana', 'hora_examen', 'formato_examen',
  'ciclo_semanas', 'notificaciones', 'inicio',
]);

export async function guardarPerfil(userId, campos) {
  const limpio = {};
  for (const [k, v] of Object.entries(campos)) {
    if (PERFIL_CAMPOS.has(k)) limpio[k] = v;
  }
  return comprobar(await supabase.from('perfil_camino')
    .upsert({ user_id: userId, ...limpio, actualizado_en: ahora() }).select().single());
}

export async function guardarSesion(userId, dia, { juego, conQuien }, inicio) {
  const fecha = fechaDeDia(inicio, dia);
  return comprobar(await supabase.from('actividad_diaria')
    .upsert({ user_id: userId, fecha, sesion_en: ahora(), juego: juego ?? null, con_quien: conQuien ?? null, actualizado_en: ahora() })
    .select().single());
}

export async function guardarExamen(userId, dia, examen, inicio) {
  const fecha = fechaDeDia(inicio, dia);
  return comprobar(await supabase.from('actividad_diaria')
    .upsert({ user_id: userId, fecha, examen_en: ahora(), examen, actualizado_en: ahora() })
    .select().single());
}

export async function guardarLineaBase(userId, campos) {
  const ids = Object.values(ONBOARDING_IDS);
  await supabase.from('preguntas_respuestas_ejercicios')
    .delete().eq('user_id', userId).in('ejercicio_id', ids);
  const rows = [];
  for (const [campo, ejercicioId] of Object.entries(ONBOARDING_IDS)) {
    if (campos[campo] != null) {
      rows.push({
        user_id: userId,
        ejercicio_id: ejercicioId,
        pregunta: ONBOARDING_PREGUNTAS[campo],
        respuesta: campos[campo],
      });
    }
  }
  if (rows.length) comprobar(await supabase.from('preguntas_respuestas_ejercicios').insert(rows));
  return campos;
}
