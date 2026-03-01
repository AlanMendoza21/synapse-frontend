import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import Onboarding from './pages/Onboarding';
import Home from './pages/Home';
import Plan from './pages/Plan';
import Chat from './pages/Chat';
import Profile from './pages/Profile';
import Plans from './pages/Plans';

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="page-no-nav" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100dvh' }}><p style={{ color: 'var(--text-secondary)' }}>Cargando...</p></div>;
  if (!user) return <Navigate to="/landing" replace />;
  if (!user.onboarding_completed) return <Navigate to="/onboarding" replace />;
  return children;
}

function AuthRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (user && user.onboarding_completed) return <Navigate to="/home" replace />;
  if (user && !user.onboarding_completed) return <Navigate to="/onboarding" replace />;
  return children;
}

export default function App() {
  return (
    <Routes>
      <Route path="/landing" element={<AuthRoute><Landing /></AuthRoute>} />
      <Route path="/login" element={<AuthRoute><Login /></AuthRoute>} />
      <Route path="/register" element={<AuthRoute><Register /></AuthRoute>} />
      <Route path="/onboarding" element={<Onboarding />} />
      <Route path="/home" element={<ProtectedRoute><Home /></ProtectedRoute>} />
      <Route path="/plan" element={<ProtectedRoute><Plan /></ProtectedRoute>} />
      <Route path="/chat" element={<ProtectedRoute><Chat /></ProtectedRoute>} />
      <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
      <Route path="/plans" element={<ProtectedRoute><Plans /></ProtectedRoute>} />
      <Route path="*" element={<Navigate to="/landing" replace />} />
    </Routes>
  );
}
