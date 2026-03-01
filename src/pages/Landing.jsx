import { useNavigate } from 'react-router-dom';

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div className="page-no-nav" style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      justifyContent: 'center', minHeight: '100dvh', textAlign: 'center', padding: 24,
    }}>
      <div style={{ fontSize: 64, marginBottom: 16 }}>🧠</div>
      <h1 style={{ fontSize: 32, fontWeight: 700, marginBottom: 8 }}>Synapse</h1>
      <p style={{ color: 'var(--text-secondary)', fontSize: 16, marginBottom: 48, maxWidth: 280 }}>
        Tu día en automático. Organiza tus tareas con IA que te conoce.
      </p>

      <div style={{ width: '100%', maxWidth: 320, display: 'flex', flexDirection: 'column', gap: 12 }}>
        <button className="btn btn-primary" onClick={() => navigate('/register')}>
          Crear cuenta gratis
        </button>
        <button className="btn btn-secondary" onClick={() => navigate('/login')}>
          Iniciar sesión
        </button>
      </div>

      <p style={{ color: 'var(--text-muted)', fontSize: 12, marginTop: 32 }}>
        Synapse MVP — START Lima 2026
      </p>
    </div>
  );
}
