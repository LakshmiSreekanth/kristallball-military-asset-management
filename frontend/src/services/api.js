const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api';

function getToken() {
  return localStorage.getItem('token');
}

async function request(endpoint, options = {}) {
  const token = getToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers
  };

  const res = await fetch(`${API_BASE}${endpoint}`, { ...options, headers });
  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data.message || data.error || 'Request failed');
  }
  return data;
}

export const api = {
  login: (username, password) =>
    request('/auth/login', { method: 'POST', body: JSON.stringify({ username, password }) }),

  getProfile: () => request('/auth/profile'),

  getDashboard: (params) => {
    const qs = new URLSearchParams(params).toString();
    return request(`/assets/dashboard?${qs}`);
  },

  getBases: () => request('/assets/bases'),
  getEquipmentTypes: () => request('/assets/equipment-types'),
  getAuditLogs: () => request('/assets/audit-logs'),

  getPurchases: (params) => {
    const qs = params ? '?' + new URLSearchParams(params).toString() : '';
    return request(`/purchases${qs}`);
  },
  createPurchase: (data) =>
    request('/purchases', { method: 'POST', body: JSON.stringify(data) }),

  getTransfers: (params) => {
    const qs = params ? '?' + new URLSearchParams(params).toString() : '';
    return request(`/transfers${qs}`);
  },
  createTransfer: (data) =>
    request('/transfers', { method: 'POST', body: JSON.stringify(data) }),
  getStock: (params) => {
    const qs = params ? '?' + new URLSearchParams(params).toString() : '';
    return request(`/transfers/stock${qs}`);
  },

  getAssignments: (params) => {
    const qs = params ? '?' + new URLSearchParams(params).toString() : '';
    return request(`/operations/assignments${qs}`);
  },
  createAssignment: (data) =>
    request('/operations/assignments', { method: 'POST', body: JSON.stringify(data) }),

  getExpenditures: (params) => {
    const qs = params ? '?' + new URLSearchParams(params).toString() : '';
    return request(`/operations/expenditures${qs}`);
  },
  createExpenditure: (data) =>
    request('/operations/expenditures', { method: 'POST', body: JSON.stringify(data) })
};
