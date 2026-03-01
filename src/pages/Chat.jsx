import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../api/client';
import BottomNav from '../components/BottomNav';

export default function Chat() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  const [sessionTokens, setSessionTokens] = useState({ total: 0, cost: 0 });
  const [limits, setLimits] = useState(null);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    api.getChatHistory().then(d => setMessages(d.messages)).catch(() => {});
    api.getDailyLimits().then(setLimits).catch(() => {});
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const send = async () => {
    const text = input.trim();
    if (!text || sending) return;

    setInput('');
    setSending(true);

    setMessages(prev => [...prev, { role: 'user', message: text, created_at: new Date().toISOString() }]);

    try {
      const data = await api.sendMessage(text);
      setMessages(prev => [...prev, { role: 'assistant', message: data.response, created_at: new Date().toISOString() }]);
      if (data.usage) {
        setSessionTokens(prev => ({
          total: prev.total + data.usage.totalTokens,
          cost: prev.cost + data.usage.costUsd,
        }));
      }
      if (limits) {
        setLimits(prev => ({
          ...prev,
          usage: { ...prev.usage, messages_count: prev.usage.messages_count + 1 },
        }));
      }
    } catch (err) {
      if (err.data?.upgrade) {
        setMessages(prev => [...prev, {
          role: 'system',
          message: `Has alcanzado el límite de mensajes de hoy. Mejora a Premium para chat ilimitado.`,
          created_at: new Date().toISOString(),
        }]);
      } else {
        setMessages(prev => [...prev, {
          role: 'system',
          message: `Error: ${err.message}`,
          created_at: new Date().toISOString(),
        }]);
      }
    } finally {
      setSending(false);
      inputRef.current?.focus();
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  const msgCount = limits?.usage?.messages_count || 0;
  const isLimited = user?.plan === 'free';

  return (
    <>
      <div style={{ display: 'flex', flexDirection: 'column', height: '100dvh', maxWidth: 430, margin: '0 auto' }}>
        {/* Header */}
        <div style={{
          padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          borderBottom: '1px solid var(--border)', background: 'var(--bg-card)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 22 }}>💬</span>
            <span style={{ fontWeight: 700, fontSize: 18 }}>Synapse</span>
            {user?.plan === 'premium' && <span className="badge-premium" style={{ fontSize: 10, padding: '2px 6px' }}>⭐</span>}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            {isLimited && (
              <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>
                {msgCount}/15
              </span>
            )}
            <button onClick={() => setShowInfo(!showInfo)} style={{
              background: 'none', border: 'none', color: 'var(--text-secondary)', fontSize: 18,
            }}>ⓘ</button>
          </div>
        </div>

        {/* Info panel */}
        {showInfo && (
          <div style={{
            padding: 12, background: 'var(--bg-card)', borderBottom: '1px solid var(--border)',
            fontSize: 13, color: 'var(--text-secondary)',
          }}>
            <p>Tokens esta sesión: <strong style={{ color: 'var(--text)' }}>{sessionTokens.total.toLocaleString()}</strong></p>
            <p>Costo estimado: <strong style={{ color: 'var(--text)' }}>${sessionTokens.cost.toFixed(4)}</strong></p>
          </div>
        )}

        {/* Messages */}
        <div style={{ flex: 1, overflow: 'auto', padding: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
          {messages.length === 0 && (
            <div style={{ textAlign: 'center', marginTop: 60, color: 'var(--text-muted)' }}>
              <p style={{ fontSize: 48, marginBottom: 12 }}>🧠</p>
              <p style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-secondary)' }}>¡Hola! Soy Synapse</p>
              <p style={{ fontSize: 14, marginTop: 8, maxWidth: 260, margin: '8px auto 0' }}>
                Cuéntame qué tareas tienes hoy y te ayudo a organizar tu día.
              </p>
            </div>
          )}

          {messages.map((msg, i) => (
            <div key={i} style={{
              display: 'flex',
              justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
            }}>
              <div style={{
                maxWidth: '85%', padding: '10px 14px', borderRadius: 16,
                fontSize: 15, lineHeight: 1.5, whiteSpace: 'pre-wrap',
                ...(msg.role === 'user'
                  ? { background: 'var(--primary)', color: 'white', borderBottomRightRadius: 4 }
                  : msg.role === 'system'
                  ? { background: 'rgba(245,158,11,0.15)', color: 'var(--warning)', borderBottomLeftRadius: 4, fontSize: 13 }
                  : { background: 'var(--bg-card)', color: 'var(--text)', borderBottomLeftRadius: 4 }),
              }}>
                {msg.message}
                {msg.role === 'system' && (
                  <button
                    onClick={() => navigate('/plans')}
                    style={{
                      display: 'block', marginTop: 8, background: 'var(--premium)', color: 'white',
                      border: 'none', borderRadius: 8, padding: '6px 12px', fontSize: 12, fontWeight: 600,
                    }}
                  >⭐ Ver planes</button>
                )}
              </div>
            </div>
          ))}

          {sending && (
            <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
              <div style={{
                background: 'var(--bg-card)', borderRadius: 16, borderBottomLeftRadius: 4,
                padding: '10px 18px', color: 'var(--text-muted)', fontSize: 14,
              }}>
                Pensando...
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div style={{
          padding: '10px 12px', paddingBottom: 'calc(var(--nav-height) + 10px)',
          borderTop: '1px solid var(--border)', background: 'var(--bg)',
          display: 'flex', gap: 8, alignItems: 'flex-end',
        }}>
          <textarea
            ref={inputRef}
            className="input"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Escribe un mensaje..."
            rows={1}
            style={{
              flex: 1, resize: 'none', minHeight: 44, maxHeight: 120,
              paddingTop: 12, paddingBottom: 12,
            }}
          />
          <button
            onClick={send}
            disabled={!input.trim() || sending}
            style={{
              width: 44, height: 44, borderRadius: '50%', border: 'none', flexShrink: 0,
              background: input.trim() ? 'var(--primary)' : 'var(--bg-input)',
              color: 'white', fontSize: 18, display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >➤</button>
        </div>
      </div>
      <BottomNav />
    </>
  );
}
