import { OrbitPosition } from '@/domain/usecases/propagate-orbits'
import { ConjunctionEvent } from '@/domain/entities'

export interface IGlobeGlAdapter {
  updatePositions(positions: OrbitPosition[]): void
  showConjunctionPairs(events: ConjunctionEvent[]): void
  highlightConjunction(event: ConjunctionEvent): void
  clearHighlight(): void
  dimGlobe(opacity: number): void
  undimGlobe(): void
  selectSatellite(noradId: number): void
  deselectSatellite(): void
  markCorrected(noradId: number): void
  addConjunctionPair(event: ConjunctionEvent): void
  setGlobeTexture(mode: 'light' | 'dark'): void
  focusSatellite(noradId: number, lat: number, lng: number): void
}
