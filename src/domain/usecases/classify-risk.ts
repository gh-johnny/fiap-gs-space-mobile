import { ProbabilityOfCollision, MissDistance, type Severity } from '@/domain/value-objects'

export class ClassifyRisk {
  execute(pc: ProbabilityOfCollision, miss: MissDistance): Severity {
    if (miss.isCritical()) return 'CRITICAL'
    return pc.toSeverity()
  }
}
