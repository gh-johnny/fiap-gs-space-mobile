import * as Haptics from 'expo-haptics'
import { IHapticsGateway } from '@/core/gateways/i-haptics-gateway'

export class ExpoHapticsGateway implements IHapticsGateway {
  async warn(): Promise<void> {
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning)
  }

  async impact(): Promise<void> {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy)
  }
}
