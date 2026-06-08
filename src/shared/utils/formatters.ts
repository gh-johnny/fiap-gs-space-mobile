import { ProbabilityOfCollision, MissDistance, TimeToClosestApproach } from '@/core/value-objects'

export function formatPc(pc: ProbabilityOfCollision): string {
  return pc.toScientificNotation()
}

export function formatDistance(miss: MissDistance): string {
  return miss.toDisplayString()
}

export function formatTcpa(tcpa: TimeToClosestApproach): string {
  return tcpa.toDisplayString()
}
