import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../api/client';
import BottomNav from '../components/BottomNav';

const OCCUPATION_LABELS = { study: '📚 Estudio', work: '💼 Trabajo', both: '📚💼 Estudio y trabajo' };
const ENERGY_LABELS = { morning: '🌅 Mañana', afternoon: '☀️ Tarde', night: '🌙 Noche' };

export default function Profile() {
  const { user, logout, refreshUser } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [usage, setUsage] = useState(null);
  const [limits, setLimits] = useState(null);

  useEffect(() => {
    api.getProfile().then(d => setProfile(d.profile)).catch(() => {});
    api.getUsage().then(setUsage).catch(() => {});
    api.getDailyLimits().then(setLimits).catch(() => {});
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate('/landing');
  };

  const handleDelete = async () => {
    if (!confirm('¿Estás seguro? Se borrarán TODOS tus datos permanentemente.')) return;
    await api.deleteAccount();
    localStorage.removeItem('token');
    navigate('/landing');
  };

  const handleConnectCalendar = () => {
    if (user.plan !== 'premium') {
      navigate('/plans');
      return;
    }
    window.location.href = '/auth/google';
  };

  const handleDisconnectCalendar = async () => {
    await api.disconnectCalendar();
    await refreshUser();
  };

  return (
    <>
      <div className="page">
        <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 20 }}>👤 Mi perfil</h1>

        {/* User info */}
        <div className="card" style={{ marginBottom: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <p style={{ fontWeight: 700, fontSize: 18 }}>{user?.name}</p>
              <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>{user?.email}</p>
            </div>
            {user?.plan === 'premium' ? (
              <span className="badge-premium">⭐ Premium</span>
            ) : (
              <span style={{ fontSize: 12, color: 'var(--text-muted)', background: 'var(--bg-input)', padding: '4px 10px', borderRadius: 20 }}>Free</span>
            )}
          </div>
        </div>

        {/* Plan card */}
        {user?.plan === 'free' && (
          <div className="card" style={{ marginBottom: 16, background: 'rgba(245,158,11,0.08)', borderColor: 'rgba(245,158,11,0.2)' }}>
            <p style={{ fontWeight: 600, color: 'var(--premium)', marginBottom: 4 }}>⭐ Mejora a Premium</p>
            <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 12 }}>
              Chat ilimitado, Google Calendar, resumen del día y más.
            </p>
            <button className="btn btn-premium" style={{ fontSize: 14, padding: '10px 16px' }} onClick={() => navigate('/plans')}>
              Ver planes — $5.99/mes
            </button>
          </div>
        )}

        {/* Profile info */}
        <div className="card" style={{ marginBottom: 16 }}>
          <p style={{ fontWeight: 600, marginBottom: 12 }}>Mi información</p>
          {profile ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: 14 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Ocupación</span>
                <span>{OCCUPATION_LABELS[profile.occupation] || '—'}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Hora productiva</span>
                <span>{ENERGY_LABELS[profile.peak_energy] || '—'}</span>
              </div>
              {profile.fixed_schedules && (
                <div>
                  <span style={{ color: 'var(--text-secondary)' }}>Horarios fijos</span>
                  <p style={{ marginTop: 4, fontSize: 13 }}>{profile.fixed_schedules}</p>
                </div>
              )}
            </div>
          ) : (
            <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>Cargando...</p>
          )}
          <button className="btn btn-outline" style={{ marginTop: 12, fontSize: 14, padding: '8px 12px' }} onClick={() => navigate('/onboarding')}>
            Editar información
          </button>
        </div>

        {/* Google Calendar */}
        <div className="card" style={{ marginBottom: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <p style={{ fontWeight: 600 }}>📅 Google Calendar</p>
              <p style={{ fontSize: 13, color: user?.calendar_connected ? 'var(--success)' : 'var(--text-muted)', marginTop: 2 }}>
                {user?.calendar_connected ? 'Conectado ✓' : 'No conectado'}
              </p>
            </div>
            {user?.calendar_connected ? (
              <button className="btn btn-outline" style={{ width: 'auto', padding: '6px 12px', fontSize: 13 }} onClick={handleDisconnectCalendar}>
                Desconectar
              </button>
            ) : (
              <button
                className={user?.plan === 'premium' ? 'btn btn-primary' : 'btn btn-premium'}
                style={{ width: 'auto', padding: '6px 12px', fontSize: 13 }}
                onClick={handleConnectCalendar}
              >
                {user?.plan === 'premium' ? 'Conectar' : '⭐ Premium'}
              </button>
            )}
          </div>
        </div>

        {/* Token usage */}
        <div className="card" style={{ marginBottom: 16 }}>
          <p style={{ fontWeight: 600, marginBottom: 12 }}>🤖 Consumo de IA</p>
          {usage ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 14 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Hoy</span>
                <span>{parseInt(usage.today.total_tokens).toLocaleString()} tokens (${parseFloat(usage.today.cost_usd).toFixed(4)})</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Semana</span>
                <span>{parseInt(usage.week.total_tokens).toLocaleString()} tokens (${parseFloat(usage.week.cost_usd).toFixed(4)})</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Mes</span>
                <span>{parseInt(usage.month.total_tokens).toLocaleString()} tokens (${parseFloat(usage.month.cost_usd).toFixed(4)})</span>
              </div>
            </div>
          ) : (
            <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>Cargando...</p>
          )}
        </div>

        {/* Daily limits */}
        {user?.plan === 'free' && limits && (
          <div className="card" style={{ marginBottom: 16 }}>
            <p style={{ fontWeight: 600, marginBottom: 12 }}>📊 Uso de hoy (Free)</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 14 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Mensajes</span>
                <span>{limits.usage.messages_count}/15</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Tareas</span>
                <span>{limits.usage.tasks_count}/5</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Reorganizaciones</span>
                <span>{limits.usage.reorganizations}/1</span>
              </div>
            </div>
          </div>
        )}

        {/* Account actions */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 8 }}>
          <button className="btn btn-secondary" onClick={handleLogout}>Cerrar sesión</button>
          <button className="btn btn-danger" style={{ fontSize: 14, padding: '10px 16px' }} onClick={handleDelete}>
            Eliminar mi cuenta y datos
          </button>
        </div>
      </div>
      <BottomNav />
    </>
  );
}
