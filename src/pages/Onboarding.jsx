import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../api/client';

const STEPS = [
  {
    key: 'occupation',
    question: '¿A qué te dedicas actualmente?',
    type: 'select',
    options: [
      { value: 'study', label: '📚 Estudio', desc: 'Estudiante a tiempo completo' },
      { value: 'work', label: '💼 Trabajo', desc: 'Trabajador a tiempo completo' },
      { value: 'both', label: '📚💼 Ambos', desc: 'Estudio y trabajo a la vez' },
    ],
  },
  {
    key: 'peak_energy',
    question: '¿En qué momento del día sientes más energía?',
    type: 'select',
    options: [
      { value: 'morning', label: '🌅 Mañana', desc: '6am - 12pm' },
      { value: 'afternoon', label: '☀️ Tarde', desc: '12pm - 6pm' },
      { value: 'night', label: '🌙 Noche', desc: '6pm - 12am' },
    ],
  },
  {
    key: 'challenges',
    question: '¿Qué es lo que más te cuesta al organizar tu día?',
    subtitle: 'Puedes elegir varias',
    type: 'multi',
    options: [
      { value: 'prioritize', label: 'Decidir por dónde empezar' },
      { value: 'estimate', label: 'Estimar cuánto me toma cada cosa' },
      { value: 'focus', label: 'Mantener el foco sin distraerme' },
      { value: 'adapt', label: 'Reorganizar cuando algo cambia' },
    ],
  },
  {
    key: 'fixed_schedules',
    question: '¿Cuáles son tus horarios fijos esta semana?',
    subtitle: 'Clases, trabajo, compromisos recurrentes',
    type: 'text',
    placeholder: 'Ej: Trabajo de 9am a 1pm, clases de 3 a 6pm de lunes a jueves',
  },
];

export default function Onboarding() {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(false);
  const { user, refreshUser } = useAuth();
  const navigate = useNavigate();

  if (!user) { navigate('/landing'); return null; }

  const current = STEPS[step];
  const isLast = step === STEPS.length - 1;
  const canAdvance = current.type === 'text' ? true : !!answers[current.key];

  const handleSelect = (value) => {
    setAnswers(prev => ({ ...prev, [current.key]: value }));
  };

  const handleMultiToggle = (value) => {
    setAnswers(prev => {
      const current = prev.challenges || [];
      const updated = current.includes(value)
        ? current.filter(v => v !== value)
        : [...current, value];
      return { ...prev, challenges: updated };
    });
  };

  const handleNext = async () => {
    if (!isLast) {
      setStep(s => s + 1);
      return;
    }

    setLoading(true);
    try {
      await api.saveProfile({
        occupation: answers.occupation || null,
        peak_energy: answers.peak_energy || null,
        challenges: Array.isArray(answers.challenges) ? answers.challenges.join(',') : answers.challenges || null,
        fixed_schedules: answers.fixed_schedules || null,
      });
      await refreshUser();
      navigate('/home');
    } catch (err) {
      console.error('Onboarding save error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-no-nav" style={{
      display: 'flex', flexDirection: 'column', minHeight: '100dvh', padding: 24,
    }}>
      {/* Progress bar */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 40 }}>
        {STEPS.map((_, i) => (
          <div key={i} style={{
            flex: 1, height: 4, borderRadius: 2,
            background: i <= step ? 'var(--primary)' : 'var(--border)',
            transition: 'background 0.3s',
          }} />
        ))}
      </div>

      <p style={{ color: 'var(--text-muted)', fontSize: 14, marginBottom: 8 }}>
        Paso {step + 1} de {STEPS.length}
      </p>
      <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 8 }}>{current.question}</h2>
      {current.subtitle && (
        <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginBottom: 24 }}>{current.subtitle}</p>
      )}

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 12, marginTop: 16 }}>
        {current.type === 'select' && current.options.map(opt => (
          <button
            key={opt.value}
            onClick={() => handleSelect(opt.value)}
            style={{
              display: 'flex', alignItems: 'center', gap: 12,
              padding: 16, borderRadius: 'var(--radius)',
              background: answers[current.key] === opt.value ? 'var(--primary)' : 'var(--bg-card)',
              border: `1px solid ${answers[current.key] === opt.value ? 'var(--primary)' : 'var(--border)'}`,
              color: 'var(--text)', textAlign: 'left', fontSize: 16,
              transition: 'all 0.2s',
            }}
          >
            <div>
              <div style={{ fontWeight: 600 }}>{opt.label}</div>
              {opt.desc && <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 2 }}>{opt.desc}</div>}
            </div>
          </button>
        ))}

        {current.type === 'multi' && current.options.map(opt => {
          const selected = (answers.challenges || []).includes(opt.value);
          return (
            <button
              key={opt.value}
              onClick={() => handleMultiToggle(opt.value)}
              style={{
                display: 'flex', alignItems: 'center', gap: 12,
                padding: 16, borderRadius: 'var(--radius)',
                background: selected ? 'rgba(99,102,241,0.15)' : 'var(--bg-card)',
                border: `1px solid ${selected ? 'var(--primary)' : 'var(--border)'}`,
                color: 'var(--text)', textAlign: 'left', fontSize: 16,
                transition: 'all 0.2s',
              }}
            >
              <span style={{
                width: 22, height: 22, borderRadius: 4,
                border: `2px solid ${selected ? 'var(--primary)' : 'var(--text-muted)'}`,
                background: selected ? 'var(--primary)' : 'transparent',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 14, color: 'white', flexShrink: 0,
              }}>
                {selected ? '✓' : ''}
              </span>
              {opt.label}
            </button>
          );
        })}

        {current.type === 'text' && (
          <textarea
            className="input"
            value={answers[current.key] || ''}
            onChange={e => setAnswers(prev => ({ ...prev, [current.key]: e.target.value }))}
            placeholder={current.placeholder}
            rows={4}
            style={{ resize: 'none' }}
          />
        )}
      </div>

      <div style={{ display: 'flex', gap: 12, marginTop: 24 }}>
        {step > 0 && (
          <button className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setStep(s => s - 1)}>
            Atrás
          </button>
        )}
        <button
          className="btn btn-primary"
          style={{ flex: 2 }}
          onClick={handleNext}
          disabled={!canAdvance || loading}
        >
          {loading ? 'Guardando...' : isLast ? '¡Empezar!' : 'Siguiente'}
        </button>
      </div>
    </div>
  );
}
