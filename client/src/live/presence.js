import socket from '../socket.js';

// Où je suis, ce que je regarde, ce que j'écris : partagé avec la salle.
let current = { view: 'phase', target: null, field: null };
let timer = null;

export function updatePresence(partial) {
  const next = { ...current, ...partial };
  if (next.view === current.view && next.target === current.target && next.field === current.field) return;
  current = next;
  clearTimeout(timer);
  timer = setTimeout(() => socket.emit('presence', current), 60);
}

export function resendPresence() {
  socket.emit('presence', current);
}

// Aides pour les champs : focus = « j'écris ici », blur = « je n'écris plus »
export function typingProps(target, field) {
  return {
    onFocusCapture: () => updatePresence({ target, field }),
    onBlurCapture: () => updatePresence({ field: null }),
  };
}

export const VIEW_LABELS = {
  phase: 'Cadrer', conception: 'Concevoir', agenda: 'Agenda A4', succes: 'Succès', recap: 'Récap', darkboard: 'Atelier',
};
