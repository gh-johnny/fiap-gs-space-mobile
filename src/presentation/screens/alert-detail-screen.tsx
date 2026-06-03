import { useEffect } from 'react'
import { StyleSheet, View, Text, ScrollView, TouchableOpacity } from 'react-native'
import { useRouter } from 'expo-router'
import { SettingsOverlay } from '@/presentation/components/settings-overlay/settings-overlay'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useAlertStore } from '@/application/stores/use-alert-store'
import { useUIStore } from '@/application/stores/use-ui-store'
import { useContainer } from '@/application/container/container-context'
import { formatPc, formatMissDistance, formatTcpa, formatWindow } from '@/presentation/utils/format-simple'
import type { Severity } from '@/domain/value-objects'
import { SEVERITY_COLORS } from '@/constants/theme'


const SEVERITY_LABELS: Record<Severity, string> = {
  CRITICAL: 'CRÍTICO',
  WARNING: 'ALERTA',
  INFO: 'INFO',
}

const RECOMMENDATIONS: Record<Severity, string> = {
  CRITICAL: 'Ação imediata necessária — risco de colisão iminente',
  WARNING: 'Monitorar de perto — janela de manobra disponível',
  INFO: 'Situação sob controle — continuar monitoramento',
}

export function AlertDetailScreen() {
  const router = useRouter()
  const insets = useSafeAreaInsets()
  const { activeAlert, acknowledgeCurrentAlert } = useAlertStore()
  const { acknowledgeAlert } = useContainer()
  const { simpleMode } = useUIStore()

  useEffect(() => {
    if (activeAlert && activeAlert.status === 'detected') {
      void acknowledgeCurrentAlert(acknowledgeAlert)
    }
  }, [])

  if (!activeAlert) return null

  const event = activeAlert.conjunctionEvent
  const color = SEVERITY_COLORS[event.severity]

  return (
    <View style={styles.root}>
      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingTop: insets.top + 20, paddingBottom: insets.bottom + 32 },
        ]}
        showsVerticalScrollIndicator={false}
      >

        <View style={[styles.badge, { backgroundColor: color + '22', borderColor: color + '55' }]}>
          <View style={[styles.badgeDot, { backgroundColor: color }]} />
          <Text style={[styles.badgeText, { color }]}>{SEVERITY_LABELS[event.severity]}</Text>
        </View>

        {/* Hero: the two objects */}
        <View style={styles.hero}>
          <View style={styles.objectBlock}>
            <Text style={styles.objectName} numberOfLines={2}>{event.objectA.name}</Text>
            <Text style={styles.noradId}>NORAD {event.objectA.noradId.value}</Text>
          </View>

          <Text style={[styles.versus, { color }]}>×</Text>

          <View style={styles.objectBlock}>
            <Text style={styles.objectName} numberOfLines={2}>{event.objectB.name}</Text>
            <Text style={styles.noradId}>NORAD {event.objectB.noradId.value}</Text>
          </View>
        </View>

        {/* 2×2 metric grid */}
        <View style={styles.grid}>
          <MetricCard
            label={simpleMode ? 'Probabilidade' : 'Pc'}
            value={formatPc(event.pc, simpleMode)}
            color={color}
          />
          <MetricCard
            label={simpleMode ? 'Distância' : 'Miss Distance'}
            value={formatMissDistance(event.missDistance, simpleMode)}
            color={color}
          />
          <MetricCard
            label={simpleMode ? 'Quando' : 'TCPA'}
            value={formatTcpa(event.tcpa, simpleMode)}
            color={color}
          />
          <MetricCard
            label={simpleMode ? 'Horário' : 'Janela UTC'}
            value={formatWindow(event.tcpa, simpleMode)}
            color={color}
          />
        </View>

        {/* Recommendation */}
        <View style={[styles.recommendation, { borderLeftColor: color }]}>
          <Text style={styles.recommendationText}>{RECOMMENDATIONS[event.severity]}</Text>
        </View>

        {/* Status */}
        <Text style={styles.status}>
          Status:{' '}
          <Text style={{ color, fontWeight: '700' }}>{activeAlert.status.toUpperCase()}</Text>
        </Text>

        {/* Close button */}
        <TouchableOpacity
          style={[styles.closeBtn, { borderColor: color + '88' }]}
          onPress={() => router.back()}
          activeOpacity={0.8}
        >
          <Text style={[styles.closeBtnText, { color }]}>FECHAR</Text>
        </TouchableOpacity>

      </ScrollView>
      <SettingsOverlay />
    </View>
  )
}

function MetricCard({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <View style={styles.metricCard}>
      <Text style={styles.metricLabel}>{label}</Text>
      <Text style={[styles.metricValue, { color }]}>{value}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#000814' },
  content: { paddingHorizontal: 22, gap: 22 },

  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
  },
  badgeDot: { width: 7, height: 7, borderRadius: 4 },
  badgeText: { fontSize: 11, fontWeight: '700', letterSpacing: 1.5 },


  hero: { alignItems: 'center', gap: 10, paddingVertical: 4 },
  objectBlock: { alignItems: 'center', gap: 4 },
  objectName: {
    color: '#fff',
    fontSize: 19,
    fontWeight: '700',
    textAlign: 'center',
    letterSpacing: 0.2,
    lineHeight: 24,
  },
  noradId: { color: 'rgba(255,255,255,0.32)', fontSize: 11, letterSpacing: 0.5 },
  versus: { fontSize: 34, fontWeight: '200', lineHeight: 38 },

  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  metricCard: {
    flexBasis: '47%',
    flexGrow: 1,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 16,
    padding: 16,
    gap: 8,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  metricLabel: {
    color: 'rgba(255,255,255,0.38)',
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  metricValue: { fontSize: 16, fontWeight: '700', letterSpacing: 0.2 },

  recommendation: {
    borderLeftWidth: 3,
    paddingLeft: 16,
    paddingVertical: 2,
  },
  recommendationText: {
    color: 'rgba(255,255,255,0.62)',
    fontSize: 13,
    lineHeight: 20,
    fontStyle: 'italic',
  },

  status: {
    color: 'rgba(255,255,255,0.35)',
    fontSize: 12,
    textAlign: 'center',
    letterSpacing: 0.5,
  },

  closeBtn: {
    borderWidth: 1.5,
    borderRadius: 16,
    paddingVertical: 17,
    alignItems: 'center',
    marginTop: 2,
  },
  closeBtnText: { fontSize: 13, fontWeight: '700', letterSpacing: 2 },
})
