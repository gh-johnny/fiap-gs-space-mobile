import React, { useState } from 'react'
import { useContainer } from '@/application/container/container-context'
import { GlobeScreen } from '@/presentation/screens/globe-screen'
import { OnboardingScreen, isOnboardingComplete } from '@/presentation/screens/onboarding-screen'

export default function HomeScreen() {
  const { storageGateway } = useContainer()
  const [ready, setReady] = useState(() => isOnboardingComplete(storageGateway))

  if (!ready) {
    return <OnboardingScreen onComplete={() => setReady(true)} />
  }

  return <GlobeScreen />
}
