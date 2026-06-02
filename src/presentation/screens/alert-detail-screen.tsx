import { useEffect } from 'react'
import { StyleSheet, View, Text, ScrollView, TouchableOpacity } from 'react-native'
import { BlurView } from 'expo-blur'
import { useRouter } from 'expo-router'
import { useAlertStore } from '@/application/stores/use-alert-store'
import { useContainer } from '@/application/container/container-context'
import type { Severity } from '@/domain/value-objects'

const SEVERITY_COLORS: Record<Severity, string> = {
  CRITICAL: '#FF3B30',
  WARNING: '#FF9500',
  INFO: '#34C759',
}

export function AlertDetailScreen() {
  const router = useRouter()
  const { activeAlert, acknowledgeCurrentAlert } = useAlertStore()
  const { acknowledgeAlert } = useContainer()

  useEffect(() => {
    if (activeAlert && activeAlert.status === 'detected') {
      void acknowledgeCurrentAlert(acknowledgeAlert)
    }
  }, [])

  if (!activeAlert) return null

  const event = activeAlert.conjunctionEvent
  const color = SEVERITY_COLORS[event.severity]

  return (
    <BlurView intensity={60} tint="dark" style={StyleSheet.absoluteFill}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={[styles.badge, { backgroundColor: color + '33', borderColor: color }]}>
          <Text style={[styles.badgeText, { color }]}>{event.severity}</Text>
        </View>

        <Text style={styles.title}>Evento de Conjunção</Text>

        <View style={styles.objectCard}>
          <Text style={styles.cardTitle}>Objeto A</Text>
          <Text style={styles.objectName}>{event.objectA.name}</Text>
          <Text style={styles.noradId}>NORAD #{event.objectA.noradId.value}</Text>
        </View>

        <View style={styles.objectCard}>
          <Text style={styles.cardTitle}>Objeto B</Text>
          <Text style={styles.objectName}>{event.objectB.name}</Text>
          <Text style={styles.noradId}>NORAD #{event.objectB.noradId.value}</Text>
        </View>

        <View style={styles.metricsCard}>
          <MetricBlock label="Probabilidade de Colisão" value={event.pc.toScientificNotation()} />
          <MetricBlock label="Distância de Passagem" value={event.missDistance.toDisplayString()} />
          <MetricBlock label="Tempo para Aproximação" value={event.tcpa.toDisplayString()} />
          <MetricBlock label="Janela UTC" value={event.tcpa.toUtcString()} />
        </View>

        <Text style={styles.status}>
          Status: <Text style={{ color }}>{activeAlert.status.toUpperCase()}</Text>
        </Text>

        <TouchableOpacity style={styles.closeBtn} onPress={() => router.back()}>
          <Text style={styles.closeBtnText}>FECHAR</Text>
        </TouchableOpacity>
      </ScrollView>
    </BlurView>
  )
}

function MetricBlock({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.metricBlock}>
      <Text style={styles.metricLabel}>{label}</Text>
      <Text style={styles.metricValue}>{value}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  content: { padding: 24, paddingTop: 60, gap: 16 },
  badge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
    borderWidth: 1,
  },
  badgeText: { fontSize: 11, fontWeight: '700', letterSpacing: 1.5 },
  title: { color: '#fff', fontSize: 22, fontWeight: '700' },
  objectCard: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 12,
    padding: 14,
    gap: 2,
  },
  cardTitle: { color: 'rgba(255,255,255,0.4)', fontSize: 10, fontWeight: '600', letterSpacing: 1 },
  objectName: { color: '#fff', fontSize: 15, fontWeight: '600' },
  noradId: { color: 'rgba(255,255,255,0.4)', fontSize: 11 },
  metricsCard: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 12,
    padding: 14,
    gap: 10,
  },
  metricBlock: { gap: 2 },
  metricLabel: { color: 'rgba(255,255,255,0.4)', fontSize: 11 },
  metricValue: { color: '#fff', fontSize: 14, fontWeight: '500' },
  status: { color: 'rgba(255,255,255,0.6)', fontSize: 13 },
  closeBtn: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 8,
  },
  closeBtnText: { color: '#fff', fontWeight: '700', letterSpacing: 1 },
})
