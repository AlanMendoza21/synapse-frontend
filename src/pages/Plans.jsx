import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../api/client';

export default function Plans() {
  const { user, refreshUser } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [billing, setBilling] = useState('monthly');

  const handleUpgrade = async () => {
    setLoading(true);
    try {
      await api.upgrade();
      await refreshUser();
      navigate('/home');
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDowngrade = async () => {
    if (!confirm('¿Seguro que quieres volver al plan Free? Perderás acceso a Calendar, resumen del día y chat ilimitado.')) return;
    setLoading(true);
    try {
      await api.downgrade();
      await refreshUser();
      navigate('/home');
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-no-nav" style={{ padding: 20, minHeight: '100dvh' }}>
      <button onClick={() => navigate(-1)} style={{
        background: 'none', border: 'none', color: 'var(--text-secondary)',
        fontSize: 14, marginBottom: 24, padding: 0,
      }}>← Volver</button>

      <h1 style={{ fontSize: 26, fontWeight: 700, textAlign: 'center', marginBottom: 8 }}>
        Elige tu plan
      </h1>
      <p style={{ textAlign: 'center', color: 'var(--text-secondary)', marginBottom: 24 }}>
        Desbloquea todo el potencial de Synapse
      </p>

      {/* Billing toggle */}
      <div style={{
        display: 'flex', background: 'var(--bg-card)', borderRadius: 12, padding: 4,
        marginBottom: 24,
      }}>
        <button
          onClick={() => setBilling('monthly')}
          style={{
            flex: 1, padding: '10px 16px', borderRadius: 10, border: 'none',
            background: billing === 'monthly' ? 'var(--primary)' : 'transparent',
            color: 'var(--text)', fontWeight: 600, fontSize: 14,
          }}
        >Mensual</button>
        <button
          onClick={() => setBilling('yearly')}
          style={{
            flex: 1, padding: '10px 16px', borderRadius: 10, border: 'none',
            background: billing === 'yearly' ? 'var(--primary)' : 'transparent',
            color: 'var(--text)', fontWeight: 600, fontSize: 14,
          }}
        >Anual (-30%)</button>
      </div>

      {/* Free plan */}
      <div className="card" style={{ marginBottom: 14, borderColor: user?.plan === 'free' ? 'var(--primary)' : 'var(--border)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <h3 style={{ fontSize: 18, fontWeight: 700 }}>Free</h3>
          <span style={{ fontSize: 22, fontWeight: 700 }}>$0<span style={{ fontSize: 14, color: 'var(--text-muted)' }}>/mes</span></span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: 14 }}>
          {['15 mensajes/día', '1 plan del día', 'Hasta 5 tareas', 'Progreso del día'].map(f => (
            <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ color: 'var(--success)' }}>✓</span> {f}
            </div>
          ))}
          {['Google Calendar', 'Resumen de fin de día', 'Historial 30 días', 'Sugerencias proactivas'].map(f => (
            <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text-muted)' }}>
              <span>✗</span> {f}
            </div>
          ))}
        </div>
        {user?.plan === 'free' && (
          <div style={{ marginTop: 14, textAlign: 'center', color: 'var(--text-muted)', fontSize: 13, fontWeight: 600 }}>
            Plan actual
          </div>
        )}
        {user?.plan === 'premium' && (
          <button className="btn btn-outline" style={{ marginTop: 14, fontSize: 14 }} onClick={handleDowngrade} disabled={loading}>
            Cambiar a Free
          </button>
        )}
      </div>

      {/* Premium plan */}
      <div className="card" style={{
        marginBottom: 14,
        borderColor: user?.plan === 'premium' ? 'var(--premium)' : 'var(--border)',
        background: 'linear-gradient(135deg, rgba(245,158,11,0.05), rgba(99,102,241,0.05))',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <h3 style={{ fontSize: 18, fontWeight: 700 }}>⭐ Premium</h3>
          <div style={{ textAlign: 'right' }}>
            <span style={{ fontSize: 22, fontWeight: 700 }}>
              ${billing === 'monthly' ? '5.99' : '4.16'}
              <span style={{ fontSize: 14, color: 'var(--text-muted)' }}>/mes</span>
            </span>
            {billing === 'yearly' && (
              <p style={{ fontSize: 12, color: 'var(--premium)' }}>$49.90/año</p>
            )}
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: 14 }}>
          {[
            'Chat ILIMITADO',
            'Planes ilimitados',
            'Tareas ilimitadas',
            'Progreso del día',
            'Google Calendar',
            'Resumen de fin de día',
            'Historial 30 días',
            'Sugerencias proactivas',
          ].map(f => (
            <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ color: 'var(--success)' }}>✓</span>
              <span style={{ fontWeight: f.includes('ILIMITAD') ? 600 : 400 }}>{f}</span>
            </div>
          ))}
        </div>

        {user?.plan === 'free' && (
          <button className="btn btn-premium" style={{ marginTop: 14 }} onClick={handleUpgrade} disabled={loading}>
            {loading ? 'Procesando...' : 'Empezar Premium'}
          </button>
        )}
        {user?.plan === 'premium' && (
          <div style={{ marginTop: 14, textAlign: 'center', color: 'var(--premium)', fontSize: 13, fontWeight: 600 }}>
            ⭐ Plan actual
          </div>
        )}
      </div>

      <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: 12, marginTop: 16 }}>
        7 días de prueba gratis. Cancela cuando quieras.
      </p>
    </div>
  );
}
