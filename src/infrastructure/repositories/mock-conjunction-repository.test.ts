import { MockConjunctionRepository } from './mock-conjunction-repository'

describe('MockConjunctionRepository', () => {
  const sut = new MockConjunctionRepository()

  it('findAll() retorna 3 eventos', async () => {
    const result = await sut.findAll()
    expect(result).toHaveLength(3)
  })

  it('contém 1 CRITICAL, 1 WARNING e 1 INFO', async () => {
    const result = await sut.findAll()
    const severities = result.map((e) => e.severity)
    expect(severities).toContain('CRITICAL')
    expect(severities).toContain('WARNING')
    expect(severities).toContain('INFO')
  })

  it('findBySeverity("CRITICAL") retorna só críticos', async () => {
    const result = await sut.findBySeverity('CRITICAL')
    expect(result.length).toBeGreaterThan(0)
    expect(result.every((e) => e.severity === 'CRITICAL')).toBe(true)
  })

  it('findBySeverity("WARNING") retorna só warnings', async () => {
    const result = await sut.findBySeverity('WARNING')
    expect(result.every((e) => e.severity === 'WARNING')).toBe(true)
  })
})
