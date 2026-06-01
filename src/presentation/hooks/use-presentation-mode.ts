import { useState, useCallback } from 'react'
import { IStorageGateway } from '@/domain/gateways/i-storage-gateway'

const STORAGE_KEY = 'presentation_mode'

interface UsePresentationModeReturn {
  isPresentationMode: boolean
  toggle: () => void
}

export function usePresentationMode(storage: IStorageGateway): UsePresentationModeReturn {
  const [isPresentationMode, setIsPresentationMode] = useState<boolean>(
    () => storage.get<boolean>(STORAGE_KEY) ?? false,
  )

  const toggle = useCallback(() => {
    setIsPresentationMode((prev) => {
      const next = !prev
      storage.set(STORAGE_KEY, next)
      return next
    })
  }, [storage])

  return { isPresentationMode, toggle }
}
