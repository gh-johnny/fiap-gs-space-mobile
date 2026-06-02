import type { ProbabilityOfCollision } from '@/domain/value-objects/probability-of-collision'
import type { MissDistance } from '@/domain/value-objects/miss-distance'
import type { TimeToClosestApproach } from '@/domain/value-objects/time-to-closest-approach'

export function formatPc(pc: ProbabilityOfCollision, simple: boolean): string {
  if (!simple) return pc.toScientificNotation()
  const oneIn = Math.round(1 / pc.value)
  if (oneIn >= 1_000_000) return `1 em ${(oneIn / 1_000_000).toFixed(1)}M`
  if (oneIn >= 1_000) return `1 em ${(oneIn / 1_000).toFixed(0)}k`
  return `1 em ${oneIn}`
}

export function formatMissDistance(md: MissDistance, simple: boolean): string {
  if (!simple) return md.toDisplayString()
  if (md.meters < 1000) return `${Math.round(md.meters)}m de separação`
  return `${(md.meters / 1000).toFixed(1)}km de separação`
}

export function formatTcpa(tcpa: TimeToClosestApproach, simple: boolean): string {
  if (!simple) return tcpa.toDisplayString()
  const totalMin = Math.max(0, Math.round((tcpa.date.getTime() - Date.now()) / 60000))
  if (totalMin === 0) return 'agora'
  const h = Math.floor(totalMin / 60)
  const m = totalMin % 60
  if (h === 0) return `em ${m}min`
  if (m === 0) return `em ${h}h`
  return `em ${h}h ${m}min`
}

export function formatWindow(tcpa: TimeToClosestApproach, simple: boolean): string {
  if (!simple) return tcpa.toUtcString()
  const d = tcpa.date
  const months = ['jan','fev','mar','abr','mai','jun','jul','ago','set','out','nov','dez']
  const hh = String(d.getUTCHours()).padStart(2, '0')
  const mm = String(d.getUTCMinutes()).padStart(2, '0')
  return `${d.getUTCDate()} ${months[d.getUTCMonth()]} · ${hh}:${mm}`
}
