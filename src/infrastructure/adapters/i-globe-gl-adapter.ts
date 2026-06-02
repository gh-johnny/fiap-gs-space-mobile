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
}
