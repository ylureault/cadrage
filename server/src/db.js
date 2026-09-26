import Database from 'better-sqlite3';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { mkdirSync } from 'fs';
import { SYSTEM_TEMPLATES } from './templates.js';

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

  // Seed demo board (v1 data, migrated just after)
  seedDemoBoard(d);

  runOnce(d, 'planning-v2', () => migrateAgendaToPlanning(d));
  runOnce(d, 'templates-v2', () => {
    d.prepare(`DELETE FROM deroulement_templates WHERE is_system = 1`).run();
  });
  runOnce(d, 'demo-v2', () => upgradeDemo(d));
  runOnce(d, 'demo-v3', () => polishDemo(d));
  runOnce(d, 'demo-v4', () => {
    d.prepare(`UPDATE spaces SET welcome_message = ? WHERE id = '6AG_demo'`).run(
      'Bienvenue dans la démo. NovaPulse est un cas fictif, construit pour explorer l\'outil : le cadrage avec le sponsor, les 8 polarités, un déroulé sur deux jours et la mesure du succès.'
    );
  });

  seedSystemTemplates(d);
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
      } else {
        insertPause.run(newId(), day.space_id, day.id, slot.title || (slot.slot_type === 'buffer' ? 'Marge' : 'Pause'), slot.duration_minutes, pos++);
      }
    }
    d.prepare(`UPDATE agenda_days SET label = ? WHERE id = ? AND (label IS NULL OR label = '')`).run(`Jour ${day.day_number}`, day.id);
  }
}

function upgradeDemo(d) {
  const DEMO_ID = '6AG_demo';
  if (!d.prepare(`SELECT id FROM spaces WHERE id = ?`).get(DEMO_ID)) return;
  d.prepare(`UPDATE spaces SET question = ?, intention = ?, lieu = ?, participants = ?, accueil = ?, reference = ?, event_type = ?, situation = ?, facilitator = ? WHERE id = ?`).run(
    'Qui voulons-nous être à 45, sans perdre ce qui nous a fait tenir à 5 ?',
    'Que chacun reparte avec une charte culture co-écrite et une action qu\'il porte lui-même dans les 90 jours.',
    'Lieu à confirmer',
    '12',
    'café d\'accueil dès 8h45',
    'Séminaire de lancement · 2 jours',
    'seminaire',
    'traverser',
    'Yoan Lureault, Insuffle',
    DEMO_ID
  );
  const fix = d.prepare(`UPDATE blocks SET kind = ?, production = ? WHERE id = ?`);
  const plan = {
    'demo-blk-0': ['collectif', ''], 'demo-blk-1': ['collectif', ''],
    'demo-blk-2': ['collectif', 'Carte des forces et irritants'], 'demo-blk-4': ['collectif', '5 thèmes prioritaires'],
    'demo-blk-7': ['collectif', 'Récits du futur'], 'demo-blk-8': ['collectif', '5 principes candidats'],
    'demo-blk-11': ['apport', ''], 'demo-blk-12': ['collectif', 'Charte en comportements'],
    'demo-blk-14': ['collectif', 'Charte validée'], 'demo-blk-16': ['collectif', 'Plan 90 jours sur une page'],
    'demo-blk-17': ['collectif', 'Une action par personne'],
  };
  for (const [id, [kind, prod]] of Object.entries(plan)) fix.run(kind, prod, id);

  // Durées recalées sur la grille du quart d'heure, horaires 9h00 → 17h30 / 9h00 → 16h00
  const dur = {
    'demo-blk-0': 15, 'demo-blk-1': 30, 'demo-blk-2': 60, 'demo-blk-3': 15, 'demo-blk-4': 45, 'demo-blk-5': 75,
    'demo-blk-6': 15, 'demo-blk-7': 75, 'demo-blk-8': 45, 'demo-blk-9': 30,
    'demo-blk-10': 15, 'demo-blk-11': 15, 'demo-blk-12': 90, 'demo-blk-13': 15, 'demo-blk-14': 45, 'demo-blk-15': 60,
    'demo-blk-16': 60, 'demo-blk-17': 30, 'demo-blk-18': 30,
  };
  const setDur = d.prepare(`UPDATE blocks SET duration_minutes = ? WHERE id = ?`);
  for (const [id, m] of Object.entries(dur)) setDur.run(m, id);
  d.prepare(`UPDATE agenda_days SET end_time = '16:00' WHERE id = 'demo-day-1'`).run();
  d.prepare(`UPDATE agenda_days SET end_time = '15:00' WHERE id = 'demo-day-2'`).run();
  d.prepare(`INSERT INTO blocks (id, space_id, day_id, title, intention, block_type, kind, duration_minutes, position) VALUES ('demo-blk-19', ?, 'demo-day-1', 'Pause', '', 'pause', 'pause', 15, 7)`).run(DEMO_ID);
  // Réordonne le jour 1 : pause entre la vision et la galerie
  const order1 = ['demo-blk-0', 'demo-blk-1', 'demo-blk-2', 'demo-blk-3', 'demo-blk-4', 'demo-blk-5', 'demo-blk-6', 'demo-blk-7', 'demo-blk-19', 'demo-blk-8', 'demo-blk-9'];
  order1.forEach((id, i) => d.prepare(`UPDATE blocks SET position = ?, day_id = 'demo-day-1' WHERE id = ?`).run(i, id));
  d.prepare(`UPDATE blocks SET title = 'Clôture du jour 1' WHERE id = 'demo-blk-9'`).run();
  d.prepare(`UPDATE agenda_days SET encadre = ? WHERE id = 'demo-day-2'`).run(JSON.stringify({
    titre: 'Les 5 principes en chantier',
    items: [
      { label: '1.', texte: 'Principe issu de la galerie du jour 1, à confirmer.' },
      { label: '2.', texte: 'Principe issu de la galerie du jour 1, à confirmer.' },
      { label: '3.', texte: 'Principe issu de la galerie du jour 1, à confirmer.' },
    ],
  }));
}

// Démo : zéro tiret long, textes courts pour tenir dans la grille A4, succès renseigné
function polishDemo(d) {
  const DEMO_ID = '6AG_demo';
  if (!d.prepare(`SELECT id FROM spaces WHERE id = ?`).get(DEMO_ID)) return;
  d.prepare(`UPDATE spaces SET client_name = 'NovaPulse', reference = 'Séminaire de lancement · 2 jours', orientation = 'paysage', footer_note = 'Démo Insuffle. Cas fictif, pour explorer l''outil.' WHERE id = ?`).run(DEMO_ID);
  const seq = {
    'demo-blk-0': ['Ouverture', 'Oser parler vrai.', 'Mot de Camille.'],
    'demo-blk-1': ['Ma première semaine ici', 'Relier anciens et nouveaux par un récit.', 'Binômes anciens / nouveaux.'],
    'demo-blk-2': ['Forces et irritants', 'Voir ce qui fait tenir la boîte et ce qui coince, sans filtre.', 'Sous-groupes de 4 mélangés.'],
    'demo-blk-4': ['Restitution et convergence', 'Choisir les 5 thèmes qui comptent.', 'Plénière, vote par gommettes.'],
    'demo-blk-6': ['Rencontres éclair', 'Relancer l\'énergie.', 'Binômes successifs.'],
    'demo-blk-7': ['NovaPulse dans 3 ans', 'Raconter au passé la boîte qui a réussi sa croissance.', 'Groupes de 3, récit au passé.'],
    'demo-blk-8': ['Galerie des récits', 'Faire émerger les 5 non-négociables.', 'Récits au mur, lecture libre.'],
    'demo-blk-9': ['Clôture du jour 1', 'Poser un mot sur la journée.', 'Un mot chacun.'],
    'demo-blk-10': ['Réveil', 'Se remettre en mouvement.', 'Debout.'],
    'demo-blk-11': ['Le cap du jour 2', 'Viser l\'action.', 'Apport court.'],
    'demo-blk-12': ['La charte en comportements', 'Traduire chaque principe en gestes observables.', '5 sous-groupes, un par principe.'],
    'demo-blk-14': ['Pitch et validation', 'Valider ensemble la charte finale.', '5 min par principe, puis consentement.'],
    'demo-blk-16': ['Plan 90 jours', 'Passer de la charte aux actions pilotées.', 'Un pilote, un objectif, des ressources.'],
    'demo-blk-17': ['Mon engagement', 'Chacun porte une action, publiquement.', 'Carte lue à un binôme témoin.'],
    'demo-blk-18': ['Le cercle des fiertés', 'Repartir avec l\'énergie du travail fait.', 'Cercle debout, un mot chacun.'],
  };
  const upd = d.prepare(`UPDATE blocks SET title = ?, intention = ?, format = ? WHERE id = ?`);
  for (const [id, [t, i, f]] of Object.entries(seq)) upd.run(t, i, f, id);
  d.prepare(`UPDATE blocks SET title = 'Pause café' WHERE id IN ('demo-blk-3', 'demo-blk-13')`).run();
  d.prepare(`UPDATE blocks SET intention = '', format = '' WHERE space_id = ? AND kind = 'pause'`).run(DEMO_ID);

  const crit = d.prepare(`INSERT INTO success_criteria (id, space_id, statement, indicator, horizon, target, status, result_note, position, created_by) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'Yoan Lureault')`);
  crit.run('demo-crit-1', DEMO_ID, 'Chaque participant repart avec une action qu\'il porte lui-même.', 'Cartes d\'engagement signées et lues à un binôme.', 'fin', '12 sur 12', 'atteint', '12 cartes lues en clôture.', 0);
  crit.run('demo-crit-2', DEMO_ID, 'La charte tient en 5 principes, écrits en comportements observables.', 'Charte validée par consentement, sans objection.', 'fin', '5 principes', 'partiel', '4 principes validés, le 5e à retravailler.', 1);
  crit.run('demo-crit-3', DEMO_ID, 'Les rituels d\'équipe sont installés.', 'Nombre de rituels tenus trois semaines de suite.', 'j90', '3 rituels', 'a_mesurer', '', 2);
  const act = d.prepare(`INSERT INTO success_actions (id, space_id, what, who, horizon, due_date, status, position, created_by) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'Yoan Lureault')`);
  act.run('demo-act-1', DEMO_ID, 'Envoyer la synthèse et la charte à toute l\'entreprise.', 'Camille', '72h', '2026-04-19', 'fait', 0);
  act.run('demo-act-2', DEMO_ID, 'Retravailler le 5e principe avec deux volontaires.', 'Sarah', '2sem', '2026-04-30', 'en_cours', 1);
  act.run('demo-act-3', DEMO_ID, 'Point de suivi du plan 90 jours.', 'Yoan', 'j90', '2026-07-15', 'a_faire', 2);
  const vote = d.prepare(`INSERT OR IGNORE INTO success_votes (space_id, kind, pseudo, value) VALUES (?, ?, ?, ?)`);
  [['avant', [3, 4, 2, 5]], ['apres', [7, 8, 6, 8]], ['roti', [4, 5, 4, 4]]].forEach(([k, vals]) => {
    ['Yoan Lureault', 'Camille Lefèvre', 'Thomas Nguyen', 'Sarah Ben Ali'].forEach((who, i) => vote.run(DEMO_ID, k, who, vals[i]));
  });
  d.prepare(`UPDATE spaces SET scale_question = 'Sur notre culture à 45, où en est le groupe ?' WHERE id = ?`).run(DEMO_ID);
}

function seedSystemTemplates(d) {
  const stmt = d.prepare(`INSERT OR REPLACE INTO deroulement_templates (id, name, description, is_system, data, created_by) VALUES (?, ?, ?, 1, ?, 'Insuffle')`);
  for (const t of SYSTEM_TEMPLATES) {
    stmt.run(t.id, t.name, t.description, JSON.stringify({ version: 2, ...t.data }));
  }
}


function seedDemoBoard(d) {
  const DEMO_ID = '6AG_demo';
  const existing = d.prepare(`SELECT id FROM spaces WHERE id = ?`).get(DEMO_ID);
  if (existing) return;

  // Create space
  d.prepare(`INSERT INTO spaces (id, client_name, sponsor, facilitator, session_date, session_date_end, welcome_message, archived, facilitator_ids) VALUES (?, ?, ?, ?, ?, ?, ?, 1, ?)`).run(
    DEMO_ID,
    'NovaPulse — Séminaire de lancement stratégique',
    'Camille Lefèvre, CEO',
    'Yoan Lureault',
    '2026-04-15',
    '2026-04-16',
    'Bienvenue dans cette démo Insuffle Cadrage Live ! Ce cadrage illustre un cas réel de préparation de séminaire pour une startup parisienne en phase de scale-up. Explorez librement les 4 phases, les 8 axes et le déroulé.',
    JSON.stringify(['Yoan Lureault'])
  );

  // Phase states
  const phases = ['avant', 'pendant_facilitation', 'pendant_risques', 'conclusion'];
  for (const phase of phases) {
    d.prepare(`INSERT INTO phase_state (space_id, phase) VALUES (?, ?)`).run(DEMO_ID, phase);
  }

  // Helper
  let cardPos = 0;
  function card(phase, col, content, author, color) {
    const id = `demo-card-${cardPos}`;
    d.prepare(`INSERT INTO cards (id, space_id, phase, column_key, content, author, author_color, position, tags, reactions) VALUES (?, ?, ?, ?, ?, ?, ?, ?, '[]', '{}')`).run(
      id, DEMO_ID, phase, col, content, author, color, cardPos
    );
    cardPos++;
    return id;
  }

  const Y = 'Yoan Lureault';
  const C = 'Camille Lefèvre';
  const T = 'Thomas Nguyen';
  const S = 'Sarah Ben Ali';
  const cY = '#3498db';
  const cC = '#e74c3c';
  const cT = '#2ecc71';
  const cS = '#9b59b6';

  // ===== AVANT — Clarifier le cadre =====
  card('avant', 'clarifier_cadre', 'NovaPulse lève 8M€ en Série A et passe de 15 à 45 personnes en 6 mois. L\'équipe fondatrice sent qu\'elle perd la culture startup. Le board pousse à structurer sans étouffer.', C, cC);
  card('avant', 'clarifier_cadre', 'Le vrai sujet n\'est pas la croissance mais l\'identité : qui sommes-nous à 45 quand on s\'est construit à 5 dans un garage à Belleville ?', Y, cY);
  card('avant', 'clarifier_cadre', '[Q] Pourquoi fait-on appel à vous maintenant ?\n\nCamille m\'a contacté après un départ de 2 seniors en 3 semaines. Le signal est clair : l\'ADN se dilue. Le séminaire doit poser un cadre avant que la prochaine vague de recrutements n\'arrive.', Y, cY);
  card('avant', 'clarifier_cadre', 'On a tenté un offsite l\'an dernier avec un consultant classique : slides, brainstorm post-it, plan d\'action Excel. 3 mois après, rien n\'avait bougé. Cette fois il faut que ça transforme.', C, cC);
  card('avant', 'clarifier_cadre', '[Q] Qu\'est-ce qui a déjà été tenté et pourquoi ça n\'a pas marché ?\n\nL\'approche top-down ne fonctionne pas avec cette génération. Camille a un style très horizontal mais le board veut de la structure. Tension fondamentale à résoudre.', Y, cY);

  // ===== AVANT — Personnes et rôles =====
  card('avant', 'personnes_roles', 'Participants : 12 personnes — CODIR (5), Tech Leads (3), Head of People (1), Ops (2), nouveau COO arrivé il y a 3 semaines.', C, cC);
  card('avant', 'personnes_roles', 'Attention au COO (Marc Dupont) : recruté pour "mettre de l\'ordre" mais l\'équipe tech le perçoit comme un contrôleur. Tension latente.', Y, cY);
  card('avant', 'personnes_roles', '[Q] Y a-t-il des personnes opposées à cette initiative ?\n\nPas opposées ouvertement. Mais Léa (CTO) est sceptique : "Encore un séminaire pour rien". Il faut la convaincre dans les 30 premières minutes.', Y, cY);
  card('avant', 'personnes_roles', 'Manque quelqu\'un d\'important : les 2 personnes qui ont quitté. Leur feedback de sortie devrait être partagé anonymement.', S, cS);

  // ===== AVANT — Définir le succès =====
  card('avant', 'definir_succes', 'C\'est un succès si : chaque participant repart avec UNE action concrète qu\'il s\'engage à porter, et si Léa dit "ça valait le coup" à la fin.', Y, cY);
  card('avant', 'definir_succes', 'Livrable attendu : une charte culture en 5 points max, co-construite, que chaque nouvel arrivant recevra.', C, cC);
  card('avant', 'definir_succes', '[Q] À quoi verra-t-on que ça a bougé ?\n\nDans 3 mois : rétention améliorée, NPS interne > 40 (actuellement 22), et au moins 3 rituels d\'équipe installés.', C, cC);
  card('avant', 'definir_succes', 'Attention : ne pas confondre satisfaction post-séminaire et impact réel. Le vrai test c\'est dans 3 mois.', T, cT);

  // ===== AVANT — Attentes =====
  card('avant', 'attentes', 'Camille attend de moi que je provoque les vraies conversations, pas que je facilite du consensus mou. Elle veut que Marc (COO) et Léa (CTO) se parlent vraiment.', Y, cY);
  card('avant', 'attentes', 'Le board (via Camille) veut un plan d\'action structuré. L\'équipe veut être entendue. Tension entre les deux.', Y, cY);
  card('avant', 'attentes', 'L\'équipe tech est habituée aux rituels agile (rétros, stand-ups). Ils seront réceptifs aux formats participatifs mais allergiques au bullshit corporate.', T, cT);

  // ===== PENDANT — Contenu et sujet =====
  card('pendant_facilitation', 'contenu_sujet', 'Séquence clé : faire émerger les "non-négociables culturels" de l\'équipe fondatrice, puis les confronter à la vision des nouveaux arrivants.', Y, cY);
  card('pendant_facilitation', 'contenu_sujet', 'Le vrai sujet derrière la demande : comment garder l\'esprit garage à 45 personnes sans tomber dans le "family washing" ?', Y, cY);
  card('pendant_facilitation', 'contenu_sujet', 'Faudra des données : résultats de l\'enquête interne, feedbacks de sortie anonymisés, et la roadmap produit pour ancrer dans le réel.', C, cC);
  card('pendant_facilitation', 'contenu_sujet', 'Prévoir un temps pour que Marc présente sa vision des process — mais après le travail collectif, pas avant. Sinon ça cadre trop.', Y, cY);

  // ===== PENDANT — Énergie et dynamique =====
  card('pendant_facilitation', 'energie_dynamique', 'Ambiance actuelle : fatigue + méfiance. Les anciens ont l\'impression de perdre "leur" boîte. Les nouveaux ne comprennent pas les codes implicites.', S, cS);
  card('pendant_facilitation', 'energie_dynamique', 'Sous-groupes indispensables pour libérer la parole. Mélanger anciens/nouveaux dès le premier atelier.', Y, cY);
  card('pendant_facilitation', 'energie_dynamique', 'Rythme proposé : J1 matin = diagnostic + émergence (énergie haute). J1 après-midi = vision (créativité). J2 matin = co-construction (production). J2 après-midi = engagements (ancrage).', Y, cY);
  card('pendant_facilitation', 'energie_dynamique', 'Attention au niveau d\'énergie post-déjeuner J1 : prévoir un energizer costaud avant l\'atelier vision.', T, cT);

  // ===== RISQUES =====
  card('pendant_risques', 'risques_resistances', 'Risque #1 : Marc (COO) prend trop de place et transforme le séminaire en réunion de cadrage opérationnel. Parade : lui donner un rôle de scribe/observateur le matin.', Y, cY);
  card('pendant_risques', 'risques_resistances', 'Risque #2 : Léa décroche si le format est trop "soft". Parade : intégrer un exercice technique concret (architecture decision records).', Y, cY);
  card('pendant_risques', 'risques_resistances', 'Risque #3 : le sujet des départs revient comme un grief. Si ça arrive, l\'accueillir 10 min max puis recentrer sur "qu\'est-ce qu\'on construit maintenant".', Y, cY);
  card('pendant_risques', 'risques_resistances', 'Pire scénario : Camille et Marc se contredisent publiquement sur la direction. Prévoir un temps d\'alignement CEO/COO la veille.', S, cS);
  card('pendant_risques', 'risques_resistances', 'Confidentialité : les feedbacks de sortie doivent être 100% anonymisés. Camille a tendance à deviner qui a dit quoi.', T, cT);

  // ===== CONCLUSION — Livrables =====
  card('conclusion', 'production_livrables', 'Livrable 1 : Charte culture NovaPulse — 5 principes co-construits, formulés en comportements observables, pas en valeurs creuses.', Y, cY);
  card('conclusion', 'production_livrables', 'Livrable 2 : Plan d\'action 90 jours avec owners et KPIs. Format : une page, pas un Excel de 200 lignes.', C, cC);
  card('conclusion', 'production_livrables', 'Livrable 3 : Kit d\'onboarding culturel pour les prochains recrutements (à produire dans les 2 semaines post-séminaire).', S, cS);

  // ===== CONCLUSION — Suite et impact =====
  card('conclusion', 'suite_impact', 'Le lendemain : Camille envoie un mail de synthèse + la charte à toute l\'entreprise. Pas seulement aux participants.', Y, cY);
  card('conclusion', 'suite_impact', 'Point de suivi à 6 semaines. Second atelier de 2h prévu pour mesurer l\'avancement du plan 90 jours.', Y, cY);
  card('conclusion', 'suite_impact', 'Ce séminaire est le début d\'un parcours, pas une action isolée. Budget déjà validé pour 3 sessions sur 12 mois.', C, cC);

  // ===== CONCLUSION — Posture et meta =====
  card('conclusion', 'posture_meta', 'Ma posture : miroir + provocateur. Pas de complaisance. Si Camille veut du consensus, je dois oser lui montrer les vrais écarts.', Y, cY);
  card('conclusion', 'posture_meta', 'Question que je n\'ai pas encore osé poser : "Camille, est-ce que tu es prête à entendre que certains voient le COO comme TA solution, pas la leur ?"', Y, cY);
  card('conclusion', 'posture_meta', 'Mon rôle : faire faire, pas faire. Les solutions doivent venir du groupe. Je structure le processus, ils produisent le contenu.', Y, cY);

  // ===== AXES =====
  const axesData = [
    { key: 'decider_murir', yoan: 2, camille: 4, thomas: 3, sarah: 2 },
    { key: 'agir_cap', yoan: 2, camille: 4, thomas: 2, sarah: 3 },
    { key: 'cadre_autonomie', yoan: 4, camille: 2, thomas: 4, sarah: 3 },
    { key: 'produire_explorer', yoan: 3, camille: 4, thomas: 3, sarah: 2 },
    { key: 'contenu_processus', yoan: 4, camille: 2, thomas: 3, sarah: 4 },
    { key: 'recul_action', yoan: 3, camille: 5, thomas: 4, sarah: 2 },
    { key: 'ouvert_cible', yoan: 3, camille: 4, thomas: 2, sarah: 3 },
    { key: 'serieux_ludique', yoan: 4, camille: 2, thomas: 4, sarah: 5 },
  ];

  for (const ax of axesData) {
    d.prepare(`INSERT OR IGNORE INTO axes (space_id, axis_key, pseudo, color, position, explanation) VALUES (?, ?, ?, ?, ?, ?)`).run(DEMO_ID, ax.key, Y, cY, ax.yoan, '');
    d.prepare(`INSERT OR IGNORE INTO axes (space_id, axis_key, pseudo, color, position, explanation) VALUES (?, ?, ?, ?, ?, ?)`).run(DEMO_ID, ax.key, C, cC, ax.camille, '');
    d.prepare(`INSERT OR IGNORE INTO axes (space_id, axis_key, pseudo, color, position, explanation) VALUES (?, ?, ?, ?, ?, ?)`).run(DEMO_ID, ax.key, T, cT, ax.thomas, '');
    d.prepare(`INSERT OR IGNORE INTO axes (space_id, axis_key, pseudo, color, position, explanation) VALUES (?, ?, ?, ?, ?, ?)`).run(DEMO_ID, ax.key, S, cS, ax.sarah, '');
  }

  // Final positions
  d.prepare(`INSERT OR IGNORE INTO axes_final (space_id, axis_key, position) VALUES (?, ?, ?)`).run(DEMO_ID, 'decider_murir', 3);
  d.prepare(`INSERT OR IGNORE INTO axes_final (space_id, axis_key, position) VALUES (?, ?, ?)`).run(DEMO_ID, 'agir_cap', 2);
  d.prepare(`INSERT OR IGNORE INTO axes_final (space_id, axis_key, position) VALUES (?, ?, ?)`).run(DEMO_ID, 'cadre_autonomie', 3);
  d.prepare(`INSERT OR IGNORE INTO axes_final (space_id, axis_key, position) VALUES (?, ?, ?)`).run(DEMO_ID, 'serieux_ludique', 4);

  // ===== DÉROULÉ — Blocs =====
  const dBlocks = [
    { id: 'demo-blk-0', title: 'Ouverture — Le cadre et les règles', intention: 'Poser un cadre de sécurité psychologique pour que chacun ose parler vrai', type: 'ouverture', dur: 20, format: 'pleniere', pos: 0 },
    { id: 'demo-blk-1', title: 'Icebreaker — "Ma première semaine chez NovaPulse"', intention: 'Reconnecter anciens et nouveaux à travers un récit fondateur partagé', type: 'icebreaker', dur: 25, format: 'binomes', material: 'Feuilles A5, feutres', pos: 1 },
    { id: 'demo-blk-2', title: 'Diagnostic — Forces et irritants', intention: 'Cartographier ce qui fait la force de NovaPulse ET ce qui dysfonctionne sans filtre', type: 'exploration', dur: 50, format: 'sous-groupes', format_detail: 'Sous-groupes de 4 mixtes anciens/nouveaux', material: 'Post-its, paperboard', pos: 2 },
    { id: 'demo-blk-3', title: 'Pause café', intention: 'Respiration et conversations informelles', type: 'pause', dur: 15, pos: 3 },
    { id: 'demo-blk-4', title: 'Restitution et convergence', intention: 'Synthétiser les diagnostics et identifier les 5 thèmes prioritaires par vote', type: 'debriefing', dur: 30, format: 'pleniere', material: 'Gommettes de vote', pos: 4 },
    { id: 'demo-blk-5', title: 'Déjeuner', intention: 'Connexions informelles — placer les gens stratégiquement', type: 'pause', dur: 75, pos: 5 },
    { id: 'demo-blk-6', title: 'Energizer — "Speed dating NovaPulse"', intention: 'Relancer l\'énergie post-déjeuner et créer des connexions inattendues', type: 'energizer', dur: 15, format: 'binomes', pos: 6 },
    { id: 'demo-blk-7', title: 'Vision — "NovaPulse dans 3 ans, tout a réussi"', intention: 'Projeter le groupe dans un futur commun inspirant et identifier les fils rouges', type: 'exploration', dur: 60, format: 'sous-groupes', format_detail: 'Groupes de 3', material: 'Grandes feuilles, feutres couleur', pos: 7 },
    { id: 'demo-blk-8', title: 'Galerie des visions et fils rouges', intention: 'Croiser les perspectives et faire émerger les 5 non-négociables culturels', type: 'production', dur: 30, format: 'pleniere', deliverable: 'Liste des 5 principes culturels candidats', pos: 8 },
    { id: 'demo-blk-9', title: 'Clôture J1 — En un mot', intention: 'Permettre à chacun de poser un mot sur la journée et ancrer les apprentissages', type: 'cloture', dur: 15, format: 'pleniere', pos: 9 },
    { id: 'demo-blk-10', title: 'Réveil corporel', intention: 'Remettre le corps et l\'esprit en mouvement pour une journée de production', type: 'energizer', dur: 10, format: 'pleniere', pos: 10 },
    { id: 'demo-blk-11', title: 'Synthèse J1 et cap du J2', intention: 'Rappeler les 5 principes émergés hier et orienter la journée vers l\'action', type: 'ouverture', dur: 15, format: 'pleniere', pos: 11 },
    { id: 'demo-blk-12', title: 'Co-construction — Charte culture en comportements', intention: 'Transformer chaque principe en 2-3 comportements observables et concrets', type: 'production', dur: 60, format: 'sous-groupes', format_detail: '5 sous-groupes, 1 par principe', material: 'Templates charte A3, feutres', deliverable: 'Charte culture NovaPulse en 5 principes', pos: 12 },
    { id: 'demo-blk-13', title: 'Pause café', intention: 'Respiration', type: 'pause', dur: 15, pos: 13 },
    { id: 'demo-blk-14', title: 'Pitchs et vote', intention: 'Présenter les 5 principes rédigés et valider collectivement la charte finale', type: 'debriefing', dur: 40, format: 'pleniere', pos: 14 },
    { id: 'demo-blk-15', title: 'Déjeuner', intention: 'Connexions', type: 'pause', dur: 60, pos: 15 },
    { id: 'demo-blk-16', title: 'Plan 90 jours — Actions concrètes', intention: 'Transformer la charte en plan d\'action avec owners, échéances et KPIs', type: 'decision', dur: 45, format: 'pleniere', deliverable: 'Plan 90 jours sur une page', pos: 16 },
    { id: 'demo-blk-17', title: 'Engagements individuels', intention: 'Chacun s\'engage publiquement sur UNE action qu\'il porte personnellement', type: 'production', dur: 20, format: 'individuel', pos: 17 },
    { id: 'demo-blk-18', title: 'Clôture — Le cercle des fiertés', intention: 'Célébrer le travail accompli et repartir avec de l\'énergie collective', type: 'cloture', dur: 20, format: 'pleniere', pos: 18 },
  ];

  for (const b of dBlocks) {
    d.prepare(`INSERT INTO blocks (id, space_id, title, intention, block_type, duration_minutes, format, format_detail, material, deliverable, position, created_by) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`).run(
      b.id, DEMO_ID, b.title, b.intention, b.type, b.dur, b.format || 'pleniere', b.format_detail || '', b.material || '', b.deliverable || '', b.pos, Y
    );
  }

  // Sections
  d.prepare(`INSERT INTO sections (id, space_id, title, position) VALUES (?, ?, ?, ?)`).run('demo-sec-j1-matin', DEMO_ID, 'Jour 1 — Matin : Diagnostic', 0);
  d.prepare(`INSERT INTO sections (id, space_id, title, position) VALUES (?, ?, ?, ?)`).run('demo-sec-j1-aprem', DEMO_ID, 'Jour 1 — Après-midi : Vision', 1);
  d.prepare(`INSERT INTO sections (id, space_id, title, position) VALUES (?, ?, ?, ?)`).run('demo-sec-j2-matin', DEMO_ID, 'Jour 2 — Matin : Co-construction', 2);
  d.prepare(`INSERT INTO sections (id, space_id, title, position) VALUES (?, ?, ?, ?)`).run('demo-sec-j2-aprem', DEMO_ID, 'Jour 2 — Après-midi : Engagements', 3);

  // Update blocks with section_id
  d.prepare(`UPDATE blocks SET section_id = 'demo-sec-j1-matin' WHERE id IN ('demo-blk-0','demo-blk-1','demo-blk-2','demo-blk-3','demo-blk-4','demo-blk-5')`).run();
  d.prepare(`UPDATE blocks SET section_id = 'demo-sec-j1-aprem' WHERE id IN ('demo-blk-6','demo-blk-7','demo-blk-8','demo-blk-9')`).run();
  d.prepare(`UPDATE blocks SET section_id = 'demo-sec-j2-matin' WHERE id IN ('demo-blk-10','demo-blk-11','demo-blk-12','demo-blk-13','demo-blk-14','demo-blk-15')`).run();
  d.prepare(`UPDATE blocks SET section_id = 'demo-sec-j2-aprem' WHERE id IN ('demo-blk-16','demo-blk-17','demo-blk-18')`).run();

  // ===== AGENDA — 2 jours =====
  d.prepare(`INSERT INTO agenda_days (id, space_id, day_number, date, start_time, end_time, position) VALUES (?, ?, ?, ?, ?, ?, ?)`).run('demo-day-1', DEMO_ID, 1, '2026-04-15', '09:00', '17:30', 0);
  d.prepare(`INSERT INTO agenda_days (id, space_id, day_number, date, start_time, end_time, position) VALUES (?, ?, ?, ?, ?, ?, ?)`).run('demo-day-2', DEMO_ID, 2, '2026-04-16', '09:00', '16:30', 1);

  // Day 1 slots
  const day1Slots = [
    { id: 'demo-slot-0', blockId: 'demo-blk-0', start: '09:00', dur: 20 },
    { id: 'demo-slot-1', blockId: 'demo-blk-1', start: '09:20', dur: 25 },
    { id: 'demo-slot-2', blockId: 'demo-blk-2', start: '09:45', dur: 50 },
    { id: 'demo-slot-3', blockId: 'demo-blk-3', start: '10:35', dur: 15 },
    { id: 'demo-slot-4', blockId: 'demo-blk-4', start: '10:50', dur: 30 },
    { id: 'demo-slot-5', blockId: 'demo-blk-5', start: '11:20', dur: 75 },
    { id: 'demo-slot-6', blockId: 'demo-blk-6', start: '12:35', dur: 15 },
    { id: 'demo-slot-7', blockId: 'demo-blk-7', start: '12:50', dur: 60 },
    { id: 'demo-slot-8', blockId: 'demo-blk-8', start: '13:50', dur: 30 },
    { id: 'demo-slot-9', blockId: 'demo-blk-9', start: '14:20', dur: 15 },
  ];
  day1Slots.forEach((s, i) => {
    d.prepare(`INSERT INTO agenda_slots (id, space_id, day_id, block_id, slot_type, start_time, duration_minutes, position) VALUES (?, ?, ?, ?, 'block', ?, ?, ?)`).run(
      s.id, DEMO_ID, 'demo-day-1', s.blockId, s.start, s.dur, i
    );
  });

  // Day 2 slots
  const day2Slots = [
    { id: 'demo-slot-10', blockId: 'demo-blk-10', start: '09:00', dur: 10 },
    { id: 'demo-slot-11', blockId: 'demo-blk-11', start: '09:10', dur: 15 },
    { id: 'demo-slot-12', blockId: 'demo-blk-12', start: '09:25', dur: 60 },
    { id: 'demo-slot-13', blockId: 'demo-blk-13', start: '10:25', dur: 15 },
    { id: 'demo-slot-14', blockId: 'demo-blk-14', start: '10:40', dur: 40 },
    { id: 'demo-slot-15', blockId: 'demo-blk-15', start: '11:20', dur: 60 },
    { id: 'demo-slot-16', blockId: 'demo-blk-16', start: '12:20', dur: 45 },
    { id: 'demo-slot-17', blockId: 'demo-blk-17', start: '13:05', dur: 20 },
    { id: 'demo-slot-18', blockId: 'demo-blk-18', start: '13:25', dur: 20 },
  ];
  day2Slots.forEach((s, i) => {
    d.prepare(`INSERT INTO agenda_slots (id, space_id, day_id, block_id, slot_type, start_time, duration_minutes, position) VALUES (?, ?, ?, ?, 'block', ?, ?, ?)`).run(
      s.id, DEMO_ID, 'demo-day-2', s.blockId, s.start, s.dur, i
    );
  });
}

const db = createDatabase();
export default db;
