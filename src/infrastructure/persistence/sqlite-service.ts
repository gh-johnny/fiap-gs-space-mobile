import * as SQLite from 'expo-sqlite'

interface Migration {
  version: number
  up: string
}

const MIGRATIONS: Migration[] = [
  {
    version: 1,
    up: `
      CREATE TABLE IF NOT EXISTS orbital_alerts (
        id TEXT PRIMARY KEY,
        conjunction_event_json TEXT NOT NULL,
        status TEXT NOT NULL,
        detected_at TEXT NOT NULL
      );
    `,
  },
  {
    version: 2,
    up: `
      CREATE TABLE IF NOT EXISTS kv_store (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL
      );
    `,
  },
]

export class SqliteService {
  private db: SQLite.SQLiteDatabase | null = null

  initialize(): void {
    if (!this.db) {
      this.db = SQLite.openDatabaseSync('orbital-guardian.db')
    }
    this.runMigrations(this.db)
  }

  getDb(): SQLite.SQLiteDatabase {
    if (!this.db) throw new Error('SqliteService não foi inicializado — chame initialize() primeiro')
    return this.db
  }

  private runMigrations(db: SQLite.SQLiteDatabase): void {
    const row = db.getFirstSync<{ user_version: number }>('PRAGMA user_version')
    const currentVersion = row?.user_version ?? 0

    const pending = MIGRATIONS.filter((m) => m.version > currentVersion)
    for (const migration of pending) {
      db.execSync(migration.up)
      db.execSync(`PRAGMA user_version = ${migration.version}`)
    }
  }
}
