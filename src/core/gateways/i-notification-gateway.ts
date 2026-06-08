export interface INotificationGateway {
  requestPermission(): Promise<boolean>
  scheduleConjunctionAlert(satelliteA: string, satelliteB: string, severity: string): Promise<void>
}
