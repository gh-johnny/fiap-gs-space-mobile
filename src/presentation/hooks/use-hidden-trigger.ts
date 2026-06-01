import { useCallback, useRef } from 'react'

interface UseHiddenTriggerParams {
  onTrigger: () => void
  screenWidth: number
  screenHeight: number
  requiredTaps?: number
  windowMs?: number
}

interface UseHiddenTriggerReturn {
  onTap: (x: number, y: number) => void
}

const CORNER_X_THRESHOLD = 0.8 // x > 80% da largura
const CORNER_Y_THRESHOLD = 0.2 // y < 20% da altura

export function useHiddenTrigger({
  onTrigger,
  screenWidth,
  screenHeight,
  requiredTaps = 5,
  windowMs = 1500,
}: UseHiddenTriggerParams): UseHiddenTriggerReturn {
  const tapsRef = useRef<number[]>([])

  const onTap = useCallback(
    (x: number, y: number) => {
      const inCorner =
        x > screenWidth * CORNER_X_THRESHOLD && y < screenHeight * CORNER_Y_THRESHOLD

      if (!inCorner) {
        tapsRef.current = []
        return
      }

      const now = Date.now()
      tapsRef.current.push(now)

      // descarta taps fora da janela
      tapsRef.current = tapsRef.current.filter((t) => now - t < windowMs)

      if (tapsRef.current.length >= requiredTaps) {
        tapsRef.current = []
        onTrigger()
      }
    },
    [screenWidth, screenHeight, requiredTaps, windowMs, onTrigger],
  )

  return { onTap }
}
