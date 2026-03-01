const API_BASE = '/api';

async function request(endpoint, options = {}) {
  const { method = 'GET', body, headers: extraHeaders } = options;

  const headers = { ...extraHeaders };
  if (body && !(body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

  const token = localStorage.getItem('token');
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${endpoint}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
    credentials: 'include',
  });

  const data = await res.json();

  if (!res.ok) {
    const error = new Error(data.error || 'Error del servidor');
    error.status = res.status;
    error.data = data;
    throw error;
  }

  return data;
}

export const api = {
  // Auth
  register: (data) => request('/auth/register', { method: 'POST', body: data }),
  login: (data) => request('/auth/login', { method: 'POST', body: data }),
  logout: () => request('/auth/logout', { method: 'POST' }),
  me: () => request('/auth/me'),

  // Profile
  getProfile: () => request('/users/profile'),
  saveProfile: (data) => request('/users/profile', { method: 'POST', body: data }),
  updateName: (name) => request('/users/name', { method: 'PUT', body: { name } }),
  deleteAccount: () => request('/users/account', { method: 'DELETE' }),

  // Usage & Limits
  getUsage: () => request('/users/usage'),
  getDailyLimits: () => request('/users/daily-limits'),

  // Tasks
  getTasks: (date) => request(`/tasks${date ? `?date=${date}` : ''}`),
  createTask: (data) => request('/tasks', { method: 'POST', body: data }),
  updateTask: (id, data) => request(`/tasks/${id}`, { method: 'PATCH', body: data }),
  deleteTask: (id) => request(`/tasks/${id}`, { method: 'DELETE' }),
  getProgress: (date) => request(`/tasks/progress${date ? `?date=${date}` : ''}`),

  // Chat
  sendMessage: (message) => request('/chat', { method: 'POST', body: { message } }),
  getChatHistory: (date) => request(`/chat/history${date ? `?date=${date}` : ''}`),

  // Calendar
  getCalendarEvents: () => request('/calendar/events'),
  disconnectCalendar: () => request('/calendar/disconnect', { method: 'POST' }),

  // Subscription
  getSubscription: () => request('/subscription'),
  upgrade: () => request('/subscription/upgrade', { method: 'POST' }),
  downgrade: () => request('/subscription/downgrade', { method: 'POST' }),
};
