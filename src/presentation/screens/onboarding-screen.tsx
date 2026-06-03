import React from 'react'
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native'
import { useContainer } from '@/application/container/container-context'
import { useTranslation } from '@/i18n/use-translation'

const ONBOARDING_KEY = 'onboarding_complete'

interface OnboardingScreenProps {
  onComplete: () => void
}

export function OnboardingScreen({ onComplete }: OnboardingScreenProps) {
  const { storageGateway } = useContainer()
  const t = useTranslation()

  function handleConfirm() {
    storageGateway.set(ONBOARDING_KEY, true)
    onComplete()
  }

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.emoji}>🛸</Text>
        <Text style={styles.title}>{t('onboarding.title')}</Text>
        <Text style={styles.subtitle}>{t('onboarding.subtitle')}</Text>

        <View style={styles.bullets}>
          <Bullet text={t('onboarding.bullet1')} />
          <Bullet text={t('onboarding.bullet2')} />
          <Bullet text={t('onboarding.bullet3')} />
        </View>

        <TouchableOpacity style={styles.btn} onPress={handleConfirm}>
          <Text style={styles.btnText}>{t('onboarding.start')}</Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}

function Bullet({ text }: { text: string }) {
  return (
    <View style={styles.bullet}>
      <Text style={styles.bulletDot}>›</Text>
      <Text style={styles.bulletText}>{text}</Text>
    </View>
  )
}

export function isOnboardingComplete(storageGateway: { get: <T>(key: string) => T | null }): boolean {
  return storageGateway.get<boolean>(ONBOARDING_KEY) === true
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000814', justifyContent: 'center' },
  content: { padding: 32, gap: 20, alignItems: 'center' },
  emoji: { fontSize: 56 },
  title: { color: '#fff', fontSize: 28, fontWeight: '700', textAlign: 'center' },
  subtitle: { color: 'rgba(255,255,255,0.6)', fontSize: 14, textAlign: 'center', lineHeight: 20 },
  bullets: { gap: 10, alignSelf: 'stretch' },
  bullet: { flexDirection: 'row', gap: 8 },
  bulletDot: { color: '#00E5FF', fontSize: 18 },
  bulletText: { color: 'rgba(255,255,255,0.7)', fontSize: 13, flex: 1, lineHeight: 20 },
  btn: {
    backgroundColor: '#00E5FF',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 32,
    alignSelf: 'stretch',
    alignItems: 'center',
    marginTop: 8,
  },
  btnText: { color: '#000', fontWeight: '800', letterSpacing: 1 },
})
