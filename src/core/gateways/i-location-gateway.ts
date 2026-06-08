export interface UserLocation {
  lat: number
  lng: number
  accuracy: number
}

export interface ILocationGateway {
  requestPermission(): Promise<boolean>
  startWatching(onUpdate: (location: UserLocation) => void): Promise<void>
  stopWatching(): void
}
