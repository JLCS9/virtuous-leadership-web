#!/usr/bin/env node
// Seed script: creates a complete test user "Álvaro Alabart" with all data.
// Run: node scripts/seed-test-user.mjs
// Requires: .env with SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY

import { readFileSync } from 'fs';
import { createClient } from '@supabase/supabase-js';

const env = Object.fromEntries(
  readFileSync('.env', 'utf8').split('\n').filter(l => l && !l.startsWith('#'))
    .map(l => { const i = l.indexOf('='); return [l.slice(0, i), l.slice(i + 1)]; })
);

const SUPABASE_URL = env.SUPABASE_URL;
const SERVICE_KEY = env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(SUPABASE_URL, SERVICE_KEY, { auth: { autoRefreshToken: false, persistSession: false } });

const EMAIL = 'alvaro.test@virtuousleadership.com';
const PASSWORD = 'TestVL2026!';

async function main() {
  // 0. Delete existing test user if any
  const { data: existing } = await supabase.auth.admin.listUsers();
  const old = existing?.users?.find(u => u.email === EMAIL);
  if (old) {
    console.log('Deleting existing test user:', old.id);
    // Clean up related data first (cascade should handle most, but be safe)
    await supabase.from('actividad_diaria').delete().eq('user_id', old.id);
    await supabase.from('preguntas_respuestas_ejercicios').delete().eq('user_id', old.id);
    await supabase.from('persona_observaciones').delete().eq('user_id', old.id);
    await supabase.from('persona_estimaciones').delete().eq('user_id', old.id);
    await supabase.from('personas').delete().eq('user_id', old.id);
    await supabase.from('perfil_camino').delete().eq('user_id', old.id);
    await supabase.from('test_results').delete().eq('user_id', old.id);
    await supabase.from('consents').delete().eq('user_id', old.id);
    await supabase.from('suscripciones_retos').delete().eq('user_id', old.id);
    await supabase.from('formacion_progreso').delete().eq('user_id', old.id);
    await supabase.from('formacion_estado').delete().eq('user_id', old.id);
    await supabase.from('profiles').delete().eq('id', old.id);
    await supabase.auth.admin.deleteUser(old.id);
    console.log('Deleted.');
  }

  // 1. Create auth user
  const { data: authData, error: authErr } = await supabase.auth.admin.createUser({
    email: EMAIL,
    password: PASSWORD,
    email_confirm: true,
    user_metadata: { first_name: 'Álvaro', last_name: 'Alabart', birth_year: 1990, sex: 'hombre', country: 'ES', spiritual: true },
  });
  if (authErr) throw new Error(`Auth: ${authErr.message}`);
  const uid = authData.user.id;
  console.log('✓ User created:', uid, EMAIL);

  // 2. Profile (the trigger should create it, but upsert to fill all fields)
  const { error: profErr } = await supabase.from('profiles').upsert({
    id: uid,
    first_name: 'Álvaro',
    last_name: 'Alabart',
    locale: 'es',
    country: 'ES',
    spiritual: true,
    birth_year: 1990,
    sex: 'hombre',
    signup_source: 'test_temperamento',
    consent_at: new Date().toISOString(),
    onboarded_at: new Date().toISOString(),
  });
  if (profErr) console.error('Profile error:', profErr.message);
  else console.log('✓ Profile inserted');

  // 3. Test results: temperament (COL-MEL)
  const tempResult = {
    scores: { COL: 14, MEL: 11, SAN: 6, FLE: 3 },
    primary: 'COL', secondary: 'MEL', profile: 'col-mel',
    answers: Array(22).fill(null).map((_, i) => ({ q: i + 1, a: i < 14 ? 'COL' : i < 17 ? 'MEL' : 'SAN' })),
  };
  const { error: trErr } = await supabase.from('test_results').insert({
    user_id: uid, test_id: 'temperamento-adulto', test_version: '1.0', kind: 'temperament',
    result: tempResult, source: 'self', taken_at: '2026-10-20T10:30:00Z',
  });
  if (trErr) console.error('Temp result error:', trErr.message);
  else console.log('✓ Temperament result (COL-MEL)');

  // 4. Test results: character
  const charResult = {
    virtues: {
      prudencia:    { global: 0.72, passive: 0.65, active: 0.78 },
      fortaleza:    { global: 0.85, passive: 0.80, active: 0.90 },
      dominio:      { global: 0.58, passive: 0.50, active: 0.65 },
      justicia:     { global: 0.68, passive: 0.70, active: 0.66 },
      magnanimidad: { global: 0.45, passive: 0.40, active: 0.50 },
      humildad:     { global: 0.62, passive: 0.55, active: 0.68 },
    },
    answers: Array(68).fill(null).map((_, i) => ({ q: i + 1, a: [1, 0.5, 0, -0.5, -1][i % 5] })),
  };
  const { error: chErr } = await supabase.from('test_results').insert({
    user_id: uid, test_id: 'test-caracter', test_version: '1.0', kind: 'character',
    result: charResult, source: 'self', taken_at: '2026-10-25T14:00:00Z',
  });
  if (chErr) console.error('Char result error:', chErr.message);
  else console.log('✓ Character result (6 virtues)');

  // 5. Consents
  const consents = [
    { user_id: uid, purpose: 'cuenta', granted: true, text_version: '1', locale: 'es', source: 'web' },
    { user_id: uid, purpose: 'newsletter', granted: true, text_version: '1', locale: 'es', source: 'web' },
  ];
  const { error: conErr } = await supabase.from('consents').insert(consents);
  if (conErr) console.error('Consents error:', conErr.message);
  else console.log('✓ Consents (cuenta + newsletter)');

  // 6. Suscripción retos (activa)
  const { error: susErr } = await supabase.from('suscripciones_retos').insert({
    user_id: uid, activa: true, nota: 'Cuenta test D1',
  });
  if (susErr) console.error('Suscripcion error:', susErr.message);
  else console.log('✓ Suscripción retos activa');

  // 7. Perfil camino (onboarding completo, inicio hace 8 días)
  const inicio = new Date();
  inicio.setDate(inicio.getDate() - 7);
  const inicioStr = inicio.toISOString().slice(0, 10);
  const { error: pcErr } = await supabase.from('perfil_camino').insert({
    user_id: uid,
    momentos: ['manana', 'noche'],
    estado_vida: 'trabajo',
    objetivo: 'Ser mejor líder en mi equipo',
    vida_interior: 'si',
    ritmo: [false, true, true, true, true, true, false],
    hora_manana: '07:30',
    hora_examen: '22:00',
    formato_examen: 'breve',
    ciclo_semanas: 4,
    notificaciones: true,
    inicio: inicioStr,
  });
  if (pcErr) console.error('Perfil camino error:', pcErr.message);
  else console.log('✓ Perfil camino (inicio:', inicioStr, ')');

  // 8. Actividad diaria (7 días con sesiones + 4 exámenes)
  const dias = [];
  for (let d = 1; d <= 7; d++) {
    const fecha = new Date(inicio);
    fecha.setDate(fecha.getDate() + d - 1);
    const fechaStr = fecha.toISOString().slice(0, 10);
    const row = {
      user_id: uid,
      fecha: fechaStr,
      sesion_en: new Date(fecha.getTime() + 8 * 3600000).toISOString(),
      juego: d <= 3 ? { tipo: 'virtud_del_dia', virtud: 'fortaleza' } : d <= 5 ? { tipo: 'persona_del_dia' } : null,
      con_quien: d % 2 === 0 ? 'persona:mi-jefe' : d === 3 ? 'solo' : null,
    };
    if (d <= 4) {
      row.examen_en = new Date(fecha.getTime() + 22 * 3600000).toISOString();
      row.examen = {
        puntuacion: [3, 4, 2, 5][d - 1],
        reflexion: ['Bien, mantuve la calma en la reunión', 'Hoy costó más, me dejé llevar por la ira', 'Regular, perdí la paciencia con el tráfico', 'Gran día, practiqué la escucha activa'][d - 1],
      };
    }
    dias.push(row);
  }
  const { error: adErr } = await supabase.from('actividad_diaria').insert(dias);
  if (adErr) console.error('Actividad diaria error:', adErr.message);
  else console.log('✓ Actividad diaria (7 días, 4 exámenes)');

  // 9. Personas (3 personas con estimaciones)
  const personasData = [
    { nombre: 'María', grupo: 'familia', relacion: 'esposa', avatar: '👩', estrella: true, me_cuesta: false, estado: 'estimado', primario: 'SAN', secundario: 'COL', confianza: 'alta' },
    { nombre: 'Carlos', grupo: 'trabajo', relacion: 'jefe', avatar: '👨‍💼', estrella: false, me_cuesta: true, estado: 'estimado', primario: 'COL', secundario: 'MEL', confianza: 'media' },
    { nombre: 'Lucía', grupo: 'amigos', relacion: 'amiga', avatar: '👩‍🦰', estrella: true, me_cuesta: false, estado: 'sin_estimar', primario: null, secundario: null, confianza: null },
  ];
  for (const p of personasData) {
    const { data: persona, error: pErr } = await supabase.from('personas').insert({
      user_id: uid, ...p,
      puntos: p.primario ? { COL: p.primario === 'COL' ? 12 : 5, MEL: p.secundario === 'MEL' ? 10 : 3, SAN: p.primario === 'SAN' ? 13 : 4, FLE: 2 } : null,
    }).select().single();
    if (pErr) { console.error('Persona error:', pErr.message); continue; }
    console.log(`✓ Persona: ${p.nombre} (${persona.id})`);

    if (p.estado === 'estimado') {
      const { error: eErr } = await supabase.from('persona_estimaciones').insert({
        persona_id: persona.id, user_id: uid,
        respuestas: Array(22).fill(null).map((_, i) => ({ q: i + 1, a: i < 12 ? p.primario : p.secundario || 'FLE' })),
        desempate: null,
        puntos: { COL: p.primario === 'COL' ? 12 : 5, MEL: p.secundario === 'MEL' ? 10 : 3, SAN: p.primario === 'SAN' ? 13 : 4, FLE: 2 },
        primario: p.primario, secundario: p.secundario, confianza: p.confianza,
      });
      if (eErr) console.error('  Estimacion error:', eErr.message);
      else console.log(`  ✓ Estimación de ${p.nombre}`);
    }
  }

  // 10. Observaciones de personas (2)
  const { data: personasList } = await supabase.from('personas').select('id, nombre').eq('user_id', uid);
  const maria = personasList?.find(p => p.nombre === 'María');
  const carlos = personasList?.find(p => p.nombre === 'Carlos');
  if (maria) {
    await supabase.from('persona_observaciones').insert({
      persona_id: maria.id, user_id: uid, situacion: 'buena_noticia',
      palabra: 'alegría', temperamento: 'SAN', linea: 'Se puso muy contenta al saber la noticia, abrazó a todo el mundo',
    });
    console.log('✓ Observación de María');
  }
  if (carlos) {
    await supabase.from('persona_observaciones').insert({
      persona_id: carlos.id, user_id: uid, situacion: 'critica',
      palabra: 'control', temperamento: 'COL', linea: 'Ante la crisis del proyecto, tomó el mando y reorganizó al equipo sin dudar',
    });
    console.log('✓ Observación de Carlos');
  }

  // 11. Ejercicios onboarding (línea base)
  const onboardingIds = {
    fallo: '64c9372c-08fc-4fd9-b0e7-656ce4f67a1f',
    me_ven: 'c611caac-6ac0-460a-9ee9-a7acdac8c72d',
    me_gustaria: 'e1db0dde-8e65-4143-964a-26af56d9bcab',
  };
  const ejerciciosData = [
    { ejercicio_id: onboardingIds.fallo, pregunta: 'Cuando algo me sale mal, yo…', respuesta: '"Me frustro pero intento buscar una solución rápida. A veces me enfado conmigo mismo."' },
    { ejercicio_id: onboardingIds.me_ven, pregunta: 'Los que me quieren dicen que soy…', respuesta: '["Trabajador","Exigente","Buen amigo","A veces impaciente"]' },
    { ejercicio_id: onboardingIds.me_gustaria, pregunta: 'Me gustaría que dijeran que soy…', respuesta: '["Paciente","Buen escuchador","Alegre","Generoso"]' },
  ];
  for (const ej of ejerciciosData) {
    const { error: ejErr } = await supabase.from('preguntas_respuestas_ejercicios').insert({
      user_id: uid, ...ej, respuesta: JSON.parse(ej.respuesta),
    });
    if (ejErr) console.error('Ejercicio error:', ejErr.message);
    else console.log(`✓ Ejercicio onboarding: ${ej.pregunta.slice(0, 30)}…`);
  }

  // 12. Formación progreso (3 lecciones vistas)
  const lecciones = ['intro-liderazgo-virtuoso', 'magnanimidad-01', 'humildad-01'];
  for (const l of lecciones) {
    const { error: fpErr } = await supabase.from('formacion_progreso').insert({ user_id: uid, leccion_id: l });
    if (fpErr) console.error('Formacion progreso error:', fpErr.message);
  }
  const { error: feErr } = await supabase.from('formacion_estado').insert({ user_id: uid, ultima: 'magnanimidad-01' });
  if (feErr) console.error('Formacion estado error:', feErr.message);
  else console.log('✓ Formación: 3 lecciones vistas');

  console.log('\n════════════════════════════════════════');
  console.log('✓ CUENTA TEST COMPLETA');
  console.log('  Email:', EMAIL);
  console.log('  Password:', PASSWORD);
  console.log('  User ID:', uid);
  console.log('  Datos: profile, 2 test results, 3 personas,');
  console.log('         perfil_camino, 7 días actividad, 3 ejercicios,');
  console.log('         2 consents, suscripción activa, 3 lecciones formación');
  console.log('════════════════════════════════════════');
}

main().catch(e => { console.error('FATAL:', e.message); process.exit(1); });
