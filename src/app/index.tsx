import React, { useState } from 'react'
import { View, StyleSheet } from 'react-native'
import { useContainer } from '@/application/container/container-context'
import { GlobeScreen } from '@/presentation/screens/globe-screen'
import { DashboardScreen } from '@/presentation/screens/dashboard-screen'
import { OnboardingScreen, isOnboardingComplete } from '@/presentation/screens/onboarding-screen'
import { TabBar, type AppTab } from '@/presentation/components/tab-bar/tab-bar'

export default function HomeScreen() {
  const { storageGateway } = useContainer()
  const [ready, setReady] = useState(() => isOnboardingComplete(storageGateway))
  const [activeTab, setActiveTab] = useState<AppTab>('globe')

  if (!ready) {
    return <OnboardingScreen onComplete={() => setReady(true)} />
  }

  return (
    <View style={styles.root}>
      {activeTab === 'globe' ? <GlobeScreen /> : <DashboardScreen />}
      <TabBar active={activeTab} onChange={setActiveTab} />
    </View>
  )
}

const styles = StyleSheet.create({
  root: { flex: 1 },
})
