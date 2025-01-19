import Database, { Database as DBType } from 'better-sqlite3'
import path from 'path'
import fs from 'fs'
import { Paths } from './paths'


const DB_PATH = Paths.getDBPath()

// Ensure the database directory exists
function ensureDBDirectoryExists() {
  const dir = path.dirname(DB_PATH)
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true })
  }
}

// Locally define an interface that extends the external DB type
export interface BetterSqliteDatabase extends DBType {}
// Open the SQLite database
export function openDB(): BetterSqliteDatabase {
  ensureDBDirectoryExists()
  return new Database(DB_PATH, { verbose: console.log }) // `verbose` logs all queries
}
// Initialize the database and create the table
export function initializeDB() {
  try {
    const db = openDB()
    console.log('******************************************************')
    console.log('**************Initializing database... ***************')
    console.log('******************************************************')
    db.exec(`
            CREATE TABLE IF NOT EXISTS organization_detail (
                id TEXT PRIMARY KEY UNIQUE,
                cd_id TEXT NOT NULL UNIQUE,
                cd_secret TEXT NOT NULL UNIQUE,
                organization_name TEXT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );

            CREATE TABLE IF NOT EXISTS projects (
                project_id TEXT NOT NULL UNIQUE PRIMARY KEY,
                name TEXT NOT NULL,
                description TEXT,
                organization_id INTEGER NOT NULL,
                is_connected_to_remote BOOLEAN DEFAULT 0,
                remote_url TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (organization_id) REFERENCES organization_detail (id)
            );
            CREATE TABLE IF NOT EXISTS loggedin_organization_detail (
                id TEXT PRIMARY KEY UNIQUE,
                cd_id TEXT NOT NULL UNIQUE,
                cd_secret TEXT NOT NULL UNIQUE,
                organization_name TEXT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `)

    // applyMigrations();
    console.log('Database initialized.')
  } catch (error) {
    console.error('Error initializing database:', error)
  }
}
