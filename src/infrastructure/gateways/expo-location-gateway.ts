import * as Location from 'expo-location'
import type { ILocationGateway, UserLocation } from '@/core/gateways/i-location-gateway'

export class ExpoLocationGateway implements ILocationGateway {
  private subscription: Location.LocationSubscription | null = null

  async requestPermission(): Promise<boolean> {
    const { status } = await Location.requestForegroundPermissionsAsync()
    return status === 'granted'
  }

  async startWatching(onUpdate: (location: UserLocation) => void): Promise<void> {
    this.subscription = await Location.watchPositionAsync(
      {
        accuracy: Location.Accuracy.Balanced,
        timeInterval: 10_000,
        distanceInterval: 50,
      },
      (loc) => onUpdate({
        lat: loc.coords.latitude,
        lng: loc.coords.longitude,
        accuracy: loc.coords.accuracy ?? 0,
      }),
    )
  }

  stopWatching(): void {
    this.subscription?.remove()
    this.subscription = null
  }
}
