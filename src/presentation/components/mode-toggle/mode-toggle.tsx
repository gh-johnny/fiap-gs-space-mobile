import { StyleSheet, TouchableOpacity, View } from 'react-native'

function ScopeIcon({ color }: { color: string }) {
  return (
    <View style={{ width: 16, height: 16, alignItems: 'center', justifyContent: 'center' }}>
      <View style={{ position: 'absolute', width: 16, height: 16, borderRadius: 8, borderWidth: 1.2, borderColor: color }} />
      <View style={{ width: 4, height: 4, borderRadius: 2, backgroundColor: color }} />
      <View style={{ position: 'absolute', top: 0, width: 1.5, height: 4, borderRadius: 1, backgroundColor: color }} />
      <View style={{ position: 'absolute', bottom: 0, width: 1.5, height: 4, borderRadius: 1, backgroundColor: color }} />
      <View style={{ position: 'absolute', left: 0, height: 1.5, width: 4, borderRadius: 1, backgroundColor: color }} />
      <View style={{ position: 'absolute', right: 0, height: 1.5, width: 4, borderRadius: 1, backgroundColor: color }} />
    </View>
  )
}

function EyeIcon({ color }: { color: string }) {
  return (
    <View style={{ width: 22, height: 12, borderRadius: 6, borderWidth: 1.2, borderColor: color, alignItems: 'center', justifyContent: 'center' }}>
      <View style={{ width: 5, height: 5, borderRadius: 2.5, backgroundColor: color }} />
    </View>
  )
}

interface Props {
  simpleMode: boolean
  onToggle: () => void
}

export function ModeToggle({ simpleMode, onToggle }: Props) {
  const techColor  = !simpleMode ? '#fff' : 'rgba(255,255,255,0.28)'
  const eyeColor   = simpleMode  ? '#fff' : 'rgba(255,255,255,0.28)'

  return (
    <TouchableOpacity style={styles.pill} onPress={onToggle} activeOpacity={0.8}>
      <View style={styles.slot}>
        <ScopeIcon color={techColor} />
      </View>
      <View style={styles.slot}>
        <EyeIcon color={eyeColor} />
      </View>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.07)',
    borderRadius: 20,
    padding: 3,
    gap: 2,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255,255,255,0.15)',
  },
  slot: {
    width: 34,
    height: 28,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
})
