import type { INotificationGateway } from '@/core/gateways/i-notification-gateway'

export class ExpoNotificationGateway implements INotificationGateway {
  private available = false

  constructor() {
    try {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const Notifications = require('expo-notifications')
      Notifications.setNotificationHandler({
        handleNotification: async () => ({
          shouldShowAlert: true,
          shouldPlaySound: true,
          shouldSetBadge: false,
          shouldShowBanner: true,
          shouldShowList: true,
        }),
      })
      this.available = true
    } catch {
      // expo-notifications not available in Expo Go SDK 53+
    }
  }

  async requestPermission(): Promise<boolean> {
    if (!this.available) return false
    try {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const Notifications = require('expo-notifications')
      const { status } = await Notifications.requestPermissionsAsync()
      return status === 'granted'
    } catch {
      return false
    }
  }

  async scheduleConjunctionAlert(satelliteA: string, satelliteB: string, severity: string): Promise<void> {
    if (!this.available) return
    try {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const Notifications = require('expo-notifications')
      await Notifications.scheduleNotificationAsync({
        content: {
          title: `⚠️ Conjunction Alert — ${severity}`,
          body: `${satelliteA} × ${satelliteB}`,
          sound: true,
        },
        trigger: null,
      })
    } catch {
      // silently degrade
    }
  }
}
