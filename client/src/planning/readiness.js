import { analyzePlanning, sortByPos } from './utils.js';

// Ce qu'il faut pour qu'un temps collectif soit prêt, dans l'ordre où on le fait.
// Chaque point dit où aller pour le compléter.
export function readiness(state) {
  const p = state.planning || {};
  const space = state.space || {};
  const cards = state.cards || [];
  const avantCols = new Set(cards.filter(c => c.phase === 'avant').map(c => c.column_key));
  const polarites = new Set((state.axes || []).filter(a => a.position != null).map(a => a.axis_key));
  const days = sortByPos(state.agendaDays || []);
  const { issues } = analyzePlanning(p, days, state.blocks || []);
  const blocking = issues.filter(i => i.level === 'error').length;
  const success = state.success || {};

  const items = [
    { key: 'cadre', label: 'Le client et la date', done: !!space.client_name && !!(space.session_date || days.some(d => d.date)), view: 'conception' },
    { key: 'avant', label: 'Le cadrage « Avant » avec le sponsor', hint: '3 colonnes sur 4 renseignées', done: avantCols.size >= 3, view: 'phase' },
    { key: 'polarites', label: 'Les 8 polarités positionnées', hint: 'au moins 5', done: polarites.size >= 5, view: 'phase' },
    { key: 'question', label: 'La question-titre', done: !!p.question?.trim(), view: 'conception' },
    { key: 'intention', label: 'L\'intention générale', done: !!p.intention?.trim(), view: 'conception' },
    { key: 'situation', label: 'La situation du collectif', hint: 'carte de la complexité', done: !!p.situation, view: 'conception' },
    { key: 'succes', label: 'Au moins un critère de succès observable', done: (success.criteria || []).some(c => c.statement?.trim()), view: 'succes' },
    { key: 'deroule', label: 'Un déroulé qui tombe juste', hint: 'aucun contrôle bloquant', done: (state.blocks || []).some(b => b.day_id) && blocking === 0, view: 'conception' },
    { key: 'suite', label: 'La suite : au moins une action datée', done: (success.actions || []).some(a => a.what?.trim() && (a.due_date || a.horizon)), view: 'succes' },
  ];
  const done = items.filter(i => i.done).length;
  return { items, done, total: items.length, pct: Math.round((done / items.length) * 100) };
}
