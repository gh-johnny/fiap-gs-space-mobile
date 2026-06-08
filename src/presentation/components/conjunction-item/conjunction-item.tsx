import React from 'react'
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native'
import { ConjunctionEvent } from '@/core/entities'
import { SEVERITY_COLORS } from '@/constants/theme'
import { useTranslation } from '@/i18n/use-translation'

interface ConjunctionItemProps {
  event: ConjunctionEvent
  isCorrected?: boolean
  onCorrect?: () => void
  onRemove?: () => void
}

export function ConjunctionItem({ event, isCorrected = false, onCorrect, onRemove }: ConjunctionItemProps) {
  const color = isCorrected ? '#34C759' : SEVERITY_COLORS[event.severity]
  const hasActions = onCorrect !== undefined || onRemove !== undefined
  const t = useTranslation()

  return (
    <View style={[styles.container, isCorrected && styles.containerCorrected]}>
      <View style={[styles.bar, { backgroundColor: color }]} />
      <View style={styles.body}>
        <View style={styles.info}>
          <View style={styles.nameRow}>
            <Text style={styles.names} numberOfLines={1}>
              {event.objectA.name} — {event.objectB.name}
            </Text>
            {isCorrected && (
              <Text style={[styles.correctedBadge, { color }]}>{t('conjunction.correctedBadge')}</Text>
            )}
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detail}>Pc {event.pc.toScientificNotation()}</Text>
            <Text style={styles.detailSep}>·</Text>
            <Text style={styles.detail}>{event.missDistance.toDisplayString()}</Text>
            <Text style={styles.detailSep}>·</Text>
            <Text style={styles.detail}>{event.tcpa.toDisplayString()}</Text>
          </View>
        </View>
        {hasActions && (
          <View style={styles.actionRow}>
            {!isCorrected && onCorrect && (
              <TouchableOpacity
                style={[styles.correctBtn, { borderColor: color + '55', backgroundColor: color + '12' }]}
                onPress={onCorrect}
              >
                <Text style={[styles.correctBtnText, { color }]}>{t('conjunction.correct')}</Text>
              </TouchableOpacity>
            )}
            {isCorrected && onRemove && (
              <TouchableOpacity style={styles.removeBtn} onPress={onRemove}>
                <Text style={styles.removeBtnText}>{t('conjunction.remove')}</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 10,
    overflow: 'hidden',
    marginBottom: 8,
  },
  containerCorrected: {
    backgroundColor: 'rgba(52,199,89,0.06)',
  },
  bar: { width: 3 },
  body: { flex: 1, padding: 12, gap: 8 },
  info: { gap: 4 },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  names: { color: '#fff', fontSize: 13, fontWeight: '600', flex: 1 },
  correctedBadge: {
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 1,
    flexShrink: 0,
  },
  detailRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  detail: { color: 'rgba(255,255,255,0.5)', fontSize: 11 },
  detailSep: { color: 'rgba(255,255,255,0.2)', fontSize: 11 },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(255,255,255,0.07)',
    paddingTop: 8,
  },
  correctBtn: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 8,
    borderWidth: 1,
  },
  correctBtnText: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1,
  },
  removeBtn: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  removeBtnText: {
    color: 'rgba(255,255,255,0.3)',
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 0.8,
  },
})
