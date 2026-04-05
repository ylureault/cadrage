import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import { nanoid } from 'nanoid';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { existsSync } from 'fs';
import { PHASES, AXES, PARTICIPANT_COLORS } from './canvas-data.js';
import { createLinkedBoard, getEmbedUrl, checkBoardExists } from './darkboard-service.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

// SQLite stores booleans as 0/1 integers. These helpers convert to real booleans for JSON responses.
const serializePhaseState = (p) => ({ ...p, locked: !!p.locked, hidden: !!p.hidden });
const serializeCard = (c) => ({ ...c, tags: JSON.parse(c.tags || '[]'), reactions: JSON.parse(c.reactions || '{}'), marked_discuss: !!c.marked_discuss });
const serializeSpace = (s) => ({ ...s, facilitator_ids: JSON.parse(s.facilitator_ids || '[]'), archived: !!s.archived, hidden_columns: JSON.parse(s.hidden_columns || '[]') });
const serializeBlock = (b) => ({ ...b, linked_axes: JSON.parse(b.linked_axes || '[]'), linked_card_ids: JSON.parse(b.linked_card_ids || '[]'), attention_flag: !!b.attention_flag, collapsed: !!b.collapsed });

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

  function isFacilitator(spaceId, pseudo) {
    const space = db.prepare(`SELECT facilitator_ids FROM spaces WHERE id = ?`).get(spaceId);
    return (JSON.parse(space?.facilitator_ids || '[]')).includes(pseudo);
  }

  function isArchived(spaceId) {
    const space = db.prepare(`SELECT archived FROM spaces WHERE id = ?`).get(spaceId);
    return !!space?.archived;
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
    const blocks = db.prepare(`SELECT * FROM blocks WHERE space_id = ? ORDER BY position, created_at`).all(req.params.id).map(serializeBlock);
    const blockComments = db.prepare(`SELECT * FROM block_comments WHERE space_id = ? ORDER BY created_at`).all(req.params.id);
    const dSections = db.prepare(`SELECT * FROM sections WHERE space_id = ? ORDER BY position`).all(req.params.id);
    const agendaDays = db.prepare(`SELECT * FROM agenda_days WHERE space_id = ? ORDER BY position`).all(req.params.id);
    const agendaSlots = db.prepare(`SELECT * FROM agenda_slots WHERE space_id = ? ORDER BY position`).all(req.params.id);

    res.json({
      space: serializeSpace(space),
      cards: cards.map(serializeCard),
      comments, axes, axesFinal,
      phaseStates: phaseStates.map(serializePhaseState),
      votes,
      blocks, blockComments, sections: dSections, agendaDays, agendaSlots
    });
  });

  app.patch('/api/spaces/:id', (req, res) => {
    const { client_name, sponsor, facilitator, session_date, session_date_end, welcome_message, archived, hidden_columns } = req.body;
    const fields = [];
    const values = [];
    if (client_name !== undefined) { fields.push('client_name = ?'); values.push(client_name); }
    if (sponsor !== undefined) { fields.push('sponsor = ?'); values.push(sponsor); }
    if (facilitator !== undefined) { fields.push('facilitator = ?'); values.push(facilitator); }
    if (session_date !== undefined) { fields.push('session_date = ?'); values.push(session_date); }
    if (session_date_end !== undefined) { fields.push('session_date_end = ?'); values.push(session_date_end); }
    if (welcome_message !== undefined) { fields.push('welcome_message = ?'); values.push(welcome_message); }
    if (archived !== undefined) { fields.push('archived = ?'); values.push(archived ? 1 : 0); }
    if (hidden_columns !== undefined) { fields.push('hidden_columns = ?'); values.push(JSON.stringify(hidden_columns)); }
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

  // ===================== DARKBOARD INTEGRATION =====================

  // Launch a linked DarkBoard for this cadrage
  app.post('/api/spaces/:id/launch-board', async (req, res) => {
    try {
      const space = db.prepare(`SELECT * FROM spaces WHERE id = ? AND deleted = 0`).get(req.params.id);
      if (!space) return res.status(404).json({ error: 'Espace introuvable' });

      const cards = db.prepare(`SELECT * FROM cards WHERE space_id = ?`).all(req.params.id);
      const spaceData = { ...space, cards };

      const { template, prefill } = req.body || {};
      const result = await createLinkedBoard(req.params.id, spaceData, { template, prefill });

      res.status(201).json({
        session_id: req.params.id,
        ...result,
      });
    } catch (err) {
      console.error('Launch board error:', err.message);
      res.status(502).json({ error: 'Impossible de créer le DarkBoard', details: err.message });
    }
  });

  // Get embed URL for this cadrage's DarkBoard
  app.get('/api/spaces/:id/board-embed', (req, res) => {
    const { toolbar, theme } = req.query;
    const embedUrl = getEmbedUrl(req.params.id, { toolbar, theme });
    res.json({ embedUrl, boardId: `cadrage-${req.params.id}` });
  });

  // Check if a DarkBoard exists for this cadrage
  app.get('/api/spaces/:id/board-status', async (req, res) => {
    try {
      const exists = await checkBoardExists(req.params.id);
      res.json({ exists, boardId: `cadrage-${req.params.id}` });
    } catch {
      res.json({ exists: false, boardId: `cadrage-${req.params.id}` });
    }
  });

  // ===================== CRUD API COMPLÈTE =====================

  // --- SPACES ---

  // List all spaces (non-deleted), with optional filters
  app.get('/api/spaces', (req, res) => {
    const { archived, plan, search, limit: lim, offset: off } = req.query;
    let where = 'deleted = 0';
    const params = [];

    if (archived !== undefined) { where += ' AND archived = ?'; params.push(archived === 'true' ? 1 : 0); }
    if (plan) { where += ' AND plan = ?'; params.push(plan); }
    if (search) { where += ' AND (client_name LIKE ? OR sponsor LIKE ? OR facilitator LIKE ?)'; const s = `%${search}%`; params.push(s, s, s); }

    const total = db.prepare(`SELECT COUNT(*) as count FROM spaces WHERE ${where}`).get(...params).count;
    const limit = Math.min(parseInt(lim) || 50, 100);
    const offset = parseInt(off) || 0;

    const spaces = db.prepare(`SELECT * FROM spaces WHERE ${where} ORDER BY updated_at DESC LIMIT ? OFFSET ?`).all(...params, limit, offset);
    res.json({
      spaces: spaces.map(serializeSpace),
      total,
      limit,
      offset,
    });
  });

  // --- CARDS ---

  // List cards for a space (with optional phase/column filters)
  app.get('/api/spaces/:id/cards', (req, res) => {
    const space = db.prepare(`SELECT id FROM spaces WHERE id = ? AND deleted = 0`).get(req.params.id);
    if (!space) return res.status(404).json({ error: 'Espace introuvable' });

    const { phase, column_key, author } = req.query;
    let where = 'space_id = ?';
    const params = [req.params.id];

    if (phase) { where += ' AND phase = ?'; params.push(phase); }
    if (column_key) { where += ' AND column_key = ?'; params.push(column_key); }
    if (author) { where += ' AND author = ?'; params.push(author); }

    const cards = db.prepare(`SELECT * FROM cards WHERE ${where} ORDER BY position, created_at`).all(...params);
    res.json(cards.map(serializeCard));
  });

  // Get a single card
  app.get('/api/cards/:cardId', (req, res) => {
    const card = db.prepare(`SELECT * FROM cards WHERE id = ?`).get(req.params.cardId);
    if (!card) return res.status(404).json({ error: 'Carte introuvable' });
    res.json(serializeCard(card));
  });

  // Create a card
  app.post('/api/spaces/:id/cards', (req, res) => {
    const space = db.prepare(`SELECT id, archived FROM spaces WHERE id = ? AND deleted = 0`).get(req.params.id);
    if (!space) return res.status(404).json({ error: 'Espace introuvable' });
    if (space.archived) return res.status(403).json({ error: 'Espace archivé — lecture seule' });

    const { phase, column_key, content, author, author_color } = req.body;
    if (!phase || !column_key || !content) return res.status(400).json({ error: 'phase, column_key et content sont requis' });
    if (content.length > 500) return res.status(400).json({ error: 'Contenu limité à 500 caractères' });

    const id = generateId();
    const maxPos = db.prepare(`SELECT MAX(position) as maxPos FROM cards WHERE space_id = ? AND phase = ? AND column_key = ?`).get(req.params.id, phase, column_key);
    const position = (maxPos?.maxPos ?? -1) + 1;

    db.prepare(`INSERT INTO cards (id, space_id, phase, column_key, content, author, author_color, position, tags, reactions) VALUES (?, ?, ?, ?, ?, ?, ?, ?, '[]', '{}')`).run(
      id, req.params.id, phase, column_key, content, author || 'API', author_color || '#888', position
    );

    const card = db.prepare(`SELECT * FROM cards WHERE id = ?`).get(id);
    logActivity(req.params.id, author || 'API', 'create-card', column_key, content.slice(0, 100));
    res.status(201).json({ ...card, tags: [], reactions: {} });
  });

  // Update a card (content, tags, position, phase, column_key)
  app.put('/api/cards/:cardId', (req, res) => {
    const card = db.prepare(`SELECT * FROM cards WHERE id = ?`).get(req.params.cardId);
    if (!card) return res.status(404).json({ error: 'Carte introuvable' });

    const space = db.prepare(`SELECT archived FROM spaces WHERE id = ?`).get(card.space_id);
    if (space?.archived) return res.status(403).json({ error: 'Espace archivé — lecture seule' });

    const { content, phase, column_key, position, tags, marked_discuss } = req.body;
    const fields = [];
    const values = [];

    if (content !== undefined) {
      if (content.length > 500) return res.status(400).json({ error: 'Contenu limité à 500 caractères' });
      fields.push('content = ?'); values.push(content);
    }
    if (phase !== undefined) { fields.push('phase = ?'); values.push(phase); }
    if (column_key !== undefined) { fields.push('column_key = ?'); values.push(column_key); }
    if (position !== undefined) { fields.push('position = ?'); values.push(position); }
    if (tags !== undefined) { fields.push('tags = ?'); values.push(JSON.stringify(tags)); }
    if (marked_discuss !== undefined) { fields.push('marked_discuss = ?'); values.push(marked_discuss ? 1 : 0); }

    if (fields.length === 0) return res.json({ ok: true });

    fields.push("updated_at = datetime('now')");
    values.push(req.params.cardId);
    db.prepare(`UPDATE cards SET ${fields.join(', ')} WHERE id = ?`).run(...values);

    const updated = db.prepare(`SELECT * FROM cards WHERE id = ?`).get(req.params.cardId);
    res.json(serializeCard(updated));
  });

  // --- COMMENTS ---

  // List comments for a card
  app.get('/api/cards/:cardId/comments', (req, res) => {
    const comments = db.prepare(`SELECT * FROM comments WHERE card_id = ? ORDER BY created_at`).all(req.params.cardId);
    res.json(comments);
  });

  // Create a comment
  app.post('/api/cards/:cardId/comments', (req, res) => {
    const card = db.prepare(`SELECT * FROM cards WHERE id = ?`).get(req.params.cardId);
    if (!card) return res.status(404).json({ error: 'Carte introuvable' });

    const space = db.prepare(`SELECT archived FROM spaces WHERE id = ?`).get(card.space_id);
    if (space?.archived) return res.status(403).json({ error: 'Espace archivé — lecture seule' });

    const { content, author, author_color } = req.body;
    if (!content) return res.status(400).json({ error: 'content est requis' });

    const id = generateId();
    db.prepare(`INSERT INTO comments (id, card_id, space_id, author, author_color, content) VALUES (?, ?, ?, ?, ?, ?)`).run(
      id, req.params.cardId, card.space_id, author || 'API', author_color || '#888', content
    );

    const comment = db.prepare(`SELECT * FROM comments WHERE id = ?`).get(id);
    logActivity(card.space_id, author || 'API', 'add-comment', req.params.cardId, content.slice(0, 100));
    res.status(201).json(comment);
  });

  // --- AXES ---

  // List axis positions for a space
  app.get('/api/spaces/:id/axes', (req, res) => {
    const axes = db.prepare(`SELECT * FROM axes WHERE space_id = ?`).all(req.params.id);
    const axesFinal = db.prepare(`SELECT * FROM axes_final WHERE space_id = ?`).all(req.params.id);
    res.json({ axes, axesFinal });
  });

  // Set/update a user's axis position
  app.put('/api/spaces/:id/axes/:axisKey', (req, res) => {
    const space = db.prepare(`SELECT id, archived FROM spaces WHERE id = ? AND deleted = 0`).get(req.params.id);
    if (!space) return res.status(404).json({ error: 'Espace introuvable' });
    if (space.archived) return res.status(403).json({ error: 'Espace archivé — lecture seule' });

    const { pseudo, color, position, explanation } = req.body;
    if (!pseudo || position === undefined) return res.status(400).json({ error: 'pseudo et position sont requis' });
    if (position < 1 || position > 5) return res.status(400).json({ error: 'position doit être entre 1 et 5' });

    // Check if axis is locked
    const final = db.prepare(`SELECT locked FROM axes_final WHERE space_id = ? AND axis_key = ?`).get(req.params.id, req.params.axisKey);
    if (final?.locked) return res.status(403).json({ error: 'Axe verrouillé' });

    db.prepare(`INSERT INTO axes (space_id, axis_key, pseudo, color, position, explanation, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, datetime('now'))
      ON CONFLICT(space_id, axis_key, pseudo) DO UPDATE SET position = ?, explanation = ?, updated_at = datetime('now')`).run(
      req.params.id, req.params.axisKey, pseudo, color || '#888', position, explanation || '',
      position, explanation || ''
    );

    const allPositions = db.prepare(`SELECT * FROM axes WHERE space_id = ? AND axis_key = ?`).all(req.params.id, req.params.axisKey);
    res.json({ axisKey: req.params.axisKey, positions: allPositions });
  });

  // Set final axis position (facilitator)
  app.put('/api/spaces/:id/axes-final/:axisKey', (req, res) => {
    const space = db.prepare(`SELECT id, archived FROM spaces WHERE id = ? AND deleted = 0`).get(req.params.id);
    if (!space) return res.status(404).json({ error: 'Espace introuvable' });

    const { position, locked } = req.body;

    db.prepare(`INSERT INTO axes_final (space_id, axis_key, position, locked, updated_at)
      VALUES (?, ?, ?, ?, datetime('now'))
      ON CONFLICT(space_id, axis_key) DO UPDATE SET position = COALESCE(?, position), locked = COALESCE(?, locked), updated_at = datetime('now')`).run(
      req.params.id, req.params.axisKey, position || 3, locked ? 1 : 0,
      position, locked !== undefined ? (locked ? 1 : 0) : null
    );

    const final = db.prepare(`SELECT * FROM axes_final WHERE space_id = ? AND axis_key = ?`).get(req.params.id, req.params.axisKey);
    res.json(final);
  });

  // --- VOTES ---

  // List votes for a space
  app.get('/api/spaces/:id/votes', (req, res) => {
    const votes = db.prepare(`SELECT card_id, COUNT(*) as count FROM votes WHERE space_id = ? GROUP BY card_id`).all(req.params.id);
    res.json(votes);
  });

  // Cast a vote
  app.post('/api/spaces/:id/votes', (req, res) => {
    const space = db.prepare(`SELECT id, archived FROM spaces WHERE id = ? AND deleted = 0`).get(req.params.id);
    if (!space) return res.status(404).json({ error: 'Espace introuvable' });
    if (space.archived) return res.status(403).json({ error: 'Espace archivé — lecture seule' });

    const { card_id, pseudo } = req.body;
    if (!card_id || !pseudo) return res.status(400).json({ error: 'card_id et pseudo sont requis' });

    // Check vote limit (3 per participant)
    const existing = db.prepare(`SELECT COUNT(*) as count FROM votes WHERE space_id = ? AND pseudo = ?`).get(req.params.id, pseudo);
    if (existing.count >= 3) return res.status(400).json({ error: 'Maximum 3 votes par participant' });

    // Check duplicate
    const dup = db.prepare(`SELECT id FROM votes WHERE space_id = ? AND card_id = ? AND pseudo = ?`).get(req.params.id, card_id, pseudo);
    if (dup) return res.status(409).json({ error: 'Vote déjà enregistré' });

    db.prepare(`INSERT INTO votes (space_id, card_id, pseudo) VALUES (?, ?, ?)`).run(req.params.id, card_id, pseudo);

    const allVotes = db.prepare(`SELECT card_id, COUNT(*) as count FROM votes WHERE space_id = ? GROUP BY card_id`).all(req.params.id);
    res.status(201).json(allVotes);
  });

  // --- PHASE STATES ---

  // Get phase states for a space
  app.get('/api/spaces/:id/phase-states', (req, res) => {
    const states = db.prepare(`SELECT * FROM phase_state WHERE space_id = ?`).all(req.params.id);
    res.json(states.map(serializePhaseState));
  });

  // Update a phase state (lock/hide)
  app.put('/api/spaces/:id/phase-states/:phase', (req, res) => {
    const { locked, hidden } = req.body;

    const fields = [];
    const values = [];
    if (locked !== undefined) { fields.push('locked = ?'); values.push(locked ? 1 : 0); }
    if (hidden !== undefined) { fields.push('hidden = ?'); values.push(hidden ? 1 : 0); }
    if (fields.length === 0) return res.json({ ok: true });

    values.push(req.params.id, req.params.phase);
    db.prepare(`UPDATE phase_state SET ${fields.join(', ')} WHERE space_id = ? AND phase = ?`).run(...values);

    const state = db.prepare(`SELECT * FROM phase_state WHERE space_id = ? AND phase = ?`).get(req.params.id, req.params.phase);
    res.json(serializePhaseState(state));
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
      try {
        if (!pseudo?.trim()) { socket.emit('error', { message: 'Pseudo requis.' }); return; }
        if (pseudo.length > 50) { socket.emit('error', { message: 'Pseudo trop long (50 caractères max).' }); return; }
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

        socket.emit('joined', { pseudo, color: currentColor, archived: !!space.archived });
        io.to(spaceId).emit('participants', getParticipantsList(spaceId));
        socket.to(spaceId).emit('notification', { message: `${pseudo} a rejoint le cadrage` });

        const timer = spaceTimers.get(spaceId);
        if (timer) socket.emit('timer-update', { remaining: timer.remaining, duration: timer.duration });
      } catch (e) {
        console.error('join-space error:', e);
        socket.emit('error', { message: 'Erreur lors de la connexion à l\'espace.' });
      }
    });

    socket.on('update-header', (data) => {
      if (!currentSpace) return;
      if (!isFacilitator(currentSpace, currentPseudo)) return;
      const space = db.prepare(`SELECT archived FROM spaces WHERE id = ?`).get(currentSpace);
      if (space?.archived) return;
      const { field, value } = data;
      const allowed = ['client_name', 'sponsor', 'facilitator', 'session_date', 'session_date_end'];
      if (!allowed.includes(field)) return;
      db.prepare(`UPDATE spaces SET ${field} = ?, updated_at = datetime('now') WHERE id = ?`).run(value, currentSpace);
      socket.to(currentSpace).emit('header-updated', { field, value, by: currentPseudo });
    });

    socket.on('create-card', ({ phase, columnKey, content }) => {
      if (!currentSpace || !currentPseudo || !currentColor) {
        socket.emit('error', { message: 'Session expirée. Rechargez la page.' });
        return;
      }
      if (!content?.trim()) {
        socket.emit('error', { message: 'Le contenu de la carte ne peut pas être vide.' });
        return;
      }
      const space = db.prepare(`SELECT archived FROM spaces WHERE id = ?`).get(currentSpace);
      if (space?.archived) {
        socket.emit('error', { message: 'Ce cadrage est archivé (lecture seule).' });
        return;
      }

      const phaseState = db.prepare(`SELECT locked FROM phase_state WHERE space_id = ? AND phase = ?`).get(currentSpace, phase);
      if (phaseState?.locked) {
        socket.emit('error', { message: 'Phase verrouillée par le facilitateur.' });
        return;
      }

      try {
        if (content.length > 500) content = content.substring(0, 500);
        const id = generateId();
        const maxPos = db.prepare(`SELECT MAX(position) as mp FROM cards WHERE space_id = ? AND column_key = ?`).get(currentSpace, columnKey);
        const position = (maxPos?.mp ?? -1) + 1;

        db.prepare(`INSERT INTO cards (id, space_id, phase, column_key, content, author, author_color, position) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`).run(
          id, currentSpace, phase, columnKey, content.trim(), currentPseudo, currentColor, position
        );
        logActivity(currentSpace, currentPseudo, 'create-card', columnKey, content.trim().substring(0, 50));

        const card = db.prepare(`SELECT * FROM cards WHERE id = ?`).get(id);
        if (!card) {
          socket.emit('error', { message: 'La carte n\'a pas pu être créée.' });
          return;
        }
        io.to(currentSpace).emit('card-created', serializeCard(card));
        // Activity notification to other users
        const preview = content.trim().substring(0, 60);
        const isQuestion = content.startsWith('[Q] ');
        socket.to(currentSpace).emit('activity-notification', {
          type: isQuestion ? 'answer' : 'card',
          author: currentPseudo,
          color: currentColor,
          message: isQuestion ? `a répondu à une question` : `a ajouté une carte`,
          preview,
          cardId: id,
        });
      } catch (e) {
        console.error('create-card error:', e);
        socket.emit('error', { message: 'Erreur lors de la création de la carte.' });
      }
    });

    socket.on('update-card', ({ cardId, content }) => {
      if (!currentSpace) return;
      if (isArchived(currentSpace)) return;
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
      if (card.author !== currentPseudo && !isFacilitator(currentSpace, currentPseudo)) return;
      db.prepare(`DELETE FROM cards WHERE id = ?`).run(cardId);
      logActivity(currentSpace, currentPseudo, 'delete-card', card.column_key, asFacilitator ? 'Carte supprimée par le facilitateur' : '');
      io.to(currentSpace).emit('card-deleted', { cardId, by: currentPseudo });
    });

    socket.on('move-card', ({ cardId, toPhase, toColumnKey, toPosition }) => {
      if (!currentSpace) return;
      if (isArchived(currentSpace)) return;
      db.prepare(`UPDATE cards SET phase = ?, column_key = ?, position = ?, updated_at = datetime('now') WHERE id = ? AND space_id = ?`).run(
        toPhase, toColumnKey, toPosition, cardId, currentSpace
      );
      io.to(currentSpace).emit('card-moved', { cardId, toPhase, toColumnKey, toPosition, by: currentPseudo });
    });

    socket.on('mark-discuss', ({ cardId }) => {
      if (!currentSpace) return;
      if (isArchived(currentSpace)) return;
      const card = db.prepare(`SELECT marked_discuss FROM cards WHERE id = ? AND space_id = ?`).get(cardId, currentSpace);
      if (!card) return;
      const newVal = card.marked_discuss ? 0 : 1;
      db.prepare(`UPDATE cards SET marked_discuss = ? WHERE id = ?`).run(newVal, cardId);
      io.to(currentSpace).emit('card-marked-discuss', { cardId, marked: newVal, by: currentPseudo });
    });

    socket.on('add-tag', ({ cardId, tag }) => {
      if (!currentSpace) return;
      if (isArchived(currentSpace)) return;
      const card = db.prepare(`SELECT tags FROM cards WHERE id = ? AND space_id = ?`).get(cardId, currentSpace);
      if (!card) return;
      const tags = JSON.parse(card.tags || '[]');
      if (!tags.includes(tag)) tags.push(tag);
      db.prepare(`UPDATE cards SET tags = ? WHERE id = ?`).run(JSON.stringify(tags), cardId);
      io.to(currentSpace).emit('card-tags-updated', { cardId, tags });
    });

    socket.on('remove-tag', ({ cardId, tag }) => {
      if (!currentSpace) return;
      if (isArchived(currentSpace)) return;
      const card = db.prepare(`SELECT tags FROM cards WHERE id = ? AND space_id = ?`).get(cardId, currentSpace);
      if (!card) return;
      const tags = JSON.parse(card.tags || '[]').filter(t => t !== tag);
      db.prepare(`UPDATE cards SET tags = ? WHERE id = ?`).run(JSON.stringify(tags), cardId);
      io.to(currentSpace).emit('card-tags-updated', { cardId, tags });
    });

    socket.on('react', ({ cardId, emoji }) => {
      if (!currentSpace) return;
      if (isArchived(currentSpace)) return;
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
      if (isArchived(currentSpace)) return;
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
      if (isArchived(currentSpace)) return;
      db.prepare(`DELETE FROM votes WHERE space_id = ? AND card_id = ? AND pseudo = ?`).run(currentSpace, cardId, currentPseudo);
      const votes = db.prepare(`SELECT card_id, COUNT(*) as count FROM votes WHERE space_id = ? GROUP BY card_id`).all(currentSpace);
      io.to(currentSpace).emit('votes-updated', votes);
    });

    socket.on('add-comment', ({ cardId, content }) => {
      if (!currentSpace || !currentPseudo || !currentColor || !content?.trim()) return;
      if (isArchived(currentSpace)) return;
      const id = generateId();
      db.prepare(`INSERT INTO comments (id, card_id, space_id, author, author_color, content) VALUES (?, ?, ?, ?, ?, ?)`).run(
        id, cardId, currentSpace, currentPseudo, currentColor, content.trim()
      );
      const comment = db.prepare(`SELECT * FROM comments WHERE id = ?`).get(id);
      io.to(currentSpace).emit('comment-added', comment);
      // Activity notification
      socket.to(currentSpace).emit('activity-notification', {
        type: 'comment',
        author: currentPseudo,
        color: currentColor,
        message: `a commenté une carte`,
        preview: content.trim().substring(0, 60),
        cardId,
      });
    });

    socket.on('set-axis-position', ({ axisKey, position, explanation }) => {
      if (!currentSpace || !currentPseudo || !currentColor) return;
      const axFinal = db.prepare(`SELECT locked FROM axes_final WHERE space_id = ? AND axis_key = ?`).get(currentSpace, axisKey);
      if (axFinal?.locked) { socket.emit('error', { message: 'Axe verrouillé' }); return; }
      if (position < 1 || position > 5) return;

      db.prepare(`INSERT INTO axes (space_id, axis_key, pseudo, color, position, explanation, updated_at) VALUES (?, ?, ?, ?, ?, ?, datetime('now'))
        ON CONFLICT(space_id, axis_key, pseudo) DO UPDATE SET position = excluded.position, explanation = excluded.explanation, updated_at = datetime('now')`).run(
        currentSpace, axisKey, currentPseudo, currentColor, position, explanation || ''
      );
      const allAxes = db.prepare(`SELECT * FROM axes WHERE space_id = ? AND axis_key = ?`).all(currentSpace, axisKey);
      io.to(currentSpace).emit('axis-updated', { axisKey, positions: allAxes });
    });

    socket.on('set-axis-final', ({ axisKey, position }) => {
      if (!currentSpace) return;
      if (!isFacilitator(currentSpace, currentPseudo)) return;
      db.prepare(`INSERT INTO axes_final (space_id, axis_key, position, updated_at) VALUES (?, ?, ?, datetime('now'))
        ON CONFLICT(space_id, axis_key) DO UPDATE SET position = excluded.position, updated_at = datetime('now')`).run(
        currentSpace, axisKey, position
      );
      io.to(currentSpace).emit('axis-final-updated', { axisKey, position });
    });

    socket.on('lock-axis', ({ axisKey, locked }) => {
      if (!currentSpace) return;
      if (!isFacilitator(currentSpace, currentPseudo)) return;
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
      // First facilitator can self-assign; after that, only facilitators can add/remove
      if (ids.length > 0 && !ids.includes(currentPseudo)) return;
      if (add && !ids.includes(pseudo)) ids.push(pseudo);
      if (!add) { const idx = ids.indexOf(pseudo); if (idx >= 0) ids.splice(idx, 1); }
      db.prepare(`UPDATE spaces SET facilitator_ids = ? WHERE id = ?`).run(JSON.stringify(ids), currentSpace);
      io.to(currentSpace).emit('facilitators-updated', ids);
    });

    socket.on('lock-phase', ({ phase, locked }) => {
      if (!currentSpace) return;
      if (!isFacilitator(currentSpace, currentPseudo)) return;
      db.prepare(`UPDATE phase_state SET locked = ? WHERE space_id = ? AND phase = ?`).run(locked ? 1 : 0, currentSpace, phase);
      io.to(currentSpace).emit('phase-state-changed', { phase, locked, hidden: null });
    });

    socket.on('hide-phase', ({ phase, hidden }) => {
      if (!currentSpace) return;
      if (!isFacilitator(currentSpace, currentPseudo)) return;
      db.prepare(`UPDATE phase_state SET hidden = ? WHERE space_id = ? AND phase = ?`).run(hidden ? 1 : 0, currentSpace, phase);
      io.to(currentSpace).emit('phase-state-changed', { phase, locked: null, hidden });
    });

    socket.on('start-timer', ({ duration }) => {
      if (!currentSpace) return;
      if (!isFacilitator(currentSpace, currentPseudo)) return;
      if (!duration || duration < 1 || duration > 3600) return;
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
      if (!isFacilitator(currentSpace, currentPseudo)) return;
      const timer = spaceTimers.get(currentSpace);
      if (timer?.interval) clearInterval(timer.interval);
      spaceTimers.delete(currentSpace);
      io.to(currentSpace).emit('timer-stopped');
    });

    socket.on('spotlight', ({ cardId }) => {
      if (!currentSpace) return;
      if (!isFacilitator(currentSpace, currentPseudo)) return;
      io.to(currentSpace).emit('spotlight-changed', { cardId });
    });

    socket.on('set-welcome-message', ({ message }) => {
      if (!currentSpace) return;
      if (!isFacilitator(currentSpace, currentPseudo)) return;
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
      if (!isFacilitator(currentSpace, currentPseudo)) return;
      db.prepare(`UPDATE spaces SET archived = ? WHERE id = ?`).run(archived ? 1 : 0, currentSpace);
      io.to(currentSpace).emit('space-archived', { archived });
    });

    socket.on('update-setting', ({ key, value }) => {
      if (!currentSpace) return;
      const allowed = ['hidden_columns'];
      if (!allowed.includes(key)) return;
      const dbValue = key === 'hidden_columns' ? JSON.stringify(value) : (value ? 1 : 0);
      db.prepare(`UPDATE spaces SET ${key} = ? WHERE id = ?`).run(dbValue, currentSpace);
      io.to(currentSpace).emit('setting-updated', { key, value });
    });

    // ===================== DÉROULÉ — BLOCS =====================

    socket.on('create-block', (data) => {
      if (!currentSpace || !currentPseudo) return;
      const space = db.prepare(`SELECT archived FROM spaces WHERE id = ?`).get(currentSpace);
      if (space?.archived) return;
      const { title, intention, block_type, duration_minutes, section_id } = data;
      if (!title?.trim() || !intention?.trim()) { socket.emit('error', { message: "Titre et intention sont obligatoires." }); return; }
      const validTypes = ['ouverture','icebreaker','production','exploration','debriefing','decision','pause','cloture','transition','energizer'];
      if (block_type && !validTypes.includes(block_type)) { socket.emit('error', { message: 'Type de bloc invalide.' }); return; }
      const id = generateId();
      const maxPos = db.prepare(`SELECT MAX(position) as mp FROM blocks WHERE space_id = ?`).get(currentSpace);
      const position = (maxPos?.mp ?? -1) + 1;
      db.prepare(`INSERT INTO blocks (id, space_id, section_id, title, intention, block_type, duration_minutes, created_by, position) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`).run(
        id, currentSpace, section_id || null, title.trim(), intention.trim(), block_type || 'production', duration_minutes || 30, currentPseudo, position
      );
      logActivity(currentSpace, currentPseudo, 'create-block', title.trim(), '');
      const block = db.prepare(`SELECT * FROM blocks WHERE id = ?`).get(id);
      io.to(currentSpace).emit('block-created', serializeBlock(block));
    });

    socket.on('update-block', (data) => {
      if (!currentSpace) return;
      const space = db.prepare(`SELECT archived FROM spaces WHERE id = ?`).get(currentSpace);
      if (space?.archived) return;
      const { blockId, ...fields } = data;
      const allowed = ['title', 'intention', 'description', 'block_type', 'duration_minutes', 'format', 'format_detail', 'material', 'deliverable', 'attention_flag', 'attention_note', 'linked_axes', 'linked_card_ids', 'collapsed', 'section_id', 'status'];
      const sets = [];
      const vals = [];
      for (const [k, v] of Object.entries(fields)) {
        if (!allowed.includes(k)) continue;
        if (k === 'linked_axes' || k === 'linked_card_ids') {
          sets.push(`${k} = ?`); vals.push(JSON.stringify(v));
        } else if (k === 'attention_flag' || k === 'collapsed') {
          sets.push(`${k} = ?`); vals.push(v ? 1 : 0);
        } else {
          sets.push(`${k} = ?`); vals.push(v);
        }
      }
      if (sets.length === 0) return;
      sets.push("updated_at = datetime('now')");
      vals.push(blockId, currentSpace);
      db.prepare(`UPDATE blocks SET ${sets.join(', ')} WHERE id = ? AND space_id = ?`).run(...vals);
      const block = db.prepare(`SELECT * FROM blocks WHERE id = ?`).get(blockId);
      if (block) io.to(currentSpace).emit('block-updated', serializeBlock(block));
    });

    socket.on('delete-block', ({ blockId }) => {
      if (!currentSpace) return;
      if (isArchived(currentSpace)) return;
      const block = db.prepare(`SELECT * FROM blocks WHERE id = ? AND space_id = ?`).get(blockId, currentSpace);
      if (!block) return;
      db.prepare(`DELETE FROM blocks WHERE id = ?`).run(blockId);
      // Also remove from agenda slots
      db.prepare(`DELETE FROM agenda_slots WHERE block_id = ? AND space_id = ?`).run(blockId, currentSpace);
      logActivity(currentSpace, currentPseudo, 'delete-block', block.title, '');
      io.to(currentSpace).emit('block-deleted', { blockId });
    });

    socket.on('duplicate-block', ({ blockId }) => {
      if (!currentSpace) return;
      if (isArchived(currentSpace)) return;
      const orig = db.prepare(`SELECT * FROM blocks WHERE id = ? AND space_id = ?`).get(blockId, currentSpace);
      if (!orig) return;
      const id = generateId();
      const maxPos = db.prepare(`SELECT MAX(position) as mp FROM blocks WHERE space_id = ?`).get(currentSpace);
      const position = (maxPos?.mp ?? -1) + 1;
      db.prepare(`INSERT INTO blocks (id, space_id, section_id, title, intention, description, block_type, duration_minutes, format, format_detail, material, deliverable, attention_flag, attention_note, linked_axes, linked_card_ids, created_by, position) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`).run(
        id, currentSpace, orig.section_id, `Copie de - ${orig.title}`, orig.intention, orig.description, orig.block_type, orig.duration_minutes, orig.format, orig.format_detail, orig.material, orig.deliverable, orig.attention_flag, orig.attention_note, orig.linked_axes, orig.linked_card_ids, currentPseudo, position
      );
      const block = db.prepare(`SELECT * FROM blocks WHERE id = ?`).get(id);
      io.to(currentSpace).emit('block-created', serializeBlock(block));
    });

    socket.on('reorder-blocks', ({ orderedIds }) => {
      if (!currentSpace) return;
      if (isArchived(currentSpace)) return;
      const stmt = db.prepare(`UPDATE blocks SET position = ? WHERE id = ? AND space_id = ?`);
      const tx = db.transaction(() => {
        orderedIds.forEach((id, i) => stmt.run(i, id, currentSpace));
      });
      tx();
      io.to(currentSpace).emit('blocks-reordered', { orderedIds });
    });

    socket.on('add-block-comment', ({ blockId, content }) => {
      if (!currentSpace || !currentPseudo || !currentColor || !content?.trim()) return;
      if (isArchived(currentSpace)) return;
      const id = generateId();
      db.prepare(`INSERT INTO block_comments (id, block_id, space_id, author, author_color, content) VALUES (?, ?, ?, ?, ?, ?)`).run(
        id, blockId, currentSpace, currentPseudo, currentColor, content.trim()
      );
      const comment = db.prepare(`SELECT * FROM block_comments WHERE id = ?`).get(id);
      io.to(currentSpace).emit('block-comment-added', comment);
    });

    // ===================== SECTIONS =====================

    socket.on('create-section', ({ title }) => {
      if (!currentSpace) return;
      if (isArchived(currentSpace)) return;
      const id = generateId();
      const maxPos = db.prepare(`SELECT MAX(position) as mp FROM sections WHERE space_id = ?`).get(currentSpace);
      const position = (maxPos?.mp ?? -1) + 1;
      db.prepare(`INSERT INTO sections (id, space_id, title, position) VALUES (?, ?, ?, ?)`).run(id, currentSpace, title || 'Nouvelle section', position);
      const section = db.prepare(`SELECT * FROM sections WHERE id = ?`).get(id);
      io.to(currentSpace).emit('section-created', section);
    });

    socket.on('update-section', ({ sectionId, title, collapsed }) => {
      if (!currentSpace) return;
      if (isArchived(currentSpace)) return;
      const sets = []; const vals = [];
      if (title !== undefined) { sets.push('title = ?'); vals.push(title); }
      if (collapsed !== undefined) { sets.push('collapsed = ?'); vals.push(collapsed ? 1 : 0); }
      if (sets.length === 0) return;
      vals.push(sectionId, currentSpace);
      db.prepare(`UPDATE sections SET ${sets.join(', ')} WHERE id = ? AND space_id = ?`).run(...vals);
      const section = db.prepare(`SELECT * FROM sections WHERE id = ?`).get(sectionId);
      if (section) io.to(currentSpace).emit('section-updated', section);
    });

    socket.on('delete-section', ({ sectionId }) => {
      if (!currentSpace) return;
      if (isArchived(currentSpace)) return;
      // Detach blocks from section
      db.prepare(`UPDATE blocks SET section_id = NULL WHERE section_id = ? AND space_id = ?`).run(sectionId, currentSpace);
      db.prepare(`DELETE FROM sections WHERE id = ? AND space_id = ?`).run(sectionId, currentSpace);
      io.to(currentSpace).emit('section-deleted', { sectionId });
    });

    socket.on('reorder-sections', ({ orderedIds }) => {
      if (!currentSpace) return;
      if (isArchived(currentSpace)) return;
      const stmt = db.prepare(`UPDATE sections SET position = ? WHERE id = ? AND space_id = ?`);
      orderedIds.forEach((id, i) => stmt.run(i, id, currentSpace));
      io.to(currentSpace).emit('sections-reordered', { orderedIds });
    });

    // ===================== AGENDA =====================

    socket.on('create-agenda-day', ({ date, start_time, end_time }) => {
      if (!currentSpace) return;
      if (isArchived(currentSpace)) return;
      const id = generateId();
      const maxPos = db.prepare(`SELECT MAX(position) as mp FROM agenda_days WHERE space_id = ?`).get(currentSpace);
      const position = (maxPos?.mp ?? -1) + 1;
      const dayNumber = position + 1;
      db.prepare(`INSERT INTO agenda_days (id, space_id, day_number, date, start_time, end_time, position) VALUES (?, ?, ?, ?, ?, ?, ?)`).run(
        id, currentSpace, dayNumber, date || '', start_time || '09:00', end_time || '17:30', position
      );
      const day = db.prepare(`SELECT * FROM agenda_days WHERE id = ?`).get(id);
      io.to(currentSpace).emit('agenda-day-created', day);
    });

    socket.on('update-agenda-day', ({ dayId, ...fields }) => {
      if (!currentSpace) return;
      if (isArchived(currentSpace)) return;
      const allowed = ['date', 'start_time', 'end_time'];
      const sets = []; const vals = [];
      for (const [k, v] of Object.entries(fields)) {
        if (!allowed.includes(k)) continue;
        sets.push(`${k} = ?`); vals.push(v);
      }
      if (sets.length === 0) return;
      vals.push(dayId, currentSpace);
      db.prepare(`UPDATE agenda_days SET ${sets.join(', ')} WHERE id = ? AND space_id = ?`).run(...vals);
      const day = db.prepare(`SELECT * FROM agenda_days WHERE id = ?`).get(dayId);
      if (day) io.to(currentSpace).emit('agenda-day-updated', day);
    });

    socket.on('delete-agenda-day', ({ dayId }) => {
      if (!currentSpace) return;
      if (isArchived(currentSpace)) return;
      db.prepare(`DELETE FROM agenda_slots WHERE day_id = ? AND space_id = ?`).run(dayId, currentSpace);
      db.prepare(`DELETE FROM agenda_days WHERE id = ? AND space_id = ?`).run(dayId, currentSpace);
      io.to(currentSpace).emit('agenda-day-deleted', { dayId });
    });

    socket.on('create-agenda-slot', ({ dayId, block_id, slot_type, title, start_time, duration_minutes }) => {
      if (!currentSpace) return;
      if (isArchived(currentSpace)) return;
      const id = generateId();
      const maxPos = db.prepare(`SELECT MAX(position) as mp FROM agenda_slots WHERE day_id = ?`).get(dayId);
      const position = (maxPos?.mp ?? -1) + 1;
      db.prepare(`INSERT INTO agenda_slots (id, space_id, day_id, block_id, slot_type, title, start_time, duration_minutes, position) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`).run(
        id, currentSpace, dayId, block_id || null, slot_type || 'block', title || '', start_time, duration_minutes || 30, position
      );
      const slot = db.prepare(`SELECT * FROM agenda_slots WHERE id = ?`).get(id);
      io.to(currentSpace).emit('agenda-slot-created', slot);
    });

    socket.on('update-agenda-slot', ({ slotId, ...fields }) => {
      if (!currentSpace) return;
      if (isArchived(currentSpace)) return;
      const allowed = ['block_id', 'slot_type', 'title', 'start_time', 'duration_minutes', 'position'];
      const sets = []; const vals = [];
      for (const [k, v] of Object.entries(fields)) {
        if (!allowed.includes(k)) continue;
        sets.push(`${k} = ?`); vals.push(v);
      }
      if (sets.length === 0) return;
      sets.push("updated_at = datetime('now')");
      vals.push(slotId, currentSpace);
      db.prepare(`UPDATE agenda_slots SET ${sets.join(', ')} WHERE id = ? AND space_id = ?`).run(...vals);
      const slot = db.prepare(`SELECT * FROM agenda_slots WHERE id = ?`).get(slotId);
      if (slot) io.to(currentSpace).emit('agenda-slot-updated', slot);
    });

    socket.on('delete-agenda-slot', ({ slotId }) => {
      if (!currentSpace) return;
      if (isArchived(currentSpace)) return;
      db.prepare(`DELETE FROM agenda_slots WHERE id = ? AND space_id = ?`).run(slotId, currentSpace);
      io.to(currentSpace).emit('agenda-slot-deleted', { slotId });
    });

    socket.on('reorder-agenda-slots', ({ dayId, orderedIds }) => {
      if (!currentSpace) return;
      if (isArchived(currentSpace)) return;
      const stmt = db.prepare(`UPDATE agenda_slots SET position = ? WHERE id = ? AND space_id = ?`);
      orderedIds.forEach((id, i) => stmt.run(i, id, currentSpace));
      io.to(currentSpace).emit('agenda-slots-reordered', { dayId, orderedIds });
    });

    socket.on('auto-schedule-agenda', ({ dayId }) => {
      if (!currentSpace) return;
      if (isArchived(currentSpace)) return;
      const day = db.prepare(`SELECT * FROM agenda_days WHERE id = ? AND space_id = ?`).get(dayId, currentSpace);
      if (!day) return;
      const blocks = db.prepare(`SELECT * FROM blocks WHERE space_id = ? ORDER BY position`).all(currentSpace);
      const scheduled = db.prepare(`SELECT block_id FROM agenda_slots WHERE space_id = ? AND block_id IS NOT NULL`).all(currentSpace).map(s => s.block_id);
      const unscheduled = blocks.filter(b => !scheduled.includes(b.id));
      if (unscheduled.length === 0) return;

      // Clear existing slots for this day
      db.prepare(`DELETE FROM agenda_slots WHERE day_id = ? AND space_id = ?`).run(dayId, currentSpace);

      let currentTime = day.start_time;
      let pos = 0;
      let minutesSincePause = 0;
      const lunchInserted = { done: false };

      function addMinutes(time, mins) {
        const [h, m] = time.split(':').map(Number);
        const total = h * 60 + m + mins;
        return `${String(Math.floor(total / 60)).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`;
      }
      function timeToMinutes(time) { const [h, m] = time.split(':').map(Number); return h * 60 + m; }

      const insertSlot = db.prepare(`INSERT INTO agenda_slots (id, space_id, day_id, block_id, slot_type, title, start_time, duration_minutes, position) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`);

      const tx = db.transaction(() => {
        for (const block of unscheduled) {
          // Insert lunch around 12:30
          if (!lunchInserted.done && timeToMinutes(currentTime) >= 12 * 60 + 15) {
            insertSlot.run(generateId(), currentSpace, dayId, null, 'pause', 'Déjeuner', currentTime, 60, pos++);
            currentTime = addMinutes(currentTime, 60);
            minutesSincePause = 0;
            lunchInserted.done = true;
          }
          // Insert coffee break every 90 min
          if (minutesSincePause >= 90 && block.block_type !== 'pause') {
            insertSlot.run(generateId(), currentSpace, dayId, null, 'pause', 'Pause café', currentTime, 15, pos++);
            currentTime = addMinutes(currentTime, 15);
            minutesSincePause = 0;
          }

          insertSlot.run(generateId(), currentSpace, dayId, block.id, 'block', '', currentTime, block.duration_minutes, pos++);
          currentTime = addMinutes(currentTime, block.duration_minutes);
          minutesSincePause += block.duration_minutes;
        }
      });
      tx();

      const slots = db.prepare(`SELECT * FROM agenda_slots WHERE day_id = ? AND space_id = ? ORDER BY position`).all(dayId, currentSpace);
      io.to(currentSpace).emit('agenda-auto-scheduled', { dayId, slots });
    });

    // ===================== TEMPLATES DÉROULÉ =====================

    socket.on('save-deroulement-template', ({ name, description }) => {
      if (!currentSpace || !currentPseudo) return;
      if (isArchived(currentSpace)) return;
      const blocks = db.prepare(`SELECT * FROM blocks WHERE space_id = ? ORDER BY position`).all(currentSpace);
      const sections = db.prepare(`SELECT * FROM sections WHERE space_id = ? ORDER BY position`).all(currentSpace);
      const id = generateId();
      db.prepare(`INSERT INTO deroulement_templates (id, space_id, name, description, data, created_by) VALUES (?, ?, ?, ?, ?, ?)`).run(
        id, currentSpace, name || 'Mon template', description || '', JSON.stringify({ blocks: blocks.map(serializeBlock), sections }), currentPseudo
      );
      socket.emit('template-saved', { id, name });
    });

    socket.on('load-deroulement-template', ({ templateId }) => {
      if (!currentSpace) return;
      if (isArchived(currentSpace)) return;
      const tpl = db.prepare(`SELECT * FROM deroulement_templates WHERE id = ?`).get(templateId);
      if (!tpl) return;
      const data = JSON.parse(tpl.data);
      const sectionMap = {};
      const tx = db.transaction(() => {
        for (const sec of (data.sections || [])) {
          const newId = generateId();
          sectionMap[sec.id] = newId;
          db.prepare(`INSERT INTO sections (id, space_id, title, position) VALUES (?, ?, ?, ?)`).run(newId, currentSpace, sec.title, sec.position);
        }
        for (const block of (data.blocks || [])) {
          const newId = generateId();
          const secId = block.section_id ? (sectionMap[block.section_id] || null) : null;
          db.prepare(`INSERT INTO blocks (id, space_id, section_id, title, intention, description, block_type, duration_minutes, format, format_detail, material, deliverable, created_by, position) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`).run(
            newId, currentSpace, secId, block.title, block.intention, block.description || '', block.block_type, block.duration_minutes, block.format || 'pleniere', block.format_detail || '', block.material || '', block.deliverable || '', currentPseudo, block.position
          );
        }
      });
      tx();
      // Reload all data for the space
      const blocks = db.prepare(`SELECT * FROM blocks WHERE space_id = ? ORDER BY position`).all(currentSpace).map(serializeBlock);
      const sections = db.prepare(`SELECT * FROM sections WHERE space_id = ? ORDER BY position`).all(currentSpace);
      io.to(currentSpace).emit('deroulement-loaded', { blocks, sections });
    });

    socket.on('list-templates', () => {
      const system = db.prepare(`SELECT id, name, description, is_system, created_at FROM deroulement_templates WHERE is_system = 1 ORDER BY name`).all();
      const personal = currentSpace ? db.prepare(`SELECT id, name, description, created_at FROM deroulement_templates WHERE space_id = ? AND is_system = 0 ORDER BY created_at DESC`).all(currentSpace) : [];
      socket.emit('templates-list', { system, personal });
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
      // Clean up timer if this was the last user in the space
      const remaining = spaceParticipants.get(currentSpace);
      if (remaining && remaining.size === 0) {
        const timer = spaceTimers.get(currentSpace);
        if (timer?.interval) clearInterval(timer.interval);
        spaceTimers.delete(currentSpace);
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
