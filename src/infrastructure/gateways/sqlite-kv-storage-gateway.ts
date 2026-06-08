import { IStorageGateway } from '@/core/gateways/i-storage-gateway'
import { SqliteService } from '@/infrastructure/persistence/sqlite-service'

export class SqliteKvStorageGateway implements IStorageGateway {
  constructor(private readonly sqliteService: SqliteService) {}

  get<T>(key: string): T | null {
    const db = this.sqliteService.getDb()
    const row = db.getFirstSync<{ value: string }>('SELECT value FROM kv_store WHERE key = ?', [key])
    if (!row) return null
    try {
      return JSON.parse(row.value) as T
    } catch {
      return null
    }
  }

  set<T>(key: string, value: T): void {
    const db = this.sqliteService.getDb()
    db.runSync('INSERT OR REPLACE INTO kv_store (key, value) VALUES (?, ?)', [key, JSON.stringify(value)])
  }

  remove(key: string): void {
    const db = this.sqliteService.getDb()
    db.runSync('DELETE FROM kv_store WHERE key = ?', [key])
  }
}
