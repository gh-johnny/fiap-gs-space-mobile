import { StyleSheet, View, Text, TouchableOpacity } from 'react-native'
import { BlurView } from 'expo-blur'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useTranslation } from '@/i18n/use-translation'

export type AppTab = 'globe' | 'intel'

interface TabBarProps {
  active: AppTab
  onChange: (tab: AppTab) => void
}

export const TAB_BAR_HEIGHT = 84

export function TabBar({ active, onChange }: TabBarProps) {
  const insets = useSafeAreaInsets()
  const t = useTranslation()

  const TABS: { id: AppTab; icon: string; label: string }[] = [
    { id: 'globe', icon: '◉', label: t('tab.globe') },
    { id: 'intel', icon: '⊞', label: t('tab.intel') },
  ]

  return (
    <View style={[styles.wrapper, { bottom: Math.max(insets.bottom, 12) + 14 }]}>
      <View style={styles.pill}>
        <BlurView intensity={85} tint="dark" style={StyleSheet.absoluteFill} />
        <View style={styles.tabs}>
          {TABS.map((tab) => {
            const isActive = active === tab.id
            return (
              <TouchableOpacity
                key={tab.id}
                style={[styles.tab, isActive && styles.tabActive]}
                onPress={() => onChange(tab.id)}
                activeOpacity={0.75}
              >
                <Text style={[styles.icon, isActive && styles.iconActive]}>{tab.icon}</Text>
                <Text style={[styles.label, isActive && styles.labelActive]}>{tab.label}</Text>
              </TouchableOpacity>
            )
          })}
        </View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 10,
  },
  pill: {
    flexDirection: 'row',
    borderRadius: 50,
    overflow: 'hidden',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255,255,255,0.18)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 24,
    elevation: 16,
  },
  tabs: {
    flexDirection: 'row',
    padding: 5,
    gap: 4,
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    paddingHorizontal: 22,
    paddingVertical: 11,
    borderRadius: 50,
  },
  tabActive: {
    backgroundColor: 'rgba(0,229,255,0.13)',
  },
  icon: {
    fontSize: 15,
    color: 'rgba(255,255,255,0.3)',
  },
  iconActive: {
    color: '#00E5FF',
  },
  label: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.5,
    color: 'rgba(255,255,255,0.3)',
  },
  labelActive: {
    color: '#00E5FF',
  },
})
