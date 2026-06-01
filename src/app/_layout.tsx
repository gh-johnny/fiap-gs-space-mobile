import { Stack } from 'expo-router'
import { ContainerProvider } from '@/application/container/container-context'

export default function RootLayout() {
  return (
    <ContainerProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen
          name="alert-detail"
          options={{ presentation: 'modal', animation: 'slide_from_bottom' }}
        />
      </Stack>
    </ContainerProvider>
  )
}
