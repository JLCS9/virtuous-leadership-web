#!/usr/bin/env node
// Rellena una cuenta de PRUEBA con personas de «Tu entorno» (con su estimación y observaciones) y un
// resultado del test de carácter, para ver el portal completo sin rellenarlo a mano.
//
// Entra con el email y la contraseña de esa cuenta (nunca con la clave de servicio) y escribe solo en
// ella. Ojo: en local la base de datos es la de PRODUCCIÓN; usa una cuenta de prueba, no la de demo.
// Es idempotente: repetirlo no duplica personas ni el test de carácter.
//
//   DEMO_EMAIL=cuenta@ejemplo.com DEMO_PASSWORD=... node scripts/seed-entorno-demo.mjs
//   node scripts/seed-entorno-demo.mjs --dry      # solo enseña lo que crearía, sin conectar
//
// Lee VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY del entorno o de .env.development.local / .env.local.
import { existsSync, readFileSync } from 'node:fs';
import { createClient } from '@supabase/supabase-js';
import { planDeDatos, sembrar } from './datos-demo-entorno.mjs';

if (process.argv.includes('--dry')) {
  const plan = planDeDatos();
  for (const p of plan.personas) console.log(`${p.nombre.padEnd(8)} ${p.grupo.padEnd(8)} ${p.relacion.padEnd(10)} ${p.primario}-${p.secundario} (${p.confianza})`);
  console.log(`${plan.observaciones.length} observaciones · carácter:`, plan.caracter.self);
  process.exit(0);
}

function entornoLocal() {
  const env = { ...process.env };
  for (const fichero of ['.env.development.local', '.env.local']) {
    if (!existsSync(fichero)) continue;
    for (const linea of readFileSync(fichero, 'utf8').split('\n')) {
      const i = linea.indexOf('=');
      if (i > 0 && !linea.startsWith('#')) env[linea.slice(0, i).trim()] ??= linea.slice(i + 1).trim();
    }
  }
  return env;
}

const { DEMO_EMAIL, DEMO_PASSWORD, VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY } = entornoLocal();
if (!DEMO_EMAIL || !DEMO_PASSWORD) { console.error('Faltan DEMO_EMAIL y DEMO_PASSWORD.'); process.exit(1); }
if (!VITE_SUPABASE_URL || !VITE_SUPABASE_ANON_KEY) { console.error('Faltan VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY (.env.development.local).'); process.exit(1); }

const supabase = createClient(VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY, { auth: { persistSession: false, autoRefreshToken: false } });
const { data, error } = await supabase.auth.signInWithPassword({ email: DEMO_EMAIL, password: DEMO_PASSWORD });
if (error) { console.error('No se pudo entrar:', error.message); process.exit(1); }

try {
  const hecho = await sembrar(supabase, data.user.id);
  console.log(`Creado: ${hecho.personas} personas, ${hecho.observaciones} observaciones, ${hecho.caracter} test de carácter.`);
} catch (e) {
  console.error(e.message);
  process.exitCode = 1;
}
