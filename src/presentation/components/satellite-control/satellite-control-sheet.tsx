import React, { useState, useRef } from 'react'
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Pressable,
} from 'react-native'
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withRepeat,
  withTiming,
  runOnJS,
} from 'react-native-reanimated'
import { Gesture, GestureDetector } from 'react-native-gesture-handler'
import { BlurView } from 'expo-blur'
import { useOrbitalStore } from '@/application/stores/use-orbital-store'

interface SatelliteControlSheetProps {
  noradId: string
  onClose: () => void
}

const SHEET_HEIGHT = 580
const CLOSE_THRESHOLD = 100

type ButtonState = 'idle' | 'running' | 'done'

interface ControlButtonProps {
  icon: string
  label: string
  kind: 'command' | 'toggle'
  onSuccess?: string
  danger?: boolean
  fullWidth?: boolean
}

function ControlButton({ icon, label, kind, onSuccess, danger = false, fullWidth = false }: ControlButtonProps) {
  const [state, setState] = useState<ButtonState>('idle')
  const [toggled, setToggled] = useState(false)
  const pulseOpacity = useSharedValue(0)

  const pulseStyle = useAnimatedStyle(() => ({
    opacity: pulseOpacity.value,
  }))

  function handlePress() {
    if (kind === 'toggle') {
      setToggled((v) => !v)
      return
    }

    if (state === 'running') return

    setState('running')
    pulseOpacity.value = withRepeat(withTiming(0.8, { duration: 500 }), -1, true)

    const delay = 700 + Math.random() * 700
    setTimeout(() => {
      pulseOpacity.value = withTiming(0, { duration: 200 })
      setState('done')
      setTimeout(() => setState('idle'), 2000)
    }, delay)
  }

  const isOn = kind === 'toggle' && toggled
  const isDone = state === 'done'
  const isRunning = state === 'running'

  const containerStyle = [
    styles.controlBtn,
    fullWidth && styles.controlBtnFull,
    danger && styles.controlBtnDanger,
    isOn && styles.controlBtnOn,
    isDone && styles.controlBtnDone,
  ]

  const iconStyle = [
    styles.controlBtnIcon,
    isOn && styles.controlBtnIconOn,
    isDone && styles.controlBtnIconDone,
  ]

  const labelStyle = [
    styles.controlBtnLabel,
    isOn && styles.controlBtnLabelOn,
    isDone && styles.controlBtnLabelDone,
  ]

  return (
    <Pressable onPress={handlePress} style={fullWidth ? styles.controlBtnWrapperFull : styles.controlBtnWrapper}>
      <View style={containerStyle}>
        <Animated.View
          style={[
            StyleSheet.absoluteFill,
            styles.pulseBorder,
            danger && styles.pulseBorderDanger,
            pulseStyle,
          ]}
          pointerEvents="none"
        />
        <Text style={iconStyle}>
          {isDone ? '✓' : icon}
        </Text>
        <Text style={labelStyle} numberOfLines={1}>
          {isDone ? (onSuccess ?? 'OK') : isRunning ? '...' : label}
        </Text>
      </View>
    </Pressable>
  )
}

function orbitBand(altKm: number): string {
  if (altKm < 2000) return 'LEO'
  if (altKm < 35786) return 'MEO'
  return 'GEO'
}

function typeLabel(type: string): string {
  switch (type) {
    case 'OPERATIONAL_SATELLITE': return 'OPERACIONAL'
    case 'DEBRIS': return 'DETRITO'
    case 'ROCKET_BODY': return 'ESTÁGIO'
    default: return type
  }
}

function typeColor(type: string): string {
  switch (type) {
    case 'OPERATIONAL_SATELLITE': return '#00E5FF'
    case 'DEBRIS': return '#FF9500'
    case 'ROCKET_BODY': return '#FF6B35'
    default: return '#00E5FF'
  }
}

export function SatelliteControlSheet({ noradId, onClose }: SatelliteControlSheetProps) {
  const translateY = useSharedValue(SHEET_HEIGHT)

  React.useEffect(() => {
    translateY.value = withSpring(0, { damping: 20, stiffness: 180 })
  }, [])

  const satellite = useOrbitalStore(
    (s) => s.satellites.find((sat) => sat.noradId.value === Number(noradId)) ?? null
  )
  const position = useOrbitalStore(
    (s) => s.positions.find((p) => p.noradId.value === Number(noradId)) ?? null
  )

  const onCloseRef = useRef(onClose)
  onCloseRef.current = onClose

  const pan = Gesture.Pan()
    .onUpdate((e) => {
      translateY.value = Math.max(0, e.translationY)
    })
    .onEnd((e) => {
      if (e.translationY > CLOSE_THRESHOLD) {
        translateY.value = withSpring(SHEET_HEIGHT)
        runOnJS(onCloseRef.current)()
      } else {
        translateY.value = withSpring(0, { damping: 20, stiffness: 180 })
      }
    })

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }))

  const vel = position
    ? (Math.sqrt(398600 / (6371 + position.alt))).toFixed(1)
    : null

  const band = position ? orbitBand(position.alt) : null
  const satType = satellite?.type ?? ''

  return (
    <Animated.View style={[styles.container, animStyle]}>
      <BlurView intensity={50} tint="dark" style={styles.blur}>

        <GestureDetector gesture={pan}>
          <View style={styles.handleArea}>
            <View style={styles.handle} />
          </View>
        </GestureDetector>

        <ScrollView
          style={styles.scroll}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          <View style={styles.header}>
            <View style={styles.headerTop}>
              <Text style={styles.satName} numberOfLines={2}>
                {satellite?.name ?? `SAT ${noradId}`}
              </Text>
              <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
                <Text style={styles.closeBtnText}>✕</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.badges}>
              <View style={[styles.badge, { borderColor: typeColor(satType) }]}>
                <Text style={[styles.badgeText, { color: typeColor(satType) }]}>
                  {typeLabel(satType)}
                </Text>
              </View>
              {band && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{band}</Text>
                </View>
              )}
            </View>

            <Text style={styles.noradLabel}>NORAD {noradId}</Text>
          </View>

          <View style={styles.telemetryCard}>
            <View style={styles.telemetryRow}>
              {[
                { label: 'LAT', value: position ? `${position.lat.toFixed(1)}°` : '---' },
                { label: 'LNG', value: position ? `${position.lng.toFixed(1)}°` : '---' },
                { label: 'ALT', value: position ? `${Math.round(position.alt)} km` : '---' },
                { label: 'VEL', value: vel ? `${vel} km/s` : '---' },
              ].map(({ label, value }) => (
                <View key={label} style={styles.telemetryCol}>
                  <Text style={styles.telemetryLabel}>{label}</Text>
                  <Text style={styles.telemetryValue}>{value}</Text>
                </View>
              ))}
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>SISTEMAS</Text>
            <View style={styles.controlGrid}>
              <ControlButton icon="⚡" label="ENERGIA" kind="toggle" />
              <ControlButton icon="🌡" label="THERMAL" kind="command" onSuccess="REGULADO" />
              <ControlButton icon="↻" label="ATITUDE" kind="command" onSuccess="CORRIGIDA" />
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>COMUNICAÇÕES</Text>
            <View style={styles.controlGrid}>
              <ControlButton icon="📶" label="PING" kind="command" onSuccess="42ms" />
              <ControlButton icon="▲" label="UPLINK" kind="command" onSuccess="3.2 MB" />
              <ControlButton icon="▼" label="DOWNLINK" kind="command" onSuccess="8.1 MB" />
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>PROPULSÃO</Text>
            <View style={styles.controlGrid}>
              <ControlButton icon="🚀" label="BOOST" kind="command" onSuccess="+0.5 km" />
              <ControlButton icon="🛑" label="FREIO" kind="command" onSuccess="-0.3 km" />
              <ControlButton icon="↔" label="CORREÇÃO" kind="command" onSuccess="OK" />
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>SENSORES</Text>
            <View style={styles.controlGrid}>
              <ControlButton icon="📷" label="CÂMERA" kind="toggle" />
              <ControlButton icon="◎" label="RADAR" kind="toggle" />
              <ControlButton icon="◈" label="ESPECTRO" kind="toggle" />
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>EMERGÊNCIA</Text>
            <ControlButton
              icon="⚠"
              label="MODO SEGURO"
              kind="command"
              onSuccess="ATIVADO"
              danger
              fullWidth
            />
          </View>
        </ScrollView>

      </BlurView>
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: SHEET_HEIGHT,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    overflow: 'hidden',
    zIndex: 25,
  },
  blur: { flex: 1 },
  handleArea: {
    alignItems: 'center',
    paddingTop: 12,
    paddingBottom: 8,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.25)',
  },
  scroll: { flex: 1 },
  scrollContent: { paddingBottom: 40 },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(255,255,255,0.08)',
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 8,
  },
  satName: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '700',
    letterSpacing: -0.3,
    flex: 1,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  closeBtnText: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 14,
    fontWeight: '600',
  },
  badges: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 10,
    marginBottom: 6,
  },
  badge: {
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.25)',
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  badgeText: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 1.2,
  },
  noradLabel: {
    color: 'rgba(255,255,255,0.3)',
    fontSize: 10,
    fontWeight: '500',
    letterSpacing: 0.8,
  },
  telemetryCard: {
    marginHorizontal: 16,
    marginVertical: 14,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    paddingVertical: 14,
    paddingHorizontal: 8,
  },
  telemetryRow: {
    flexDirection: 'row',
  },
  telemetryCol: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  telemetryLabel: {
    color: 'rgba(255,255,255,0.3)',
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 1.5,
  },
  telemetryValue: {
    color: '#00E5FF',
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  section: {
    paddingHorizontal: 16,
    paddingTop: 14,
    gap: 10,
  },
  sectionTitle: {
    color: 'rgba(255,255,255,0.3)',
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  controlGrid: {
    flexDirection: 'row',
    gap: 8,
  },
  controlBtnWrapper: {
    flex: 1,
  },
  controlBtnWrapperFull: {
    width: '100%',
  },
  controlBtn: {
    height: 80,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    overflow: 'hidden',
  },
  controlBtnFull: {
    height: 60,
    flexDirection: 'row',
    gap: 10,
  },
  controlBtnDanger: {
    borderColor: 'rgba(255,59,48,0.4)',
    backgroundColor: 'rgba(255,59,48,0.06)',
  },
  controlBtnOn: {
    backgroundColor: 'rgba(0,229,255,0.12)',
    borderColor: 'rgba(0,229,255,0.3)',
  },
  controlBtnDone: {
    backgroundColor: 'rgba(52,199,89,0.15)',
    borderColor: 'rgba(52,199,89,0.3)',
  },
  pulseBorder: {
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#00E5FF',
  },
  pulseBorderDanger: {
    borderColor: '#FF3B30',
  },
  controlBtnIcon: {
    fontSize: 22,
    color: 'rgba(255,255,255,0.7)',
  },
  controlBtnIconOn: {
    color: '#00E5FF',
  },
  controlBtnIconDone: {
    color: '#34C759',
  },
  controlBtnLabel: {
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 1.5,
    color: 'rgba(255,255,255,0.4)',
    textTransform: 'uppercase',
  },
  controlBtnLabelOn: {
    color: '#00E5FF',
  },
  controlBtnLabelDone: {
    color: '#34C759',
  },
})
