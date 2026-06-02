import React, { useState, useRef, useEffect } from 'react'
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

interface SatelliteControlSheetProps {
  noradId: string
  onClose: () => void
}

const SHEET_HEIGHT = 620
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
  if (t === 'ROCKET_BODY') return 'ESTÁGIO'
  return t
}

function typeColor(t: string) {
  if (t === 'OPERATIONAL_SATELLITE') return '#00E5FF'
  if (t === 'DEBRIS') return '#FF9500'
  if (t === 'ROCKET_BODY') return '#FF6B35'
  return '#00E5FF'
}

// ─── sub-components ────────────────────────────────────────────────────────────

function LiveDot() {
  const opacity = useSharedValue(1)
  useEffect(() => {
    opacity.value = withRepeat(withTiming(0.2, { duration: 700 }), -1, true)
    return () => cancelAnimation(opacity)
  }, [])
  const style = useAnimatedStyle(() => ({ opacity: opacity.value }))
  return (
    <View style={styles.liveRow}>
      <Animated.View style={[styles.liveDot, style]} />
      <Text style={styles.liveText}>LIVE</Text>
    </View>
  )
}

function PulseRing({ danger }: { danger?: boolean }) {
  const opacity = useSharedValue(0.1)
  useEffect(() => {
    opacity.value = withRepeat(withTiming(0.9, { duration: 550 }), -1, true)
    return () => cancelAnimation(opacity)
  }, [])
  const style = useAnimatedStyle(() => ({ opacity: opacity.value }))
  return (
    <Animated.View
      style={[StyleSheet.absoluteFill, styles.pulseRing, danger && styles.pulseRingDanger, style]}
      pointerEvents="none"
    />
  )
}

function SectionHeader({ num, title }: { num: string; title: string }) {
  return (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionNum}>{num}</Text>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.sectionLine} />
    </View>
  )
}

// ─── control button ────────────────────────────────────────────────────────────

interface ControlButtonProps {
  icon: string
  label: string
  kind: 'command' | 'toggle'
  onSuccess?: string
  danger?: boolean
  delayMs?: [number, number]
}

function ControlButton({ icon, label, kind, onSuccess, danger = false, delayMs = [700, 1400] }: ControlButtonProps) {
  const [cmdState, setCmdState] = useState<'idle' | 'running' | 'done'>('idle')
  const [toggled, setToggled] = useState(false)

  const isOn = kind === 'toggle' && toggled
  const isDone = cmdState === 'done'
  const isRunning = cmdState === 'running'

  const accentColor = isDone ? '#34C759' : isOn ? '#00E5FF' : danger ? '#FF3B30' : 'rgba(255,255,255,0.07)'

  function handlePress() {
    if (kind === 'toggle') { setToggled(v => !v); return }
    if (isRunning) return
    setCmdState('running')
    const ms = delayMs[0] + Math.random() * (delayMs[1] - delayMs[0])
    setTimeout(() => {
      setCmdState('done')
      setTimeout(() => setCmdState('idle'), 2200)
    }, ms)
  }

  return (
    <Pressable onPress={handlePress} style={styles.btnWrap}>
      <View style={[
        styles.btn,
        isOn && styles.btnOn,
        isDone && styles.btnDone,
        danger && styles.btnDanger,
      ]}>
        {isRunning && <PulseRing danger={danger} />}
        <View style={[styles.btnAccent, { backgroundColor: accentColor }]} />
        <Text style={[styles.btnIcon, isOn && styles.btnIconOn, isDone && styles.btnIconDone]}>
          {isDone ? '✓' : icon}
        </Text>
        <Text style={[styles.btnLabel, isOn && styles.btnLabelOn, isDone && styles.btnLabelDone]} numberOfLines={1}>
          {isDone ? (onSuccess ?? 'OK') : isRunning ? '···' : label}
        </Text>
      </View>
    </Pressable>
  )
}

// ─── emergency button ──────────────────────────────────────────────────────────

function EmergencyButton() {
  const [state, setState] = useState<'idle' | 'running' | 'done'>('idle')
  const isRunning = state === 'running'
  const isDone = state === 'done'

  function handlePress() {
    if (isRunning) return
    setState('running')
    setTimeout(() => {
      setState('done')
      setTimeout(() => setState('idle'), 3000)
    }, 1600)
  }

  return (
    <Pressable onPress={handlePress} style={styles.emergencyWrap}>
      <View style={[styles.emergencyBtn, isDone && styles.emergencyBtnDone]}>
        {isRunning && <PulseRing danger={!isDone} />}
        <View style={styles.emergencyStripe} />
        <Text style={[styles.emergencyIcon, isDone && { color: '#34C759' }]}>
          {isDone ? '✓' : '⚠'}
        </Text>
        <View style={styles.emergencyText}>
          <Text style={[styles.emergencyLabel, isDone && { color: '#34C759' }]}>
            {isDone ? 'MODO SEGURO ATIVADO' : 'ATIVAR MODO SEGURO'}
          </Text>
          <Text style={styles.emergencySub}>
            {isDone ? 'todos os sistemas em standby' : 'protocolo de emergência · uso restrito'}
          </Text>
        </View>
        <Text style={[styles.emergencyArrow, isDone && { color: '#34C759' }]}>›</Text>
      </View>
    </Pressable>
  )
}

// ─── main sheet ────────────────────────────────────────────────────────────────

export function SatelliteControlSheet({ noradId, onClose }: SatelliteControlSheetProps) {
  const translateY = useSharedValue(SHEET_HEIGHT)

  useEffect(() => {
    translateY.value = withSpring(0, { damping: 22, stiffness: 190 })
  }, [])

  const satellite = useOrbitalStore(s => s.satellites.find(sat => sat.noradId.value === Number(noradId)) ?? null)
  const position  = useOrbitalStore(s => s.positions.find(p => p.noradId.value === Number(noradId)) ?? null)

  const onCloseRef = useRef(onClose)
  onCloseRef.current = onClose

  const pan = Gesture.Pan()
    .onUpdate(e => { translateY.value = Math.max(0, e.translationY) })
    .onEnd(e => {
      if (e.translationY > CLOSE_THRESHOLD) {
        translateY.value = withSpring(SHEET_HEIGHT, { damping: 20 })
        runOnJS(onCloseRef.current)()
      } else {
        translateY.value = withSpring(0, { damping: 22, stiffness: 190 })
      }
    })

  const animStyle = useAnimatedStyle(() => ({ transform: [{ translateY: translateY.value }] }))

  const satType = satellite?.type ?? ''
  const color   = typeColor(satType)
  const vel     = position ? Math.sqrt(398600 / (6371 + position.alt)).toFixed(1) : null
  const band    = position ? orbitBand(position.alt) : null

  const telemetry = [
    { label: 'LAT', value: position ? `${position.lat.toFixed(2)}°` : '—' },
    { label: 'LNG', value: position ? `${position.lng.toFixed(2)}°` : '—' },
    { label: 'ALT', value: position ? `${Math.round(position.alt)} km` : '—' },
    { label: 'VEL', value: vel ? `${vel} km/s` : '—' },
  ]

  return (
    <Animated.View style={[styles.container, animStyle]}>
      {/* Type-color top bar */}
      <View style={[styles.topColorBar, { backgroundColor: color }]} />

      <BlurView intensity={72} tint="dark" style={styles.blur}>
        <GestureDetector gesture={pan}>
          <View style={styles.handleArea}>
            <View style={styles.handle} />
            <Text style={styles.sheetLabel}>PAINEL DE CONTROLE</Text>
          </View>
        </GestureDetector>

        <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>

          {/* ── header ── */}
          <View style={styles.header}>
            <View style={styles.headerTop}>
              <Text style={styles.satName} numberOfLines={2}>{satellite?.name ?? `SAT ${noradId}`}</Text>
              <TouchableOpacity style={styles.closeBtn} onPress={onClose} hitSlop={8}>
                <Text style={styles.closeBtnText}>✕</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.badgeRow}>
              <View style={[styles.typeBadge, { backgroundColor: color + '1A', borderColor: color + '55' }]}>
                <View style={[styles.typeDot, { backgroundColor: color }]} />
                <Text style={[styles.typeBadgeText, { color }]}>{typeLabel(satType)}</Text>
              </View>
              {band && (
                <View style={styles.orbitBadge}>
                  <Text style={styles.orbitBadgeText}>{band}</Text>
                </View>
              )}
            </View>

            <Text style={styles.noradId}>NORAD ID · {noradId}</Text>
          </View>

          {/* ── telemetry HUD ── */}
          <View style={styles.hudCard}>
            <LiveDot />
            <View style={styles.hudRow}>
              {telemetry.map(({ label, value }, i) => (
                <React.Fragment key={label}>
                  {i > 0 && <View style={styles.hudSep} />}
                  <View style={styles.hudCol}>
                    <Text style={styles.hudLabel}>{label}</Text>
                    <Text style={styles.hudValue}>{value}</Text>
                  </View>
                </React.Fragment>
              ))}
            </View>
          </View>

          {/* ── sections ── */}
          <View style={styles.section}>
            <SectionHeader num="01" title="SISTEMAS" />
            <View style={styles.grid}>
              <ControlButton icon="⚡" label="ENERGIA"  kind="toggle" />
              <ControlButton icon="🌡" label="THERMAL"  kind="command" onSuccess="REGULADO"  delayMs={[900, 1300]} />
              <ControlButton icon="↻"  label="ATITUDE"  kind="command" onSuccess="CORRIGIDA" delayMs={[800, 1200]} />
            </View>
          </View>

          <View style={styles.section}>
            <SectionHeader num="02" title="COMUNICAÇÕES" />
            <View style={styles.grid}>
              <ControlButton icon="📶" label="PING"     kind="command" onSuccess="38 ms"   delayMs={[1400, 2200]} />
              <ControlButton icon="▲"  label="UPLINK"   kind="command" onSuccess="4.1 MB"  delayMs={[1200, 2000]} />
              <ControlButton icon="▼"  label="DOWNLINK" kind="command" onSuccess="9.7 MB"  delayMs={[1500, 2400]} />
            </View>
          </View>

          <View style={styles.section}>
            <SectionHeader num="03" title="PROPULSÃO" />
            <View style={styles.grid}>
              <ControlButton icon="🚀" label="BOOST"   kind="command" onSuccess="+0.5 km" delayMs={[1000, 1600]} />
              <ControlButton icon="🛑" label="FREIO"   kind="command" onSuccess="−0.3 km" delayMs={[900, 1400]}  />
              <ControlButton icon="↔"  label="CORREÇÃO" kind="command" onSuccess="OK"      delayMs={[700, 1100]} />
            </View>
          </View>

          <View style={styles.section}>
            <SectionHeader num="04" title="SENSORES" />
            <View style={styles.grid}>
              <ControlButton icon="📷" label="CÂMERA"  kind="toggle" />
              <ControlButton icon="◎"  label="RADAR"   kind="toggle" />
              <ControlButton icon="◈"  label="ESPECTRO" kind="toggle" />
            </View>
          </View>

          <View style={[styles.section, { marginBottom: 8 }]}>
            <SectionHeader num="⚠" title="EMERGÊNCIA" />
            <EmergencyButton />
          </View>

        </ScrollView>
      </BlurView>
    </Animated.View>
  )
}

// ─── styles ────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0, left: 0, right: 0,
    height: SHEET_HEIGHT,
    borderTopLeftRadius: 26,
    borderTopRightRadius: 26,
    overflow: 'hidden',
    zIndex: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -6 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 20,
  },
  topColorBar: { height: 3, width: '100%' },
  blur: { flex: 1 },

  handleArea: { alignItems: 'center', paddingTop: 14, paddingBottom: 10, gap: 6 },
  handle: { width: 36, height: 4, borderRadius: 2, backgroundColor: 'rgba(255,255,255,0.2)' },
  sheetLabel: { color: 'rgba(255,255,255,0.25)', fontSize: 9, fontWeight: '700', letterSpacing: 2.5 },

  scroll: { flex: 1 },
  scrollContent: { paddingBottom: 48 },

  // header
  header: {
    paddingHorizontal: 20,
    paddingBottom: 18,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(255,255,255,0.07)',
  },
  headerTop: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8, marginBottom: 12 },
  satName: { color: '#fff', fontSize: 24, fontWeight: '800', letterSpacing: -0.5, flex: 1, lineHeight: 30 },
  closeBtn: {
    width: 30, height: 30, borderRadius: 15,
    backgroundColor: 'rgba(255,255,255,0.07)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255,255,255,0.12)',
    alignItems: 'center', justifyContent: 'center', marginTop: 3,
  },
  closeBtnText: { color: 'rgba(255,255,255,0.45)', fontSize: 13 },
  badgeRow: { flexDirection: 'row', gap: 8, marginBottom: 8 },
  typeBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    borderRadius: 8, borderWidth: 1,
    paddingHorizontal: 10, paddingVertical: 5,
  },
  typeDot: { width: 6, height: 6, borderRadius: 3 },
  typeBadgeText: { fontSize: 9, fontWeight: '700', letterSpacing: 1.3 },
  orbitBadge: {
    borderRadius: 8, borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255,255,255,0.18)',
    backgroundColor: 'rgba(255,255,255,0.05)',
    paddingHorizontal: 10, paddingVertical: 5,
  },
  orbitBadgeText: { color: 'rgba(255,255,255,0.55)', fontSize: 9, fontWeight: '700', letterSpacing: 1.3 },
  noradId: { color: 'rgba(255,255,255,0.25)', fontSize: 10, fontWeight: '500', letterSpacing: 1 },

  // HUD telemetry
  hudCard: {
    marginHorizontal: 16,
    marginTop: 16, marginBottom: 4,
    borderRadius: 16,
    backgroundColor: 'rgba(0,229,255,0.03)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(0,229,255,0.12)',
    paddingVertical: 14, paddingHorizontal: 12,
    gap: 10,
  },
  liveRow: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  liveDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#00E5FF' },
  liveText: { color: '#00E5FF', fontSize: 8, fontWeight: '800', letterSpacing: 2 },
  hudRow: { flexDirection: 'row', alignItems: 'center' },
  hudSep: { width: StyleSheet.hairlineWidth, height: 32, backgroundColor: 'rgba(255,255,255,0.1)', marginHorizontal: 2 },
  hudCol: { flex: 1, alignItems: 'center', gap: 5 },
  hudLabel: { color: 'rgba(255,255,255,0.3)', fontSize: 8, fontWeight: '700', letterSpacing: 1.8 },
  hudValue: { color: '#00E5FF', fontSize: 13, fontWeight: '700', letterSpacing: 0.3 },

  // section
  section: { paddingHorizontal: 16, paddingTop: 16, gap: 12 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  sectionNum: { color: 'rgba(255,255,255,0.2)', fontSize: 9, fontWeight: '800', letterSpacing: 1, width: 18 },
  sectionTitle: { color: 'rgba(255,255,255,0.4)', fontSize: 9, fontWeight: '700', letterSpacing: 2 },
  sectionLine: { flex: 1, height: StyleSheet.hairlineWidth, backgroundColor: 'rgba(255,255,255,0.08)' },

  // control button
  grid: { flexDirection: 'row', gap: 8 },
  btnWrap: { flex: 1 },
  btn: {
    height: 88,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
    overflow: 'hidden',
  },
  btnOn:     { backgroundColor: 'rgba(0,229,255,0.1)',   borderColor: 'rgba(0,229,255,0.3)' },
  btnDone:   { backgroundColor: 'rgba(52,199,89,0.1)',   borderColor: 'rgba(52,199,89,0.3)' },
  btnDanger: { backgroundColor: 'rgba(255,59,48,0.06)',  borderColor: 'rgba(255,59,48,0.25)' },
  btnAccent: { position: 'absolute', top: 0, left: 0, right: 0, height: 2 },
  btnIcon:      { fontSize: 24, color: 'rgba(255,255,255,0.6)' },
  btnIconOn:    { color: '#00E5FF' },
  btnIconDone:  { color: '#34C759' },
  btnLabel:     { fontSize: 8, fontWeight: '700', letterSpacing: 1.5, color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase' },
  btnLabelOn:   { color: '#00E5FF' },
  btnLabelDone: { color: '#34C759' },

  // pulse ring
  pulseRing: { borderRadius: 14, borderWidth: 1.5, borderColor: '#00E5FF' },
  pulseRingDanger: { borderColor: '#FF3B30' },

  // emergency button
  emergencyWrap: { width: '100%' },
  emergencyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    height: 68,
    borderRadius: 14,
    backgroundColor: 'rgba(255,59,48,0.07)',
    borderWidth: 1,
    borderColor: 'rgba(255,59,48,0.3)',
    overflow: 'hidden',
    paddingHorizontal: 18,
  },
  emergencyBtnDone: { backgroundColor: 'rgba(52,199,89,0.08)', borderColor: 'rgba(52,199,89,0.3)' },
  emergencyStripe: { position: 'absolute', left: 0, top: 0, bottom: 0, width: 4, backgroundColor: '#FF3B30' },
  emergencyIcon: { fontSize: 22, color: '#FF3B30' },
  emergencyText: { flex: 1, gap: 3 },
  emergencyLabel: { color: '#FF3B30', fontSize: 12, fontWeight: '700', letterSpacing: 1 },
  emergencySub: { color: 'rgba(255,255,255,0.3)', fontSize: 9, letterSpacing: 0.5 },
  emergencyArrow: { color: 'rgba(255,59,48,0.5)', fontSize: 22, fontWeight: '300' },
})
