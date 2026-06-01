import { RefObject } from 'react'
import { WebView } from 'react-native-webview'
import { IGlobeGlAdapter } from './i-globe-gl-adapter'
import { OrbitPosition } from '@/domain/usecases/propagate-orbits'
import { ConjunctionEvent } from '@/domain/entities'
import type { GlobePointDataExternal, GlobeArcDataExternal } from './globe-gl-external-types'

const POINT_RADIUS_DEFAULT = 0.3
const POINT_RADIUS_HIGHLIGHTED = 0.6
const ARC_STROKE = 1.5
const CONJUNCTION_COLOR = '#FF3B30'

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
      alt: p.alt / 6371, // normalizado para unidades de raio terrestre
      color: OBJECT_TYPE_COLORS['OPERATIONAL_SATELLITE']!,
      radius: POINT_RADIUS_DEFAULT,
      noradId: p.noradId.value,
    }))

    this.postMessage({ type: 'UPDATE_POSITIONS', payload: points })
  }

  highlightConjunction(event: ConjunctionEvent): void {
    const arc: GlobeArcDataExternal = {
      startLat: 0, // preenchido pelo globe.html via noradId
      startLng: 0,
      endLat: 0,
      endLng: 0,
      color: CONJUNCTION_COLOR,
      stroke: ARC_STROKE,
    }

    this.postMessage({
      type: 'HIGHLIGHT_CONJUNCTION',
      payload: {
        noradIdA: event.objectA.noradId.value,
        noradIdB: event.objectB.noradId.value,
        arc,
        pointRadius: POINT_RADIUS_HIGHLIGHTED,
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

  private postMessage(message: unknown): void {
    this.webViewRef.current?.injectJavaScript(
      `window.handleGlobeCommand(${JSON.stringify(message)}); true;`,
    )
  }
}
