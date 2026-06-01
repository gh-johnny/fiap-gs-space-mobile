// Tipos externos do SQLite — espelham o schema da tabela orbital_alerts

export interface SqliteAlertRowExternal {
  readonly id: string
  readonly conjunction_event_json: string // JSON serializado de ConjunctionEvent
  readonly status: string // 'detected' | 'acknowledged' | 'dismissed'
  readonly detected_at: string // ISO 8601
}
