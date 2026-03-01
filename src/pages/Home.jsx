import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../api/client';
import BottomNav from '../components/BottomNav';

export default function Home() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [progress, setProgress] = useState({ total: 0, completed: 0, percentage: 0 });
  const [tasks, setTasks] = useState([]);
  const [limits, setLimits] = useState(null);

  useEffect(() => {
    api.getProgress().then(setProgress).catch(() => {});
    api.getTasks().then(d => setTasks(d.tasks)).catch(() => {});
    api.getDailyLimits().then(setLimits).catch(() => {});
  }, []);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Buenos días' : hour < 18 ? 'Buenas tardes' : 'Buenas noches';

  const nextTask = tasks.find(t => t.status === 'pending' && t.source === 'user');

  return (
    <>
      <div className="page">
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 700 }}>{greeting}, {user?.name?.split(' ')[0]}</h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginTop: 2 }}>
              {new Date().toLocaleDateString('es-PE', { weekday: 'long', day: 'numeric', month: 'long' })}
            </p>
          </div>
          {user?.plan === 'premium' && <span className="badge-premium">⭐ Premium</span>}
        </div>

        {/* Progress card */}
        <div className="card" style={{ marginBottom: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <span style={{ fontWeight: 600 }}>Progreso de hoy</span>
            <span style={{ color: 'var(--text-secondary)', fontSize: 14 }}>
              {progress.completed} de {progress.total} tareas
            </span>
          </div>
          <div style={{ height: 8, background: 'var(--bg-input)', borderRadius: 4, overflow: 'hidden' }}>
            <div style={{
              height: '100%', borderRadius: 4, transition: 'width 0.5s',
              width: `${progress.percentage}%`,
              background: progress.percentage === 100 ? 'var(--success)' : 'var(--primary)',
            }} />
          </div>
          <p style={{ textAlign: 'right', fontSize: 14, color: 'var(--text-secondary)', marginTop: 6 }}>
            {progress.percentage}%
          </p>
        </div>

        {/* Next task */}
        {nextTask && (
          <div className="card" style={{ marginBottom: 16 }}>
            <p style={{ color: 'var(--text-secondary)', fontSize: 13, marginBottom: 8 }}>⏭️ Siguiente tarea</p>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <p style={{ fontWeight: 600, fontSize: 16 }}>{nextTask.title}</p>
                {nextTask.time_start && (
                  <p style={{ color: 'var(--text-muted)', fontSize: 13, marginTop: 2 }}>
                    {nextTask.time_start}{nextTask.time_end ? ` - ${nextTask.time_end}` : ''}
                  </p>
                )}
              </div>
              <button
                className="btn btn-primary"
                style={{ width: 'auto', padding: '8px 16px', fontSize: 14 }}
                onClick={async () => {
                  await api.updateTask(nextTask.id, { status: 'completed' });
                  setTasks(prev => prev.map(t => t.id === nextTask.id ? { ...t, status: 'completed' } : t));
                  setProgress(prev => ({
                    ...prev,
                    completed: prev.completed + 1,
                    percentage: Math.round(((prev.completed + 1) / prev.total) * 100),
                  }));
                }}
              >
                Completar ✓
              </button>
            </div>
          </div>
        )}

        {/* Quick actions */}
        <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
          <button className="btn btn-secondary" style={{ flex: 1 }} onClick={() => navigate('/chat')}>
            💬 Hablar con Synapse
          </button>
          <button className="btn btn-secondary" style={{ flex: 1 }} onClick={() => navigate('/plan')}>
            📋 Ver plan del día
          </button>
        </div>

        {/* Limits indicator (Free only) */}
        {user?.plan === 'free' && limits && (
          <div className="card" style={{ background: 'rgba(99,102,241,0.08)' }}>
            <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 8 }}>Tu uso de hoy (Free)</p>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14 }}>
              <span>💬 {limits.usage.messages_count}/15 mensajes</span>
              <span>📋 {limits.usage.tasks_count}/5 tareas</span>
            </div>
            <button
              className="btn btn-premium"
              style={{ marginTop: 12, fontSize: 14, padding: '10px 16px' }}
              onClick={() => navigate('/plans')}
            >
              ⭐ Desbloquear sin límites
            </button>
          </div>
        )}
      </div>
      <BottomNav />
    </>
  );
}
