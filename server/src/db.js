import Database from 'better-sqlite3';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { mkdirSync } from 'fs';
import { SYSTEM_TEMPLATES } from './templates.js';
import { refreshDemo } from './demo.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

export function createDatabase(dbPath) {
  if (!dbPath) {
    const dataDir = join(__dirname, '..', 'data');
    mkdirSync(dataDir, { recursive: true });
    dbPath = join(dataDir, 'cadrage.db');
  }
  const d = new Database(dbPath);
  d.pragma('journal_mode = WAL');
  d.pragma('foreign_keys = ON');
  initSchema(d);
  return d;
}

function initSchema(d) {
  d.exec(`
  CREATE TABLE IF NOT EXISTS spaces (
    id TEXT PRIMARY KEY,
    client_name TEXT DEFAULT '',
    sponsor TEXT DEFAULT '',
    facilitator TEXT DEFAULT '',
    session_date TEXT DEFAULT '',
    welcome_message TEXT DEFAULT '',
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now')),
    archived INTEGER DEFAULT 0,
    deleted INTEGER DEFAULT 0,
    deleted_at TEXT,
    plan TEXT DEFAULT 'free',
    facilitator_ids TEXT DEFAULT '[]'
  );

  CREATE TABLE IF NOT EXISTS cards (
    id TEXT PRIMARY KEY,
    space_id TEXT NOT NULL,
    phase TEXT NOT NULL,
    column_key TEXT NOT NULL,
    content TEXT NOT NULL,
    author TEXT NOT NULL,
    author_color TEXT NOT NULL,
    position INTEGER DEFAULT 0,
    tags TEXT DEFAULT '[]',
    reactions TEXT DEFAULT '{}',
    marked_discuss INTEGER DEFAULT 0,
    hidden INTEGER DEFAULT 0,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (space_id) REFERENCES spaces(id)
  );

  CREATE TABLE IF NOT EXISTS comments (
    id TEXT PRIMARY KEY,
    card_id TEXT NOT NULL,
    space_id TEXT NOT NULL,
    author TEXT NOT NULL,
    author_color TEXT NOT NULL,
    content TEXT NOT NULL,
    created_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (card_id) REFERENCES cards(id) ON DELETE CASCADE,
    FOREIGN KEY (space_id) REFERENCES spaces(id)
  );

  CREATE TABLE IF NOT EXISTS axes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    space_id TEXT NOT NULL,
    axis_key TEXT NOT NULL,
    pseudo TEXT NOT NULL,
    color TEXT NOT NULL,
    position INTEGER,
    explanation TEXT DEFAULT '',
    updated_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (space_id) REFERENCES spaces(id),
    UNIQUE(space_id, axis_key, pseudo)
  );

  CREATE TABLE IF NOT EXISTS axes_final (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    space_id TEXT NOT NULL,
    axis_key TEXT NOT NULL,
    position INTEGER NOT NULL,
    locked INTEGER DEFAULT 0,
    updated_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (space_id) REFERENCES spaces(id),
    UNIQUE(space_id, axis_key)
  );

  CREATE TABLE IF NOT EXISTS snapshots (
    id TEXT PRIMARY KEY,
    space_id TEXT NOT NULL,
    name TEXT NOT NULL,
    data TEXT NOT NULL,
    created_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (space_id) REFERENCES spaces(id)
  );

  CREATE TABLE IF NOT EXISTS activity_log (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    space_id TEXT NOT NULL,
    pseudo TEXT NOT NULL,
    action TEXT NOT NULL,
    target TEXT DEFAULT '',
    details TEXT DEFAULT '',
    created_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (space_id) REFERENCES spaces(id)
  );

  CREATE TABLE IF NOT EXISTS phase_state (
    space_id TEXT NOT NULL,
    phase TEXT NOT NULL,
    locked INTEGER DEFAULT 0,
    hidden INTEGER DEFAULT 0,
    PRIMARY KEY (space_id, phase),
    FOREIGN KEY (space_id) REFERENCES spaces(id)
  );

  CREATE TABLE IF NOT EXISTS votes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    space_id TEXT NOT NULL,
    card_id TEXT NOT NULL,
    pseudo TEXT NOT NULL,
    FOREIGN KEY (space_id) REFERENCES spaces(id),
    FOREIGN KEY (card_id) REFERENCES cards(id) ON DELETE CASCADE,
    UNIQUE(space_id, card_id, pseudo)
  );

  CREATE INDEX IF NOT EXISTS idx_cards_space ON cards(space_id);
  CREATE INDEX IF NOT EXISTS idx_comments_card ON comments(card_id);
  CREATE INDEX IF NOT EXISTS idx_axes_space ON axes(space_id);
  CREATE INDEX IF NOT EXISTS idx_activity_space ON activity_log(space_id);
  CREATE INDEX IF NOT EXISTS idx_votes_card ON votes(card_id);

  -- ===================== DÉROULÉ =====================

  CREATE TABLE IF NOT EXISTS blocks (
    id TEXT PRIMARY KEY,
    space_id TEXT NOT NULL,
    section_id TEXT,
    title TEXT NOT NULL DEFAULT '',
    intention TEXT NOT NULL DEFAULT '',
    description TEXT DEFAULT '',
    block_type TEXT NOT NULL DEFAULT 'production',
    duration_minutes INTEGER DEFAULT 30,
    format TEXT DEFAULT 'pleniere',
    format_detail TEXT DEFAULT '',
    material TEXT DEFAULT '',
    deliverable TEXT DEFAULT '',
    attention_flag INTEGER DEFAULT 0,
    attention_note TEXT DEFAULT '',
    linked_axes TEXT DEFAULT '[]',
    linked_card_ids TEXT DEFAULT '[]',
    status TEXT DEFAULT 'active',
    created_by TEXT DEFAULT '',
    position INTEGER DEFAULT 0,
    collapsed INTEGER DEFAULT 0,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (space_id) REFERENCES spaces(id)
  );

  CREATE TABLE IF NOT EXISTS block_comments (
    id TEXT PRIMARY KEY,
    block_id TEXT NOT NULL,
    space_id TEXT NOT NULL,
    author TEXT NOT NULL,
    author_color TEXT NOT NULL,
    content TEXT NOT NULL,
    created_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (block_id) REFERENCES blocks(id) ON DELETE CASCADE,
    FOREIGN KEY (space_id) REFERENCES spaces(id)
  );

  CREATE TABLE IF NOT EXISTS sections (
    id TEXT PRIMARY KEY,
    space_id TEXT NOT NULL,
    title TEXT NOT NULL DEFAULT '',
    position INTEGER DEFAULT 0,
    collapsed INTEGER DEFAULT 0,
    created_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (space_id) REFERENCES spaces(id)
  );

  -- ===================== AGENDA =====================

  CREATE TABLE IF NOT EXISTS agenda_days (
    id TEXT PRIMARY KEY,
    space_id TEXT NOT NULL,
    day_number INTEGER NOT NULL DEFAULT 1,
    date TEXT DEFAULT '',
    start_time TEXT NOT NULL DEFAULT '09:00',
    end_time TEXT NOT NULL DEFAULT '17:30',
    position INTEGER DEFAULT 0,
    created_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (space_id) REFERENCES spaces(id)
  );

  CREATE TABLE IF NOT EXISTS agenda_slots (
    id TEXT PRIMARY KEY,
    space_id TEXT NOT NULL,
    day_id TEXT NOT NULL,
    block_id TEXT,
    slot_type TEXT NOT NULL DEFAULT 'block',
    title TEXT DEFAULT '',
    start_time TEXT NOT NULL,
    duration_minutes INTEGER NOT NULL DEFAULT 30,
    position INTEGER DEFAULT 0,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (space_id) REFERENCES spaces(id),
    FOREIGN KEY (day_id) REFERENCES agenda_days(id) ON DELETE CASCADE,
    FOREIGN KEY (block_id) REFERENCES blocks(id) ON DELETE SET NULL
  );

  -- ===================== TEMPLATES DÉROULÉ =====================

  CREATE TABLE IF NOT EXISTS deroulement_templates (
    id TEXT PRIMARY KEY,
    space_id TEXT,
    name TEXT NOT NULL DEFAULT '',
    description TEXT DEFAULT '',
    is_system INTEGER DEFAULT 0,
    data TEXT NOT NULL DEFAULT '{}',
    created_by TEXT DEFAULT '',
    created_at TEXT DEFAULT (datetime('now'))
  );

  CREATE INDEX IF NOT EXISTS idx_blocks_space ON blocks(space_id);
  CREATE INDEX IF NOT EXISTS idx_block_comments_block ON block_comments(block_id);
  CREATE INDEX IF NOT EXISTS idx_sections_space ON sections(space_id);
  CREATE INDEX IF NOT EXISTS idx_agenda_days_space ON agenda_days(space_id);
  CREATE INDEX IF NOT EXISTS idx_agenda_slots_day ON agenda_slots(day_id);
  CREATE INDEX IF NOT EXISTS idx_agenda_slots_space ON agenda_slots(space_id);
`);

  // Migrations — add columns if they don't exist
  const cols = d.prepare(`PRAGMA table_info(spaces)`).all().map(c => c.name);
  if (!cols.includes('session_date_end')) {
    d.exec(`ALTER TABLE spaces ADD COLUMN session_date_end TEXT DEFAULT ''`);
  }
  if (!cols.includes('hide_onboarding')) {
    d.exec(`ALTER TABLE spaces ADD COLUMN hide_onboarding INTEGER DEFAULT 0`);
  }
  if (!cols.includes('hidden_columns')) {
    d.exec(`ALTER TABLE spaces ADD COLUMN hidden_columns TEXT DEFAULT '[]'`);
  }

  // Planning v2 : fiche du temps collectif (question-titre, intention, charte...)
  addColumns(d, 'spaces', {
    question: `TEXT DEFAULT ''`,
    intention: `TEXT DEFAULT ''`,
    charte: `TEXT DEFAULT 'insuffle'`,
    lieu: `TEXT DEFAULT ''`,
    participants: `TEXT DEFAULT ''`,
    accueil: `TEXT DEFAULT ''`,
    reference: `TEXT DEFAULT ''`,
    footer_note: `TEXT DEFAULT ''`,
    event_type: `TEXT DEFAULT ''`,
    situation: `TEXT DEFAULT ''`,
    slot_minutes: `INTEGER DEFAULT 15`,
    planning_columns: `TEXT DEFAULT '["sequence","intention","format","production"]'`,
    orientation: `TEXT DEFAULT 'auto'`,
  });
  addColumns(d, 'agenda_days', {
    label: `TEXT DEFAULT ''`,
    encadre: `TEXT DEFAULT ''`,
  });
  addColumns(d, 'blocks', {
    day_id: `TEXT`,
    kind: `TEXT DEFAULT 'collectif'`,
    production: `TEXT DEFAULT ''`,
    method_key: `TEXT DEFAULT ''`,
    roles: `TEXT DEFAULT ''`,
    facilitator_notes: `TEXT DEFAULT ''`,
  });
  addColumns(d, 'blocks', { diamond: `TEXT DEFAULT ''` });
  addColumns(d, 'spaces', { facilitator_keys: `TEXT DEFAULT '{}'` });
  addColumns(d, 'spaces', {
    scale_question: `TEXT DEFAULT ''`,
    votes_open: `TEXT DEFAULT '[]'`,
  });

  // Mesure du succès : critères, suite (actions), votes du groupe, regard du facilitateur
  d.exec(`
  CREATE TABLE IF NOT EXISTS success_criteria (
    id TEXT PRIMARY KEY,
    space_id TEXT NOT NULL,
    statement TEXT NOT NULL DEFAULT '',
    indicator TEXT DEFAULT '',
    horizon TEXT DEFAULT 'fin',
    target TEXT DEFAULT '',
    status TEXT DEFAULT 'a_mesurer',
    result_note TEXT DEFAULT '',
    position INTEGER DEFAULT 0,
    created_by TEXT DEFAULT '',
    updated_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (space_id) REFERENCES spaces(id)
  );
  CREATE TABLE IF NOT EXISTS success_actions (
    id TEXT PRIMARY KEY,
    space_id TEXT NOT NULL,
    what TEXT NOT NULL DEFAULT '',
    who TEXT DEFAULT '',
    horizon TEXT DEFAULT '72h',
    due_date TEXT DEFAULT '',
    status TEXT DEFAULT 'a_faire',
    note TEXT DEFAULT '',
    position INTEGER DEFAULT 0,
    created_by TEXT DEFAULT '',
    updated_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (space_id) REFERENCES spaces(id)
  );
  CREATE TABLE IF NOT EXISTS success_votes (
    space_id TEXT NOT NULL,
    kind TEXT NOT NULL,
    pseudo TEXT NOT NULL,
    value INTEGER NOT NULL,
    comment TEXT DEFAULT '',
    updated_at TEXT DEFAULT (datetime('now')),
    PRIMARY KEY (space_id, kind, pseudo),
    FOREIGN KEY (space_id) REFERENCES spaces(id)
  );
  CREATE TABLE IF NOT EXISTS facilitator_review (
    space_id TEXT NOT NULL,
    criterion TEXT NOT NULL,
    score INTEGER DEFAULT 0,
    note TEXT DEFAULT '',
    PRIMARY KEY (space_id, criterion),
    FOREIGN KEY (space_id) REFERENCES spaces(id)
  );
  CREATE INDEX IF NOT EXISTS idx_success_criteria_space ON success_criteria(space_id);
  CREATE INDEX IF NOT EXISTS idx_success_actions_space ON success_actions(space_id);
  `);

  d.exec(`CREATE TABLE IF NOT EXISTS migrations (key TEXT PRIMARY KEY, applied_at TEXT DEFAULT (datetime('now')))`);


  runOnce(d, 'planning-v2', () => migrateAgendaToPlanning(d));
  runOnce(d, 'templates-v2', () => {
    d.prepare(`DELETE FROM deroulement_templates WHERE is_system = 1`).run();
  });
  seedSystemTemplates(d);

  // La démo de référence, reconstruite à chaque démarrage (dates à jour)
  refreshDemo(d);
}

function addColumns(d, table, defs) {
  const existing = d.prepare(`PRAGMA table_info(${table})`).all().map(c => c.name);
  for (const [name, def] of Object.entries(defs)) {
    if (!existing.includes(name)) d.exec(`ALTER TABLE ${table} ADD COLUMN ${name} ${def}`);
  }
}

function runOnce(d, key, fn) {
  if (d.prepare(`SELECT key FROM migrations WHERE key = ?`).get(key)) return;
  d.transaction(() => {
    fn();
    d.prepare(`INSERT INTO migrations (key) VALUES (?)`).run(key);
  })();
}

const LEGACY_FORMATS = {
  pleniere: 'Plénière', binomes: 'Binômes', trinomes: 'Trinômes',
  'sous-groupes': 'Sous-groupes', individuel: 'Individuel',
};

// Agenda v1 (créneaux séparés des blocs) -> planning v2 (les séquences vivent dans les jours)
export function migrateAgendaToPlanning(d) {
  let n = 0;
  const newId = () => `mig${Date.now().toString(36)}${(n++).toString(36)}`;

  const blocks = d.prepare(`SELECT id, block_type, format, format_detail FROM blocks`).all();
  const upd = d.prepare(`UPDATE blocks SET format = ?, kind = ? WHERE id = ?`);
  for (const b of blocks) {
    const base = LEGACY_FORMATS[b.format] ?? b.format ?? '';
    const format = b.format_detail ? (base && base !== 'Sous-groupes' ? `${base}, ${b.format_detail}` : b.format_detail) : base;
    upd.run(format, b.block_type === 'pause' ? 'pause' : 'collectif', b.id);
  }

  const days = d.prepare(`SELECT * FROM agenda_days ORDER BY space_id, position`).all();
  const slotsOf = d.prepare(`SELECT * FROM agenda_slots WHERE day_id = ? ORDER BY position`);
  const place = d.prepare(`UPDATE blocks SET day_id = ?, position = ?, duration_minutes = ? WHERE id = ? AND day_id IS NULL`);
  const insertPause = d.prepare(`INSERT INTO blocks (id, space_id, day_id, title, intention, block_type, kind, duration_minutes, position) VALUES (?, ?, ?, ?, '', 'pause', 'pause', ?, ?)`);
  for (const day of days) {
    let pos = 0;
    for (const slot of slotsOf.all(day.id)) {
      if (slot.block_id) {
        const r = place.run(day.id, pos, slot.duration_minutes, slot.block_id);
        if (r.changes) pos++;
        else {
          // Bloc déjà placé ailleurs (planifié deux fois) : on le copie plutôt que de perdre le créneau
          const src = d.prepare(`SELECT * FROM blocks WHERE id = ?`).get(slot.block_id);
          if (src) {
            d.prepare(`INSERT INTO blocks (id, space_id, day_id, title, intention, description, block_type, kind, duration_minutes, format, material, deliverable, position)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`).run(newId(), src.space_id, day.id, src.title, src.intention, src.description, src.block_type, src.kind || 'collectif', slot.duration_minutes, src.format, src.material, src.deliverable, pos++);
          }
        }
      } else {
        insertPause.run(newId(), day.space_id, day.id, slot.title || (slot.slot_type === 'buffer' ? 'Marge' : 'Pause'), slot.duration_minutes, pos++);
      }
    }
    d.prepare(`UPDATE agenda_days SET label = ? WHERE id = ? AND (label IS NULL OR label = '')`).run(`Jour ${day.day_number}`, day.id);
  }
}

function seedSystemTemplates(d) {
  const stmt = d.prepare(`INSERT OR REPLACE INTO deroulement_templates (id, name, description, is_system, data, created_by) VALUES (?, ?, ?, 1, ?, 'Insuffle')`);
  for (const t of SYSTEM_TEMPLATES) {
    stmt.run(t.id, t.name, t.description, JSON.stringify({ version: 2, ...t.data }));
  }
}


const db = createDatabase();
export default db;
