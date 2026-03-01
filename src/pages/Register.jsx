import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await register(name, email, password);
      navigate('/onboarding');
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

      <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 8 }}>Crear cuenta</h1>
      <p style={{ color: 'var(--text-secondary)', marginBottom: 32 }}>Empieza a organizar tu día con IA</p>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div>
          <label className="label">Nombre</label>
          <input
            className="input" type="text" value={name}
            onChange={e => setName(e.target.value)}
            placeholder="Tu nombre" required autoComplete="name"
          />
        </div>
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
            placeholder="Mínimo 6 caracteres" required minLength={6}
            autoComplete="new-password"
          />
        </div>

        {error && <p style={{ color: 'var(--danger)', fontSize: 14 }}>{error}</p>}

        <button className="btn btn-primary" type="submit" disabled={loading}>
          {loading ? 'Creando cuenta...' : 'Crear cuenta gratis'}
        </button>
      </form>

      <p style={{ textAlign: 'center', marginTop: 24, color: 'var(--text-secondary)', fontSize: 14 }}>
        ¿Ya tienes cuenta? <a href="/login" onClick={e => { e.preventDefault(); navigate('/login'); }}>Inicia sesión</a>
      </p>
    </div>
  );
}
