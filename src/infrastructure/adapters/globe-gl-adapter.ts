import { RefObject } from 'react'
import { WebView } from 'react-native-webview'
import { IGlobeGlAdapter } from './i-globe-gl-adapter'
import { OrbitPosition } from '@/core/usecases/propagate-orbits'
import { ConjunctionEvent } from '@/core/entities'
import type { GlobePointDataExternal } from './globe-gl-external-types'
import { OBJECT_TYPE_COLORS } from '@/constants/theme'

export class GlobeGlAdapter implements IGlobeGlAdapter {
  constructor(private readonly webViewRef: RefObject<WebView>) {}

  updatePositions(positions: OrbitPosition[]): void {
    const points: GlobePointDataExternal[] = positions.map((p) => ({
      lat: p.lat,
      lng: p.lng,
      alt: p.alt / 6371,
      color: OBJECT_TYPE_COLORS[p.satType ?? 'OPERATIONAL_SATELLITE'] ?? OBJECT_TYPE_COLORS['OPERATIONAL_SATELLITE']!,
      radius: 0.3,
      noradId: p.noradId.value,
    }))
    this.postMessage({ type: 'UPDATE_POSITIONS', payload: points })
  }

  showConjunctionPairs(events: ConjunctionEvent[]): void {
    const pairs = events.map((e) => ({
      noradIdA: e.objectA.noradId.value,
      noradIdB: e.objectB.noradId.value,
      satTypeA: e.objectA.type,
      satTypeB: e.objectB.type,
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

  showSatCard(noradId: number, name: string, satType: string, altKm: number): void {
    this.postMessage({ type: 'SHOW_SAT_CARD', payload: { noradId, name, satType, altKm } })
  }

  hideSatCard(): void {
    this.postMessage({ type: 'HIDE_SAT_CARD' })
  }

  deselectSatellite(): void {
    this.postMessage({ type: 'DESELECT_SATELLITE' })
  }

  markCorrected(noradId: number): void {
    this.postMessage({ type: 'MARK_CORRECTED', payload: { noradId } })
  }

  addConjunctionPair(event: ConjunctionEvent): void {
    this.postMessage({
      type: 'ADD_CONJUNCTION_PAIR',
      payload: {
        noradIdA: event.objectA.noradId.value,
        noradIdB: event.objectB.noradId.value,
        satTypeA: event.objectA.type,
        satTypeB: event.objectB.type,
        severity: event.severity,
      },
    })
  }

  setGlobeTexture(mode: 'light' | 'dark'): void {
    this.postMessage({ type: 'SET_GLOBE_TEXTURE', payload: { mode } })
  }

  setSimpleMode(simple: boolean): void {
    this.postMessage({ type: 'SET_SIMPLE_MODE', payload: { simple } })
  }

  setLocale(locale: 'en' | 'pt'): void {
    this.postMessage({ type: 'SET_LOCALE', payload: { locale } })
  }

  focusSatellite(noradId: number, lat: number, lng: number, lngOffset = 0): void {
    this.postMessage({ type: 'FOCUS_SATELLITE', payload: { noradId, lat, lng, lngOffset } })
  }

  setSatMode(noradId: number, mode: string, modeColor: string): void {
    this.postMessage({ type: 'SET_SAT_MODE', payload: { noradId, mode, modeColor } })
  }

  setUserBeacon(lat: number, lng: number): void {
    this.postMessage({ type: 'SET_USER_BEACON', payload: { lat, lng } })
  }

  clearUserBeacon(): void {
    this.postMessage({ type: 'CLEAR_USER_BEACON' })
  }

  private postMessage(message: unknown): void {
    this.webViewRef.current?.injectJavaScript(
      `window.handleGlobeCommand(${JSON.stringify(message)}); true;`,
    )
  }
}
