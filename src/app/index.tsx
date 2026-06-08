import React, { useState } from 'react'
import { View, StyleSheet } from 'react-native'
import { GlobeScreen } from '@/presentation/screens/globe-screen'
import { DashboardScreen } from '@/presentation/screens/dashboard-screen'
import { OnboardingScreen } from '@/presentation/screens/onboarding-screen'
import { TabBar, type AppTab } from '@/presentation/components/tab-bar/tab-bar'

export default function HomeScreen() {
  const [ready, setReady] = useState(false) // always show onboarding — demo app
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
