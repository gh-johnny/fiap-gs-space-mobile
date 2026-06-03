import type { ProbabilityOfCollision } from '@/domain/value-objects/probability-of-collision'
import type { MissDistance } from '@/domain/value-objects/miss-distance'
import type { TimeToClosestApproach } from '@/domain/value-objects/time-to-closest-approach'
import { TRANSLATIONS, type Locale } from '@/i18n/translations'

export function formatPc(pc: ProbabilityOfCollision, simple: boolean, locale: Locale = 'pt'): string {
  if (!simple) return pc.toScientificNotation()
  const t = TRANSLATIONS[locale]
  const oneIn = Math.round(1 / pc.value)
  const prefix = t['format.oneIn']
  if (oneIn >= 1_000_000) return `${prefix} ${(oneIn / 1_000_000).toFixed(1)}M`
  if (oneIn >= 1_000) return `${prefix} ${(oneIn / 1_000).toFixed(0)}k`
  return `${prefix} ${oneIn}`
}

export function formatMissDistance(md: MissDistance, simple: boolean, locale: Locale = 'pt'): string {
  if (!simple) return md.toDisplayString()
  const t = TRANSLATIONS[locale]
  if (md.meters < 1000) return `${Math.round(md.meters)}${t['format.separation.m']}`
  return `${(md.meters / 1000).toFixed(1)}${t['format.separation.km']}`
}

export function formatTcpa(tcpa: TimeToClosestApproach, simple: boolean, locale: Locale = 'pt'): string {
  if (!simple) return tcpa.toDisplayString()
  const t = TRANSLATIONS[locale]
  const totalMin = Math.max(0, Math.round((tcpa.date.getTime() - Date.now()) / 60000))
  if (totalMin === 0) return t['format.now']
  const h = Math.floor(totalMin / 60)
  const m = totalMin % 60
  if (h === 0) return t['format.inMin'].replace('{m}', String(m))
  if (m === 0) return t['format.inHours'].replace('{h}', String(h))
  return t['format.inHoursMin'].replace('{h}', String(h)).replace('{m}', String(m))
}

export function formatWindow(tcpa: TimeToClosestApproach, simple: boolean, locale: Locale = 'pt'): string {
  if (!simple) return tcpa.toUtcString()
  const t = TRANSLATIONS[locale]
  const d = tcpa.date
  const months = t['format.months'].split(',')
  const hh = String(d.getUTCHours()).padStart(2, '0')
  const mm = String(d.getUTCMinutes()).padStart(2, '0')
  return `${d.getUTCDate()} ${months[d.getUTCMonth()]} · ${hh}:${mm}`
}
