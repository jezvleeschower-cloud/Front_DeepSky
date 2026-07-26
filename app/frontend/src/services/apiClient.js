// Simple API client using fetch. Respects VITE_API_URL if presente.
// If VITE_API_URL is not set during development, fall back to localhost:7001
const BASE = import.meta.env.VITE_API_URL || 'http://localhost:7001';

async function request(path, options = {}) {
  const url = path.startsWith('http') ? path : `${BASE}${path}`;
  // Añadir Authorization si hay token
  const token = localStorage.getItem('ds_token');
  if (token) {
    options.headers = options.headers ? { ...options.headers, Authorization: `Bearer ${token}` } : { Authorization: `Bearer ${token}` };
  }
  console.debug('[apiClient] Request:', options.method || 'GET', url);
  const res = await fetch(url, options);
  const text = await res.text();
  const contentType = res.headers.get('content-type') || '';

  if (!res.ok) {
    let payload = text;
    try { if (contentType.includes('application/json')) payload = JSON.parse(text); } catch(e) {}
    const backendText = payload && (payload.message || payload.error);
    const message = backendText || `HTTP ${res.status}`;
    const err = new Error(message);
    err.status = res.status;
    err.payload = payload;
    throw err;
  }

  if (contentType.includes('application/json')) {
    return JSON.parse(text);
  }
  return text;
}

export const apiClient = {
  get: async (path) => request(path, { method: 'GET' }),
  post: async (path, body) => request(path, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }),
  request: async (path, options) => request(path, options),
};