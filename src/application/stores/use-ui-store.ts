import { create } from 'zustand'

interface UIState {
  simpleMode: boolean
  toggleSimpleMode: () => void
}

export const useUIStore = create<UIState>((set) => ({
  simpleMode: false,
  toggleSimpleMode: () => set((s) => ({ simpleMode: !s.simpleMode })),
}))
