import { renderHook, act } from '@testing-library/react-native'
import { usePresentationMode } from './use-presentation-mode'
import { IStorageGateway } from '@/domain/gateways/i-storage-gateway'

function makeStorage(initial: boolean | null = null): jest.Mocked<IStorageGateway> {
  return {
    get: jest.fn().mockReturnValue(initial),
    set: jest.fn(),
    remove: jest.fn(),
  }
}

describe('usePresentationMode', () => {
  it('toggle() alterna isPresentationMode de false para true', () => {
    const storage = makeStorage(false)
    const { result } = renderHook(() => usePresentationMode(storage))

    act(() => result.current.toggle())

    expect(result.current.isPresentationMode).toBe(true)
  })

  it('toggle() alterna de true para false', () => {
    const storage = makeStorage(true)
    const { result } = renderHook(() => usePresentationMode(storage))

    act(() => result.current.toggle())

    expect(result.current.isPresentationMode).toBe(false)
  })

  it('persiste via IStorageGateway.set ao alternar', () => {
    const storage = makeStorage(false)
    const { result } = renderHook(() => usePresentationMode(storage))

    act(() => result.current.toggle())

    expect(storage.set).toHaveBeenCalledWith('presentation_mode', true)
  })

  it('lê estado inicial do storage', () => {
    const storage = makeStorage(true)
    const { result } = renderHook(() => usePresentationMode(storage))

    expect(result.current.isPresentationMode).toBe(true)
  })
})
