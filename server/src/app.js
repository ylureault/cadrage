import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import { nanoid } from 'nanoid';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { existsSync } from 'fs';
import { PHASES, AXES, PARTICIPANT_COLORS } from './canvas-data.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

export function createApp(db) {
  const app = express();
  const server = createServer(app);
  const io = new Server(server, {
    cors: { origin: '*', methods: ['GET', 'POST'] }
  });

  app.use(cors());
  app.use(express.json());

  // Serve static files in production
  const clientDist = join(__dirname, '..', '..', 'client', 'dist');
  if (existsSync(clientDist)) {
    app.use(express.static(clientDist));
  }

  // ===================== HELPERS =====================

  function generateId() { return nanoid(10); }

  function getParticipantColor(spaceId, pseudo) {
    const existing = db.prepare(
      `SELECT DISTINCT author_color FROM cards WHERE space_id = ? AND author = ? LIMIT 1`
    ).get(spaceId, pseudo);
    if (existing) return existing.author_color;

    const usedColors = db.prepare(
      `SELECT DISTINCT author_color FROM cards WHERE space_id = ?`
    ).all(spaceId).map(r => r.author_color);

    for (const color of PARTICIPANT_COLORS) {
      if (!usedColors.includes(color)) return color;
    }
    return PARTICIPANT_COLORS[Math.floor(Math.random() * PARTICIPANT_COLORS.length)];
  }

  function logActivity(spaceId, pseudo, action, target = '', details = '') {
    db.prepare(
      `INSERT INTO activity_log (space_id, pseudo, action, target, details) VALUES (?, ?, ?, ?, ?)`
    ).run(spaceId, pseudo, action, target, details);
  }

  // ===================== REST API =====================

  app.get('/api/canvas-structure', (req, res) => {
    res.json({ phases: PHASES, axes: AXES });
  });

  app.post('/api/spaces', (req, res) => {
    const id = generateId();
    db.prepare(`INSERT INTO spaces (id) VALUES (?)`).run(id);
    for (const phase of PHASES) {
      db.prepare(`INSERT INTO phase_state (space_id, phase) VALUES (?, ?)`).run(id, phase.key);
    }
    res.json({ id });
  });

  app.get('/api/spaces/:id', (req, res) => {
    const space = db.prepare(`SELECT * FROM spaces WHERE id = ? AND deleted = 0`).get(req.params.id);
    if (!space) return res.status(404).json({ error: 'Espace inexistant' });

    const cards = db.prepare(`SELECT * FROM cards WHERE space_id = ? ORDER BY position, created_at`).all(req.params.id);
    const comments = db.prepare(`SELECT * FROM comments WHERE space_id = ? ORDER BY created_at`).all(req.params.id);
    const axes = db.prepare(`SELECT * FROM axes WHERE space_id = ?`).all(req.params.id);
    const axesFinal = db.prepare(`SELECT * FROM axes_final WHERE space_id = ?`).all(req.params.id);
    const phaseStates = db.prepare(`SELECT * FROM phase_state WHERE space_id = ?`).all(req.params.id);
    const votes = db.prepare(`SELECT * FROM votes WHERE space_id = ?`).all(req.params.id);

    res.json({
      space: { ...space, facilitator_ids: JSON.parse(space.facilitator_ids || '[]') },
      cards: cards.map(c => ({ ...c, tags: JSON.parse(c.tags || '[]'), reactions: JSON.parse(c.reactions || '{}') })),
      comments, axes, axesFinal, phaseStates, votes
    });
  });

  app.patch('/api/spaces/:id', (req, res) => {
    const { client_name, sponsor, facilitator, session_date, welcome_message, archived } = req.body;
    const fields = [];
    const values = [];
    if (client_name !== undefined) { fields.push('client_name = ?'); values.push(client_name); }
    if (sponsor !== undefined) { fields.push('sponsor = ?'); values.push(sponsor); }
    if (facilitator !== undefined) { fields.push('facilitator = ?'); values.push(facilitator); }
    if (session_date !== undefined) { fields.push('session_date = ?'); values.push(session_date); }
    if (welcome_message !== undefined) { fields.push('welcome_message = ?'); values.push(welcome_message); }
    if (archived !== undefined) { fields.push('archived = ?'); values.push(archived ? 1 : 0); }
    if (fields.length === 0) return res.json({ ok: true });

    fields.push("updated_at = datetime('now')");
    values.push(req.params.id);
    db.prepare(`UPDATE spaces SET ${fields.join(', ')} WHERE id = ?`).run(...values);
    res.json({ ok: true });
  });

  app.delete('/api/spaces/:id', (req, res) => {
    db.prepare(`UPDATE spaces SET deleted = 1, deleted_at = datetime('now') WHERE id = ?`).run(req.params.id);
    res.json({ ok: true });
  });

  app.post('/api/spaces/:id/restore', (req, res) => {
    db.prepare(`UPDATE spaces SET deleted = 0, deleted_at = NULL WHERE id = ?`).run(req.params.id);
    res.json({ ok: true });
  });

  app.post('/api/spaces/:id/duplicate', (req, res) => {
    const { asTemplate } = req.body || {};
    const orig = db.prepare(`SELECT * FROM spaces WHERE id = ?`).get(req.params.id);
    if (!orig) return res.status(404).json({ error: 'Espace introuvable' });

    const newId = generateId();
    db.prepare(`INSERT INTO spaces (id, client_name, sponsor, facilitator, session_date, plan) VALUES (?, ?, ?, ?, '', ?)`).run(
      newId, orig.client_name, orig.sponsor, orig.facilitator, orig.plan
    );
    for (const phase of PHASES) {
      db.prepare(`INSERT INTO phase_state (space_id, phase) VALUES (?, ?)`).run(newId, phase.key);
    }
    if (!asTemplate) {
      const cards = db.prepare(`SELECT * FROM cards WHERE space_id = ?`).all(req.params.id);
      for (const card of cards) {
        db.prepare(`INSERT INTO cards (id, space_id, phase, column_key, content, author, author_color, position, tags) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`).run(
          generateId(), newId, card.phase, card.column_key, card.content, card.author, card.author_color, card.position, card.tags
        );
      }
    }
    res.json({ id: newId });
  });

  app.post('/api/spaces/:id/snapshots', (req, res) => {
    const { name } = req.body;
    const cards = db.prepare(`SELECT * FROM cards WHERE space_id = ?`).all(req.params.id);
    const axes = db.prepare(`SELECT * FROM axes WHERE space_id = ?`).all(req.params.id);
    const axesFinal = db.prepare(`SELECT * FROM axes_final WHERE space_id = ?`).all(req.params.id);
    const snapId = generateId();
    db.prepare(`INSERT INTO snapshots (id, space_id, name, data) VALUES (?, ?, ?, ?)`).run(
      snapId, req.params.id, name, JSON.stringify({ cards, axes, axesFinal })
    );
    res.json({ id: snapId });
  });

  app.get('/api/spaces/:id/snapshots', (req, res) => {
    const snaps = db.prepare(`SELECT id, name, created_at FROM snapshots WHERE space_id = ? ORDER BY created_at DESC`).all(req.params.id);
    res.json(snaps);
  });

  app.get('/api/snapshots/:id', (req, res) => {
    const snap = db.prepare(`SELECT * FROM snapshots WHERE id = ?`).get(req.params.id);
    if (!snap) return res.status(404).json({ error: 'Snapshot introuvable' });
    res.json({ ...snap, data: JSON.parse(snap.data) });
  });

  app.get('/api/spaces/:id/activity', (req, res) => {
    const logs = db.prepare(`SELECT * FROM activity_log WHERE space_id = ? ORDER BY created_at DESC LIMIT 50`).all(req.params.id);
    res.json(logs);
  });

  // Catch-all for SPA
  app.get('*', (req, res) => {
    if (req.path.startsWith('/api') || req.path.startsWith('/socket.io')) return res.status(404).end();
    const indexPath = join(clientDist, 'index.html');
    if (existsSync(indexPath)) return res.sendFile(indexPath);
    res.status(404).json({ error: 'Not found' });
  });

  // ===================== SOCKET.IO =====================

  const spaceParticipants = new Map();
  const spaceTimers = new Map();

  io.on('connection', (socket) => {
    let currentSpace = null;
    let currentPseudo = null;
    let currentColor = null;

    socket.on('join-space', ({ spaceId, pseudo }) => {
      const space = db.prepare(`SELECT id, archived FROM spaces WHERE id = ? AND deleted = 0`).get(spaceId);
      if (!space) { socket.emit('error', { message: 'Espace inexistant' }); return; }

      currentSpace = spaceId;
      currentPseudo = pseudo;
      currentColor = getParticipantColor(spaceId, pseudo);
      socket.join(spaceId);

      if (!spaceParticipants.has(spaceId)) spaceParticipants.set(spaceId, new Map());
      const participants = spaceParticipants.get(spaceId);

      const uniquePseudos = new Set([...participants.values()].map(p => p.pseudo));
      const spaceData = db.prepare(`SELECT plan FROM spaces WHERE id = ?`).get(spaceId);
      const limit = spaceData?.plan === 'pro' ? 15 : 5;
      if (!uniquePseudos.has(pseudo) && uniquePseudos.size >= limit) {
        socket.emit('error', { message: `Cet espace a atteint sa capacité maximale (${limit} participants)` });
        return;
      }

      participants.set(socket.id, { pseudo, color: currentColor });
      logActivity(spaceId, pseudo, 'join', '', '');

      socket.emit('joined', { pseudo, color: currentColor, archived: space.archived });
      io.to(spaceId).emit('participants', getParticipantsList(spaceId));
      socket.to(spaceId).emit('notification', { message: `${pseudo} a rejoint le cadrage` });

      const timer = spaceTimers.get(spaceId);
      if (timer) socket.emit('timer-update', { remaining: timer.remaining, duration: timer.duration });
    });

    socket.on('update-header', (data) => {
      if (!currentSpace) return;
      const space = db.prepare(`SELECT archived FROM spaces WHERE id = ?`).get(currentSpace);
      if (space?.archived) return;
      const { field, value } = data;
      const allowed = ['client_name', 'sponsor', 'facilitator', 'session_date'];
      if (!allowed.includes(field)) return;
      db.prepare(`UPDATE spaces SET ${field} = ?, updated_at = datetime('now') WHERE id = ?`).run(value, currentSpace);
      socket.to(currentSpace).emit('header-updated', { field, value, by: currentPseudo });
    });

    socket.on('create-card', ({ phase, columnKey, content }) => {
      if (!currentSpace || !content?.trim()) return;
      const space = db.prepare(`SELECT archived FROM spaces WHERE id = ?`).get(currentSpace);
      if (space?.archived) return;

      const phaseState = db.prepare(`SELECT locked FROM phase_state WHERE space_id = ? AND phase = ?`).get(currentSpace, phase);
      if (phaseState?.locked) { socket.emit('error', { message: 'Phase verrouillée par le facilitateur' }); return; }

      if (content.length > 500) content = content.substring(0, 500);
      const id = generateId();
      const maxPos = db.prepare(`SELECT MAX(position) as mp FROM cards WHERE space_id = ? AND column_key = ?`).get(currentSpace, columnKey);
      const position = (maxPos?.mp ?? -1) + 1;

      db.prepare(`INSERT INTO cards (id, space_id, phase, column_key, content, author, author_color, position) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`).run(
        id, currentSpace, phase, columnKey, content.trim(), currentPseudo, currentColor, position
      );
      logActivity(currentSpace, currentPseudo, 'create-card', columnKey, content.trim().substring(0, 50));

      const card = db.prepare(`SELECT * FROM cards WHERE id = ?`).get(id);
      io.to(currentSpace).emit('card-created', { ...card, tags: JSON.parse(card.tags), reactions: JSON.parse(card.reactions) });
    });

    socket.on('update-card', ({ cardId, content }) => {
      if (!currentSpace) return;
      const card = db.prepare(`SELECT * FROM cards WHERE id = ? AND space_id = ?`).get(cardId, currentSpace);
      if (!card || card.author !== currentPseudo) return;
      if (content.length > 500) content = content.substring(0, 500);
      db.prepare(`UPDATE cards SET content = ?, updated_at = datetime('now') WHERE id = ?`).run(content.trim(), cardId);
      io.to(currentSpace).emit('card-updated', { cardId, content: content.trim(), by: currentPseudo });
    });

    socket.on('delete-card', ({ cardId, asFacilitator }) => {
      if (!currentSpace) return;
      const card = db.prepare(`SELECT * FROM cards WHERE id = ? AND space_id = ?`).get(cardId, currentSpace);
      if (!card) return;
      if (!asFacilitator && card.author !== currentPseudo) return;
      db.prepare(`DELETE FROM cards WHERE id = ?`).run(cardId);
      logActivity(currentSpace, currentPseudo, 'delete-card', card.column_key, asFacilitator ? 'Carte supprimée par le facilitateur' : '');
      io.to(currentSpace).emit('card-deleted', { cardId, by: currentPseudo });
    });

    socket.on('move-card', ({ cardId, toPhase, toColumnKey, toPosition }) => {
      if (!currentSpace) return;
      db.prepare(`UPDATE cards SET phase = ?, column_key = ?, position = ?, updated_at = datetime('now') WHERE id = ? AND space_id = ?`).run(
        toPhase, toColumnKey, toPosition, cardId, currentSpace
      );
      io.to(currentSpace).emit('card-moved', { cardId, toPhase, toColumnKey, toPosition, by: currentPseudo });
    });

    socket.on('mark-discuss', ({ cardId }) => {
      if (!currentSpace) return;
      const card = db.prepare(`SELECT marked_discuss FROM cards WHERE id = ? AND space_id = ?`).get(cardId, currentSpace);
      if (!card) return;
      const newVal = card.marked_discuss ? 0 : 1;
      db.prepare(`UPDATE cards SET marked_discuss = ? WHERE id = ?`).run(newVal, cardId);
      io.to(currentSpace).emit('card-marked-discuss', { cardId, marked: newVal, by: currentPseudo });
    });

    socket.on('add-tag', ({ cardId, tag }) => {
      if (!currentSpace) return;
      const card = db.prepare(`SELECT tags FROM cards WHERE id = ? AND space_id = ?`).get(cardId, currentSpace);
      if (!card) return;
      const tags = JSON.parse(card.tags || '[]');
      if (!tags.includes(tag)) tags.push(tag);
      db.prepare(`UPDATE cards SET tags = ? WHERE id = ?`).run(JSON.stringify(tags), cardId);
      io.to(currentSpace).emit('card-tags-updated', { cardId, tags });
    });

    socket.on('remove-tag', ({ cardId, tag }) => {
      if (!currentSpace) return;
      const card = db.prepare(`SELECT tags FROM cards WHERE id = ? AND space_id = ?`).get(cardId, currentSpace);
      if (!card) return;
      const tags = JSON.parse(card.tags || '[]').filter(t => t !== tag);
      db.prepare(`UPDATE cards SET tags = ? WHERE id = ?`).run(JSON.stringify(tags), cardId);
      io.to(currentSpace).emit('card-tags-updated', { cardId, tags });
    });

    socket.on('react', ({ cardId, emoji }) => {
      if (!currentSpace) return;
      const card = db.prepare(`SELECT reactions FROM cards WHERE id = ? AND space_id = ?`).get(cardId, currentSpace);
      if (!card) return;
      const reactions = JSON.parse(card.reactions || '{}');
      if (!reactions[emoji]) reactions[emoji] = [];
      const idx = reactions[emoji].indexOf(currentPseudo);
      if (idx >= 0) reactions[emoji].splice(idx, 1);
      else reactions[emoji].push(currentPseudo);
      if (reactions[emoji].length === 0) delete reactions[emoji];
      db.prepare(`UPDATE cards SET reactions = ? WHERE id = ?`).run(JSON.stringify(reactions), cardId);
      io.to(currentSpace).emit('card-reactions-updated', { cardId, reactions });
    });

    socket.on('vote', ({ cardId }) => {
      if (!currentSpace) return;
      const existing = db.prepare(`SELECT COUNT(*) as c FROM votes WHERE space_id = ? AND pseudo = ?`).get(currentSpace, currentPseudo);
      if (existing.c >= 3) { socket.emit('error', { message: 'Vous avez utilisé tous vos votes (3 max)' }); return; }
      try {
        db.prepare(`INSERT INTO votes (space_id, card_id, pseudo) VALUES (?, ?, ?)`).run(currentSpace, cardId, currentPseudo);
      } catch { return; }
      const votes = db.prepare(`SELECT card_id, COUNT(*) as count FROM votes WHERE space_id = ? GROUP BY card_id`).all(currentSpace);
      io.to(currentSpace).emit('votes-updated', votes);
    });

    socket.on('unvote', ({ cardId }) => {
      if (!currentSpace) return;
      db.prepare(`DELETE FROM votes WHERE space_id = ? AND card_id = ? AND pseudo = ?`).run(currentSpace, cardId, currentPseudo);
      const votes = db.prepare(`SELECT card_id, COUNT(*) as count FROM votes WHERE space_id = ? GROUP BY card_id`).all(currentSpace);
      io.to(currentSpace).emit('votes-updated', votes);
    });

    socket.on('add-comment', ({ cardId, content }) => {
      if (!currentSpace || !content?.trim()) return;
      const id = generateId();
      db.prepare(`INSERT INTO comments (id, card_id, space_id, author, author_color, content) VALUES (?, ?, ?, ?, ?, ?)`).run(
        id, cardId, currentSpace, currentPseudo, currentColor, content.trim()
      );
      const comment = db.prepare(`SELECT * FROM comments WHERE id = ?`).get(id);
      io.to(currentSpace).emit('comment-added', comment);
    });

    socket.on('set-axis-position', ({ axisKey, position, explanation }) => {
      if (!currentSpace) return;
      const axFinal = db.prepare(`SELECT locked FROM axes_final WHERE space_id = ? AND axis_key = ?`).get(currentSpace, axisKey);
      if (axFinal?.locked) { socket.emit('error', { message: 'Axe verrouillé' }); return; }

      db.prepare(`INSERT INTO axes (space_id, axis_key, pseudo, color, position, explanation, updated_at) VALUES (?, ?, ?, ?, ?, ?, datetime('now'))
        ON CONFLICT(space_id, axis_key, pseudo) DO UPDATE SET position = excluded.position, explanation = excluded.explanation, updated_at = datetime('now')`).run(
        currentSpace, axisKey, currentPseudo, currentColor, position, explanation || ''
      );
      const allAxes = db.prepare(`SELECT * FROM axes WHERE space_id = ? AND axis_key = ?`).all(currentSpace, axisKey);
      io.to(currentSpace).emit('axis-updated', { axisKey, positions: allAxes });
    });

    socket.on('set-axis-final', ({ axisKey, position }) => {
      if (!currentSpace) return;
      db.prepare(`INSERT INTO axes_final (space_id, axis_key, position, updated_at) VALUES (?, ?, ?, datetime('now'))
        ON CONFLICT(space_id, axis_key) DO UPDATE SET position = excluded.position, updated_at = datetime('now')`).run(
        currentSpace, axisKey, position
      );
      io.to(currentSpace).emit('axis-final-updated', { axisKey, position });
    });

    socket.on('lock-axis', ({ axisKey, locked }) => {
      if (!currentSpace) return;
      db.prepare(`INSERT INTO axes_final (space_id, axis_key, position, locked) VALUES (?, ?, 3, ?)
        ON CONFLICT(space_id, axis_key) DO UPDATE SET locked = excluded.locked`).run(
        currentSpace, axisKey, locked ? 1 : 0
      );
      io.to(currentSpace).emit('axis-lock-changed', { axisKey, locked });
    });

    socket.on('set-facilitator', ({ pseudo, add }) => {
      if (!currentSpace) return;
      const space = db.prepare(`SELECT facilitator_ids FROM spaces WHERE id = ?`).get(currentSpace);
      const ids = JSON.parse(space?.facilitator_ids || '[]');
      if (add && !ids.includes(pseudo)) ids.push(pseudo);
      if (!add) { const idx = ids.indexOf(pseudo); if (idx >= 0) ids.splice(idx, 1); }
      db.prepare(`UPDATE spaces SET facilitator_ids = ? WHERE id = ?`).run(JSON.stringify(ids), currentSpace);
      io.to(currentSpace).emit('facilitators-updated', ids);
    });

    socket.on('lock-phase', ({ phase, locked }) => {
      if (!currentSpace) return;
      db.prepare(`UPDATE phase_state SET locked = ? WHERE space_id = ? AND phase = ?`).run(locked ? 1 : 0, currentSpace, phase);
      io.to(currentSpace).emit('phase-state-changed', { phase, locked, hidden: null });
    });

    socket.on('hide-phase', ({ phase, hidden }) => {
      if (!currentSpace) return;
      db.prepare(`UPDATE phase_state SET hidden = ? WHERE space_id = ? AND phase = ?`).run(hidden ? 1 : 0, currentSpace, phase);
      io.to(currentSpace).emit('phase-state-changed', { phase, locked: null, hidden });
    });

    socket.on('start-timer', ({ duration }) => {
      if (!currentSpace) return;
      const existing = spaceTimers.get(currentSpace);
      if (existing?.interval) clearInterval(existing.interval);

      const timer = { duration, remaining: duration };
      timer.interval = setInterval(() => {
        timer.remaining--;
        io.to(currentSpace).emit('timer-update', { remaining: timer.remaining, duration: timer.duration });
        if (timer.remaining <= 0) {
          clearInterval(timer.interval);
          spaceTimers.delete(currentSpace);
          io.to(currentSpace).emit('timer-ended');
        }
      }, 1000);
      spaceTimers.set(currentSpace, timer);
      io.to(currentSpace).emit('timer-update', { remaining: duration, duration });
    });

    socket.on('stop-timer', () => {
      if (!currentSpace) return;
      const timer = spaceTimers.get(currentSpace);
      if (timer?.interval) clearInterval(timer.interval);
      spaceTimers.delete(currentSpace);
      io.to(currentSpace).emit('timer-stopped');
    });

    socket.on('spotlight', ({ cardId }) => {
      if (!currentSpace) return;
      io.to(currentSpace).emit('spotlight-changed', { cardId });
    });

    socket.on('set-welcome-message', ({ message }) => {
      if (!currentSpace) return;
      db.prepare(`UPDATE spaces SET welcome_message = ? WHERE id = ?`).run(message, currentSpace);
      io.to(currentSpace).emit('welcome-message-updated', { message });
    });

    socket.on('toggle-silent-mode', ({ columnKey, active }) => {
      if (!currentSpace) return;
      io.to(currentSpace).emit('silent-mode-changed', { columnKey, active });
    });

    socket.on('reveal-cards', ({ columnKey }) => {
      if (!currentSpace) return;
      io.to(currentSpace).emit('cards-revealed', { columnKey });
    });

    socket.on('focus-zone', ({ columnKey }) => {
      if (!currentSpace) return;
      socket.to(currentSpace).emit('participant-focus', { pseudo: currentPseudo, color: currentColor, columnKey });
    });

    socket.on('archive-space', ({ archived }) => {
      if (!currentSpace) return;
      db.prepare(`UPDATE spaces SET archived = ? WHERE id = ?`).run(archived ? 1 : 0, currentSpace);
      io.to(currentSpace).emit('space-archived', { archived });
    });

    socket.on('disconnect', () => {
      if (!currentSpace) return;
      const participants = spaceParticipants.get(currentSpace);
      if (participants) {
        participants.delete(socket.id);
        io.to(currentSpace).emit('participants', getParticipantsList(currentSpace));
        if (currentPseudo) {
          logActivity(currentSpace, currentPseudo, 'leave', '', '');
          io.to(currentSpace).emit('notification', { message: `${currentPseudo} a quitté le cadrage` });
        }
      }
    });
  });

  function getParticipantsList(spaceId) {
    const participants = spaceParticipants.get(spaceId);
    if (!participants) return [];
    const unique = new Map();
    for (const p of participants.values()) {
      if (!unique.has(p.pseudo)) unique.set(p.pseudo, p);
    }
    return [...unique.values()];
  }

  return { app, server, io, spaceTimers };
}
