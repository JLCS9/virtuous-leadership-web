import { readFileSync } from 'fs';
import { createClient } from '@supabase/supabase-js';
const env = Object.fromEntries(
  readFileSync('.env','utf8').split('\n').filter(l => l && l[0] !== '#')
    .map(l => { const i = l.indexOf('='); return [l.slice(0, i), l.slice(i + 1)]; })
);
const sb = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, { auth: { autoRefreshToken: false, persistSession: false } });
const { error } = await sb.from('suscripciones_retos').update({ activa: true, nota: 'Cuenta test D1' }).eq('user_id', '2fda982d-da5a-489a-84b9-48a517e45c3e');
console.log(error ? 'Error: ' + error.message : '✓ Suscripción activada');
