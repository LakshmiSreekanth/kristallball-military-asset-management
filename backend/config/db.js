import initSqlJs from 'sql.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DB_PATH = path.join(__dirname, '..', 'data', 'military_assets.db');

let db = null;

function persist() {
  const data = db.export();
  fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });
  fs.writeFileSync(DB_PATH, Buffer.from(data));
}

export async function initDatabase() {
  const SQL = await initSqlJs();
  fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });

  if (fs.existsSync(DB_PATH)) {
    const buffer = fs.readFileSync(DB_PATH);
    db = new SQL.Database(buffer);
  } else {
    db = new SQL.Database();
  }

  db.run(`
    CREATE TABLE IF NOT EXISTS bases (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      location TEXT NOT NULL
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL CHECK(role IN ('ADMIN', 'BASE_COMMANDER', 'LOGISTICS_OFFICER')),
      base_id INTEGER REFERENCES bases(id) ON DELETE SET NULL
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS equipment_types (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      category TEXT NOT NULL CHECK(category IN ('WEAPON', 'VEHICLE', 'AMMUNITION'))
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS purchases (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      base_id INTEGER NOT NULL REFERENCES bases(id),
      equipment_type_id INTEGER NOT NULL REFERENCES equipment_types(id),
      quantity INTEGER NOT NULL CHECK(quantity > 0),
      date TEXT NOT NULL DEFAULT (datetime('now')),
      created_at TEXT DEFAULT (datetime('now')),
      created_by INTEGER REFERENCES users(id)
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS transfers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      source_base_id INTEGER NOT NULL REFERENCES bases(id),
      destination_base_id INTEGER NOT NULL REFERENCES bases(id),
      equipment_type_id INTEGER NOT NULL REFERENCES equipment_types(id),
      quantity INTEGER NOT NULL CHECK(quantity > 0),
      status TEXT DEFAULT 'COMPLETED',
      timestamp TEXT DEFAULT (datetime('now')),
      initiated_by INTEGER REFERENCES users(id)
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS assignments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      base_id INTEGER NOT NULL REFERENCES bases(id),
      equipment_type_id INTEGER NOT NULL REFERENCES equipment_types(id),
      personnel_name TEXT NOT NULL,
      quantity INTEGER NOT NULL CHECK(quantity > 0),
      date TEXT DEFAULT (datetime('now')),
      created_by INTEGER REFERENCES users(id)
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS expenditures (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      base_id INTEGER NOT NULL REFERENCES bases(id),
      equipment_type_id INTEGER NOT NULL REFERENCES equipment_types(id),
      quantity INTEGER NOT NULL CHECK(quantity > 0),
      reason TEXT,
      date TEXT DEFAULT (datetime('now')),
      created_by INTEGER REFERENCES users(id)
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS audit_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER REFERENCES users(id),
      action TEXT NOT NULL,
      details TEXT NOT NULL,
      created_at TEXT DEFAULT (datetime('now'))
    )
  `);

  persist();
  return db;
}

export function getDb() {
  if (!db) throw new Error('Database not initialized');
  return db;
}

export function saveDb() {
  persist();
}

export function queryAll(sql, params = []) {
  const stmt = db.prepare(sql);
  stmt.bind(params);
  const rows = [];
  while (stmt.step()) {
    rows.push(stmt.getAsObject());
  }
  stmt.free();
  return rows;
}

export function queryOne(sql, params = []) {
  const rows = queryAll(sql, params);
  return rows[0] || null;
}

export function run(sql, params = []) {
  db.run(sql, params);
  persist();
  const result = db.exec('SELECT last_insert_rowid() as id');
  const lastId = result[0]?.values[0]?.[0] ?? null;
  return { lastInsertRowid: lastId };
}

export function transaction(fn) {
  try {
    const result = fn();
    persist();
    return result;
  } catch (err) {
    throw err;
  }
}
