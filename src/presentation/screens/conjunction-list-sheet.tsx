import React from 'react'
import { StyleSheet, View, Text, ScrollView } from 'react-native'
import Animated, { useAnimatedStyle, useSharedValue, withSpring, runOnJS } from 'react-native-reanimated'
import { Gesture, GestureDetector } from 'react-native-gesture-handler'
import { BlurView } from 'expo-blur'
import { TAB_BAR_HEIGHT } from '@/presentation/components/tab-bar/tab-bar'
import { ConjunctionItem } from '@/presentation/components/conjunction-item/conjunction-item'
import { useAlertStore } from '@/application/stores/use-alert-store'

interface ConjunctionListSheetProps {
  onClose: () => void
}

const SHEET_HEIGHT = 500
const CLOSE_THRESHOLD = 80

export function ConjunctionListSheet({ onClose }: ConjunctionListSheetProps) {
  const translateY = useSharedValue(0)
  const { conjunctions, alertHistory } = useAlertStore()

  // Pan gesture applied ONLY to the handle — ScrollView scrolls independently
  const pan = Gesture.Pan()
    .onUpdate((e) => {
      translateY.value = Math.max(0, e.translationY)
    })
    .onEnd((e) => {
      if (e.translationY > CLOSE_THRESHOLD) {
        translateY.value = withSpring(SHEET_HEIGHT)
        runOnJS(onClose)()
      } else {
        translateY.value = withSpring(0)
      }
    })

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }))

  return (
    <Animated.View style={[styles.container, animStyle]}>
      <BlurView intensity={50} tint="dark" style={styles.blur}>

        <GestureDetector gesture={pan}>
          <View style={styles.handleArea}>
            <View style={styles.handle} />
            <Text style={styles.sheetTitle}>CONJUNÇÕES ATIVAS</Text>
          </View>
        </GestureDetector>

        <ScrollView
          style={styles.scroll}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          <Section title="Críticas & Alerta">
            {conjunctions.filter(e => e.severity !== 'INFO').length === 0
              ? <Text style={styles.empty}>Nenhuma conjunção crítica</Text>
              : conjunctions
                  .filter(e => e.severity !== 'INFO')
                  .map((e, i) => <ConjunctionItem key={i} event={e} />)
            }
          </Section>

          <Section title="Informativas">
            {conjunctions.filter(e => e.severity === 'INFO').length === 0
              ? <Text style={styles.empty}>Nenhuma</Text>
              : conjunctions
                  .filter(e => e.severity === 'INFO')
                  .map((e, i) => <ConjunctionItem key={i} event={e} />)
            }
          </Section>

          <Section title="Histórico">
            {alertHistory.length === 0
              ? <Text style={styles.empty}>Nenhum alerta registrado</Text>
              : alertHistory.map((a) => (
                <View key={a.id} style={styles.historyItem}>
                  <Text style={styles.historyName} numberOfLines={1}>
                    {a.conjunctionEvent.objectA.name} × {a.conjunctionEvent.objectB.name}
                  </Text>
                  <Text style={styles.historyStatus}>{a.status.toUpperCase()}</Text>
                </View>
              ))
            }
          </Section>
        </ScrollView>

      </BlurView>
    </Animated.View>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {children}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: TAB_BAR_HEIGHT,
    left: 0,
    right: 0,
    height: SHEET_HEIGHT,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    overflow: 'hidden',
    zIndex: 20,
  },
  blur: { flex: 1 },
  handleArea: {
    alignItems: 'center',
    paddingTop: 12,
    paddingBottom: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(255,255,255,0.08)',
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.25)',
    marginBottom: 10,
  },
  sheetTitle: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 2,
  },
  scroll: { flex: 1 },
  scrollContent: { paddingBottom: 32 },
  section: { paddingHorizontal: 16, paddingTop: 16, gap: 8 },
  sectionTitle: {
    color: 'rgba(255,255,255,0.35)',
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  empty: { color: 'rgba(255,255,255,0.25)', fontSize: 13, fontStyle: 'italic' },
  historyItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 8,
    padding: 10,
    gap: 8,
  },
  historyName: { color: 'rgba(255,255,255,0.7)', fontSize: 12, flex: 1 },
  historyStatus: { color: 'rgba(255,255,255,0.35)', fontSize: 10, letterSpacing: 0.5 },
})
