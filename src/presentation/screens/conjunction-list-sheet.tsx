import React, { useCallback } from 'react'
import { StyleSheet, View, Text, ScrollView } from 'react-native'
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  useAnimatedGestureHandler,
} from 'react-native-reanimated'
import { PanGestureHandler, PanGestureHandlerGestureEvent } from 'react-native-gesture-handler'
import { BlurView } from 'expo-blur'
import { ConjunctionItem } from '@/presentation/components/conjunction-item/conjunction-item'
import { useAlertStore } from '@/application/stores/use-alert-store'

interface ConjunctionListSheetProps {
  onClose: () => void
}

const SHEET_HEIGHT = 500
const CLOSE_THRESHOLD = 120

type GestureContext = { startY: number }

export function ConjunctionListSheet({ onClose }: ConjunctionListSheetProps) {
  const translateY = useSharedValue(0)
  const { conjunctions, alertHistory } = useAlertStore()

  const gestureHandler = useAnimatedGestureHandler<PanGestureHandlerGestureEvent, GestureContext>({
    onStart: (_, ctx) => { ctx.startY = translateY.value },
    onActive: (e, ctx) => {
      translateY.value = Math.max(0, ctx.startY + e.translationY)
    },
    onEnd: (e) => {
      if (e.translationY > CLOSE_THRESHOLD) {
        translateY.value = withSpring(SHEET_HEIGHT, {}, () => {
          // onClose chamado depois da animação
        })
        onClose()
      } else {
        translateY.value = withSpring(0)
      }
    },
  })

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }))

  return (
    <Animated.View style={[styles.container, animStyle]}>
      <PanGestureHandler onGestureEvent={gestureHandler}>
        <Animated.View>
          <BlurView intensity={50} tint="dark" style={styles.blur}>
            <View style={styles.handle} />

            <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
              <Section title="Ativas">
                {conjunctions.length === 0
                  ? <Text style={styles.empty}>Nenhuma conjunção ativa</Text>
                  : conjunctions.map((e, i) => <ConjunctionItem key={i} event={e} />)
                }
              </Section>

              <Section title="Histórico">
                {alertHistory.length === 0
                  ? <Text style={styles.empty}>Nenhum alerta registrado</Text>
                  : alertHistory.map((a) => (
                    <View key={a.id} style={styles.historyItem}>
                      <Text style={styles.historyName}>
                        {a.conjunctionEvent.objectA.name} × {a.conjunctionEvent.objectB.name}
                      </Text>
                      <Text style={styles.historyStatus}>{a.status}</Text>
                    </View>
                  ))
                }
              </Section>
            </ScrollView>
          </BlurView>
        </Animated.View>
      </PanGestureHandler>
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
    bottom: 0,
    left: 0,
    right: 0,
    height: SHEET_HEIGHT,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    overflow: 'hidden',
  },
  blur: { flex: 1 },
  handle: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.2)',
    marginTop: 12,
    marginBottom: 8,
  },
  scroll: { flex: 1 },
  section: { padding: 16, gap: 8 },
  sectionTitle: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  empty: { color: 'rgba(255,255,255,0.3)', fontSize: 13, fontStyle: 'italic' },
  historyItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 8,
    padding: 10,
  },
  historyName: { color: '#fff', fontSize: 12 },
  historyStatus: { color: 'rgba(255,255,255,0.4)', fontSize: 11 },
})
