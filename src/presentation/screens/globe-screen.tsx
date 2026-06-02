import { useRef, useEffect } from 'react'
import { StyleSheet, View, useWindowDimensions } from 'react-native'
import { useSharedValue, withTiming } from 'react-native-reanimated'
import { GlobeView } from '@/presentation/components/globe-view/globe-view'
import { AlertCard } from '@/presentation/components/alert-card/alert-card'
import { IGlobeGlAdapter } from '@/infrastructure/adapters/i-globe-gl-adapter'
import { useOrbitalStore } from '@/application/stores/use-orbital-store'
import { useAlertStore } from '@/application/stores/use-alert-store'
import { useOrbitalLoop } from '@/presentation/hooks/use-orbital-loop'
import { useHiddenTrigger } from '@/presentation/hooks/use-hidden-trigger'
import { useContainer } from '@/application/container/container-context'

export function GlobeScreen() {
  const { width, height } = useWindowDimensions()
  const globeRef = useRef<IGlobeGlAdapter>(null)
  const globeDim = useSharedValue(0)

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

  useEffect(() => {
    void loadSatellites(satelliteRepository)
    void loadConjunctions(conjunctionRepository)
    void loadAlertHistory(alertHistoryRepository)
  }, [])

  useOrbitalLoop(
    (ts) => {
      propagatePositions(propagateOrbits, ts)
      globeRef.current?.updatePositions(positions)

      const critical = conjunctions.find((c) => c.severity === 'CRITICAL')
      if (critical) globeRef.current?.highlightConjunction(critical)
    },
    3000,
  )

  const { onTap } = useHiddenTrigger({
    onTrigger: () => {
      void hapticsGateway.warn()
      triggerAlert()
      globeDim.value = withTiming(0.5, { duration: 400 })
      globeRef.current?.dimGlobe(0.5)
    },
    screenWidth: width,
    screenHeight: height,
  })

  function handleDismiss() {
    dismissAlert()
    globeDim.value = withTiming(0, { duration: 400 })
    globeRef.current?.undimGlobe()
  }

  async function handleAcknowledge() {
    await acknowledgeCurrentAlert(acknowledgeAlert)
  }

  return (
    <View style={styles.container} onTouchEnd={(e) => onTap(e.nativeEvent.pageX, e.nativeEvent.pageY)}>
      <GlobeView ref={globeRef} />

      {activeAlert && (
        <AlertCard
          alert={activeAlert}
          visible={!!activeAlert}
          onAcknowledge={() => void handleAcknowledge()}
          onDismiss={handleDismiss}
        />
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000814',
  },
})
