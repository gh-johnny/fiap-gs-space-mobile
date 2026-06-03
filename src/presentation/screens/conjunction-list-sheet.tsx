import React from 'react'
import { StyleSheet, View, Text, ScrollView } from 'react-native'
import Animated, { useAnimatedStyle, useSharedValue, withSpring, runOnJS } from 'react-native-reanimated'
import { Gesture, GestureDetector } from 'react-native-gesture-handler'
import { BlurView } from 'expo-blur'
import { TAB_BAR_HEIGHT } from '@/presentation/components/tab-bar/tab-bar'
import { ConjunctionItem } from '@/presentation/components/conjunction-item/conjunction-item'
import { useAlertStore } from '@/application/stores/use-alert-store'
import { useTranslation } from '@/i18n/use-translation'
import type { ConjunctionEvent } from '@/domain/entities'

interface Props {
  onClose: () => void
  onOpenControlSheet: (noradId: string) => void
  correctedNoradIds: Set<string>
}

const SHEET_HEIGHT = 520
const CLOSE_THRESHOLD = 80
const SEVERITY_RANK = { CRITICAL: 0, WARNING: 1, INFO: 2 } as const

function isCorrectedConjunction(c: ConjunctionEvent, correctedNoradIds: Set<string>): boolean {
  return (
    correctedNoradIds.has(String(c.objectA.noradId.value)) ||
    correctedNoradIds.has(String(c.objectB.noradId.value))
  )
}

export function ConjunctionListSheet({ onClose, onOpenControlSheet, correctedNoradIds }: Props) {
  const translateY = useSharedValue(0)
  const { conjunctions, removeConjunction } = useAlertStore()
  const t = useTranslation()

  const active = conjunctions
    .filter((c) => !isCorrectedConjunction(c, correctedNoradIds))
    .sort((a, b) => SEVERITY_RANK[a.severity] - SEVERITY_RANK[b.severity])

  const corrected = conjunctions.filter((c) => isCorrectedConjunction(c, correctedNoradIds))

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
            <Text style={styles.sheetTitle}>{t('conjunction.title')}</Text>
            <Text style={styles.sheetCount}>{conjunctions.length}</Text>
          </View>
        </GestureDetector>

        <ScrollView
          style={styles.scroll}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t('conjunction.active')} — {active.length}</Text>
            {active.length === 0
              ? <Text style={styles.empty}>{t('conjunction.none')}</Text>
              : active.map((c, i) => (
                <ConjunctionItem
                  key={i}
                  event={c}
                  isCorrected={false}
                  onCorrect={() => onOpenControlSheet(String(c.objectA.noradId.value))}
                />
              ))
            }
          </View>

          {corrected.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>{t('conjunction.corrected')} — {corrected.length}</Text>
              {corrected.map((c, i) => (
                <ConjunctionItem
                  key={i}
                  event={c}
                  isCorrected
                  onRemove={() =>
                    removeConjunction(
                      String(c.objectA.noradId.value),
                      String(c.objectB.noradId.value),
                    )
                  }
                />
              ))}
            </View>
          )}
        </ScrollView>

      </BlurView>
    </Animated.View>
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
    zIndex: 20,
  },
  blur: { flex: 1 },
  handleArea: {
    alignItems: 'center',
    paddingTop: 12,
    paddingBottom: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(255,255,255,0.08)',
    gap: 4,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.25)',
  },
  sheetTitle: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 2,
  },
  sheetCount: {
    color: 'rgba(255,255,255,0.2)',
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 1,
  },
  scroll: { flex: 1 },
  scrollContent: { paddingBottom: TAB_BAR_HEIGHT + 32 },
  section: { paddingHorizontal: 16, paddingTop: 16, gap: 0 },
  sectionTitle: {
    color: 'rgba(255,255,255,0.3)',
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    marginBottom: 10,
  },
  empty: { color: 'rgba(255,255,255,0.25)', fontSize: 13, fontStyle: 'italic' },
})
