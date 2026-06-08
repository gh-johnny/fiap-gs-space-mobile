import React, { useState, useEffect } from 'react'
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, Pressable, useWindowDimensions } from 'react-native'
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withRepeat,
  withTiming,
  withSequence,
  runOnJS,
  cancelAnimation,
} from 'react-native-reanimated'
import { Gesture, GestureDetector } from 'react-native-gesture-handler'
import { BlurView } from 'expo-blur'
import { useOrbitalStore } from '@/application/stores/use-orbital-store'
import { TAB_BAR_HEIGHT } from '@/presentation/components/tab-bar/tab-bar'
import { useTranslation } from '@/i18n/use-translation'
import type { TranslationKey } from '@/i18n/translations'
import { OBJECT_TYPE_COLORS } from '@/constants/theme'

interface Props {
  noradId: string
  onClose: () => void
  onCorrected?: () => void
  onReady?: () => void
  accentColor?: string
  onModeChange?: (mode: 'NOMINAL' | 'ECO' | 'SAFE') => void
}

const CLOSE_THRESHOLD = 100

// ─── helpers ──────────────────────────────────────────────────────────────────

function orbitBand(alt: number) {
  if (alt < 2000) return 'LEO'
  if (alt < 35786) return 'MEO'
  return 'GEO'
}

function typeColor(t: string) {
  return OBJECT_TYPE_COLORS[t] ?? '#00E5FF'
}

function typeTranslationKey(satType: string): TranslationKey {
  if (satType === 'OPERATIONAL_SATELLITE') return 'sat.typeOperational'
  if (satType === 'DEBRIS') return 'sat.typeDebris'
  if (satType === 'ROCKET_BODY') return 'sat.typeRocket'
  if (satType === 'ASTEROID') return 'sat.typeAsteroid'
  return 'sat.typeOperational'
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
  const t = useTranslation()

  if (satType === 'DEBRIS') {
    return (
      <View style={illus.root}>
        <View style={[illus.glow, { backgroundColor: color + '18' }]} />
        <Text style={[illus.debrisIcon, { color }]}>✦</Text>
        <Text style={[illus.debrisLabel, { color: color + '80' }]}>{t('sat.fragmentLabel')}</Text>
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
          <Text style={[illus.rocketSub, { color: color + '70' }]}>{t('sat.propellant')}</Text>
        </View>
        <View style={[illus.rocketNozzle, { borderColor: color, backgroundColor: color + '25' }]} />
      </View>
    )
  }
  if (satType === 'ASTEROID') {
    return (
      <View style={illus.root}>
        <View style={[illus.glow, { backgroundColor: color + '18' }]} />
        <Text style={[illus.asteroidIcon, { color }]}>☄</Text>
        <Text style={[illus.debrisLabel, { color: color + '80' }]}>{t('sat.asteroidLabel')}</Text>
      </View>
    )
  }
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

function LiveDot({ color = '#00E5FF' }: { color?: string }) {
  const opacity = useSharedValue(1)
  useEffect(() => {
    opacity.value = withRepeat(withTiming(0.15, { duration: 750 }), -1, true)
    return () => cancelAnimation(opacity)
  }, [])
  const s = useAnimatedStyle(() => ({ opacity: opacity.value }))
  return <Animated.View style={[styles.liveDot, { backgroundColor: color }, s]} />
}

// ─── mode button (animated glow when active) ──────────────────────────────────

function ModeButton({
  label, color, isActive, onPress,
}: { label: string; color: string; isActive: boolean; onPress: () => void }) {
  const glowOp = useSharedValue(0)

  useEffect(() => {
    if (isActive) {
      glowOp.value = withRepeat(withTiming(1, { duration: 900 }), -1, true)
    } else {
      cancelAnimation(glowOp)
      glowOp.value = withTiming(0, { duration: 300 })
    }
    return () => cancelAnimation(glowOp)
  }, [isActive])

  const glowStyle = useAnimatedStyle(() => ({ opacity: glowOp.value }))

  return (
    <Pressable style={styles.modeBtnWrap} onPress={onPress}>
      <View style={[styles.modeBtn, isActive && { backgroundColor: color + '18', borderColor: color + '60' }]}>
        <Animated.View style={[StyleSheet.absoluteFill, styles.modeBtnGlow, { borderColor: color }, glowStyle]} pointerEvents="none" />
        <Text style={[styles.modeBtnText, isActive && { color }]}>{label}</Text>
      </View>
    </Pressable>
  )
}

// ─── mode status badge ─────────────────────────────────────────────────────────

const MODE_STATUS = { NOMINAL: 'FULL OPS', ECO: 'POWER SAVE', SAFE: 'STANDBY' } as const

function ModeStatusBadge({ mode, color }: { mode: 'NOMINAL' | 'ECO' | 'SAFE'; color: string }) {
  const dotOp = useSharedValue(1)
  const dotStyle = useAnimatedStyle(() => ({ opacity: dotOp.value }))

  useEffect(() => {
    dotOp.value = withRepeat(withTiming(0.25, { duration: 1100 }), -1, true)
    return () => cancelAnimation(dotOp)
  }, [])

  return (
    <View style={badge.wrap}>
      <View style={badge.row}>
        <Animated.View style={[badge.dot, { backgroundColor: color }, dotStyle]} />
        <Text style={[badge.mode, { color }]}>{mode}</Text>
      </View>
      <Text style={[badge.status, { color: color + '70' }]}>{MODE_STATUS[mode]}</Text>
    </View>
  )
}

const badge = StyleSheet.create({
  wrap:   { alignItems: 'center', gap: 3, paddingTop: 6 },
  row:    { flexDirection: 'row', alignItems: 'center', gap: 5 },
  dot:    { width: 4, height: 4, borderRadius: 2 },
  mode:   { fontSize: 8, fontWeight: '700', letterSpacing: 1.8 },
  status: { fontSize: 7, fontWeight: '600', letterSpacing: 1.2 },
})

// ─── orbital correction button ─────────────────────────────────────────────────

function OrbitalCorrectionButton({ color, onComplete }: { color: string; onComplete?: () => void }) {
  const [phase, setPhase] = useState(-1)
  const pulseOp = useSharedValue(0)
  const t = useTranslation()

  const PHASES = [t('sat.phase0'), t('sat.phase1'), t('sat.phase2')] as const

  function start() {
    if (phase >= 0) return
    setPhase(0)
    pulseOp.value = withRepeat(withTiming(0.7, { duration: 500 }), -1, true)
    setTimeout(() => setPhase(1), 1400)
    setTimeout(() => {
      cancelAnimation(pulseOp)
      pulseOp.value = withTiming(0, { duration: 200 })
      setPhase(2)
      onComplete?.()
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
          {phase >= 0 ? PHASES[Math.min(phase, 2)] : t('sat.executeCorrection')}
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

// ─── main sheet ────────────────────────────────────────────────────────────────

export function SatelliteControlSheet({ noradId, onClose, onCorrected, onReady, accentColor, onModeChange }: Props) {
  const { height: screenHeight } = useWindowDimensions()
  const sheetHeight = Math.round(screenHeight * 0.80)
  const portholeHeight = Math.round(screenHeight * 0.15)
  const blurTopHeight = Math.round(sheetHeight - screenHeight / 2 - portholeHeight / 2)
  const t = useTranslation()

  const translateY = useSharedValue(sheetHeight)

  useEffect(() => {
    translateY.value = withSpring(0, { damping: 46, stiffness: 280 }, (finished) => {
      if (finished && onReady) runOnJS(onReady)()
    })
  }, [])

  const satellite = useOrbitalStore(s => s.satellites.find(sat => sat.noradId.value === Number(noradId)) ?? null)
  const position  = useOrbitalStore(s => s.positions.find(p => p.noradId.value === Number(noradId)) ?? null)

  const pan = Gesture.Pan()
    .onUpdate(e => { translateY.value = Math.max(0, e.translationY) })
    .onEnd(e => {
      if (e.translationY > CLOSE_THRESHOLD) {
        translateY.value = withSpring(sheetHeight, { damping: 20 })
        runOnJS(onClose)()
      } else {
        translateY.value = withSpring(0, { damping: 46, stiffness: 280 })
      }
    })

  const animStyle = useAnimatedStyle(() => ({ transform: [{ translateY: translateY.value }] }))

  const [activeMode, setActiveMode] = useState<'NOMINAL' | 'ECO' | 'SAFE'>('NOMINAL')
  const modeFlash = useSharedValue(0)
  const flashStyle = useAnimatedStyle(() => ({ opacity: modeFlash.value }))

  const MODES = [
    { key: 'NOMINAL' as const, label: t('sat.modeNominal'), color: '#00E5FF' },
    { key: 'ECO' as const,     label: t('sat.modeEco'),     color: '#34C759' },
    { key: 'SAFE' as const,    label: t('sat.modeSafe'),    color: '#FF9500' },
  ]

  function handleModeChange(newMode: 'NOMINAL' | 'ECO' | 'SAFE') {
    setActiveMode(newMode)
    modeFlash.value = withSequence(
      withTiming(1, { duration: 70 }),
      withTiming(0, { duration: 550 }),
    )
    onModeChange?.(newMode)
  }

  const satType = satellite?.type ?? ''
  const color   = accentColor ?? typeColor(satType)
  const modeColor = MODES.find(m => m.key === activeMode)?.color ?? color
  const band    = position ? orbitBand(position.alt) : null
  const vel     = position ? Math.sqrt(398600 / (6371 + position.alt)).toFixed(1) : null

  return (
    <Animated.View style={[styles.container, { height: sheetHeight }, animStyle]}>

      {/* ── Top blur: handle + illustration — height sized to center porthole on screen ── */}
      <BlurView intensity={75} tint="dark" style={[styles.blurTop, { height: blurTopHeight }]}>
        <GestureDetector gesture={pan}>
          <View style={styles.handleArea}>
            <View style={styles.handle} />
          </View>
        </GestureDetector>

        <View style={styles.illustrationArea}>
          <Animated.View
            style={[StyleSheet.absoluteFill, { backgroundColor: modeColor + '22' }, flashStyle]}
            pointerEvents="none"
          />
          <SatelliteIllustration satType={satType} color={color} />
          {satellite?.isControllable() && (
            <View style={styles.modeBadgeWrap}>
              <ModeStatusBadge mode={activeMode} color={modeColor} />
            </View>
          )}
        </View>
      </BlurView>

      {/* ── Full-width transparent porthole ── */}
      <View style={[styles.portholeArea, { height: portholeHeight }]}>
        <View style={[styles.cornerTL, { borderColor: color + '55' }]} />
        <View style={[styles.cornerTR, { borderColor: color + '55' }]} />
        <View style={[styles.cornerBL, { borderColor: color + '55' }]} />
        <View style={[styles.cornerBR, { borderColor: color + '55' }]} />
      </View>

      <View style={[styles.topBar, { backgroundColor: color }]} />

      {/* ── Bottom blur: satellite identity + telemetry + controls ── */}
      <BlurView intensity={75} tint="dark" style={styles.blur}>

        <View style={styles.header}>
          <View style={styles.headerRow}>
            <View style={styles.headerText}>
              <Text style={styles.satName} numberOfLines={2}>{satellite?.name ?? `SAT-${noradId}`}</Text>
              <View style={styles.badgeRow}>
                <View style={[styles.typeBadge, { backgroundColor: color + '1A', borderColor: color + '55' }]}>
                  <View style={[styles.typeDot, { backgroundColor: color }]} />
                  <Text style={[styles.typeBadgeText, { color }]}>{t(typeTranslationKey(satType))}</Text>
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

        <View style={[styles.telemetry, { borderColor: color + '22', backgroundColor: color + '0A' }]}>
          <LiveDot color={color} />
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
            <Text style={styles.telemetryKey}>{t('sat.noSignal')}</Text>
          )}
        </View>

        <Text style={styles.sheetLabel}>
          {satellite?.isControllable() ? t('sat.controlPanel') : t('sat.observationalData')}
        </Text>

        <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>

          {!satellite?.isControllable() && (
            <View style={[styles.section, styles.noControlSection]}>
              <Text style={[styles.noControlText, { color: color + '80' }]}>{t('sat.uncontrolledInfo')}</Text>
            </View>
          )}

          {satellite?.isControllable() && (<>
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>{t('sat.opMode')}</Text>
            <View style={styles.modeRow}>
              {MODES.map(m => (
                <ModeButton
                  key={m.key}
                  label={m.label}
                  color={m.color}
                  isActive={activeMode === m.key}
                  onPress={() => handleModeChange(m.key)}
                />
              ))}
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionLabel}>{t('sat.systems')}</Text>
            <View style={styles.sysPanelRow}>
              <SystemPanel icon="⚡" title="SOLAR" onValue="94 W · 98%" offValue="OFFLINE" color={color} defaultOn />
              <SystemPanel icon="📡" title="COMMS" onValue="S-BAND 2.2G" offValue={t('sat.commsOffline')} color={color} defaultOn />
              <SystemPanel icon="🔭" title="CAM" onValue={t('sat.cameraValue')} offValue="OFFLINE" color={color} defaultOn={false} />
            </View>
          </View>

          <View style={[styles.section, { marginBottom: 8 }]}>
            <OrbitalCorrectionButton color={color} onComplete={onCorrected} />
          </View>
          </>)}

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
  rocketNose:   { width: 28, height: 18, borderTopLeftRadius: 14, borderTopRightRadius: 14, borderWidth: 1, borderBottomWidth: 0 },
  rocketBody:   { width: 38, height: 56, borderWidth: 1, borderRadius: 4, alignItems: 'center', justifyContent: 'center', gap: 4 },
  rocketLabel:  { fontSize: 18 },
  rocketSub:    { fontSize: 7, fontWeight: '700', letterSpacing: 1 },
  rocketNozzle: { width: 30, height: 14, borderTopWidth: 0, borderWidth: 1, borderBottomLeftRadius: 6, borderBottomRightRadius: 6 },
  debrisIcon:   { fontSize: 52, marginBottom: 4 },
  debrisLabel:  { fontSize: 8, fontWeight: '700', letterSpacing: 1.5, textAlign: 'center' },
  asteroidIcon: { fontSize: 52, marginBottom: 4 },
})

// ─── main styles ───────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0, right: 0,
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
  blurTop: {},
  handleArea: { alignItems: 'center', paddingTop: 14, paddingBottom: 10 },
  handle: { width: 36, height: 4, borderRadius: 2, backgroundColor: 'rgba(255,255,255,0.2)' },
  illustrationArea: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  modeBadgeWrap: { position: 'absolute', bottom: 4, alignSelf: 'center' },
  portholeArea: {},
  cornerTL: { position: 'absolute', top: 10, left: 16, width: 16, height: 16, borderTopWidth: 1.5, borderLeftWidth: 1.5 },
  cornerTR: { position: 'absolute', top: 10, right: 16, width: 16, height: 16, borderTopWidth: 1.5, borderRightWidth: 1.5 },
  cornerBL: { position: 'absolute', bottom: 10, left: 16, width: 16, height: 16, borderBottomWidth: 1.5, borderLeftWidth: 1.5 },
  cornerBR: { position: 'absolute', bottom: 10, right: 16, width: 16, height: 16, borderBottomWidth: 1.5, borderRightWidth: 1.5 },
  sheetLabel: { color: 'rgba(255,255,255,0.22)', fontSize: 9, fontWeight: '700', letterSpacing: 2.5, textAlign: 'center', paddingTop: 10, paddingBottom: 6 },

  scroll:        { flex: 1 },
  scrollContent: { paddingBottom: TAB_BAR_HEIGHT + 24 },

  header: { paddingHorizontal: 20, paddingTop: 12, paddingBottom: 14, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: 'rgba(255,255,255,0.07)' },
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

  telemetry: { marginHorizontal: 16, marginVertical: 12, flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 6, paddingHorizontal: 14, paddingVertical: 10, borderRadius: 12, borderWidth: StyleSheet.hairlineWidth },
  liveDot:   { width: 6, height: 6, borderRadius: 3 },
  telemetryDivider: { fontSize: 12 },
  telemetryItem: {},
  telemetryKey: { color: 'rgba(255,255,255,0.3)', fontSize: 10, fontWeight: '600', letterSpacing: 0.5 },
  telemetryVal: { fontSize: 11, fontWeight: '700', letterSpacing: 0.3 },

  section: { paddingHorizontal: 16, paddingTop: 14, gap: 10 },
  sectionLabel: { color: 'rgba(255,255,255,0.28)', fontSize: 9, fontWeight: '700', letterSpacing: 2 },

  modeRow: { flexDirection: 'row', gap: 8 },
  modeBtnWrap: { flex: 1 },
  modeBtn: { paddingVertical: 10, borderRadius: 10, borderWidth: StyleSheet.hairlineWidth, borderColor: 'rgba(255,255,255,0.1)', backgroundColor: 'rgba(255,255,255,0.04)', alignItems: 'center' },
  modeBtnGlow: { borderRadius: 10, borderWidth: 1.5 },
  modeBtnText: { color: 'rgba(255,255,255,0.3)', fontSize: 10, fontWeight: '700', letterSpacing: 1.5 },

  sysPanelRow: { flexDirection: 'row', gap: 8 },
  sysPanel: { flex: 1, backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: 14, padding: 12, gap: 5, borderWidth: StyleSheet.hairlineWidth, borderColor: 'rgba(255,255,255,0.08)' },
  sysPanelTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  sysPanelIcon: { fontSize: 18 },
  sysPanelDot: { width: 6, height: 6, borderRadius: 3 },
  sysPanelTitle: { color: 'rgba(255,255,255,0.4)', fontSize: 8, fontWeight: '700', letterSpacing: 1.5 },
  sysPanelValue: { fontSize: 10, fontWeight: '700', letterSpacing: 0.3 },

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

  noControlSection: { paddingTop: 20, paddingBottom: 8 },
  noControlText: { fontSize: 12, lineHeight: 20, letterSpacing: 0.2, textAlign: 'center', paddingHorizontal: 8 },
})
