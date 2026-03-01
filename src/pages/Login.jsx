import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const user = await login(email, password);
      navigate(user.onboarding_completed ? '/home' : '/onboarding');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-no-nav" style={{
      display: 'flex', flexDirection: 'column', justifyContent: 'center',
      minHeight: '100dvh', padding: 24,
    }}>
      <button onClick={() => navigate('/landing')} style={{
        background: 'none', border: 'none', color: 'var(--text-secondary)',
        fontSize: 14, alignSelf: 'flex-start', marginBottom: 32, padding: 0,
      }}>← Volver</button>

      <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 8 }}>Bienvenido de vuelta</h1>
      <p style={{ color: 'var(--text-secondary)', marginBottom: 32 }}>Inicia sesión en tu cuenta</p>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div>
          <label className="label">Email</label>
          <input
            className="input" type="email" value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="tu@email.com" required autoComplete="email"
          />
        </div>
        <div>
          <label className="label">Contraseña</label>
          <input
            className="input" type="password" value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="Tu contraseña" required autoComplete="current-password"
          />
        </div>

        {error && <p style={{ color: 'var(--danger)', fontSize: 14 }}>{error}</p>}

        <button className="btn btn-primary" type="submit" disabled={loading}>
          {loading ? 'Ingresando...' : 'Iniciar sesión'}
        </button>
      </form>

      <p style={{ textAlign: 'center', marginTop: 24, color: 'var(--text-secondary)', fontSize: 14 }}>
        ¿No tienes cuenta? <a href="/register" onClick={e => { e.preventDefault(); navigate('/register'); }}>Regístrate</a>
      </p>
    </div>
  );
}
