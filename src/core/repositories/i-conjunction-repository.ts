import { ConjunctionEvent } from '@/core/entities'
import { type Severity } from '@/core/value-objects'

export interface IConjunctionRepository {
  findAll(): Promise<ConjunctionEvent[]>
  findBySeverity(severity: Severity): Promise<ConjunctionEvent[]>
}
