import Database from 'better-sqlite3';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { mkdirSync } from 'fs';

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

  // Seed system templates for Déroulé (US-D023)
  seedSystemTemplates(d);
}

function seedSystemTemplates(d) {
  const existing = d.prepare(`SELECT COUNT(*) as c FROM deroulement_templates WHERE is_system = 1`).get();
  if (existing.c > 0) return; // Already seeded

  const templates = [
    {
      id: 'tpl-seminaire-codir',
      name: 'Séminaire CODIR — 1 journée',
      description: 'Format classique pour un comité de direction : diagnostic, co-construction, plan d\'action.',
      data: {
        sections: [
          { id: 'sec-matin', title: 'Matin', position: 0 },
          { id: 'sec-aprem', title: 'Après-midi', position: 1 },
        ],
        blocks: [
          { title: 'Ouverture et cadrage', intention: 'Poser le cadre de la journée, clarifier les règles du jeu et créer un espace de confiance', block_type: 'ouverture', duration_minutes: 20, format: 'pleniere', section_id: 'sec-matin', position: 0 },
          { title: 'Tour de table d\'inclusion', intention: 'Permettre à chacun de se rendre présent et d\'exprimer son état d\'esprit', block_type: 'icebreaker', duration_minutes: 25, format: 'pleniere', section_id: 'sec-matin', position: 1 },
          { title: 'Diagnostic partagé', intention: 'Aligner la perception de la situation actuelle et identifier les points de convergence et de divergence', block_type: 'exploration', duration_minutes: 60, format: 'sous-groupes', format_detail: 'Sous-groupes de 4', section_id: 'sec-matin', position: 2 },
          { title: 'Pause café', intention: 'Respiration et échanges informels', block_type: 'pause', duration_minutes: 15, section_id: 'sec-matin', position: 3 },
          { title: 'Restitution et convergence', intention: 'Synthétiser les diagnostics et définir les priorités', block_type: 'debriefing', duration_minutes: 30, format: 'pleniere', section_id: 'sec-matin', position: 4 },
          { title: 'Déjeuner', intention: 'Pause et connexions informelles', block_type: 'pause', duration_minutes: 75, section_id: 'sec-matin', position: 5 },
          { title: 'World Café — pistes de solutions', intention: 'Explorer collectivement les solutions possibles sur chaque priorité', block_type: 'production', duration_minutes: 60, format: 'sous-groupes', format_detail: 'Tables tournantes de 5', material: 'Grandes nappes papier, feutres de couleur', section_id: 'sec-aprem', position: 6 },
          { title: 'Pause', intention: 'Respiration', block_type: 'pause', duration_minutes: 15, section_id: 'sec-aprem', position: 7 },
          { title: 'Plan d\'action', intention: 'Transformer les idées en engagements concrets avec des responsables et des échéances', block_type: 'decision', duration_minutes: 45, format: 'pleniere', deliverable: 'Plan d\'action avec responsables et échéances', section_id: 'sec-aprem', position: 8 },
          { title: 'Tour de clôture', intention: 'Permettre à chacun de partager un mot sur la journée et repartir avec de l\'énergie', block_type: 'cloture', duration_minutes: 15, format: 'pleniere', section_id: 'sec-aprem', position: 9 },
        ]
      }
    },
    {
      id: 'tpl-futur-desire',
      name: 'Atelier Futur Désiré — demi-journée',
      description: 'Méthode Insuffle pour projeter le groupe dans un futur positif et en tirer des actions.',
      data: {
        sections: [],
        blocks: [
          { title: 'Accueil et météo intérieure', intention: 'Se rendre présent et se connecter au groupe', block_type: 'ouverture', duration_minutes: 15, format: 'pleniere', position: 0 },
          { title: 'Icebreaker — « Le journal du futur »', intention: 'Réchauffer l\'imaginaire et ouvrir à la projection', block_type: 'icebreaker', duration_minutes: 15, format: 'binomes', material: 'Feuilles A4, feutres', position: 1 },
          { title: 'Projection — « Dans 3 ans, tout a réussi »', intention: 'Visualiser collectivement le futur désiré et le rendre tangible', block_type: 'exploration', duration_minutes: 45, format: 'sous-groupes', format_detail: 'Sous-groupes de 4', material: 'Post-its, paperboard', position: 2 },
          { title: 'Pause', intention: 'Respiration', block_type: 'pause', duration_minutes: 15, position: 3 },
          { title: 'Galerie et vote', intention: 'Partager les visions, repérer les convergences et voter sur les priorités', block_type: 'production', duration_minutes: 30, format: 'pleniere', material: 'Gommettes de vote', position: 4 },
          { title: 'Plan de premiers pas', intention: 'Transformer la vision en actions concrètes à court terme', block_type: 'decision', duration_minutes: 30, format: 'pleniere', deliverable: 'Liste de 5 premières actions', position: 5 },
          { title: 'Clôture en un mot', intention: 'Ancrer l\'énergie et permettre un temps de parole final', block_type: 'cloture', duration_minutes: 10, format: 'pleniere', position: 6 },
        ]
      }
    },
    {
      id: 'tpl-retro-equipe',
      name: 'Rétrospective d\'équipe — 2h',
      description: 'Format de rétrospective pour faire le bilan et s\'améliorer en équipe.',
      data: {
        sections: [],
        blocks: [
          { title: 'Check-in', intention: 'Prendre la température de l\'équipe et créer les conditions de la parole', block_type: 'ouverture', duration_minutes: 10, format: 'pleniere', position: 0 },
          { title: 'Collecte — Ce qui a bien fonctionné / Ce qui peut s\'améliorer', intention: 'Recueillir toutes les perceptions sans filtre', block_type: 'exploration', duration_minutes: 20, format: 'individuel', material: 'Post-its, feutres', position: 1 },
          { title: 'Regroupement et échanges', intention: 'Comprendre les tendances et créer un diagnostic partagé', block_type: 'debriefing', duration_minutes: 25, format: 'pleniere', position: 2 },
          { title: 'Pause', intention: 'Respiration', block_type: 'pause', duration_minutes: 10, position: 3 },
          { title: 'Brainstorming solutions', intention: 'Générer des idées d\'amélioration sur les thèmes prioritaires', block_type: 'production', duration_minutes: 25, format: 'trinomes', position: 4 },
          { title: 'Vote et engagement', intention: 'Sélectionner les 3 actions prioritaires et s\'engager collectivement', block_type: 'decision', duration_minutes: 20, format: 'pleniere', deliverable: '3 actions d\'amélioration avec responsables', position: 5 },
          { title: 'Check-out', intention: 'Fermer le temps collectif avec gratitude', block_type: 'cloture', duration_minutes: 10, format: 'pleniere', position: 6 },
        ]
      }
    },
    {
      id: 'tpl-seminaire-2j',
      name: 'Séminaire transformation — 2 jours',
      description: 'Format séminaire long avec diagnostic, vision, co-construction et plan d\'action.',
      data: {
        sections: [
          { id: 'sec-j1-matin', title: 'Jour 1 — Matin', position: 0 },
          { id: 'sec-j1-aprem', title: 'Jour 1 — Après-midi', position: 1 },
          { id: 'sec-j2-matin', title: 'Jour 2 — Matin', position: 2 },
          { id: 'sec-j2-aprem', title: 'Jour 2 — Après-midi', position: 3 },
        ],
        blocks: [
          { title: 'Ouverture du séminaire', intention: 'Installer le cadre, présenter les enjeux et la feuille de route des 2 jours', block_type: 'ouverture', duration_minutes: 30, section_id: 'sec-j1-matin', position: 0 },
          { title: 'Icebreaker — « La ligne du temps »', intention: 'Reconnecter les équipes à l\'histoire collective', block_type: 'icebreaker', duration_minutes: 30, format: 'pleniere', material: 'Fresque chronologique, post-its', section_id: 'sec-j1-matin', position: 1 },
          { title: 'Diagnostic — Forces et faiblesses', intention: 'Cartographier l\'état des lieux avec lucidité et bienveillance', block_type: 'exploration', duration_minutes: 60, format: 'sous-groupes', format_detail: 'Sous-groupes mixtes de 5', section_id: 'sec-j1-matin', position: 2 },
          { title: 'Déjeuner', intention: 'Connexions informelles', block_type: 'pause', duration_minutes: 75, section_id: 'sec-j1-matin', position: 3 },
          { title: 'Vision — « Dans 5 ans, nous sommes… »', intention: 'Projeter le groupe dans un futur commun inspirant', block_type: 'exploration', duration_minutes: 60, format: 'sous-groupes', format_detail: 'Sous-groupes de 4', section_id: 'sec-j1-aprem', position: 4 },
          { title: 'Pause', intention: 'Respiration', block_type: 'pause', duration_minutes: 15, section_id: 'sec-j1-aprem', position: 5 },
          { title: 'Galerie des visions', intention: 'Croiser les perspectives et identifier les fils rouges', block_type: 'debriefing', duration_minutes: 45, format: 'pleniere', section_id: 'sec-j1-aprem', position: 6 },
          { title: 'Clôture Jour 1', intention: 'Prendre du recul sur la journée et poser les bases du Jour 2', block_type: 'cloture', duration_minutes: 15, section_id: 'sec-j1-aprem', position: 7 },
          { title: 'Réveil corporel', intention: 'Remettre le corps et l\'esprit en mouvement', block_type: 'energizer', duration_minutes: 15, section_id: 'sec-j2-matin', position: 8 },
          { title: 'Synthèse Jour 1 et cap du Jour 2', intention: 'Rappeler les apprentissages et orienter l\'énergie vers l\'action', block_type: 'ouverture', duration_minutes: 20, section_id: 'sec-j2-matin', position: 9 },
          { title: 'Ateliers de co-construction', intention: 'Transformer les constats en projets concrets', block_type: 'production', duration_minutes: 75, format: 'sous-groupes', format_detail: 'Sous-groupes thématiques', material: 'Templates A0, feutres, post-its', section_id: 'sec-j2-matin', position: 10 },
          { title: 'Déjeuner', intention: 'Connexions', block_type: 'pause', duration_minutes: 75, section_id: 'sec-j2-matin', position: 11 },
          { title: 'Pitchs des projets', intention: 'Présenter les travaux et recueillir les feedbacks', block_type: 'debriefing', duration_minutes: 45, format: 'pleniere', section_id: 'sec-j2-aprem', position: 12 },
          { title: 'Pause', intention: 'Respiration', block_type: 'pause', duration_minutes: 15, section_id: 'sec-j2-aprem', position: 13 },
          { title: 'Vote et priorisation', intention: 'Décider collectivement des chantiers prioritaires', block_type: 'decision', duration_minutes: 30, format: 'pleniere', deliverable: 'Top 5 des chantiers avec sponsors', section_id: 'sec-j2-aprem', position: 14 },
          { title: 'Engagements individuels', intention: 'Chacun s\'engage sur une contribution personnelle', block_type: 'production', duration_minutes: 20, format: 'individuel', section_id: 'sec-j2-aprem', position: 15 },
          { title: 'Clôture du séminaire', intention: 'Célébrer le travail accompli et repartir avec de l\'énergie', block_type: 'cloture', duration_minutes: 20, format: 'pleniere', section_id: 'sec-j2-aprem', position: 16 },
        ]
      }
    },
  ];

  const stmt = d.prepare(`INSERT OR IGNORE INTO deroulement_templates (id, name, description, is_system, data, created_by) VALUES (?, ?, ?, 1, ?, 'Insuffle')`);
  for (const t of templates) {
    stmt.run(t.id, t.name, t.description, JSON.stringify(t.data));
  }
}

const db = createDatabase();
export default db;
