// Alta de cuenta tras el test de temperamento y guardado del resultado.
import { supabase } from './supabase';

const ACCOUNT_URL = import.meta.env.VITE_ACCOUNT_URL || '/api/account';

export class AccountError extends Error {
  constructor(code) { super(code); this.code = code; }
}

// Crea la cuenta (o detecta que ya existe) e inicia sesión con la contraseña.
// Errores: 'wrong_password' (la cuenta ya existía y la contraseña no coincide),
// 'rate_limited', 'failed'.
export async function createAccountAndSignIn({ email, password, name, birthYear, sex, language }) {
  let res;
  try {
    res = await fetch(ACCOUNT_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, name, birthYear, sex, language, consent: true }),
    });
  } catch {
    throw new AccountError('failed');
  }
  if (res.status === 429) throw new AccountError('rate_limited');
  if (res.status !== 201 && res.status !== 409) throw new AccountError('failed');

  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw new AccountError(res.status === 409 ? 'wrong_password' : 'failed');
  return { existed: res.status === 409 };
}

export async function signIn(email, password) {
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw new AccountError(error.status === 400 ? 'invalid' : 'failed');
}

export async function sendPasswordReset(email, redirectTo) {
  const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo });
  if (error) throw new AccountError('failed');
}

// Guarda el resultado en test_results (RLS: cada usuario solo ve los suyos).
export async function saveTemperamentResult(result) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new AccountError('failed');
  const { error } = await supabase.from('test_results').insert({
    user_id: user.id,
    test_id: 'vl-temperamento',
    test_version: 'tbp-v1',
    kind: 'temperament',
    result,
  });
  if (error) throw new AccountError('failed');
}

export async function fetchLatestTemperament() {
  const { data, error } = await supabase
    .from('test_results')
    .select('result, taken_at')
    .eq('kind', 'temperament')
    .order('taken_at', { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) throw new AccountError('failed');
  return data;
}

export async function fetchFirstName(user) {
  const { data } = await supabase.from('profiles').select('first_name').eq('id', user.id).maybeSingle();
  return data?.first_name || user.user_metadata?.first_name || '';
}
