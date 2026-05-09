import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../api.js';

export default function ProfileDetail() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [err, setErr] = useState(null);

  useEffect(() => {
    api.getUser(id)
      .then(setData)
      .catch((e) => setErr(e.message));
  }, [id]);

  if (err) return <div className="card error">Error: {err}</div>;
  if (!data) return <div className="card">Cargando…</div>;

  const { user, messages, activities } = data;

  const byDate = activities.reduce((acc, a) => {
    (acc[a.date] = acc[a.date] || []).push(a);
    return acc;
  }, {});

  return (
    <>
      <div style={{ marginBottom: '0.75rem' }}>
        <Link to="/perfiles">← Perfiles</Link>
      </div>

      <div className="card">
        <h2 style={{ marginTop: 0 }}>{user.name || user.phone}</h2>
        <div className="row" style={{ flexWrap: 'wrap', gap: '1.5rem' }}>
          <Field label="Teléfono" value={user.phone} />
          <Field label="Edad" value={user.age} />
          <Field label="Sexo" value={user.sex} />
          <Field label="Peso" value={user.weight_kg ? `${user.weight_kg} kg` : null} />
          <Field label="Gimnasio" value={user.gym || 'sin gimnasio'} />
          <Field label="Estado" value={user.state} />
          <Field label="Alta" value={formatDate(user.created_at)} />
        </div>
        {user.goal && (
          <>
            <div className="section-title">Objetivo</div>
            <div>{user.goal}</div>
          </>
        )}
      </div>

      <div className="card">
        <h2>Actividades</h2>
        {activities.length === 0 ? (
          <div className="muted">Sin actividades registradas todavía.</div>
        ) : (
          Object.entries(byDate).map(([date, items]) => (
            <div key={date} style={{ marginBottom: '1rem' }}>
              <div className="section-title">{date}</div>
              {items.map((a) => (
                <div className="activity-row" key={a.id}>
                  <div className="activity-time">{a.scheduled_time || '--:--'}</div>
                  <div style={{ flex: 1 }}>
                    <div>{a.description || a.type}</div>
                    {a.feedback && <div className="muted" style={{ fontSize: '0.8rem' }}>{a.feedback}</div>}
                  </div>
                  <div className={`activity-status ${a.status}`}>{a.status}</div>
                </div>
              ))}
            </div>
          ))
        )}
      </div>

      <div className="card">
        <h2>Conversación reciente</h2>
        {messages.length === 0 ? (
          <div className="muted">Sin mensajes.</div>
        ) : (
          <div className="chat">
            {messages.map((m) => (
              <div key={m.id} className={`msg ${m.direction}`}>
                {m.body}
                <span className="ts">{formatDate(m.created_at)}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}

function Field({ label, value }) {
  return (
    <div>
      <div className="muted" style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</div>
      <div>{value ?? '–'}</div>
    </div>
  );
}

function formatDate(iso) {
  if (!iso) return '–';
  const d = new Date(iso.replace(' ', 'T') + 'Z');
  return d.toLocaleString('es-ES', { dateStyle: 'short', timeStyle: 'short' });
}
