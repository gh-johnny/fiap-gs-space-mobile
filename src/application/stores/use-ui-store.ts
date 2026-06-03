import { create } from 'zustand'
import type { Locale } from '@/i18n/translations'

function defaultGlobeMode(): 'light' | 'dark' {
  const hour = new Date().getHours()
  return hour >= 6 && hour < 18 ? 'light' : 'dark'
}

interface UIState {
  simpleMode: boolean
  toggleSimpleMode: () => void
  globeMode: 'light' | 'dark'
  setGlobeMode: (mode: 'light' | 'dark') => void
  locale: Locale
  toggleLocale: () => void
}

export const useUIStore = create<UIState>((set) => ({
  simpleMode: false,
  toggleSimpleMode: () => set((s) => ({ simpleMode: !s.simpleMode })),
  globeMode: defaultGlobeMode(),
  setGlobeMode: (mode) => set({ globeMode: mode }),
  locale: 'pt',
  toggleLocale: () => set((s) => ({ locale: s.locale === 'pt' ? 'en' : 'pt' })),
}))
