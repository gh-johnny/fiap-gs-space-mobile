import { useRef, useEffect, useState } from 'react'
import { StyleSheet, View, Text, TouchableOpacity, useWindowDimensions } from 'react-native'
import { useSharedValue, withTiming } from 'react-native-reanimated'
import { useRouter } from 'expo-router'
import { GlobeView } from '@/presentation/components/globe-view/globe-view'
import { AlertCard } from '@/presentation/components/alert-card/alert-card'
import { ConjunctionListSheet } from '@/presentation/screens/conjunction-list-sheet'
import { IGlobeGlAdapter } from '@/infrastructure/adapters/i-globe-gl-adapter'
import { useOrbitalStore } from '@/application/stores/use-orbital-store'
import { useAlertStore } from '@/application/stores/use-alert-store'
import { useUIStore } from '@/application/stores/use-ui-store'
import { useOrbitalLoop } from '@/presentation/hooks/use-orbital-loop'
import { useHiddenTrigger } from '@/presentation/hooks/use-hidden-trigger'
import { useContainer } from '@/application/container/container-context'

export function GlobeScreen() {
  const router = useRouter()
  const { width, height } = useWindowDimensions()
  const globeRef = useRef<IGlobeGlAdapter>(null)
  const globeDim = useSharedValue(0)
  const [showSheet, setShowSheet] = useState(false)
  const arcsInitialized = useRef(false)

  const {
    propagateOrbits,
    satelliteRepository,
    conjunctionRepository,
    alertHistoryRepository,
    acknowledgeAlert,
    hapticsGateway,
  } = useContainer()

  const { positions, loadSatellites, propagatePositions } = useOrbitalStore()
  const { conjunctions, activeAlert, loadConjunctions, loadAlertHistory, triggerAlert, acknowledgeCurrentAlert, dismissAlert } = useAlertStore()
  const { simpleMode, toggleSimpleMode } = useUIStore()

  function handleTrigger() {
    void hapticsGateway.warn()
    triggerAlert()
    globeDim.value = withTiming(0.5, { duration: 400 })
    globeRef.current?.dimGlobe(0.5)

    const { conjunctions: current } = useAlertStore.getState()
    const target = current.find((c) => c.severity === 'CRITICAL') ?? current[0]
    if (target) globeRef.current?.highlightConjunction(target)
  }

  useEffect(() => {
    void loadSatellites(satelliteRepository)
    void loadConjunctions(conjunctionRepository)
    void loadAlertHistory(alertHistoryRepository)
  }, [])

  useEffect(() => {
    const t = setTimeout(() => {
      const { activeAlert: current } = useAlertStore.getState()
      if (!current) handleTrigger()
    }, 8000)
    return () => clearTimeout(t)
  }, [])

  useOrbitalLoop(
    (ts) => {
      propagatePositions(propagateOrbits, ts)
      // getState() lê as posições recém-propagadas — evita stale closure
      const freshPositions = useOrbitalStore.getState().positions
      globeRef.current?.updatePositions(freshPositions)

      if (!arcsInitialized.current && freshPositions.length > 0) {
        const freshConjunctions = useAlertStore.getState().conjunctions
        if (freshConjunctions.length > 0) {
          globeRef.current?.showConjunctionPairs(freshConjunctions)
          arcsInitialized.current = true
        }
      }
    },
    3000,
  )

  const { onTap } = useHiddenTrigger({
    onTrigger: handleTrigger,
    screenWidth: width,
    screenHeight: height,
  })

  function handleDismiss() {
    dismissAlert()
    globeDim.value = withTiming(0, { duration: 400 })
    globeRef.current?.undimGlobe()
    globeRef.current?.clearHighlight()
  }

  async function handleAcknowledge() {
    await acknowledgeCurrentAlert(acknowledgeAlert)
  }

  return (
    <View
      style={styles.container}
      onTouchEnd={(e) => {
        if (!showSheet) onTap(e.nativeEvent.pageX, e.nativeEvent.pageY)
      }}
    >
      <GlobeView ref={globeRef} />

      <View style={styles.topBar}>
        <TouchableOpacity style={styles.listBtn} onPress={() => setShowSheet(true)}>
          <Text style={styles.listBtnText}>≡  CONJUNÇÕES</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.modeBtn} onPress={toggleSimpleMode}>
          <Text style={[styles.modeSegment, !simpleMode && styles.modeSegmentActive]}>TÉC</Text>
          <Text style={styles.modeSep}> · </Text>
          <Text style={[styles.modeSegment, simpleMode && styles.modeSegmentActive]}>SIM</Text>
        </TouchableOpacity>

        <View style={styles.statusPill}>
          <View style={styles.statusDot} />
          <Text style={styles.statusText}>MONITOR</Text>
        </View>
      </View>

      {activeAlert && (
        <AlertCard
          alert={activeAlert}
          visible={!!activeAlert}
          onPress={() => router.push('/alert-detail')}
          onAcknowledge={() => void handleAcknowledge()}
          onDismiss={handleDismiss}
        />
      )}

      {showSheet && <ConjunctionListSheet onClose={() => setShowSheet(false)} />}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000814',
  },
  topBar: {
    position: 'absolute',
    top: 52,
    left: 16,
    right: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  listBtn: {
    backgroundColor: 'rgba(0,8,20,0.6)',
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
  },
  listBtnText: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 1,
  },
  modeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,8,20,0.6)',
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
  },
  modeSegment: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.8,
    color: 'rgba(255,255,255,0.25)',
  },
  modeSegmentActive: { color: '#fff' },
  modeSep: { color: 'rgba(255,255,255,0.2)', fontSize: 10 },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(0,8,20,0.6)',
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#00E5FF',
  },
  statusText: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 1.5,
  },
})
