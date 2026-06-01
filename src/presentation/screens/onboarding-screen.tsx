import React from 'react'
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native'
import { useContainer } from '@/application/container/container-context'

const ONBOARDING_KEY = 'onboarding_complete'

interface OnboardingScreenProps {
  onComplete: () => void
}

export function OnboardingScreen({ onComplete }: OnboardingScreenProps) {
  const { storageGateway } = useContainer()

  function handleConfirm() {
    storageGateway.set(ONBOARDING_KEY, true)
    onComplete()
  }

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.emoji}>🛸</Text>
        <Text style={styles.title}>Orbital Guardian</Text>
        <Text style={styles.subtitle}>
          Monitoramento em tempo real de satélites e detritos orbitais
        </Text>

        <View style={styles.bullets}>
          <Bullet text="Visualize objetos em órbita no globo 3D" />
          <Bullet text="Detecte conjunções e riscos de colisão" />
          <Bullet text="Acesse o histórico completo de alertas" />
        </View>

        <TouchableOpacity style={styles.btn} onPress={handleConfirm}>
          <Text style={styles.btnText}>COMEÇAR MONITORAMENTO</Text>
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
