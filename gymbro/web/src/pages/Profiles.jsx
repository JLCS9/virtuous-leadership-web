import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api.js';

export default function Profiles() {
  const [users, setUsers] = useState(null);
  const [err, setErr] = useState(null);

  useEffect(() => {
    api.listUsers()
      .then((d) => setUsers(d.users))
      .catch((e) => setErr(e.message));
  }, []);

  if (err) return <div className="card error">Error: {err}</div>;
  if (!users) return <div className="card">Cargando…</div>;

  if (users.length === 0) {
    return (
      <div className="card">
        <h2>Sin perfiles aún</h2>
        <p className="muted">
          Cuando alguien escriba al número del bot y complete el onboarding, aparecerá aquí.
        </p>
      </div>
    );
  }

  return (
    <div className="card">
      <h2>Perfiles ({users.length})</h2>
      <table>
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Tlf</th>
            <th>Edad</th>
            <th>Sexo</th>
            <th>Peso</th>
            <th>Objetivo</th>
            <th>Mensajes</th>
            <th>Último</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {users.map((u) => (
            <tr key={u.id}>
              <td>{u.name || <span className="muted">(sin nombre)</span>}</td>
              <td>{u.phone}</td>
              <td>{u.age || '–'}</td>
              <td>{u.sex || '–'}</td>
              <td>{u.weight_kg ? `${u.weight_kg} kg` : '–'}</td>
              <td>{u.goal || '–'}</td>
              <td>{u.message_count}</td>
              <td className="muted">{formatDate(u.last_message_at)}</td>
              <td><Link to={`/perfiles/${u.id}`}>Ver</Link></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function formatDate(iso) {
  if (!iso) return '–';
  const d = new Date(iso.replace(' ', 'T') + 'Z');
  return d.toLocaleString('es-ES', { dateStyle: 'short', timeStyle: 'short' });
}
