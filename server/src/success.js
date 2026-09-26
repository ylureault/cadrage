// Mesure du succès d'un temps collectif.
// Critères observables (« c'est un succès si et seulement si… »), la suite (qui fait quoi, pour quand),
// l'échelle Avant (1) / Après (10) votée par le groupe, le ROTI (satisfaction) et le regard du facilitateur.

import { clampText } from './planning.js';

export const HORIZONS = ['fin', '72h', '2sem', '1mois', 'j15', 'j90', '3mois', '6mois'];
export const CRITERION_STATUS = ['a_mesurer', 'atteint', 'partiel', 'non_atteint'];
export const ACTION_STATUS = ['a_faire', 'en_cours', 'fait', 'abandonne'];
export const VOTE_KINDS = { avant: [1, 10], apres: [1, 10], roti: [1, 5] };
export const REVIEW_CRITERIA = ['cadre', 'intention', 'questions', 'singe', 'energie', 'parole', 'decision', 'posture', 'mouvement'];

export function createSuccessStore(db, generateId) {
  const q = {
    criteria: db.prepare(`SELECT * FROM success_criteria WHERE space_id = ? ORDER BY position, rowid`),
    actions: db.prepare(`SELECT * FROM success_actions WHERE space_id = ? ORDER BY position, rowid`),
    votes: db.prepare(`SELECT kind, pseudo, value, comment, updated_at FROM success_votes WHERE space_id = ?`),
    review: db.prepare(`SELECT criterion, score, note FROM facilitator_review WHERE space_id = ?`),
    space: db.prepare(`SELECT votes_open, scale_question FROM spaces WHERE id = ?`),
  };

  function state(spaceId) {
    const space = q.space.get(spaceId);
    if (!space) return null;
    let votesOpen = [];
    try { votesOpen = JSON.parse(space.votes_open || '[]'); } catch { votesOpen = []; }
    return {
      criteria: q.criteria.all(spaceId),
      actions: q.actions.all(spaceId),
      votes: q.votes.all(spaceId),
      review: q.review.all(spaceId),
      votesOpen,
      scaleQuestion: space.scale_question || '',
    };
  }

  function cleanCriterion(input = {}) {
    const out = {};
    if (input.statement !== undefined) out.statement = clampText(input.statement, 500);
    if (input.indicator !== undefined) out.indicator = clampText(input.indicator, 500);
    if (input.target !== undefined) out.target = clampText(input.target, 200);
    if (input.result_note !== undefined) out.result_note = clampText(input.result_note, 1000);
    if (input.horizon !== undefined) out.horizon = HORIZONS.includes(input.horizon) ? input.horizon : 'fin';
    if (input.status !== undefined) out.status = CRITERION_STATUS.includes(input.status) ? input.status : 'a_mesurer';
    return out;
  }

  function cleanAction(input = {}) {
    const out = {};
    if (input.what !== undefined) out.what = clampText(input.what, 500);
    if (input.who !== undefined) out.who = clampText(input.who, 200);
    if (input.note !== undefined) out.note = clampText(input.note, 1000);
    if (input.due_date !== undefined) out.due_date = clampText(input.due_date, 20);
    if (input.horizon !== undefined) out.horizon = HORIZONS.includes(input.horizon) ? input.horizon : '72h';
    if (input.status !== undefined) out.status = ACTION_STATUS.includes(input.status) ? input.status : 'a_faire';
    return out;
  }

  function nextPos(table, spaceId) {
    const r = db.prepare(`SELECT MAX(position) AS m FROM ${table} WHERE space_id = ?`).get(spaceId);
    return (r?.m ?? -1) + 1;
  }

  function upsert(table, clean, spaceId, id, author) {
    const keys = Object.keys(clean);
    if (id) {
      if (keys.length === 0) return id;
      const r = db.prepare(`UPDATE ${table} SET ${keys.map(k => `${k} = ?`).join(', ')}, updated_at = datetime('now') WHERE id = ? AND space_id = ?`)
        .run(...keys.map(k => clean[k]), id, spaceId);
      return r.changes ? id : null;
    }
    const newId = generateId();
    db.prepare(`INSERT INTO ${table} (id, space_id, position, created_by${keys.map(k => `, ${k}`).join('')}) VALUES (?, ?, ?, ?${keys.map(() => ', ?').join('')})`)
      .run(newId, spaceId, nextPos(table, spaceId), clampText(author, 50), ...keys.map(k => clean[k]));
    return newId;
  }

  return {
    state,
    saveCriterion: (spaceId, id, input, author) => upsert('success_criteria', cleanCriterion(input), spaceId, id, author),
    deleteCriterion: (spaceId, id) => db.prepare(`DELETE FROM success_criteria WHERE id = ? AND space_id = ?`).run(id, spaceId).changes > 0,
    saveAction: (spaceId, id, input, author) => upsert('success_actions', cleanAction(input), spaceId, id, author),
    deleteAction: (spaceId, id) => db.prepare(`DELETE FROM success_actions WHERE id = ? AND space_id = ?`).run(id, spaceId).changes > 0,

    vote(spaceId, pseudo, kind, value, comment = '') {
      const range = VOTE_KINDS[kind];
      const v = parseInt(value, 10);
      if (!range || !Number.isFinite(v) || v < range[0] || v > range[1]) return false;
      db.prepare(`INSERT INTO success_votes (space_id, kind, pseudo, value, comment, updated_at) VALUES (?, ?, ?, ?, ?, datetime('now'))
        ON CONFLICT(space_id, kind, pseudo) DO UPDATE SET value = excluded.value, comment = excluded.comment, updated_at = datetime('now')`)
        .run(spaceId, kind, clampText(pseudo, 50), v, clampText(comment, 300));
      return true;
    },

    clearVotes(spaceId, kind) {
      if (!VOTE_KINDS[kind]) return false;
      db.prepare(`DELETE FROM success_votes WHERE space_id = ? AND kind = ?`).run(spaceId, kind);
      return true;
    },

    setVotesOpen(spaceId, kinds) {
      const clean = (Array.isArray(kinds) ? kinds : []).filter(k => VOTE_KINDS[k]);
      db.prepare(`UPDATE spaces SET votes_open = ? WHERE id = ?`).run(JSON.stringify([...new Set(clean)]), spaceId);
      return true;
    },

    review(spaceId, criterion, score, note) {
      if (!REVIEW_CRITERIA.includes(criterion)) return false;
      const s = Math.max(0, Math.min(4, parseInt(score, 10) || 0));
      db.prepare(`INSERT INTO facilitator_review (space_id, criterion, score, note) VALUES (?, ?, ?, ?)
        ON CONFLICT(space_id, criterion) DO UPDATE SET score = excluded.score, note = excluded.note`)
        .run(spaceId, criterion, s, clampText(note, 500));
      return true;
    },
  };
}
