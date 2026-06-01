import { TLEData } from '@/domain/value-objects'

export interface ITleGateway {
  fetchTLEs(): Promise<TLEData[]>
}
