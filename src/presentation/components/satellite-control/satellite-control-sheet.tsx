import React, { useState, useEffect } from 'react'
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, Pressable } from 'react-native'
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withRepeat,
  withTiming,
  runOnJS,
  cancelAnimation,
} from 'react-native-reanimated'
import { Gesture, GestureDetector } from 'react-native-gesture-handler'
import { BlurView } from 'expo-blur'
import { useOrbitalStore } from '@/application/stores/use-orbital-store'
import { TAB_BAR_HEIGHT } from '@/presentation/components/tab-bar/tab-bar'

interface Props {
  noradId: string
  onClose: () => void
}

const SHEET_HEIGHT = 700
const CLOSE_THRESHOLD = 100

// ─── helpers ──────────────────────────────────────────────────────────────────

function orbitBand(alt: number) {
  if (alt < 2000) return 'LEO'
  if (alt < 35786) return 'MEO'
  return 'GEO'
}
function typeLabel(t: string) {
  if (t === 'OPERATIONAL_SATELLITE') return 'OPERACIONAL'
  if (t === 'DEBRIS') return 'DETRITO'
  if (t === 'ROCKET_BODY') return 'ESTÁGIO ORBITAL'
  return t
}
function typeColor(t: string) {
  if (t === 'OPERATIONAL_SATELLITE') return '#00E5FF'
  if (t === 'DEBRIS') return '#FF9500'
  if (t === 'ROCKET_BODY') return '#FF6B35'
  return '#00E5FF'
}

// ─── satellite illustration ────────────────────────────────────────────────────

function SolarArray({ color }: { color: string }) {
  return (
    <View style={[illus.solarArray, { borderColor: color + '70' }]}>
      {[0, 1, 2, 3].map((i) => (
        <View key={i} style={[illus.solarCell, { backgroundColor: color + '22', borderColor: color + '55' }]} />
      ))}
    </View>
  )
}

function SatelliteIllustration({ satType, color }: { satType: string; color: string }) {
  if (satType === 'DEBRIS') {
    return (
      <View style={illus.root}>
        <View style={[illus.glow, { backgroundColor: color + '18' }]} />
        <Text style={[illus.debrisIcon, { color }]}>✦</Text>
        <Text style={[illus.debrisLabel, { color: color + '80' }]}>FRAGMENTO NÃO CONTROLADO</Text>
      </View>
    )
  }
  if (satType === 'ROCKET_BODY') {
    return (
      <View style={illus.root}>
        <View style={[illus.glow, { backgroundColor: color + '18' }]} />
        <View style={[illus.rocketNose, { borderColor: color, backgroundColor: color + '15' }]} />
        <View style={[illus.rocketBody, { borderColor: color, backgroundColor: color + '08' }]}>
          <Text style={[illus.rocketLabel, { color }]}>◎</Text>
          <Text style={[illus.rocketSub, { color: color + '70' }]}>PROPELENTE</Text>
        </View>
        <View style={[illus.rocketNozzle, { borderColor: color, backgroundColor: color + '25' }]} />
      </View>
    )
  }
  // Operational satellite
  return (
    <View style={illus.root}>
      <View style={[illus.glow, { backgroundColor: color + '18' }]} />
      <View style={[illus.antennaPost, { backgroundColor: color + '70' }]} />
      <View style={[illus.antennaDish, { borderColor: color }]} />
      <View style={illus.mainRow}>
        <SolarArray color={color} />
        <View style={[illus.arm, { backgroundColor: color + '55' }]} />
        <View style={[illus.body, { borderColor: color, backgroundColor: color + '08' }]}>
          <View style={[illus.bodyPorthole, { borderColor: color + '80' }]} />
          <View style={[illus.bodyCenter, { backgroundColor: color + '28' }]}>
            <Text style={[illus.bodyIcon, { color }]}>◉</Text>
          </View>
          <View style={[illus.bodyPorthole, { borderColor: color + '80' }]} />
        </View>
        <View style={[illus.arm, { backgroundColor: color + '55' }]} />
        <SolarArray color={color} />
      </View>
      <View style={[illus.thrusterMount, { backgroundColor: color + '40' }]} />
      <View style={[illus.thrusterNozzle, { borderColor: color, backgroundColor: color + '18' }]} />
    </View>
  )
}

// ─── live dot ─────────────────────────────────────────────────────────────────

function LiveDot() {
  const opacity = useSharedValue(1)
  useEffect(() => {
    opacity.value = withRepeat(withTiming(0.15, { duration: 750 }), -1, true)
    return () => cancelAnimation(opacity)
  }, [])
  const s = useAnimatedStyle(() => ({ opacity: opacity.value }))
  return <Animated.View style={[styles.liveDot, s]} />
}

// ─── mode selector ─────────────────────────────────────────────────────────────

const MODES = ['NOMINAL', 'ECO', 'SEGURO'] as const
type Mode = typeof MODES[number]

const MODE_COLORS: Record<Mode, string> = {
  NOMINAL: '#00E5FF',
  ECO: '#34C759',
  SEGURO: '#FF9500',
}

// ─── system panel ──────────────────────────────────────────────────────────────

interface SystemPanelProps {
  icon: string
  title: string
  onValue: string
  offValue: string
  defaultOn?: boolean
  color: string
}

function SystemPanel({ icon, title, onValue, offValue, defaultOn = true, color }: SystemPanelProps) {
  const [on, setOn] = useState(defaultOn)
  return (
    <Pressable style={[styles.sysPanel, on && { borderColor: color + '45' }]} onPress={() => setOn(v => !v)}>
      <View style={styles.sysPanelTop}>
        <Text style={styles.sysPanelIcon}>{icon}</Text>
        <View style={[styles.sysPanelDot, { backgroundColor: on ? color : '#FF3B30' }]} />
      </View>
      <Text style={styles.sysPanelTitle}>{title}</Text>
      <Text style={[styles.sysPanelValue, { color: on ? color : 'rgba(255,59,48,0.7)' }]} numberOfLines={1}>
        {on ? onValue : offValue}
      </Text>
    </Pressable>
  )
}

// ─── orbital correction button ─────────────────────────────────────────────────

const PHASES = [
  'CALCULANDO TRAJETÓRIA…',
  'ATIVANDO PROPULSORES…',
  'Δv +0.3 m/s APLICADO',
] as const

function OrbitalCorrectionButton({ color }: { color: string }) {
  const [phase, setPhase] = useState(-1)
  const pulseOp = useSharedValue(0)

  function start() {
    if (phase >= 0) return
    setPhase(0)
    pulseOp.value = withRepeat(withTiming(0.7, { duration: 500 }), -1, true)
    setTimeout(() => setPhase(1), 1400)
    setTimeout(() => {
      cancelAnimation(pulseOp)
      pulseOp.value = withTiming(0, { duration: 200 })
      setPhase(2)
    }, 2900)
    setTimeout(() => setPhase(-1), 5500)
  }

  const pulseStyle = useAnimatedStyle(() => ({ opacity: pulseOp.value }))
  const isDone = phase === 2
  const isRunning = phase === 0 || phase === 1
  const btnColor = isDone ? '#34C759' : color

  return (
    <Pressable onPress={start} style={styles.correctionWrap}>
      <View style={[styles.correctionBtn, { borderColor: btnColor + '70' }, isDone && styles.correctionBtnDone]}>
        <Animated.View
          style={[StyleSheet.absoluteFill, styles.correctionPulse, { borderColor: color }, pulseStyle]}
          pointerEvents="none"
        />
        <Text style={[styles.correctionText, { color: btnColor }]}>
          {phase >= 0 ? PHASES[Math.min(phase, 2)] : 'EXECUTAR CORREÇÃO ORBITAL'}
        </Text>
        {!isRunning && (
          <Text style={[styles.correctionArrow, { color: btnColor + '80' }]}>
            {isDone ? '✓' : '›'}
          </Text>
        )}
      </View>
    </Pressable>
  )
}

// ─── main sheet ────────────────────────────────────────────────────────────────

export function SatelliteControlSheet({ noradId, onClose }: Props) {
  const translateY = useSharedValue(SHEET_HEIGHT)

  useEffect(() => {
    translateY.value = withSpring(0, { damping: 22, stiffness: 190 })
  }, [])

  const satellite = useOrbitalStore(s => s.satellites.find(sat => sat.noradId.value === Number(noradId)) ?? null)
  const position  = useOrbitalStore(s => s.positions.find(p => p.noradId.value === Number(noradId)) ?? null)

  const pan = Gesture.Pan()
    .onUpdate(e => { translateY.value = Math.max(0, e.translationY) })
    .onEnd(e => {
      if (e.translationY > CLOSE_THRESHOLD) {
        translateY.value = withSpring(SHEET_HEIGHT, { damping: 20 })
        runOnJS(onClose)()
      } else {
        translateY.value = withSpring(0, { damping: 22, stiffness: 190 })
      }
    })

  const animStyle = useAnimatedStyle(() => ({ transform: [{ translateY: translateY.value }] }))

  const [activeMode, setActiveMode] = useState<Mode>('NOMINAL')

  const satType = satellite?.type ?? ''
  const color   = typeColor(satType)
  const band    = position ? orbitBand(position.alt) : null
  const vel     = position ? Math.sqrt(398600 / (6371 + position.alt)).toFixed(1) : null

  return (
    <Animated.View style={[styles.container, animStyle]}>
      <View style={[styles.topBar, { backgroundColor: color }]} />
      <BlurView intensity={75} tint="dark" style={styles.blur}>

        <GestureDetector gesture={pan}>
          <View style={styles.handleArea}>
            <View style={styles.handle} />
            <Text style={styles.sheetLabel}>PAINEL DE CONTROLE</Text>
          </View>
        </GestureDetector>

        <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>

          {/* Illustration + header */}
          <View style={styles.illustrationArea}>
            <SatelliteIllustration satType={satType} color={color} />
          </View>

          <View style={styles.header}>
            <View style={styles.headerRow}>
              <View style={styles.headerText}>
                <Text style={styles.satName} numberOfLines={2}>{satellite?.name ?? `SAT-${noradId}`}</Text>
                <View style={styles.badgeRow}>
                  <View style={[styles.typeBadge, { backgroundColor: color + '1A', borderColor: color + '55' }]}>
                    <View style={[styles.typeDot, { backgroundColor: color }]} />
                    <Text style={[styles.typeBadgeText, { color }]}>{typeLabel(satType)}</Text>
                  </View>
                  {band && <View style={styles.orbitBadge}><Text style={styles.orbitBadgeText}>{band}</Text></View>}
                </View>
                <Text style={styles.noradId}>NORAD {noradId}</Text>
              </View>
              <TouchableOpacity style={styles.closeBtn} onPress={onClose} hitSlop={10}>
                <Text style={styles.closeBtnText}>✕</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Compact telemetry */}
          <View style={[styles.telemetry, { borderColor: color + '22' }]}>
            <LiveDot />
            <Text style={[styles.telemetryDivider, { color: color + '40' }]}>·</Text>
            {position ? (
              <>
                <Text style={styles.telemetryItem}>
                  <Text style={styles.telemetryKey}>LAT </Text>
                  <Text style={[styles.telemetryVal, { color }]}>{position.lat.toFixed(1)}°</Text>
                </Text>
                <Text style={[styles.telemetryDivider, { color: 'rgba(255,255,255,0.12)' }]}>/</Text>
                <Text style={styles.telemetryItem}>
                  <Text style={styles.telemetryKey}>LNG </Text>
                  <Text style={[styles.telemetryVal, { color }]}>{position.lng.toFixed(1)}°</Text>
                </Text>
                <Text style={[styles.telemetryDivider, { color: 'rgba(255,255,255,0.12)' }]}>/</Text>
                <Text style={styles.telemetryItem}>
                  <Text style={styles.telemetryKey}>ALT </Text>
                  <Text style={[styles.telemetryVal, { color }]}>{Math.round(position.alt)} km</Text>
                </Text>
                <Text style={[styles.telemetryDivider, { color: 'rgba(255,255,255,0.12)' }]}>/</Text>
                <Text style={styles.telemetryItem}>
                  <Text style={styles.telemetryKey}>VEL </Text>
                  <Text style={[styles.telemetryVal, { color }]}>{vel} km/s</Text>
                </Text>
              </>
            ) : (
              <Text style={styles.telemetryKey}>SEM SINAL</Text>
            )}
          </View>

          {/* Mode selector */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>MODO DE OPERAÇÃO</Text>
            <View style={styles.modeRow}>
              {MODES.map(m => (
                <Pressable key={m} style={styles.modeBtnWrap} onPress={() => setActiveMode(m)}>
                  <View style={[
                    styles.modeBtn,
                    activeMode === m && { backgroundColor: MODE_COLORS[m] + '18', borderColor: MODE_COLORS[m] + '60' },
                  ]}>
                    <Text style={[styles.modeBtnText, activeMode === m && { color: MODE_COLORS[m] }]}>{m}</Text>
                  </View>
                </Pressable>
              ))}
            </View>
          </View>

          {/* System panels */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>SISTEMAS</Text>
            <View style={styles.sysPanelRow}>
              <SystemPanel icon="⚡" title="SOLAR" onValue="94 W · 98%" offValue="OFFLINE" color={color} defaultOn />
              <SystemPanel icon="📡" title="COMMS" onValue="S-BAND 2.2G" offValue="SILÊNCIO" color={color} defaultOn />
              <SystemPanel icon="🔭" title="CÂMERA" onValue="4K · VIS" offValue="OFFLINE" color={color} defaultOn={false} />
            </View>
          </View>

          {/* Orbital correction CTA */}
          <View style={[styles.section, { marginBottom: 8 }]}>
            <OrbitalCorrectionButton color={color} />
          </View>

        </ScrollView>
      </BlurView>
    </Animated.View>
  )
}

// ─── illustration styles ───────────────────────────────────────────────────────

const illus = StyleSheet.create({
  root:         { alignItems: 'center', justifyContent: 'center', height: 130, position: 'relative' },
  glow:         { position: 'absolute', width: 160, height: 80, borderRadius: 80 },
  mainRow:      { flexDirection: 'row', alignItems: 'center' },
  solarArray:   { width: 64, height: 36, borderWidth: StyleSheet.hairlineWidth, borderRadius: 3, flexDirection: 'row', overflow: 'hidden' },
  solarCell:    { flex: 1, borderRightWidth: StyleSheet.hairlineWidth },
  arm:          { width: 14, height: 2 },
  body:         { width: 44, height: 52, borderWidth: 1, borderRadius: 6, alignItems: 'center', justifyContent: 'space-between', paddingVertical: 6 },
  bodyPorthole: { width: 10, height: 10, borderRadius: 5, borderWidth: 1 },
  bodyCenter:   { width: 24, height: 18, borderRadius: 3, alignItems: 'center', justifyContent: 'center' },
  bodyIcon:     { fontSize: 10 },
  antennaPost:  { width: 2, height: 14, borderRadius: 1, marginBottom: 2 },
  antennaDish:  { width: 22, height: 12, borderRadius: 11, borderWidth: 1, borderTopWidth: 0, marginBottom: 4, transform: [{ scaleY: -1 }] },
  thrusterMount:{ width: 16, height: 4, borderRadius: 2, marginTop: 4 },
  thrusterNozzle:{ width: 22, height: 12, borderWidth: 1, borderRadius: 3, borderTopWidth: 0, marginTop: 1 },
  // rocket body
  rocketNose:   { width: 28, height: 18, borderTopLeftRadius: 14, borderTopRightRadius: 14, borderWidth: 1, borderBottomWidth: 0 },
  rocketBody:   { width: 38, height: 56, borderWidth: 1, borderRadius: 4, alignItems: 'center', justifyContent: 'center', gap: 4 },
  rocketLabel:  { fontSize: 18 },
  rocketSub:    { fontSize: 7, fontWeight: '700', letterSpacing: 1 },
  rocketNozzle: { width: 30, height: 14, borderTopWidth: 0, borderWidth: 1, borderBottomLeftRadius: 6, borderBottomRightRadius: 6 },
  // debris
  debrisIcon:   { fontSize: 52, marginBottom: 4 },
  debrisLabel:  { fontSize: 8, fontWeight: '700', letterSpacing: 1.5, textAlign: 'center' },
})

// ─── main styles ───────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: TAB_BAR_HEIGHT,
    left: 0, right: 0,
    height: SHEET_HEIGHT,
    borderTopLeftRadius: 26,
    borderTopRightRadius: 26,
    overflow: 'hidden',
    zIndex: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -8 },
    shadowOpacity: 0.55,
    shadowRadius: 24,
    elevation: 24,
  },
  topBar:   { height: 3 },
  blur:     { flex: 1 },
  handleArea: { alignItems: 'center', paddingTop: 14, paddingBottom: 8, gap: 5 },
  handle:   { width: 36, height: 4, borderRadius: 2, backgroundColor: 'rgba(255,255,255,0.2)' },
  sheetLabel: { color: 'rgba(255,255,255,0.22)', fontSize: 9, fontWeight: '700', letterSpacing: 2.5 },

  scroll:        { flex: 1 },
  scrollContent: { paddingBottom: 32 },

  illustrationArea: { alignItems: 'center', paddingVertical: 4 },

  header: { paddingHorizontal: 20, paddingBottom: 14, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: 'rgba(255,255,255,0.07)' },
  headerRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 8 },
  headerText: { flex: 1, gap: 8 },
  satName: { color: '#fff', fontSize: 20, fontWeight: '800', letterSpacing: -0.4, lineHeight: 26 },
  badgeRow: { flexDirection: 'row', gap: 7 },
  typeBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, borderRadius: 7, borderWidth: 1, paddingHorizontal: 9, paddingVertical: 4 },
  typeDot:  { width: 6, height: 6, borderRadius: 3 },
  typeBadgeText: { fontSize: 9, fontWeight: '700', letterSpacing: 1.2 },
  orbitBadge: { borderRadius: 7, borderWidth: StyleSheet.hairlineWidth, borderColor: 'rgba(255,255,255,0.2)', backgroundColor: 'rgba(255,255,255,0.05)', paddingHorizontal: 9, paddingVertical: 4 },
  orbitBadgeText: { color: 'rgba(255,255,255,0.5)', fontSize: 9, fontWeight: '700', letterSpacing: 1.2 },
  noradId: { color: 'rgba(255,255,255,0.22)', fontSize: 10, letterSpacing: 1 },
  closeBtn: { width: 30, height: 30, borderRadius: 15, backgroundColor: 'rgba(255,255,255,0.07)', borderWidth: StyleSheet.hairlineWidth, borderColor: 'rgba(255,255,255,0.12)', alignItems: 'center', justifyContent: 'center' },
  closeBtnText: { color: 'rgba(255,255,255,0.4)', fontSize: 13 },

  // telemetry
  telemetry: { marginHorizontal: 16, marginVertical: 12, flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 6, paddingHorizontal: 14, paddingVertical: 10, borderRadius: 12, backgroundColor: 'rgba(0,229,255,0.03)', borderWidth: StyleSheet.hairlineWidth },
  liveDot:   { width: 6, height: 6, borderRadius: 3, backgroundColor: '#00E5FF' },
  telemetryDivider: { fontSize: 12 },
  telemetryItem: {},
  telemetryKey: { color: 'rgba(255,255,255,0.3)', fontSize: 10, fontWeight: '600', letterSpacing: 0.5 },
  telemetryVal: { fontSize: 11, fontWeight: '700', letterSpacing: 0.3 },

  // section
  section: { paddingHorizontal: 16, paddingTop: 14, gap: 10 },
  sectionLabel: { color: 'rgba(255,255,255,0.28)', fontSize: 9, fontWeight: '700', letterSpacing: 2 },

  // mode selector
  modeRow: { flexDirection: 'row', gap: 8 },
  modeBtnWrap: { flex: 1 },
  modeBtn: { paddingVertical: 10, borderRadius: 10, borderWidth: StyleSheet.hairlineWidth, borderColor: 'rgba(255,255,255,0.1)', backgroundColor: 'rgba(255,255,255,0.04)', alignItems: 'center' },
  modeBtnText: { color: 'rgba(255,255,255,0.3)', fontSize: 10, fontWeight: '700', letterSpacing: 1.5 },

  // system panels
  sysPanelRow: { flexDirection: 'row', gap: 8 },
  sysPanel: { flex: 1, backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: 14, padding: 12, gap: 5, borderWidth: StyleSheet.hairlineWidth, borderColor: 'rgba(255,255,255,0.08)' },
  sysPanelTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  sysPanelIcon: { fontSize: 18 },
  sysPanelDot: { width: 6, height: 6, borderRadius: 3 },
  sysPanelTitle: { color: 'rgba(255,255,255,0.4)', fontSize: 8, fontWeight: '700', letterSpacing: 1.5 },
  sysPanelValue: { fontSize: 10, fontWeight: '700', letterSpacing: 0.3 },

  // orbital correction
  correctionWrap: { width: '100%' },
  correctionBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    height: 56, borderRadius: 16, borderWidth: 1,
    backgroundColor: 'rgba(255,255,255,0.04)', overflow: 'hidden', gap: 10,
  },
  correctionBtnDone: { backgroundColor: 'rgba(52,199,89,0.08)', borderColor: 'rgba(52,199,89,0.4)' },
  correctionPulse: { borderRadius: 16, borderWidth: 1.5 },
  correctionText: { fontSize: 12, fontWeight: '700', letterSpacing: 1.2 },
  correctionArrow: { fontSize: 20, fontWeight: '300' },
})
