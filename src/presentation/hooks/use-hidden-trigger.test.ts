import { renderHook, act } from '@testing-library/react-native'
import { useHiddenTrigger } from './use-hidden-trigger'

const TAP_WINDOW_MS = 1500
const REQUIRED_TAPS = 5

function tap(tapFn: (x: number, y: number) => void, count: number, inCorner = true) {
  // canto superior direito: x > 80% largura, y < 20% altura
  const x = inCorner ? 320 : 100
  const y = inCorner ? 30 : 200
  for (let i = 0; i < count; i++) tapFn(x, y)
}

describe('useHiddenTrigger', () => {
  beforeEach(() => jest.useFakeTimers())
  afterEach(() => jest.useRealTimers())

  it('5 taps no canto dentro de 1.5s dispara onTrigger', () => {
    const onTrigger = jest.fn()
    const screenWidth = 375
    const screenHeight = 812

    const { result } = renderHook(() =>
      useHiddenTrigger({ onTrigger, screenWidth, screenHeight, requiredTaps: REQUIRED_TAPS, windowMs: TAP_WINDOW_MS }),
    )

    act(() => {
      tap(result.current.onTap, REQUIRED_TAPS, true)
    })

    expect(onTrigger).toHaveBeenCalledTimes(1)
  })

  it('5 taps fora do canto não dispara', () => {
    const onTrigger = jest.fn()
    const { result } = renderHook(() =>
      useHiddenTrigger({ onTrigger, screenWidth: 375, screenHeight: 812, requiredTaps: REQUIRED_TAPS, windowMs: TAP_WINDOW_MS }),
    )

    act(() => {
      tap(result.current.onTap, REQUIRED_TAPS, false)
    })

    expect(onTrigger).not.toHaveBeenCalled()
  })

  it('intervalo > 1.5s entre taps reseta contador', () => {
    const onTrigger = jest.fn()
    const { result } = renderHook(() =>
      useHiddenTrigger({ onTrigger, screenWidth: 375, screenHeight: 812, requiredTaps: REQUIRED_TAPS, windowMs: TAP_WINDOW_MS }),
    )

    act(() => {
      tap(result.current.onTap, 3, true)
      jest.advanceTimersByTime(TAP_WINDOW_MS + 100)
      tap(result.current.onTap, 5, true)
    })

    expect(onTrigger).toHaveBeenCalledTimes(1)
  })

  it('4 taps não dispara', () => {
    const onTrigger = jest.fn()
    const { result } = renderHook(() =>
      useHiddenTrigger({ onTrigger, screenWidth: 375, screenHeight: 812, requiredTaps: REQUIRED_TAPS, windowMs: TAP_WINDOW_MS }),
    )

    act(() => {
      tap(result.current.onTap, 4, true)
    })

    expect(onTrigger).not.toHaveBeenCalled()
  })

  it('usa valores padrão (requiredTaps=5, windowMs=1500) quando não passados', () => {
    const onTrigger = jest.fn()
    // sem requiredTaps nem windowMs — usa defaults
    const { result } = renderHook(() =>
      useHiddenTrigger({ onTrigger, screenWidth: 375, screenHeight: 812 }),
    )

    act(() => {
      tap(result.current.onTap, 5, true) // 5 = default requiredTaps
    })

    expect(onTrigger).toHaveBeenCalledTimes(1)
  })
})
