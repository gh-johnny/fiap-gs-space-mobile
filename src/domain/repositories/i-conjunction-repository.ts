import { ConjunctionEvent } from '@/domain/entities'
import { type Severity } from '@/domain/value-objects'

export interface IConjunctionRepository {
  findAll(): Promise<ConjunctionEvent[]>
  findBySeverity(severity: Severity): Promise<ConjunctionEvent[]>
}
