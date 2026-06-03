import { create } from 'zustand'

function defaultGlobeMode(): 'light' | 'dark' {
  const hour = new Date().getHours()
  return hour >= 6 && hour < 18 ? 'light' : 'dark'
}

interface UIState {
  simpleMode: boolean
  toggleSimpleMode: () => void
  globeMode: 'light' | 'dark'
  setGlobeMode: (mode: 'light' | 'dark') => void
}

export const useUIStore = create<UIState>((set) => ({
  simpleMode: false,
  toggleSimpleMode: () => set((s) => ({ simpleMode: !s.simpleMode })),
  globeMode: defaultGlobeMode(),
  setGlobeMode: (mode) => set({ globeMode: mode }),
}))
