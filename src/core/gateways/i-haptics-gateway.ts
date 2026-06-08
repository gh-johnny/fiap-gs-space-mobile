export interface IHapticsGateway {
  warn(): Promise<void>
  impact(): Promise<void>
}
