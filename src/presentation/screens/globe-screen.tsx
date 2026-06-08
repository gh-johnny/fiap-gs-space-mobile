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
import { SEVERITY_COLORS, OBJECT_TYPE_COLORS } from '@/constants/theme'
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
  const [showControlSheet, setShowControlSheet] = useState(false)
  const [sheetReady, setSheetReady] = useState(false)
  const [correctedNoradIds, setCorrectedNoradIds] = useState<Set<string>>(new Set())
  const arcsInitialized = useRef(false)
  const lastBeaconPosition = useRef<{ lat: number; lng: number } | null>(null)

  const {
    propagateOrbits,
    satelliteRepository,
    conjunctionRepository,
    alertHistoryRepository,
    acknowledgeAlert,
    hapticsGateway,
    locationGateway,
    notificationGateway,
  } = useContainer()

  const { positions, loadSatellites, propagatePositions } = useOrbitalStore()
  const { conjunctions, activeAlert, loadConjunctions, loadAlertHistory, triggerAlertFor, acknowledgeCurrentAlert, dismissAlert, incrementCorrected, seedAllConjunctions } = useAlertStore()
  const { globeMode, simpleMode, locale, notificationsEnabled, locationEnabled } = useUIStore()

  useEffect(() => {
    globeRef.current?.setGlobeTexture(globeMode)
  }, [globeMode])

  useEffect(() => {
    globeRef.current?.setSimpleMode(simpleMode)
  }, [simpleMode])

  useEffect(() => {
    globeRef.current?.setLocale(locale)
  }, [locale])

  function handleGlobeReady() {
    globeRef.current?.setGlobeTexture(globeMode)
    globeRef.current?.setSimpleMode(simpleMode)
    globeRef.current?.setLocale(locale)
    const { conjunctions: currentConjunctions } = useAlertStore.getState()
    if (currentConjunctions.length > 0) {
      globeRef.current?.showConjunctionPairs(currentConjunctions)
    }
    correctedNoradIds.forEach(noradId => {
      globeRef.current?.markCorrected(Number(noradId))
    })
    if (lastBeaconPosition.current) {
      globeRef.current?.setUserBeacon(lastBeaconPosition.current.lat, lastBeaconPosition.current.lng)
    }
    arcsInitialized.current = false
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
      void notificationGateway.scheduleConjunctionAlert(
        newEvent.objectA.name,
        newEvent.objectB.name,
        newEvent.severity,
      )
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

  useEffect(() => {
    void notificationGateway.requestPermission()
  }, [])

  useEffect(() => {
    if (!locationEnabled) {
      locationGateway.stopWatching()
      lastBeaconPosition.current = null
      globeRef.current?.clearUserBeacon()
      return
    }
    let active = true
    void locationGateway.requestPermission().then((granted) => {
      if (!granted || !active) return
      void locationGateway.startWatching((loc) => {
        lastBeaconPosition.current = { lat: loc.lat, lng: loc.lng }
        globeRef.current?.setUserBeacon(loc.lat, loc.lng)
      })
    })
    return () => {
      active = false
      locationGateway.stopWatching()
      globeRef.current?.clearUserBeacon()
    }
  }, [locationEnabled])

  useEffect(() => { setSheetReady(false) }, [selectedNoradId, showControlSheet])

  useOrbitalLoop(
    (ts) => {
      propagatePositions(propagateOrbits, ts)
      // getState() lê as posições recém-propagadas — evita stale closure
      const freshPositions = useOrbitalStore.getState().positions
      globeRef.current?.updatePositions(freshPositions)

      if (!arcsInitialized.current && freshPositions.length > 0) {
        const freshConjunctions = useAlertStore.getState().conjunctions
        if (freshConjunctions.length > 0) {
          // Seed one conjunction per uncontrollable body not yet paired
          const { satellites } = useOrbitalStore.getState()
          useAlertStore.getState().seedAllConjunctions(satellites)
          // Send the full list (initial + seeded) in a single message
          const allConjunctions = useAlertStore.getState().conjunctions
          globeRef.current?.showConjunctionPairs(allConjunctions)
          arcsInitialized.current = true
        }
      }

      if (arcsInitialized.current && Math.random() < 0.02) {
        const { satellites } = useOrbitalStore.getState()
        const newEvent = useAlertStore.getState().spawnRandomConjunction(satellites)
        if (newEvent) {
          globeRef.current?.addConjunctionPair(newEvent)
          const { activeAlert: current } = useAlertStore.getState()
          if (!current) {
            triggerAlertFor(newEvent)
            void hapticsGateway.warn()
            if (notificationsEnabled) void notificationGateway.scheduleConjunctionAlert(
              newEvent.objectA.name,
              newEvent.objectB.name,
              newEvent.severity,
            )
            globeDim.value = withTiming(0.5, { duration: 400 })
            globeRef.current?.dimGlobe(0.5)
            globeRef.current?.highlightConjunction(newEvent)
          }
        }
      }
    },
    500,
  )

  const { onTap } = useHiddenTrigger({
    onTrigger: handleTrigger,
    screenWidth: width,
    screenHeight: height,
  })

  function handleSatelliteTap(noradId: string, skipCard = false) {
    setSelectedNoradId(noradId)
    setShowControlSheet(skipCard)
    globeRef.current?.dimGlobe(0.35)
    globeRef.current?.selectSatellite(Number(noradId))
    const { satellites: sats, positions: pos } = useOrbitalStore.getState()
    const sat = sats.find(s => s.noradId.value === Number(noradId))
    const position = pos.find(p => p.noradId.value === Number(noradId))
    if (!skipCard) {
      globeRef.current?.showSatCard(
        Number(noradId),
        sat?.name ?? `SAT-${noradId}`,
        sat?.type ?? 'OPERATIONAL_SATELLITE',
        position?.alt ?? 400,
      )
    }
    if (skipCard && position) globeRef.current?.focusSatellite(Number(noradId), position.lat, position.lng, 0)
  }

  function handleSatCardOpenSheet() {
    globeRef.current?.hideSatCard()
    setShowControlSheet(true)
    if (selectedNoradId) {
      const { positions: pos } = useOrbitalStore.getState()
      const position = pos.find(p => p.noradId.value === Number(selectedNoradId))
      if (position) globeRef.current?.focusSatellite(Number(selectedNoradId), position.lat, position.lng, 0)
    }
  }

  function handleControlSheetClose() {
    setSelectedNoradId(null)
    setShowControlSheet(false)
    globeRef.current?.undimGlobe()
    globeRef.current?.deselectSatellite()
  }

  const SAT_MODE_COLORS = { NOMINAL: '#00E5FF', ECO: '#34C759', SAFE: '#FF9500' } as const

  function handleSatModeChange(mode: 'NOMINAL' | 'ECO' | 'SAFE') {
    if (!selectedNoradId) return
    globeRef.current?.setSatMode(Number(selectedNoradId), mode, SAT_MODE_COLORS[mode])
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

    const { satellites: sats } = useOrbitalStore.getState()
    const sat = sats.find(s => String(s.noradId.value) === noradId)
    const defaultColor = OBJECT_TYPE_COLORS[sat?.type ?? 'OPERATIONAL_SATELLITE'] ?? '#00E5FF'

    const allPairs = conjunctions.filter(
      c => String(c.objectA.noradId.value) === noradId || String(c.objectB.noradId.value) === noradId,
    )
    if (allPairs.length === 0) return defaultColor

    const unresolvedPairs = allPairs.filter(c =>
      !correctedNoradIds.has(String(c.objectA.noradId.value)) &&
      !correctedNoradIds.has(String(c.objectB.noradId.value)),
    )
    if (unresolvedPairs.length === 0) return sat?.isControllable() ? '#34C759' : defaultColor

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
      handleSatelliteTap(noradId, true)
    }
  }

  return (
    <View
      style={styles.container}
      onTouchEnd={(e) => {
        if (!showSheet) onTap(e.nativeEvent.pageX, e.nativeEvent.pageY)
      }}
    >
      <GlobeView
        ref={globeRef}
        onSatelliteTap={handleSatelliteTap}
        onSatCardClose={handleControlSheetClose}
        onSatCardOpenSheet={handleSatCardOpenSheet}
        onReady={handleGlobeReady}
      />

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

      {activeAlert && (showSheet || (showControlSheet && sheetReady)) && (
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
            handleSatelliteTap(noradId, true)
          }}
        />
      )}

      {selectedNoradId && showControlSheet && (
        <SatelliteControlSheet
          key={selectedNoradId}
          noradId={selectedNoradId}
          accentColor={satStateColor(selectedNoradId)}
          onClose={handleControlSheetClose}
          onCorrected={handleOrbitalCorrection}
          onReady={() => setSheetReady(true)}
          onModeChange={handleSatModeChange}
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
