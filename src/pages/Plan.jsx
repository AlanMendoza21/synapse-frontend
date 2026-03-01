import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../api/client';
import BottomNav from '../components/BottomNav';

export default function Plan() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [tasks, setTasks] = useState([]);
  const [showAdd, setShowAdd] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newStart, setNewStart] = useState('');
  const [newEnd, setNewEnd] = useState('');
  const [loading, setLoading] = useState(true);

  const loadTasks = async () => {
    try {
      const data = await api.getTasks();
      setTasks(data.tasks);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadTasks(); }, []);

  const toggleTask = async (task) => {
    const newStatus = task.status === 'completed' ? 'pending' : 'completed';
    await api.updateTask(task.id, { status: newStatus });
    setTasks(prev => prev.map(t => t.id === task.id ? { ...t, status: newStatus } : t));
  };

  const addTask = async () => {
    if (!newTitle.trim()) return;
    try {
      const { task } = await api.createTask({
        title: newTitle.trim(),
        time_start: newStart || null,
        time_end: newEnd || null,
      });
      setTasks(prev => [...prev, task].sort((a, b) => (a.time_start || 'z').localeCompare(b.time_start || 'z')));
      setNewTitle(''); setNewStart(''); setNewEnd('');
      setShowAdd(false);
    } catch (err) {
      if (err.data?.upgrade) navigate('/plans');
      else alert(err.message);
    }
  };

  const deleteTask = async (id) => {
    await api.deleteTask(id);
    setTasks(prev => prev.filter(t => t.id !== id));
  };

  return (
    <>
      <div className="page">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h1 style={{ fontSize: 22, fontWeight: 700 }}>Tu plan para hoy</h1>
          <button
            style={{ background: 'none', border: 'none', fontSize: 22, color: 'var(--primary-light)' }}
            onClick={() => navigate('/chat')}
            title="Reorganizar con Synapse"
          >🔄</button>
        </div>

        {loading && <p style={{ color: 'var(--text-muted)' }}>Cargando...</p>}

        {!loading && tasks.length === 0 && (
          <div className="card" style={{ textAlign: 'center', padding: 32 }}>
            <p style={{ fontSize: 40, marginBottom: 12 }}>📋</p>
            <p style={{ color: 'var(--text-secondary)', marginBottom: 16 }}>
              Aún no tienes tareas para hoy
            </p>
            <button className="btn btn-primary" onClick={() => navigate('/chat')}>
              💬 Pedirle un plan a Synapse
            </button>
          </div>
        )}

        {/* Tasks timeline */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {tasks.map(task => (
            <div
              key={task.id}
              className="card"
              style={{
                display: 'flex', alignItems: 'center', gap: 12,
                opacity: task.status === 'completed' ? 0.6 : 1,
                borderLeft: `3px solid ${task.source === 'calendar' ? 'var(--danger)' : task.status === 'completed' ? 'var(--success)' : 'var(--primary)'}`,
              }}
            >
              {task.source === 'user' ? (
                <button
                  onClick={() => toggleTask(task)}
                  style={{
                    width: 28, height: 28, borderRadius: 8, border: 'none', flexShrink: 0,
                    background: task.status === 'completed' ? 'var(--success)' : 'var(--bg-input)',
                    color: 'white', fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}
                >
                  {task.status === 'completed' ? '✓' : ''}
                </button>
              ) : (
                <span style={{ fontSize: 20, flexShrink: 0 }}>🔴</span>
              )}

              <div style={{ flex: 1 }}>
                <p style={{
                  fontWeight: 600, fontSize: 15,
                  textDecoration: task.status === 'completed' ? 'line-through' : 'none',
                }}>{task.title}</p>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginTop: 2 }}>
                  {task.time_start && (
                    <span style={{ color: 'var(--text-muted)', fontSize: 13 }}>
                      {task.time_start}{task.time_end ? ` - ${task.time_end}` : ''}
                    </span>
                  )}
                  {task.source === 'calendar' && (
                    <span style={{ fontSize: 11, color: 'var(--text-muted)', background: 'var(--bg-input)', padding: '1px 6px', borderRadius: 4 }}>
                      📅 Calendar
                    </span>
                  )}
                </div>
              </div>

              {task.source === 'user' && (
                <button
                  onClick={() => deleteTask(task.id)}
                  style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: 18, padding: 4 }}
                >✕</button>
              )}
            </div>
          ))}
        </div>

        {/* Add task modal */}
        {showAdd && (
          <div className="card" style={{ marginTop: 16 }}>
            <input className="input" placeholder="¿Qué necesitas hacer?" value={newTitle}
              onChange={e => setNewTitle(e.target.value)} style={{ marginBottom: 10 }} autoFocus />
            <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
              <input className="input" type="time" value={newStart}
                onChange={e => setNewStart(e.target.value)} style={{ flex: 1 }} />
              <input className="input" type="time" value={newEnd}
                onChange={e => setNewEnd(e.target.value)} style={{ flex: 1 }} />
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setShowAdd(false)}>Cancelar</button>
              <button className="btn btn-primary" style={{ flex: 1 }} onClick={addTask}>Agregar</button>
            </div>
          </div>
        )}

        {/* FAB */}
        {!showAdd && (
          <button
            onClick={() => setShowAdd(true)}
            style={{
              position: 'fixed', bottom: 'calc(var(--nav-height) + 20px)',
              right: 'calc(50% - 195px)',
              width: 56, height: 56, borderRadius: '50%',
              background: 'var(--primary)', color: 'white', border: 'none',
              fontSize: 28, display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(99,102,241,0.4)',
            }}
          >+</button>
        )}
      </div>
      <BottomNav />
    </>
  );
}
