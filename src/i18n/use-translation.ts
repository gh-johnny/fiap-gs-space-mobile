import { useUIStore } from '@/application/stores/use-ui-store'
import { TRANSLATIONS, type TranslationKey } from './translations'

export function useTranslation() {
  const locale = useUIStore((s) => s.locale)
  const dict = TRANSLATIONS[locale]
  return (key: TranslationKey): string => dict[key]
}
