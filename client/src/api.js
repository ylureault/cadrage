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
  createSpace: (body = {}) => request('/api/spaces', { method: 'POST', body }),
  listTemplates: () => request('/api/templates'),
  getSpace: (id) => request(`/api/spaces/${id}`),
  updateSpace: (id, data) => request(`/api/spaces/${id}`, { method: 'PATCH', body: data }),
  deleteSpace: (id) => request(`/api/spaces/${id}`, { method: 'DELETE' }),
  restoreSpace: (id) => request(`/api/spaces/${id}/restore`, { method: 'POST' }),
  duplicateSpace: (id, asTemplate) => request(`/api/spaces/${id}/duplicate`, { method: 'POST', body: { asTemplate } }),
  createSnapshot: (id, name) => request(`/api/spaces/${id}/snapshots`, { method: 'POST', body: { name } }),
  getSnapshots: (id) => request(`/api/spaces/${id}/snapshots`),
  getSnapshot: (id) => request(`/api/snapshots/${id}`),
  getActivity: (id) => request(`/api/spaces/${id}/activity`),

  // Spaces list
  listSpaces: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return request(`/api/spaces${qs ? `?${qs}` : ''}`);
  },

  // Cards CRUD
  listCards: (spaceId, params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return request(`/api/spaces/${spaceId}/cards${qs ? `?${qs}` : ''}`);
  },
  getCard: (cardId) => request(`/api/cards/${cardId}`),
  createCard: (spaceId, data) => request(`/api/spaces/${spaceId}/cards`, { method: 'POST', body: data }),
  updateCard: (cardId, data) => request(`/api/cards/${cardId}`, { method: 'PUT', body: data }),

  // Comments
  listComments: (cardId) => request(`/api/cards/${cardId}/comments`),
  createComment: (cardId, data) => request(`/api/cards/${cardId}/comments`, { method: 'POST', body: data }),

  // Axes
  getAxes: (spaceId) => request(`/api/spaces/${spaceId}/axes`),
  setAxisPosition: (spaceId, axisKey, data) => request(`/api/spaces/${spaceId}/axes/${axisKey}`, { method: 'PUT', body: data }),
  setAxisFinal: (spaceId, axisKey, data) => request(`/api/spaces/${spaceId}/axes-final/${axisKey}`, { method: 'PUT', body: data }),

  // Votes
  getVotes: (spaceId) => request(`/api/spaces/${spaceId}/votes`),
  castVote: (spaceId, data) => request(`/api/spaces/${spaceId}/votes`, { method: 'POST', body: data }),

  // Phase states
  getPhaseStates: (spaceId) => request(`/api/spaces/${spaceId}/phase-states`),
  updatePhaseState: (spaceId, phase, data) => request(`/api/spaces/${spaceId}/phase-states/${phase}`, { method: 'PUT', body: data }),

  // DarkBoard integration
  launchBoard: (id, options = {}) => request(`/api/spaces/${id}/launch-board`, { method: 'POST', body: options }),
  getBoardEmbed: (id, options = {}) => {
    const params = new URLSearchParams(options).toString();
    return request(`/api/spaces/${id}/board-embed${params ? `?${params}` : ''}`);
  },
  getBoardStatus: (id) => request(`/api/spaces/${id}/board-status`),
};
