import { OrbitPosition } from '@/core/usecases/propagate-orbits'
import { ConjunctionEvent } from '@/core/entities'

export interface IGlobeGlAdapter {
  updatePositions(positions: OrbitPosition[]): void
  showConjunctionPairs(events: ConjunctionEvent[]): void
  highlightConjunction(event: ConjunctionEvent): void
  clearHighlight(): void
  dimGlobe(opacity: number): void
  undimGlobe(): void
  selectSatellite(noradId: number): void
  showSatCard(noradId: number, name: string, satType: string, altKm: number): void
  hideSatCard(): void
  deselectSatellite(): void
  markCorrected(noradId: number): void
  addConjunctionPair(event: ConjunctionEvent): void
  setGlobeTexture(mode: 'light' | 'dark'): void
  setSimpleMode(simple: boolean): void
  setLocale(locale: 'en' | 'pt'): void
  focusSatellite(noradId: number, lat: number, lng: number, lngOffset?: number): void
  setSatMode(noradId: number, mode: string, modeColor: string): void
  setUserBeacon(lat: number, lng: number): void
  clearUserBeacon(): void
}
