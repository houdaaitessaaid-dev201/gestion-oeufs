import { DatabaseSync } from 'node:sqlite';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbPath = path.join(__dirname, '..', 'egg_distribution.sqlite');

const db = new DatabaseSync(dbPath);

// Enable WAL mode & foreign keys
db.exec(`
  PRAGMA journal_mode = WAL;
  PRAGMA foreign_keys = ON;
`);

export function query(sql, params = []) {
  const stmt = db.prepare(sql);
  return stmt.all(...params);
}

export function get(sql, params = []) {
  const stmt = db.prepare(sql);
  const rows = stmt.all(...params);
  return rows[0] || null;
}

export function run(sql, params = []) {
  const stmt = db.prepare(sql);
  return stmt.run(...params);
}

export function transaction(fn) {
  db.exec('BEGIN TRANSACTION;');
  try {
    const result = fn();
    db.exec('COMMIT;');
    return result;
  } catch (error) {
    db.exec('ROLLBACK;');
    throw error;
  }
}

export function initDatabase() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'vendeur',
      phone TEXT,
      active INTEGER DEFAULT 1,
      created_at TEXT DEFAULT (datetime('now', 'localtime'))
    );

    CREATE TABLE IF NOT EXISTS suppliers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      phone TEXT,
      address TEXT,
      created_at TEXT DEFAULT (datetime('now', 'localtime'))
    );

    CREATE TABLE IF NOT EXISTS clients (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      contact_person TEXT,
      phone TEXT NOT NULL,
      whatsapp TEXT,
      address TEXT,
      coordinates TEXT,
      usual_quantity INTEGER DEFAULT 0,
      default_price REAL DEFAULT 1.45,
      visit_days TEXT DEFAULT 'Tous les jours',
      notes TEXT,
      created_at TEXT DEFAULT (datetime('now', 'localtime'))
    );

    CREATE TABLE IF NOT EXISTS stock_movements (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      movement_type TEXT NOT NULL, -- 'in_purchase', 'out_sale', 'loss_damage', 'adjustment'
      quantity INTEGER NOT NULL,
      unit_price REAL DEFAULT 0.0,
      supplier TEXT,
      related_sale_id INTEGER,
      user_id INTEGER,
      notes TEXT,
      movement_date TEXT DEFAULT (datetime('now', 'localtime'))
    );

    CREATE TABLE IF NOT EXISTS sales (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      client_id INTEGER NOT NULL REFERENCES clients(id),
      user_id INTEGER NOT NULL REFERENCES users(id),
      quantity INTEGER NOT NULL,
      unit_price REAL NOT NULL,
      total_amount REAL NOT NULL,
      paid_amount REAL NOT NULL DEFAULT 0.0,
      remaining_amount REAL NOT NULL,
      sale_date TEXT DEFAULT (datetime('now', 'localtime')),
      notes TEXT,
      created_at TEXT DEFAULT (datetime('now', 'localtime'))
    );

    CREATE TABLE IF NOT EXISTS payments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      client_id INTEGER NOT NULL REFERENCES clients(id),
      sale_id INTEGER REFERENCES sales(id),
      user_id INTEGER NOT NULL REFERENCES users(id),
      amount REAL NOT NULL,
      payment_method TEXT DEFAULT 'cash',
      payment_date TEXT DEFAULT (datetime('now', 'localtime')),
      notes TEXT,
      created_at TEXT DEFAULT (datetime('now', 'localtime'))
    );

    CREATE TABLE IF NOT EXISTS visits (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      client_id INTEGER NOT NULL REFERENCES clients(id),
      user_id INTEGER NOT NULL REFERENCES users(id),
      visit_date TEXT NOT NULL, -- YYYY-MM-DD
      visit_time TEXT, -- HH:MM
      status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'visited', 'missed'
      sale_id INTEGER REFERENCES sales(id),
      ordered_quantity INTEGER DEFAULT 0, -- Nombre d'œufs demandés/commandés pour cette tournée
      notes TEXT,
      created_at TEXT DEFAULT (datetime('now', 'localtime'))
    );

    CREATE TABLE IF NOT EXISTS app_settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL,
      updated_at TEXT DEFAULT (datetime('now', 'localtime'))
    );
  `);

  // Migration douce si la colonne ordered_quantity n'existe pas encore
  try {
    db.exec(`ALTER TABLE visits ADD COLUMN ordered_quantity INTEGER DEFAULT 0;`);
  } catch (e) {
    // La colonne existe déjà, ignorer
  }

  // Initialiser le prix du jour par défaut (1.35 DH)
  try {
    db.exec(`INSERT OR IGNORE INTO app_settings (key, value) VALUES ('current_egg_price', '1.35');`);
  } catch (e) {}

  seedData();
}

function seedData() {
  const userCount = get('SELECT COUNT(*) as count FROM users');
  if (userCount && userCount.count > 0) return;

  // Créer un utilisateur actif par défaut pour les opérations du vendeur
  run(`INSERT INTO users (id, name, role, phone) VALUES (?, ?, ?)`, [1, 'Vendeur', 'vendeur', '0600000000']);
}

export function resetDatabase() {
  db.exec(`
    PRAGMA foreign_keys = OFF;
    DELETE FROM sales;
    DELETE FROM payments;
    DELETE FROM visits;
    DELETE FROM stock_movements;
    DELETE FROM clients;
    DELETE FROM suppliers;
    DELETE FROM users;
    DELETE FROM sqlite_sequence WHERE name IN ('sales', 'payments', 'visits', 'stock_movements', 'clients', 'suppliers', 'users');
    INSERT INTO users (id, name, role, phone) VALUES (1, 'Vendeur', 'vendeur', '0600000000');
    INSERT OR REPLACE INTO app_settings (key, value) VALUES ('current_egg_price', '1.35');
    INSERT OR REPLACE INTO app_settings (key, value) VALUES ('current_purchase_price', '1.15');
    PRAGMA foreign_keys = ON;
    VACUUM;
  `);
}

export default db;
