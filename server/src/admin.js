// Qui utilise l'outil : une vue réservée à l'exploitant, protégée par ADMIN_TOKEN.
// On ne lit que ce que la base contient déjà : cadrages, pseudos qui les ont rejoints, activité.

import { createHash, timingSafeEqual } from 'crypto';
import { DEMO_ID } from './demo.js';

const digest = (s) => createHash('sha256').update(String(s)).digest();

// Sans ADMIN_TOKEN, la vue n'existe pas (404). Jeton lu dans « Authorization: Bearer … » ou « x-admin-token ».
export function requireAdmin(token) {
  return (req, res, next) => {
    if (!token) return res.status(404).json({ error: 'Introuvable' });
    const given = (req.get('authorization') || '').replace(/^Bearer\s+/i, '') || req.get('x-admin-token') || '';
    if (!given || !timingSafeEqual(digest(given), digest(token))) return res.status(401).json({ error: 'Jeton invalide' });
    next();
  };
}

export function usage(db, now = new Date()) {
  const spaces = db.prepare(`
    SELECT s.id, s.client_name, s.sponsor, s.facilitator, s.session_date, s.created_at, s.updated_at, s.plan, s.archived,
      s.event_type, s.facilitator_ids,
      (SELECT COUNT(*) FROM blocks b WHERE b.space_id = s.id AND b.day_id IS NOT NULL) AS sequences,
      (SELECT COUNT(*) FROM agenda_days d WHERE d.space_id = s.id) AS days,
      (SELECT COUNT(*) FROM cards c WHERE c.space_id = s.id) AS cards,
      (SELECT COUNT(*) FROM success_votes v WHERE v.space_id = s.id) AS votes,
      (SELECT MAX(created_at) FROM activity_log a WHERE a.space_id = s.id) AS last_activity
    FROM spaces s
    WHERE s.deleted = 0 AND s.id != ?
    ORDER BY COALESCE((SELECT MAX(created_at) FROM activity_log a WHERE a.space_id = s.id), s.updated_at) DESC
  `).all(DEMO_ID);

  const people = db.prepare(`
    SELECT space_id, pseudo, MIN(created_at) AS first_seen, MAX(created_at) AS last_seen, COUNT(*) AS visits
    FROM activity_log WHERE action = 'join' AND space_id != ? GROUP BY space_id, pseudo
  `).all(DEMO_ID);
  const bySpace = new Map();
  for (const p of people) {
    if (!bySpace.has(p.space_id)) bySpace.set(p.space_id, []);
    bySpace.get(p.space_id).push({ pseudo: p.pseudo, first_seen: p.first_seen, last_seen: p.last_seen, visits: p.visits });
  }

  const ago = (days) => new Date(now.getTime() - days * 86400000).toISOString().replace('T', ' ').slice(0, 19);
  const rows = spaces.map(s => {
    const members = (bySpace.get(s.id) || []).sort((a, b) => (a.last_seen < b.last_seen ? 1 : -1));
    let facilitators = [];
    try { facilitators = JSON.parse(s.facilitator_ids || '[]'); } catch { /* ancien format */ }
    return {
      id: s.id, client: s.client_name, sponsor: s.sponsor, facilitator: s.facilitator, facilitators,
      event_type: s.event_type || '', session_date: s.session_date || '', created_at: s.created_at,
      last_activity: s.last_activity || s.updated_at, demo: s.plan === 'demo-copy', archived: !!s.archived,
      sequences: s.sequences, days: s.days, cards: s.cards, votes: s.votes,
      participants: members.length, members,
    };
  });

  const real = rows.filter(r => !r.demo);
  const since = (field, days) => real.filter(r => r[field] && r[field] >= ago(days)).length;
  const pseudos = new Set(people.filter(p => !rows.find(r => r.id === p.space_id)?.demo).map(p => p.pseudo.trim().toLowerCase()));
  const byType = {};
  for (const r of real) byType[r.event_type || 'non précisé'] = (byType[r.event_type || 'non précisé'] || 0) + 1;

  // Cadrages créés par semaine, sur 12 semaines
  const weeks = [];
  for (let i = 11; i >= 0; i--) {
    const from = ago((i + 1) * 7), to = ago(i * 7);
    weeks.push({ from: from.slice(0, 10), count: real.filter(r => r.created_at >= from && r.created_at < to).length });
  }

  return {
    generated_at: now.toISOString(),
    totals: {
      cadrages: real.length,
      crees_7j: since('created_at', 7),
      crees_30j: since('created_at', 30),
      actifs_7j: since('last_activity', 7),
      actifs_30j: since('last_activity', 30),
      conçus: real.filter(r => r.sequences > 0).length,
      avec_votes: real.filter(r => r.votes > 0).length,
      personnes: pseudos.size,
      demos: rows.length - real.length,
    },
    by_type: byType,
    weeks,
    spaces: rows,
  };
}
