import { useLocation, useNavigate } from 'react-router-dom';

const tabs = [
  { path: '/home', icon: '🏠', label: 'Inicio' },
  { path: '/plan', icon: '📋', label: 'Plan' },
  { path: '/chat', icon: '💬', label: 'Chat' },
  { path: '/profile', icon: '👤', label: 'Perfil' },
];

export default function BottomNav() {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <nav className="bottom-nav" style={{
      position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)',
      width: '100%', maxWidth: 430,
      height: 'var(--nav-height)',
      background: 'var(--bg-card)',
      borderTop: '1px solid var(--border)',
      display: 'flex', alignItems: 'center', justifyContent: 'space-around',
      zIndex: 100,
    }}>
      {tabs.map(tab => {
        const active = location.pathname === tab.path;
        return (
          <button
            key={tab.path}
            onClick={() => navigate(tab.path)}
            style={{
              background: 'none', border: 'none',
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2,
              padding: '8px 16px',
              color: active ? 'var(--primary-light)' : 'var(--text-muted)',
              fontSize: 11, fontWeight: active ? 600 : 400,
            }}
          >
            <span style={{ fontSize: 22 }}>{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
