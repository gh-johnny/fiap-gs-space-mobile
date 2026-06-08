import React, { useEffect, useRef, useState } from 'react'
import {
  Animated,
  Dimensions,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native'
import { useTranslation } from '@/i18n/use-translation'

const { width: W, height: H } = Dimensions.get('window')

// Deterministic star field — golden angle distribution
const STARS = Array.from({ length: 60 }, (_, i) => ({
  id: i,
  left: ((i * 137.508) % 100) / 100 * W,
  top: ((i * 97.313) % 100) / 100 * H,
  r: i % 5 === 0 ? 2.5 : i % 3 === 0 ? 1.5 : 0.8,
  opacity: 0.12 + (i % 7) * 0.06,
}))

interface OnboardingScreenProps {
  onComplete: () => void
}

export function OnboardingScreen({ onComplete }: OnboardingScreenProps) {
  const t = useTranslation()
  const [slide, setSlide] = useState(0)
  const translateX = useRef(new Animated.Value(0)).current
  const pulseScale = useRef(new Animated.Value(1)).current
  const fadeIn = useRef(new Animated.Value(0)).current

  useEffect(() => {
    Animated.timing(fadeIn, { toValue: 1, duration: 900, useNativeDriver: true }).start()
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseScale, { toValue: 1.14, duration: 2200, useNativeDriver: true }),
        Animated.timing(pulseScale, { toValue: 1.0, duration: 2200, useNativeDriver: true }),
      ])
    ).start()
  }, [])

  function goTo(next: number) {
    Animated.spring(translateX, {
      toValue: -next * W,
      damping: 22,
      stiffness: 130,
      useNativeDriver: true,
    }).start()
    setSlide(next)
  }

  function handleNext() {
    slide < 2 ? goTo(slide + 1) : onComplete()
  }

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor="#000814" />

      {/* Star field */}
      <View style={StyleSheet.absoluteFill} pointerEvents="none">
        {STARS.map(s => (
          <View
            key={s.id}
            style={{
              position: 'absolute',
              left: s.left,
              top: s.top,
              width: s.r * 2,
              height: s.r * 2,
              borderRadius: s.r,
              backgroundColor: '#fff',
              opacity: s.opacity,
            }}
          />
        ))}
      </View>

      {/* Cyan ambient glow — top */}
      <View style={styles.glowTop} pointerEvents="none" />

      {/* Slides */}
      <Animated.View style={[styles.track, { opacity: fadeIn }]}>
        <Animated.View style={[styles.row, { transform: [{ translateX }] }]}>

          {/* ── Slide 1: Brand ── */}
          <View style={styles.slide}>
            <Animated.Text style={[styles.emoji, { transform: [{ scale: pulseScale }] }]}>
              🛸
            </Animated.Text>
            <Text style={styles.eyebrow}>{t('onboarding.s1.eyebrow')}</Text>
            <Text style={styles.title}>{t('onboarding.s1.title')}</Text>
            <View style={styles.divider} />
            <Text style={styles.body}>{t('onboarding.s1.body')}</Text>
          </View>

          {/* ── Slide 2: Globe ── */}
          <View style={styles.slide}>
            <Animated.Text style={[styles.emoji, { transform: [{ scale: pulseScale }] }]}>
              🌍
            </Animated.Text>
            <Text style={styles.eyebrow}>{t('onboarding.s2.eyebrow')}</Text>
            <Text style={styles.title}>{t('onboarding.s2.title')}</Text>
            <View style={styles.divider} />
            <View style={styles.card}>
              <FeatureRow text={t('onboarding.s2.chip1')} />
              <FeatureRow text={t('onboarding.s2.chip2')} />
              <FeatureRow text={t('onboarding.s2.chip3')} />
            </View>
          </View>

          {/* ── Slide 3: Conjunctions ── */}
          <View style={styles.slide}>
            <Animated.Text style={[styles.emoji, { transform: [{ scale: pulseScale }] }]}>
              ⚡
            </Animated.Text>
            <Text style={styles.eyebrow}>{t('onboarding.s3.eyebrow')}</Text>
            <Text style={styles.title}>{t('onboarding.s3.title')}</Text>
            <View style={styles.divider} />
            <View style={styles.card}>
              <FeatureRow text={t('onboarding.s3.chip1')} />
              <FeatureRow text={t('onboarding.s3.chip2')} />
              <FeatureRow text={t('onboarding.s3.chip3')} />
            </View>
          </View>

        </Animated.View>
      </Animated.View>

      {/* Controls */}
      <View style={styles.controls}>
        <View style={styles.dots}>
          {[0, 1, 2].map(i => (
            <TouchableOpacity key={i} onPress={() => goTo(i)} hitSlop={{ top: 12, bottom: 12, left: 8, right: 8 }}>
              <View style={[styles.dot, i === slide && styles.dotActive]} />
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity style={styles.btn} onPress={handleNext} activeOpacity={0.85}>
          <Text style={styles.btnLabel}>
            {slide < 2 ? t('onboarding.next') : t('onboarding.start')}
          </Text>
        </TouchableOpacity>

        <View style={styles.skipRow}>
          {slide < 2 ? (
            <TouchableOpacity onPress={onComplete} hitSlop={{ top: 8, bottom: 8, left: 16, right: 16 }}>
              <Text style={styles.skipLabel}>{t('onboarding.skip')}</Text>
            </TouchableOpacity>
          ) : (
            <View style={{ height: 20 }} />
          )}
        </View>
      </View>
    </View>
  )
}

function FeatureRow({ text }: { text: string }) {
  return (
    <View style={styles.featureRow}>
      <View style={styles.featureDot} />
      <Text style={styles.featureText}>{text}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#000814' },

  glowTop: {
    position: 'absolute',
    top: -120,
    left: W * 0.5 - 160,
    width: 320,
    height: 320,
    borderRadius: 160,
    backgroundColor: 'rgba(0,229,255,0.07)',
  },

  track: { flex: 1, overflow: 'hidden' },
  row: { flexDirection: 'row', width: W * 3, flex: 1 },

  slide: {
    width: W,
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 36,
    gap: 14,
    paddingBottom: 40,
  },

  emoji: { fontSize: 80, marginBottom: 2 },

  eyebrow: {
    color: '#00E5FF',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 4,
    textAlign: 'center',
  },

  title: {
    color: '#fff',
    fontSize: 40,
    fontWeight: '800',
    textAlign: 'center',
    lineHeight: 46,
    letterSpacing: -0.5,
  },

  divider: {
    width: 36,
    height: 2,
    backgroundColor: 'rgba(0,229,255,0.45)',
    borderRadius: 1,
    marginVertical: 2,
  },

  body: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 25,
    maxWidth: 290,
  },

  card: {
    alignSelf: 'stretch',
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.09)',
    padding: 22,
    gap: 18,
  },

  featureRow: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  featureDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#00E5FF',
  },
  featureText: {
    color: 'rgba(255,255,255,0.75)',
    fontSize: 14,
    fontWeight: '500',
    flex: 1,
    lineHeight: 20,
  },

  controls: {
    paddingHorizontal: 32,
    paddingBottom: 52,
    alignItems: 'center',
    gap: 16,
  },

  dots: { flexDirection: 'row', gap: 8, alignItems: 'center' },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  dotActive: {
    width: 28,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#00E5FF',
  },

  btn: {
    backgroundColor: '#00E5FF',
    borderRadius: 14,
    paddingVertical: 18,
    alignSelf: 'stretch',
    alignItems: 'center',
  },
  btnLabel: {
    color: '#000814',
    fontWeight: '800',
    fontSize: 13,
    letterSpacing: 2,
  },

  skipRow: { height: 20, justifyContent: 'center' },
  skipLabel: {
    color: 'rgba(255,255,255,0.25)',
    fontSize: 12,
    letterSpacing: 1,
    textAlign: 'center',
  },
})
