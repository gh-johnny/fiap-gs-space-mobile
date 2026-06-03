import { useEffect } from 'react'
import { StyleSheet, View, Text, ScrollView } from 'react-native'
import { BlurView } from 'expo-blur'
import Animated, { useSharedValue, withTiming, useAnimatedStyle, Easing } from 'react-native-reanimated'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useAlertStore } from '@/application/stores/use-alert-store'
import { useOrbitalStore } from '@/application/stores/use-orbital-store'
import { TAB_BAR_HEIGHT } from '@/presentation/components/tab-bar/tab-bar'
import { SEVERITY_COLORS } from '@/constants/theme'
import { useTranslation } from '@/i18n/use-translation'

export function DashboardScreen() {
  const insets = useSafeAreaInsets()
  const { conjunctions, activeAlert, correctedCount } = useAlertStore()
  const { positions } = useOrbitalStore()
  const t = useTranslation()

  const criticals = conjunctions.filter((c) => c.severity === 'CRITICAL')
  const warnings = conjunctions.filter((c) => c.severity === 'WARNING')
  const infos = conjunctions.filter((c) => c.severity === 'INFO')

  const riskIndex = Math.min(100, criticals.length * 20 + warnings.length * 8 + infos.length * 2)
  const riskColor = riskIndex >= 71 ? '#FF3B30' : riskIndex >= 41 ? '#FF9500' : '#34C759'
  const riskLabel = riskIndex >= 71 ? t('dashboard.riskHigh') : riskIndex >= 41 ? t('dashboard.riskMedium') : t('dashboard.riskLow')

  const leo = positions.filter((p) => p.alt < 2000).length
  const meo = positions.filter((p) => p.alt >= 2000 && p.alt < 35786).length
  const geo = positions.filter((p) => p.alt >= 35786).length
  const total = positions.length || 1

  const riskWidth = useSharedValue(0)
  useEffect(() => {
    riskWidth.value = withTiming(riskIndex, { duration: 1400, easing: Easing.out(Easing.cubic) })
  }, [riskIndex])
  const riskBarStyle = useAnimatedStyle(() => ({ flex: riskWidth.value / 100 }))

  const upcoming = [...conjunctions]
    .sort((a, b) => a.tcpa.date.getTime() - b.tcpa.date.getTime())
    .slice(0, 6)

  return (
    <View style={styles.root}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.content,
          { paddingTop: insets.top + 16, paddingBottom: TAB_BAR_HEIGHT + 24 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>{t('dashboard.title')}</Text>
        <Text style={styles.subtitle}>{t('dashboard.subtitle')}</Text>

        {activeAlert && (
          <BlurView intensity={40} tint="dark" style={[styles.card, styles.alertBanner]}>
            <View style={[styles.alertBannerDot, { backgroundColor: SEVERITY_COLORS[activeAlert.conjunctionEvent.severity] }]} />
            <View style={styles.alertBannerBody}>
              <Text style={styles.alertBannerLabel}>{t('dashboard.activeAlert')}</Text>
              <Text style={styles.alertBannerObjects} numberOfLines={1}>
                {activeAlert.conjunctionEvent.objectA.name} × {activeAlert.conjunctionEvent.objectB.name}
              </Text>
            </View>
            <Text style={[styles.alertBannerSev, { color: SEVERITY_COLORS[activeAlert.conjunctionEvent.severity] }]}>
              {activeAlert.conjunctionEvent.severity}
            </Text>
          </BlurView>
        )}

        <View style={styles.row}>
          <BlurView intensity={40} tint="dark" style={[styles.card, styles.cardFlex]}>
            <Text style={styles.cardLabel}>{t('dashboard.riskIndex')}</Text>
            <Text style={[styles.riskValue, { color: riskColor }]}>{riskIndex}</Text>
            <Text style={[styles.riskLabel, { color: riskColor }]}>{riskLabel}</Text>
            <View style={styles.riskTrack}>
              <Animated.View style={[styles.riskFill, { backgroundColor: riskColor }, riskBarStyle]} />
              <View style={styles.riskRemainder} />
            </View>
          </BlurView>

          <BlurView intensity={40} tint="dark" style={[styles.card, styles.cardFlex]}>
            <Text style={styles.cardLabel}>{t('dashboard.tracked')}</Text>
            <Text style={styles.bigNumber}>{positions.length || '—'}</Text>
            <Text style={styles.cardSub}>{t('dashboard.orbitalObjects')}</Text>
            <View style={styles.spacer} />
            <Text style={styles.cardLabel}>{t('dashboard.corrected')}</Text>
            <Text style={[styles.medNumber, correctedCount > 0 && { color: '#34C759' }]}>
              {correctedCount}
            </Text>
          </BlurView>
        </View>

        <BlurView intensity={40} tint="dark" style={styles.card}>
          <Text style={styles.cardLabel}>{t('dashboard.conjunctions')}</Text>
          <View style={styles.severityList}>
            <SeverityRow color={SEVERITY_COLORS.CRITICAL} label="CRITICAL" count={criticals.length} />
            <SeverityRow color={SEVERITY_COLORS.WARNING} label="WARNING" count={warnings.length} />
            <SeverityRow color={SEVERITY_COLORS.INFO} label="INFO" count={infos.length} />
          </View>
        </BlurView>

        <BlurView intensity={40} tint="dark" style={styles.card}>
          <Text style={styles.cardLabel}>{t('dashboard.upcoming')}</Text>
          {upcoming.length === 0
            ? <Text style={styles.empty}>{t('dashboard.noEvents')}</Text>
            : upcoming.map((c, i) => (
              <View key={i} style={styles.eventRow}>
                <View style={[styles.eventDot, { backgroundColor: SEVERITY_COLORS[c.severity] }]} />
                <View style={styles.eventInfo}>
                  <Text style={styles.eventObjects} numberOfLines={1}>
                    {c.objectA.name} × {c.objectB.name}
                  </Text>
                  <Text style={styles.eventTcpa}>{c.tcpa.toDisplayString()}</Text>
                </View>
                <Text style={[styles.eventSeverity, { color: SEVERITY_COLORS[c.severity] }]}>
                  {c.severity.slice(0, 4)}
                </Text>
              </View>
            ))
          }
        </BlurView>

        <BlurView intensity={40} tint="dark" style={styles.card}>
          <Text style={styles.cardLabel}>{t('dashboard.zones')}</Text>
          <ZoneBar label="LEO" subtitle="200–2 000 km" count={leo} total={total} color="#00E5FF" />
          <ZoneBar label="MEO" subtitle="2 000–35 786 km" count={meo} total={total} color="#5AC8FA" />
          <ZoneBar label="GEO" subtitle="≥ 35 786 km" count={geo} total={total} color="#64D2FF" />
          {positions.length === 0 && (
            <Text style={styles.empty}>{t('dashboard.openGlobe')}</Text>
          )}
        </BlurView>
      </ScrollView>
    </View>
  )
}

function SeverityRow({ color, label, count }: { color: string; label: string; count: number }) {
  return (
    <View style={styles.severityRow}>
      <View style={[styles.severityDot, { backgroundColor: color }]} />
      <Text style={styles.severityLabel}>{label}</Text>
      <Text style={[styles.severityCount, { color }]}>{count}</Text>
    </View>
  )
}

function ZoneBar({
  label, subtitle, count, total, color,
}: {
  label: string; subtitle: string; count: number; total: number; color: string
}) {
  const pct = count / total
  const width = useSharedValue(0)
  useEffect(() => {
    width.value = withTiming(pct, { duration: 1000, easing: Easing.out(Easing.cubic) })
  }, [pct])
  const barStyle = useAnimatedStyle(() => ({ flex: width.value }))

  return (
    <View style={styles.zoneRow}>
      <View style={styles.zoneLeft}>
        <Text style={styles.zoneLabel}>{label}</Text>
        <Text style={styles.zoneSub}>{subtitle}</Text>
      </View>
      <View style={styles.zoneTrack}>
        <Animated.View style={[styles.zoneFill, { backgroundColor: color }, barStyle]} />
        <View style={styles.zoneRemainder} />
      </View>
      <Text style={[styles.zoneCount, { color }]}>{count}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#000814' },
  scroll: { flex: 1 },
  content: { gap: 12, paddingHorizontal: 16 },
  title: {
    color: '#fff',
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: 2,
    marginBottom: 2,
  },
  subtitle: {
    color: 'rgba(255,255,255,0.35)',
    fontSize: 12,
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  row: { flexDirection: 'row', gap: 12 },
  card: {
    borderRadius: 16,
    padding: 16,
    gap: 8,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255,255,255,0.08)',
    overflow: 'hidden',
  },
  cardFlex: { flex: 1 },
  cardLabel: {
    color: 'rgba(255,255,255,0.35)',
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 1.5,
  },
  cardSub: { color: 'rgba(255,255,255,0.3)', fontSize: 10 },
  bigNumber: { color: '#fff', fontSize: 36, fontWeight: '800', lineHeight: 40 },
  medNumber: { color: '#fff', fontSize: 22, fontWeight: '700' },
  spacer: { flex: 1 },
  riskValue: { fontSize: 42, fontWeight: '800', lineHeight: 46 },
  riskLabel: { fontSize: 10, fontWeight: '700', letterSpacing: 1.5, marginTop: -4 },
  riskTrack: { flexDirection: 'row', height: 4, borderRadius: 2, overflow: 'hidden', marginTop: 4 },
  riskFill: { borderRadius: 2 },
  riskRemainder: { flex: 1, backgroundColor: 'rgba(255,255,255,0.08)' },
  severityList: { gap: 10 },
  severityRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  severityDot: { width: 8, height: 8, borderRadius: 4 },
  severityLabel: { flex: 1, color: 'rgba(255,255,255,0.6)', fontSize: 12, fontWeight: '600', letterSpacing: 0.5 },
  severityCount: { fontSize: 18, fontWeight: '700' },
  eventRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 6, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: 'rgba(255,255,255,0.06)' },
  eventDot: { width: 6, height: 6, borderRadius: 3, flexShrink: 0 },
  eventInfo: { flex: 1, gap: 2 },
  eventObjects: { color: '#fff', fontSize: 12, fontWeight: '500' },
  eventTcpa: { color: 'rgba(255,255,255,0.4)', fontSize: 10 },
  eventSeverity: { fontSize: 9, fontWeight: '700', letterSpacing: 1 },
  zoneRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 6 },
  zoneLeft: { width: 72 },
  zoneLabel: { color: '#fff', fontSize: 12, fontWeight: '700' },
  zoneSub: { color: 'rgba(255,255,255,0.3)', fontSize: 9 },
  zoneTrack: { flex: 1, flexDirection: 'row', height: 6, borderRadius: 3, overflow: 'hidden', backgroundColor: 'rgba(255,255,255,0.06)' },
  zoneFill: { borderRadius: 3 },
  zoneRemainder: { flex: 1 },
  zoneCount: { width: 24, textAlign: 'right', fontSize: 13, fontWeight: '700' },
  empty: { color: 'rgba(255,255,255,0.25)', fontSize: 12, fontStyle: 'italic' },
  alertBanner: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  alertBannerDot: { width: 10, height: 10, borderRadius: 5, flexShrink: 0 },
  alertBannerBody: { flex: 1, gap: 2 },
  alertBannerLabel: { color: 'rgba(255,255,255,0.4)', fontSize: 9, fontWeight: '700', letterSpacing: 1.5 },
  alertBannerObjects: { color: '#fff', fontSize: 13, fontWeight: '600' },
  alertBannerSev: { fontSize: 10, fontWeight: '700', letterSpacing: 1 },
})
