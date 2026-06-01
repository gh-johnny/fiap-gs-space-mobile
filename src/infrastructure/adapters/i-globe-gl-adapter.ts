import { OrbitPosition } from '@/domain/usecases/propagate-orbits'
import { ConjunctionEvent } from '@/domain/entities'

export interface IGlobeGlAdapter {
  updatePositions(positions: OrbitPosition[]): void
  highlightConjunction(event: ConjunctionEvent): void
  clearHighlight(): void
  dimGlobe(opacity: number): void
  undimGlobe(): void
}
