import React from 'react'
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native'
import { BlurView } from 'expo-blur'
import Animated, { useAnimatedStyle, withSpring } from 'react-native-reanimated'
import { OrbitalAlert } from '@/domain/entities/orbital-alert'
import type { Severity } from '@/domain/value-objects'
import { TAB_BAR_HEIGHT } from '@/presentation/components/tab-bar/tab-bar'
import { useUIStore } from '@/application/stores/use-ui-store'
import { formatPc, formatMissDistance, formatTcpa, formatWindow } from '@/presentation/utils/format-simple'
import { SEVERITY_COLORS } from '@/constants/theme'
import { useTranslation } from '@/i18n/use-translation'

interface AlertCardProps {
  alert: OrbitalAlert
  onPress: () => void
  onAcknowledge: () => void
  onDismiss: () => void
  visible: boolean
}

export function AlertCard({ alert, onPress, onAcknowledge, onDismiss, visible }: AlertCardProps) {
  const { conjunctionEvent: event } = alert
  const severity = event.severity
  const { simpleMode, locale } = useUIStore()
  const t = useTranslation()

  const SEVERITY_LABELS: Record<Severity, string> = {
    CRITICAL: t('severity.critical'),
    WARNING: t('severity.warning'),
    INFO: t('severity.info'),
  }

  const RECOMMENDATIONS: Record<Severity, string> = {
    CRITICAL: t('rec.critical'),
    WARNING: t('rec.warning'),
    INFO: t('rec.info'),
  }

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: withSpring(visible ? 0 : 300, { damping: 20, stiffness: 200 }) }],
    opacity: withSpring(visible ? 1 : 0),
  }))

  return (
    <Animated.View style={[styles.container, animStyle]}>
      <TouchableOpacity onPress={onPress} activeOpacity={0.85}>
        <BlurView intensity={40} tint="dark" style={styles.blur}>
          <View style={[styles.severityBar, { backgroundColor: SEVERITY_COLORS[severity] }]} />

          <View style={styles.content}>
            <View style={styles.header}>
              <Text style={[styles.severityLabel, { color: SEVERITY_COLORS[severity] }]}>
                {SEVERITY_LABELS[severity]}
              </Text>
              <View style={styles.headerRight}>
                <Text style={styles.detailHint}>{t('alert.viewDetails')}</Text>
                <TouchableOpacity onPress={onDismiss} hitSlop={12}>
                  <Text style={styles.closeBtn}>✕</Text>
                </TouchableOpacity>
              </View>
            </View>

            <Text style={styles.objects}>
              {event.objectA.name} × {event.objectB.name}
            </Text>

            <View style={styles.metrics}>
              <MetricRow
                label={simpleMode ? t('alert.probability') : t('alert.pc')}
                value={formatPc(event.pc, simpleMode, locale)}
              />
              <MetricRow
                label={simpleMode ? t('alert.distance') : t('alert.missDistance')}
                value={formatMissDistance(event.missDistance, simpleMode, locale)}
              />
              <MetricRow
                label={simpleMode ? t('alert.when') : t('alert.tcpa')}
                value={formatTcpa(event.tcpa, simpleMode, locale)}
              />
              <MetricRow
                label={simpleMode ? t('alert.time') : t('alert.window')}
                value={formatWindow(event.tcpa, simpleMode, locale)}
              />
            </View>

            <Text style={styles.recommendation}>{RECOMMENDATIONS[severity]}</Text>

            <TouchableOpacity
              style={[styles.ackBtn, { borderColor: SEVERITY_COLORS[severity] }]}
              onPress={onAcknowledge}
            >
              <Text style={[styles.ackBtnText, { color: SEVERITY_COLORS[severity] }]}>
                {t('alert.acknowledge')}
              </Text>
            </TouchableOpacity>
          </View>
        </BlurView>
      </TouchableOpacity>
    </Animated.View>
  )
}

function MetricRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.metricRow}>
      <Text style={styles.metricLabel}>{label}</Text>
      <Text style={styles.metricValue}>{value}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: TAB_BAR_HEIGHT + 12,
    left: 16,
    right: 16,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    zIndex: 15,
  },
  blur: { flexDirection: 'row' },
  severityBar: { width: 4 },
  content: { flex: 1, padding: 16, gap: 8 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  severityLabel: { fontSize: 11, fontWeight: '700', letterSpacing: 1.5 },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  detailHint: { color: 'rgba(255,255,255,0.35)', fontSize: 10, letterSpacing: 0.5 },
  closeBtn: { color: 'rgba(255,255,255,0.4)', fontSize: 16 },
  objects: { color: '#fff', fontSize: 15, fontWeight: '600' },
  metrics: { gap: 4 },
  metricRow: { flexDirection: 'row', justifyContent: 'space-between' },
  metricLabel: { color: 'rgba(255,255,255,0.5)', fontSize: 12 },
  metricValue: { color: '#fff', fontSize: 12, fontWeight: '500' },
  recommendation: { color: 'rgba(255,255,255,0.7)', fontSize: 11, fontStyle: 'italic' },
  ackBtn: {
    marginTop: 4,
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: 8,
    alignItems: 'center',
  },
  ackBtnText: { fontSize: 12, fontWeight: '700', letterSpacing: 1 },
})
