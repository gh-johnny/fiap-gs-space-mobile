import { SqliteService } from './sqlite-service'

const mockExecSync = jest.fn()
const mockRunSync = jest.fn().mockReturnValue({ lastInsertRowId: 0, changes: 0 })
const mockGetFirstSync = jest.fn().mockReturnValue({ user_version: 0 })

jest.mock('expo-sqlite', () => ({
  openDatabaseSync: jest.fn(() => ({
    execSync: mockExecSync,
    runSync: mockRunSync,
    getFirstSync: mockGetFirstSync,
  })),
}))

describe('SqliteService', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockGetFirstSync.mockReturnValue({ user_version: 0 })
  })

  it('initialize() cria a tabela orbital_alerts', () => {
    const sut = new SqliteService()
    sut.initialize()

    const calls = mockExecSync.mock.calls.map((c) => c[0] as string)
    const createsTable = calls.some((sql) => sql.includes('CREATE TABLE IF NOT EXISTS orbital_alerts'))
    expect(createsTable).toBe(true)
  })

  it('initialize() é idempotente — executar duas vezes não quebra', () => {
    const sut = new SqliteService()
    expect(() => {
      sut.initialize()
      sut.initialize()
    }).not.toThrow()
  })

  it('getDb() retorna a conexão após initialize()', () => {
    const sut = new SqliteService()
    sut.initialize()
    expect(sut.getDb()).toBeDefined()
  })

  it('getDb() lança se chamado antes de initialize()', () => {
    const sut = new SqliteService()
    expect(() => sut.getDb()).toThrow()
  })

  it('initialize() bumpa o PRAGMA user_version após migrar', () => {
    const sut = new SqliteService()
    sut.initialize()

    const pragmaCalls = mockExecSync.mock.calls
      .map((c) => c[0] as string)
      .filter((sql) => sql.includes('PRAGMA user_version'))
    expect(pragmaCalls.length).toBeGreaterThan(0)
  })
})
