import { StyleSheet, View, Text, TouchableOpacity } from 'react-native'
import { BlurView } from 'expo-blur'
import { useRouter } from 'expo-router'
import { OrbitalAlert } from '@/domain/entities'
import { SEVERITY_COLORS } from '@/constants/theme'

interface Props {
  alert: OrbitalAlert
  onAcknowledge: () => void
  onDismiss: () => void
}

export function MiniAlertBanner({ alert, onAcknowledge, onDismiss }: Props) {
  const router = useRouter()
  const ev    = alert.conjunctionEvent
  const color = SEVERITY_COLORS[ev.severity]

  return (
    <View style={styles.wrap}>
      <BlurView intensity={65} tint="dark" style={StyleSheet.absoluteFill} />
      <View style={[styles.strip, { backgroundColor: color }]} />
      <View style={styles.info}>
        <Text style={[styles.severity, { color }]}>{ev.severity}</Text>
        <Text style={styles.names} numberOfLines={1}>
          {ev.objectA.name} × {ev.objectB.name}
        </Text>
      </View>
      <TouchableOpacity style={styles.btn} onPress={() => router.push('/alert-detail')}>
        <Text style={styles.btnTxt}>DETALHES</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.btn} onPress={onAcknowledge}>
        <Text style={[styles.btnTxt, { color: '#34C759' }]}>✓</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.btn} onPress={onDismiss}>
        <Text style={styles.btnTxt}>✕</Text>
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    top: 141,
    left: 16,
    right: 16,
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 14,
    overflow: 'hidden',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255,255,255,0.12)',
    zIndex: 30,
  },
  strip: {
    width: 3,
    alignSelf: 'stretch',
  },
  info: {
    flex: 1,
    paddingLeft: 10,
    paddingRight: 4,
    gap: 2,
  },
  severity: {
    fontSize: 8,
    fontWeight: '800',
    letterSpacing: 1.5,
  },
  names: {
    color: 'rgba(255,255,255,0.75)',
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: -0.2,
  },
  btn: {
    paddingHorizontal: 9,
    paddingVertical: 8,
    marginRight: 4,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.07)',
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 36,
  },
  btnTxt: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.8,
  },
})
