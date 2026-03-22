const BASE = import.meta.env.DEV ? 'http://localhost:3001' : '';

async function request(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
    body: options.body ? JSON.stringify(options.body) : undefined,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Erreur réseau' }));
    throw new Error(err.error || 'Erreur');
  }
  return res.json();
}

export const api = {
  getStructure: () => request('/api/canvas-structure'),
  createSpace: () => request('/api/spaces', { method: 'POST' }),
  getSpace: (id) => request(`/api/spaces/${id}`),
  updateSpace: (id, data) => request(`/api/spaces/${id}`, { method: 'PATCH', body: data }),
  deleteSpace: (id) => request(`/api/spaces/${id}`, { method: 'DELETE' }),
  restoreSpace: (id) => request(`/api/spaces/${id}/restore`, { method: 'POST' }),
  duplicateSpace: (id, asTemplate) => request(`/api/spaces/${id}/duplicate`, { method: 'POST', body: { asTemplate } }),
  createSnapshot: (id, name) => request(`/api/spaces/${id}/snapshots`, { method: 'POST', body: { name } }),
  getSnapshots: (id) => request(`/api/spaces/${id}/snapshots`),
  getSnapshot: (id) => request(`/api/snapshots/${id}`),
  getActivity: (id) => request(`/api/spaces/${id}/activity`),
};
