import { useEffect, useState } from 'react';
import { Routes, Route, Navigate, NavLink, useNavigate } from 'react-router-dom';
import { api } from './api.js';
import Login from './pages/Login.jsx';
import BotControl from './pages/BotControl.jsx';
import Profiles from './pages/Profiles.jsx';
import ProfileDetail from './pages/ProfileDetail.jsx';

export default function App() {
  const [auth, setAuth] = useState({ loading: true, isAuth: false });

  useEffect(() => {
    api.me()
      .then(() => setAuth({ loading: false, isAuth: true }))
      .catch(() => setAuth({ loading: false, isAuth: false }));
  }, []);

  if (auth.loading) {
    return <div className="login-wrapper"><div className="muted">Cargando…</div></div>;
  }

  if (!auth.isAuth) {
    return <Login onLogin={() => setAuth({ loading: false, isAuth: true })} />;
  }

  return <Shell onLogout={() => setAuth({ loading: false, isAuth: false })} />;
}

function Shell({ onLogout }) {
  const navigate = useNavigate();
  const handleLogout = async () => {
    try { await api.logout(); } catch {}
    onLogout();
    navigate('/login');
  };

  return (
    <div className="app-shell">
      <header className="topbar">
        <h1>gymbro<span style={{ color: '#4ade80' }}>.ai</span> · admin</h1>
        <nav>
          <NavLink to="/" end className={({ isActive }) => (isActive ? 'active' : '')}>Bot</NavLink>
          <NavLink to="/perfiles" className={({ isActive }) => (isActive ? 'active' : '')}>Perfiles</NavLink>
        </nav>
        <button onClick={handleLogout}>Salir</button>
      </header>
      <main className="content">
        <Routes>
          <Route path="/" element={<BotControl />} />
          <Route path="/perfiles" element={<Profiles />} />
          <Route path="/perfiles/:id" element={<ProfileDetail />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
}
