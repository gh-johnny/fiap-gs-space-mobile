import { RefObject } from 'react'
import { WebView } from 'react-native-webview'
import { IGlobeGlAdapter } from './i-globe-gl-adapter'
import { OrbitPosition } from '@/domain/usecases/propagate-orbits'
import { ConjunctionEvent } from '@/domain/entities'
import type { GlobePointDataExternal } from './globe-gl-external-types'

const OBJECT_TYPE_COLORS: Record<string, string> = {
  OPERATIONAL_SATELLITE: '#00E5FF',
  DEBRIS: '#FF9500',
  ROCKET_BODY: '#FF6B35',
}

export class GlobeGlAdapter implements IGlobeGlAdapter {
  constructor(private readonly webViewRef: RefObject<WebView>) {}

  updatePositions(positions: OrbitPosition[]): void {
    const points: GlobePointDataExternal[] = positions.map((p) => ({
      lat: p.lat,
      lng: p.lng,
      alt: p.alt / 6371,
      color: OBJECT_TYPE_COLORS['OPERATIONAL_SATELLITE']!,
      radius: 0.3,
      noradId: p.noradId.value,
    }))
    this.postMessage({ type: 'UPDATE_POSITIONS', payload: points })
  }

  showConjunctionPairs(events: ConjunctionEvent[]): void {
    const pairs = events.map((e) => ({
      noradIdA: e.objectA.noradId.value,
      noradIdB: e.objectB.noradId.value,
      severity: e.severity,
    }))
    this.postMessage({ type: 'SET_CONJUNCTION_PAIRS', payload: pairs })
  }

  highlightConjunction(event: ConjunctionEvent): void {
    this.postMessage({
      type: 'HIGHLIGHT_CONJUNCTION',
      payload: {
        noradIdA: event.objectA.noradId.value,
        noradIdB: event.objectB.noradId.value,
      },
    })
  }

  clearHighlight(): void {
    this.postMessage({ type: 'CLEAR_HIGHLIGHT' })
  }

  dimGlobe(opacity: number): void {
    this.postMessage({ type: 'DIM_GLOBE', payload: { opacity } })
  }

  undimGlobe(): void {
    this.postMessage({ type: 'UNDIM_GLOBE' })
  }

  selectSatellite(noradId: number): void {
    this.postMessage({ type: 'SELECT_SATELLITE', payload: { noradId } })
  }

  deselectSatellite(): void {
    this.postMessage({ type: 'DESELECT_SATELLITE' })
  }

  private postMessage(message: unknown): void {
    this.webViewRef.current?.injectJavaScript(
      `window.handleGlobeCommand(${JSON.stringify(message)}); true;`,
    )
  }
}
