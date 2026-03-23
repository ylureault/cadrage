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
}

const db = createDatabase();
export default db;
