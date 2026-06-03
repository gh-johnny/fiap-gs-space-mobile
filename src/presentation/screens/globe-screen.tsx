import { useRef, useEffect, useState, useCallback } from 'react'
import { StyleSheet, View, Text, TouchableOpacity, useWindowDimensions } from 'react-native'
import { useSharedValue, withTiming } from 'react-native-reanimated'
import { useRouter } from 'expo-router'
import { GlobeView } from '@/presentation/components/globe-view/globe-view'
import { AlertCard } from '@/presentation/components/alert-card/alert-card'
import { MiniAlertBanner } from '@/presentation/components/alert-card/mini-alert-banner'
import { ConjunctionListSheet } from '@/presentation/screens/conjunction-list-sheet'
import { SatelliteControlSheet } from '@/presentation/components/satellite-control/satellite-control-sheet'
import { IGlobeGlAdapter } from '@/infrastructure/adapters/i-globe-gl-adapter'
import { useOrbitalStore } from '@/application/stores/use-orbital-store'
import { useAlertStore } from '@/application/stores/use-alert-store'
import { SEVERITY_COLORS } from '@/constants/theme'
import { useUIStore } from '@/application/stores/use-ui-store'
import { useOrbitalLoop } from '@/presentation/hooks/use-orbital-loop'
import { useHiddenTrigger } from '@/presentation/hooks/use-hidden-trigger'
import { SettingsOverlay } from '@/presentation/components/settings-overlay/settings-overlay'
import { useContainer } from '@/application/container/container-context'
import { useTranslation } from '@/i18n/use-translation'

export function GlobeScreen() {
  const router = useRouter()
  const { width, height } = useWindowDimensions()
  const t = useTranslation()
  const globeRef = useRef<IGlobeGlAdapter>(null)
  const globeDim = useSharedValue(0)
  const [showSheet, setShowSheet] = useState(false)
  const [selectedNoradId, setSelectedNoradId] = useState<string | null>(null)
  const [sheetReady, setSheetReady] = useState(false)
  const [correctedNoradIds, setCorrectedNoradIds] = useState<Set<string>>(new Set())
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
  const { conjunctions, activeAlert, loadConjunctions, loadAlertHistory, triggerAlertFor, acknowledgeCurrentAlert, dismissAlert, incrementCorrected } = useAlertStore()
  const { globeMode } = useUIStore()

  useEffect(() => {
    globeRef.current?.setGlobeTexture(globeMode)
  }, [globeMode])

  function handleGlobeReady() {
    globeRef.current?.setGlobeTexture(globeMode)
  }

  function handleTrigger() {
    const { satellites } = useOrbitalStore.getState()
    const newEvent = useAlertStore.getState().spawnRandomConjunction(satellites)
    if (!newEvent) return
    globeRef.current?.addConjunctionPair(newEvent)
    const { activeAlert: current } = useAlertStore.getState()
    if (!current) {
      triggerAlertFor(newEvent)
      void hapticsGateway.warn()
      globeDim.value = withTiming(0.5, { duration: 400 })
      globeRef.current?.dimGlobe(0.5)
      globeRef.current?.highlightConjunction(newEvent)
    }
  }

  useEffect(() => {
    void loadSatellites(satelliteRepository)
    void loadConjunctions(conjunctionRepository)
    void loadAlertHistory(alertHistoryRepository)
  }, [])

  useEffect(() => { setSheetReady(false) }, [selectedNoradId])

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

      if (arcsInitialized.current && Math.random() < 0.10) {
        const { satellites } = useOrbitalStore.getState()
        const newEvent = useAlertStore.getState().spawnRandomConjunction(satellites)
        if (newEvent) {
          globeRef.current?.addConjunctionPair(newEvent)
          const { activeAlert: current } = useAlertStore.getState()
          if (!current) {
            triggerAlertFor(newEvent)
            void hapticsGateway.warn()
            globeDim.value = withTiming(0.5, { duration: 400 })
            globeRef.current?.dimGlobe(0.5)
            globeRef.current?.highlightConjunction(newEvent)
          }
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

  function handleSatelliteTap(noradId: string) {
    setSelectedNoradId(noradId)
    globeRef.current?.dimGlobe(0.35)
    globeRef.current?.selectSatellite(Number(noradId))
    const pos = useOrbitalStore.getState().positions.find(p => p.noradId.value === Number(noradId))
    if (pos) globeRef.current?.focusSatellite(Number(noradId), pos.lat, pos.lng)
  }

  function handleControlSheetClose() {
    setSelectedNoradId(null)
    globeRef.current?.undimGlobe()
    globeRef.current?.deselectSatellite()
  }

  function handleOrbitalCorrection() {
    if (!selectedNoradId) return
    globeRef.current?.markCorrected(Number(selectedNoradId))
    dismissAlert()
    incrementCorrected()
    setCorrectedNoradIds(prev => new Set([...prev, selectedNoradId]))
  }

  const satStateColor = useCallback((noradId: string): string => {
    if (correctedNoradIds.has(noradId)) return '#34C759'

    const allPairs = conjunctions.filter(
      c => String(c.objectA.noradId.value) === noradId || String(c.objectB.noradId.value) === noradId,
    )
    if (allPairs.length === 0) return '#00E5FF'

    const unresolvedPairs = allPairs.filter(c =>
      !correctedNoradIds.has(String(c.objectA.noradId.value)) &&
      !correctedNoradIds.has(String(c.objectB.noradId.value)),
    )
    if (unresolvedPairs.length === 0) return '#34C759'

    const rank = { CRITICAL: 3, WARNING: 2, INFO: 1 } as const
    const highest = unresolvedPairs.reduce((best, c) =>
      rank[c.severity] > rank[best.severity] ? c : best,
    )
    return SEVERITY_COLORS[highest.severity]
  }, [correctedNoradIds, conjunctions])

  function handleDismiss() {
    dismissAlert()
    globeDim.value = withTiming(0, { duration: 400 })
    globeRef.current?.undimGlobe()
    globeRef.current?.clearHighlight()
  }

  async function handleAcknowledge() {
    const { activeAlert: alert } = useAlertStore.getState()
    await acknowledgeCurrentAlert(acknowledgeAlert)
    if (alert) {
      const noradId = String(alert.conjunctionEvent.objectA.noradId.value)
      setSelectedNoradId(noradId)
      globeRef.current?.dimGlobe(0.35)
      globeRef.current?.selectSatellite(Number(noradId))
      const pos = useOrbitalStore.getState().positions.find(p => p.noradId.value === Number(noradId))
      if (pos) globeRef.current?.focusSatellite(Number(noradId), pos.lat, pos.lng)
    }
  }

  return (
    <View
      style={styles.container}
      onTouchEnd={(e) => {
        if (!showSheet) onTap(e.nativeEvent.pageX, e.nativeEvent.pageY)
      }}
    >
      <GlobeView ref={globeRef} onSatelliteTap={handleSatelliteTap} onReady={handleGlobeReady} />

      <View style={styles.topBar}>
        <TouchableOpacity style={styles.listBtn} onPress={() => setShowSheet(true)}>
          <Text style={styles.listBtnText}>≡  {t('globe.conjunctions')}</Text>
        </TouchableOpacity>

        <View style={styles.statusPill}>
          <View style={styles.statusDot} />
          <Text style={styles.statusText}>{t('globe.monitor')}</Text>
        </View>
      </View>

      {activeAlert && !showSheet && !selectedNoradId && (
        <AlertCard
          alert={activeAlert}
          visible={!!activeAlert}
          onPress={() => router.push('/alert-detail')}
          onAcknowledge={() => void handleAcknowledge()}
          onDismiss={handleDismiss}
        />
      )}

      {activeAlert && (showSheet || (selectedNoradId && sheetReady)) && (
        <MiniAlertBanner
          alert={activeAlert}
          onAcknowledge={() => void handleAcknowledge()}
          onDismiss={handleDismiss}
        />
      )}

      {showSheet && (
        <ConjunctionListSheet
          onClose={() => setShowSheet(false)}
          correctedNoradIds={correctedNoradIds}
          onOpenControlSheet={(noradId) => {
            setShowSheet(false)
            handleSatelliteTap(noradId)
          }}
        />
      )}

      {selectedNoradId && (
        <SatelliteControlSheet
          key={selectedNoradId}
          noradId={selectedNoradId}
          accentColor={satStateColor(selectedNoradId)}
          onClose={handleControlSheetClose}
          onCorrected={handleOrbitalCorrection}
          onReady={() => setSheetReady(true)}
        />
      )}

      <SettingsOverlay />
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
