// Planning v2 : fiche du temps collectif, jours et séquences.
// Les séquences vivent dans un jour (day_id) ou sur le banc (day_id NULL, « à placer »).
// Les horaires ne sont pas stockés : ils se déduisent de l'ordre et des durées.

export const KINDS = ['collectif', 'apport', 'pause'];
export const BLOCK_TYPES = ['ouverture', 'icebreaker', 'production', 'exploration', 'debriefing', 'decision', 'pause', 'cloture', 'transition', 'energizer'];
export const PLANNING_COLUMNS = ['sequence', 'intention', 'format', 'production'];
export const CHARTES = ['insuffle', 'academie'];
export const DIAMOND = ['', 'diverger', 'groan', 'converger'];

export const META_FIELDS = {
  question: 400, intention: 1000, charte: 20, lieu: 200, participants: 50, accueil: 200,
  reference: 200, footer_note: 400, event_type: 40, situation: 40, orientation: 20, scale_question: 300,
  client_name: 200, sponsor: 200, facilitator: 200, session_date: 40, session_date_end: 40,
};

export const SEQ_TEXT_FIELDS = {
  title: 200, intention: 1000, description: 5000, format: 600, production: 600,
  material: 1000, deliverable: 600, attention_note: 1000, roles: 1000, facilitator_notes: 5000,
  method_key: 60,
};

const TIME_RE = /^([01]\d|2[0-3]):[0-5]\d$/;

export function clampText(v, max) {
  if (v === null || v === undefined) return '';
  return String(v).slice(0, max);
}

export function toDuration(v, fallback = 15) {
  const n = parseInt(v, 10);
  if (!Number.isFinite(n)) return fallback;
  return Math.max(5, Math.min(600, n));
}

export function isTime(v) { return typeof v === 'string' && TIME_RE.test(v); }

export function sanitizeMeta(input = {}) {
  const out = {};
  for (const [k, max] of Object.entries(META_FIELDS)) {
    if (input[k] === undefined) continue;
    out[k] = clampText(input[k], max);
  }
  if (out.charte !== undefined && !CHARTES.includes(out.charte)) out.charte = 'insuffle';
  if (out.orientation !== undefined && !['auto', 'portrait', 'paysage'].includes(out.orientation)) out.orientation = 'auto';
  if (input.slot_minutes !== undefined) {
    const n = parseInt(input.slot_minutes, 10);
    out.slot_minutes = [5, 10, 15, 30].includes(n) ? n : 15;
  }
  if (input.planning_columns !== undefined) {
    const cols = Array.isArray(input.planning_columns) ? input.planning_columns.filter(c => PLANNING_COLUMNS.includes(c)) : [];
    const withSeq = cols.includes('sequence') ? cols : ['sequence', ...cols];
    out.planning_columns = JSON.stringify(PLANNING_COLUMNS.filter(c => withSeq.includes(c)).slice(0, 4));
  }
  return out;
}

export function sanitizeEncadre(e) {
  if (!e || typeof e !== 'object') return '';
  const items = Array.isArray(e.items) ? e.items.slice(0, 12).map(i => ({
    label: clampText(i?.label, 120), texte: clampText(i?.texte, 400),
  })) : [];
  const titre = clampText(e.titre, 200);
  if (!titre && items.length === 0) return '';
  const colonnes = [1, 2].includes(Number(e.colonnes)) ? Number(e.colonnes) : 1;
  return JSON.stringify({ titre, items, colonnes });
}

export function sanitizeDay(input = {}) {
  const out = {};
  if (input.label !== undefined) out.label = clampText(input.label, 80);
  if (input.date !== undefined) out.date = clampText(input.date, 40);
  if (input.start_time !== undefined && isTime(input.start_time)) out.start_time = input.start_time;
  if (input.end_time !== undefined && isTime(input.end_time)) out.end_time = input.end_time;
  if (input.encadre !== undefined) out.encadre = sanitizeEncadre(input.encadre);
  return out;
}

export function sanitizeSequence(input = {}) {
  const out = {};
  for (const [k, max] of Object.entries(SEQ_TEXT_FIELDS)) {
    if (input[k] !== undefined) out[k] = clampText(input[k], max);
  }
  if (input.duration_minutes !== undefined) out.duration_minutes = toDuration(input.duration_minutes);
  if (input.kind !== undefined) out.kind = KINDS.includes(input.kind) ? input.kind : 'collectif';
  if (input.block_type !== undefined) out.block_type = BLOCK_TYPES.includes(input.block_type) ? input.block_type : 'production';
  if (input.attention_flag !== undefined) out.attention_flag = input.attention_flag ? 1 : 0;
  if (input.collapsed !== undefined) out.collapsed = input.collapsed ? 1 : 0;
  if (input.diamond !== undefined) out.diamond = DIAMOND.includes(input.diamond) ? input.diamond : '';
  if (out.kind === 'pause' && input.block_type === undefined) out.block_type = 'pause';
  return out;
}

export function serializeDay(d) {
  let encadre = null;
  if (d.encadre) { try { encadre = JSON.parse(d.encadre); } catch { encadre = null; } }
  return { ...d, encadre };
}

export function serializeSequence(b) {
  return {
    ...b,
    kind: b.kind || (b.block_type === 'pause' ? 'pause' : 'collectif'),
    linked_axes: safeJson(b.linked_axes, []),
    linked_card_ids: safeJson(b.linked_card_ids, []),
    attention_flag: !!b.attention_flag,
    collapsed: !!b.collapsed,
  };
}

export function serializePlanningMeta(space) {
  return {
    question: space.question || '',
    intention: space.intention || '',
    charte: space.charte || 'insuffle',
    lieu: space.lieu || '',
    participants: space.participants || '',
    accueil: space.accueil || '',
    reference: space.reference || '',
    footer_note: space.footer_note || '',
    event_type: space.event_type || '',
    scale_question: space.scale_question || '',
    situation: space.situation || '',
    slot_minutes: space.slot_minutes || 15,
    orientation: space.orientation || 'auto',
    planning_columns: safeJson(space.planning_columns, PLANNING_COLUMNS),
  };
}

function safeJson(v, fallback) {
  if (Array.isArray(v) || (v && typeof v === 'object')) return v;
  try { return v ? JSON.parse(v) : fallback; } catch { return fallback; }
}

export function createPlanningStore(db, generateId) {
  const q = {
    days: db.prepare(`SELECT * FROM agenda_days WHERE space_id = ? ORDER BY position, created_at`),
    blocks: db.prepare(`SELECT * FROM blocks WHERE space_id = ? ORDER BY position, created_at`),
    space: db.prepare(`SELECT * FROM spaces WHERE id = ?`),
    dayOf: db.prepare(`SELECT * FROM agenda_days WHERE id = ? AND space_id = ?`),
    seqOf: db.prepare(`SELECT * FROM blocks WHERE id = ? AND space_id = ?`),
    seqsIn: db.prepare(`SELECT id FROM blocks WHERE space_id = ? AND day_id IS ? ORDER BY position, created_at`),
    setPos: db.prepare(`UPDATE blocks SET position = ?, day_id = ? WHERE id = ? AND space_id = ?`),
  };

  function state(spaceId) {
    const space = q.space.get(spaceId);
    if (!space) return null;
    return {
      planning: serializePlanningMeta(space),
      agendaDays: q.days.all(spaceId).map(serializeDay),
      blocks: q.blocks.all(spaceId).map(serializeSequence),
    };
  }

  function orderedIds(spaceId, dayId) {
    return q.seqsIn.all(spaceId, dayId ?? null).map(r => r.id);
  }

  function writeOrder(spaceId, dayId, ids) {
    ids.forEach((id, i) => q.setPos.run(i, dayId ?? null, id, spaceId));
  }

  function updateMeta(spaceId, fields) {
    const clean = sanitizeMeta(fields);
    const keys = Object.keys(clean);
    if (keys.length === 0) return false;
    db.prepare(`UPDATE spaces SET ${keys.map(k => `${k} = ?`).join(', ')}, updated_at = datetime('now') WHERE id = ?`)
      .run(...keys.map(k => clean[k]), spaceId);
    return true;
  }

  const ID_RE = /^[\w-]{1,40}$/;
  function reuseId(table, wanted) {
    if (!wanted || !ID_RE.test(wanted)) return generateId();
    return db.prepare(`SELECT id FROM ${table} WHERE id = ?`).get(wanted) ? generateId() : wanted;
  }

  function createDay(spaceId, input = {}, keepId = false) {
    const days = q.days.all(spaceId);
    const last = days[days.length - 1];
    const clean = sanitizeDay(input);
    const id = keepId ? reuseId('agenda_days', input.id) : generateId();
    const position = days.length;
    db.prepare(`INSERT INTO agenda_days (id, space_id, day_number, label, date, start_time, end_time, encadre, position) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`).run(
      id, spaceId, position + 1,
      clean.label ?? `Jour ${position + 1}`,
      clean.date ?? '',
      clean.start_time ?? last?.start_time ?? '09:00',
      clean.end_time ?? last?.end_time ?? '17:00',
      clean.encadre ?? '',
      position
    );
    return id;
  }

  function updateDay(spaceId, dayId, input) {
    const clean = sanitizeDay(input);
    const keys = Object.keys(clean);
    if (keys.length === 0 || !q.dayOf.get(dayId, spaceId)) return false;
    db.prepare(`UPDATE agenda_days SET ${keys.map(k => `${k} = ?`).join(', ')} WHERE id = ? AND space_id = ?`)
      .run(...keys.map(k => clean[k]), dayId, spaceId);
    return true;
  }

  function renumberDays(spaceId) {
    q.days.all(spaceId).forEach((d, i) => {
      db.prepare(`UPDATE agenda_days SET position = ?, day_number = ? WHERE id = ?`).run(i, i + 1, d.id);
    });
  }

  // keepSequences : true = les séquences partent sur le banc ; false = supprimées
  function deleteDay(spaceId, dayId, keepSequences = true) {
    if (!q.dayOf.get(dayId, spaceId)) return false;
    if (keepSequences) {
      const bench = orderedIds(spaceId, null);
      const moved = orderedIds(spaceId, dayId);
      writeOrder(spaceId, null, [...bench, ...moved]);
    } else {
      db.prepare(`DELETE FROM blocks WHERE day_id = ? AND space_id = ?`).run(dayId, spaceId);
    }
    db.prepare(`DELETE FROM agenda_slots WHERE day_id = ?`).run(dayId);
    db.prepare(`DELETE FROM agenda_days WHERE id = ? AND space_id = ?`).run(dayId, spaceId);
    renumberDays(spaceId);
    return true;
  }

  function moveDay(spaceId, dayId, toIndex) {
    const ids = q.days.all(spaceId).map(d => d.id);
    const from = ids.indexOf(dayId);
    if (from < 0) return false;
    ids.splice(from, 1);
    ids.splice(Math.max(0, Math.min(ids.length, toIndex)), 0, dayId);
    ids.forEach((id, i) => db.prepare(`UPDATE agenda_days SET position = ?, day_number = ? WHERE id = ?`).run(i, i + 1, id));
    return true;
  }

  function duplicateDay(spaceId, dayId) {
    const day = q.dayOf.get(dayId, spaceId);
    if (!day) return false;
    const newDay = createDay(spaceId, { label: `${day.label || 'Jour'} (copie)`, start_time: day.start_time, end_time: day.end_time, date: '', encadre: day.encadre ? JSON.parse(day.encadre) : undefined });
    for (const id of orderedIds(spaceId, dayId)) duplicateSequence(spaceId, id, newDay, false);
    return newDay;
  }

  function insertSequence(spaceId, dayId, index, input, author = '', keepId = false) {
    const clean = sanitizeSequence(input);
    if (dayId && !q.dayOf.get(dayId, spaceId)) dayId = null;
    const id = keepId ? reuseId('blocks', input.id) : generateId();
    const row = {
      title: '', intention: '', description: '', format: '', production: '', material: '', deliverable: '',
      attention_note: '', roles: '', facilitator_notes: '', method_key: '', diamond: '',
      kind: 'collectif', block_type: 'production', duration_minutes: 15, attention_flag: 0, ...clean,
    };
    if (!row.title.trim()) row.title = row.kind === 'pause' ? 'Pause' : 'Nouvelle séquence';
    db.prepare(`INSERT INTO blocks (id, space_id, day_id, title, intention, description, block_type, kind, duration_minutes, format, production, material, deliverable, attention_flag, attention_note, roles, facilitator_notes, method_key, diamond, created_by, position)
      VALUES (@id, @space_id, @day_id, @title, @intention, @description, @block_type, @kind, @duration_minutes, @format, @production, @material, @deliverable, @attention_flag, @attention_note, @roles, @facilitator_notes, @method_key, @diamond, @created_by, 9999)`)
      .run({ ...row, id, space_id: spaceId, day_id: dayId ?? null, created_by: clampText(author, 50) });
    const ids = orderedIds(spaceId, dayId).filter(x => x !== id);
    const at = index === undefined || index === null ? ids.length : Math.max(0, Math.min(ids.length, index));
    ids.splice(at, 0, id);
    writeOrder(spaceId, dayId, ids);
    return id;
  }

  function updateSequence(spaceId, seqId, input) {
    const clean = sanitizeSequence(input);
    const keys = Object.keys(clean);
    if (keys.length === 0 || !q.seqOf.get(seqId, spaceId)) return false;
    db.prepare(`UPDATE blocks SET ${keys.map(k => `${k} = ?`).join(', ')}, updated_at = datetime('now') WHERE id = ? AND space_id = ?`)
      .run(...keys.map(k => clean[k]), seqId, spaceId);
    return true;
  }

  function deleteSequence(spaceId, seqId) {
    const seq = q.seqOf.get(seqId, spaceId);
    if (!seq) return false;
    db.prepare(`DELETE FROM blocks WHERE id = ?`).run(seqId);
    writeOrder(spaceId, seq.day_id, orderedIds(spaceId, seq.day_id));
    return true;
  }

  function moveSequence(spaceId, seqId, toDayId, toIndex) {
    const seq = q.seqOf.get(seqId, spaceId);
    if (!seq) return false;
    if (toDayId && !q.dayOf.get(toDayId, spaceId)) return false;
    const target = toDayId ?? null;
    const from = orderedIds(spaceId, seq.day_id).filter(x => x !== seqId);
    if ((seq.day_id ?? null) !== target) writeOrder(spaceId, seq.day_id, from);
    const ids = (seq.day_id ?? null) === target ? from : orderedIds(spaceId, target).filter(x => x !== seqId);
    const at = toIndex === undefined || toIndex === null ? ids.length : Math.max(0, Math.min(ids.length, toIndex));
    ids.splice(at, 0, seqId);
    writeOrder(spaceId, target, ids);
    return true;
  }

  function duplicateSequence(spaceId, seqId, toDayId, suffix = true) {
    const seq = q.seqOf.get(seqId, spaceId);
    if (!seq) return false;
    const dayId = toDayId === undefined ? seq.day_id : toDayId;
    const ids = orderedIds(spaceId, dayId);
    const index = dayId === seq.day_id ? ids.indexOf(seqId) + 1 : ids.length;
    return insertSequence(spaceId, dayId, index, { ...serializeSequence(seq), title: suffix ? `${seq.title} (copie)` : seq.title }, seq.created_by);
  }

  // Remplace tout le planning (annuler, import JSON, modèle en mode remplacement)
  function replaceAll(spaceId, data, author = '') {
    db.prepare(`DELETE FROM agenda_slots WHERE space_id = ?`).run(spaceId);
    db.prepare(`DELETE FROM blocks WHERE space_id = ?`).run(spaceId);
    db.prepare(`DELETE FROM agenda_days WHERE space_id = ?`).run(spaceId);
    appendAll(spaceId, data, author, true);
  }

  // Ajoute des jours et des séquences (modèle en mode ajout). Accepte deux formes :
  //  - { days: [{ ..., sequences: [...] }], bench: [...] }   (modèles, import)
  //  - { agendaDays: [...], blocks: [...] }                   (état client, annuler)
  function appendAll(spaceId, data = {}, author = '', keepIds = false) {
    if (data.planning) updateMeta(spaceId, data.planning);
    let days = Array.isArray(data.days) ? data.days : null;
    let bench = Array.isArray(data.bench) ? data.bench : [];
    if (!days && Array.isArray(data.agendaDays)) {
      const blocks = Array.isArray(data.blocks) ? [...data.blocks].sort((a, b) => (a.position ?? 0) - (b.position ?? 0)) : [];
      days = [...data.agendaDays].sort((a, b) => (a.position ?? 0) - (b.position ?? 0))
        .map(d => ({ ...d, sequences: blocks.filter(b => b.day_id === d.id) }));
      const dayIds = new Set(data.agendaDays.map(d => d.id));
      bench = blocks.filter(b => !b.day_id || !dayIds.has(b.day_id));
    }
    for (const d of (days || []).slice(0, 14)) {
      const dayId = createDay(spaceId, d, keepIds);
      for (const seq of (d.sequences || []).slice(0, 80)) insertSequence(spaceId, dayId, null, seq, seq.created_by || author, keepIds);
    }
    for (const seq of bench.slice(0, 80)) insertSequence(spaceId, null, null, seq, seq.created_by || author, keepIds);
  }

  return {
    state, updateMeta, createDay, updateDay, deleteDay, moveDay, duplicateDay,
    insertSequence, updateSequence, deleteSequence, moveSequence, duplicateSequence,
    replaceAll, appendAll,
  };
}

// Convertit un ancien modèle (v1 : blocks + sections) au format v2
export function templateToV2(data) {
  if (data?.version === 2 || Array.isArray(data?.days)) return data;
  const blocks = [...(data?.blocks || [])].sort((a, b) => (a.position ?? 0) - (b.position ?? 0));
  return {
    version: 2,
    days: [{ label: 'Jour 1', start_time: '09:00', end_time: '17:00', sequences: blocks.map(b => ({ ...b, kind: b.block_type === 'pause' ? 'pause' : (b.kind || 'collectif') })) }],
  };
}
