import { useContainer } from '@/application/container/container-context'
import type { Container } from '@/application/container/container'

export function useDI<K extends keyof Container>(key: K): Container[K] {
  const container = useContainer()
  return container[key]
}
