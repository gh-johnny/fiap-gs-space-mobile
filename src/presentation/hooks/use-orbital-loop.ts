import { useEffect, useRef } from 'react'

export function useOrbitalLoop(
  propagatePositions: (timestamp: Date) => void,
  intervalMs: number,
): void {
  const callbackRef = useRef(propagatePositions)
  callbackRef.current = propagatePositions

  useEffect(() => {
    const id = setInterval(() => {
      callbackRef.current(new Date())
    }, intervalMs)
    return () => clearInterval(id)
  }, [intervalMs])
}
