import { useState } from 'react'
import { StyleSheet, View, Text, TouchableOpacity, Pressable, Modal } from 'react-native'
import { useUIStore } from '@/application/stores/use-ui-store'

function SlidersIcon() {
  const knobPositions = [3, 9, 5]
  return (
    <View style={{ width: 18, height: 15, justifyContent: 'space-between' }}>
      {knobPositions.map((left, i) => (
        <View key={i} style={{ height: 5, justifyContent: 'center' }}>
          <View style={icon.track} />
          <View style={[icon.knob, { left }]} />
        </View>
      ))}
    </View>
  )
}

const icon = StyleSheet.create({
  track: {
    height: 1.5,
    backgroundColor: 'rgba(255,255,255,0.72)',
    borderRadius: 1,
  },
  knob: {
    position: 'absolute',
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: 'rgba(255,255,255,0.9)',
  },
})

export function SettingsOverlay() {
  const [open, setOpen] = useState(false)
  const { simpleMode, toggleSimpleMode, globeMode, setGlobeMode } = useUIStore()

  return (
    <Modal
      transparent
      visible
      animationType="none"
      statusBarTranslucent
      onRequestClose={() => { if (open) setOpen(false) }}
    >
      <View style={styles.root} pointerEvents="box-none">
        {open && (
          <Pressable style={StyleSheet.absoluteFill} onPress={() => setOpen(false)} />
        )}

        <TouchableOpacity
          style={styles.btn}
          onPress={() => setOpen((o) => !o)}
          activeOpacity={0.75}
        >
          <SlidersIcon />
        </TouchableOpacity>

        {open && (
          <View style={styles.popup}>
            <Text style={styles.popupTitle}>CONFIGURAÇÕES</Text>

            <View style={styles.row}>
              <Text style={styles.rowLabel}>Globo</Text>
              <View style={styles.group}>
                <TouchableOpacity
                  style={[styles.opt, globeMode === 'light' && styles.optActive]}
                  onPress={() => setGlobeMode('light')}
                >
                  <Text style={[styles.optText, globeMode === 'light' && styles.optTextActive]}>
                    {'☀ DIA'}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.opt, globeMode === 'dark' && styles.optActive]}
                  onPress={() => setGlobeMode('dark')}
                >
                  <Text style={[styles.optText, globeMode === 'dark' && styles.optTextActive]}>
                    {'☾ NOITE'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.row}>
              <Text style={styles.rowLabel}>Exibição</Text>
              <View style={styles.group}>
                <TouchableOpacity
                  style={[styles.opt, !simpleMode && styles.optActive]}
                  onPress={() => { if (simpleMode) toggleSimpleMode() }}
                >
                  <Text style={[styles.optText, !simpleMode && styles.optTextActive]}>TÉC</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.opt, simpleMode && styles.optActive]}
                  onPress={() => { if (!simpleMode) toggleSimpleMode() }}
                >
                  <Text style={[styles.optText, simpleMode && styles.optTextActive]}>SIM</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  root: {
    ...StyleSheet.absoluteFillObject,
  },
  btn: {
    position: 'absolute',
    top: 94,
    right: 16,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0,8,20,0.82)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.14)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  popup: {
    position: 'absolute',
    top: 138,
    right: 16,
    backgroundColor: '#000D1F',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    padding: 16,
    gap: 14,
    minWidth: 215,
  },
  popupTitle: {
    color: 'rgba(255,255,255,0.3)',
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 2,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 14,
  },
  rowLabel: {
    color: 'rgba(255,255,255,0.62)',
    fontSize: 12,
    fontWeight: '500',
  },
  group: {
    flexDirection: 'row',
    backgroundColor: '#0B1526',
    borderRadius: 10,
    padding: 3,
    gap: 3,
  },
  opt: {
    paddingVertical: 6,
    paddingHorizontal: 11,
    borderRadius: 8,
    alignItems: 'center',
  },
  optActive: {
    backgroundColor: '#1C3D70',
  },
  optText: {
    fontSize: 11,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.32)',
    letterSpacing: 0.8,
  },
  optTextActive: {
    color: '#D6EAFF',
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: 'rgba(255,255,255,0.08)',
    marginVertical: -4,
  },
})
