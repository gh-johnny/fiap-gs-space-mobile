import { renderHook, act } from '@testing-library/react-native'
import { useOrbitalLoop } from './use-orbital-loop'

describe('useOrbitalLoop', () => {
  beforeEach(() => {
    jest.useFakeTimers()
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  it('chama propagatePositions após o intervalo', () => {
    const propagate = jest.fn()
    renderHook(() => useOrbitalLoop(propagate, 1000))

    act(() => {
      jest.advanceTimersByTime(1000)
    })

    expect(propagate).toHaveBeenCalledTimes(1)
  })

  it('chama propagatePositions múltiplas vezes em múltiplos intervalos', () => {
    const propagate = jest.fn()
    renderHook(() => useOrbitalLoop(propagate, 1000))

    act(() => {
      jest.advanceTimersByTime(3000)
    })

    expect(propagate).toHaveBeenCalledTimes(3)
  })

  it('cleanup cancela o interval ao desmontar', () => {
    const propagate = jest.fn()
    const { unmount } = renderHook(() => useOrbitalLoop(propagate, 1000))

    unmount()

    act(() => {
      jest.advanceTimersByTime(3000)
    })

    expect(propagate).not.toHaveBeenCalled()
  })
})
