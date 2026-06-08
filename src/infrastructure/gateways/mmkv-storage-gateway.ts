import { MMKV } from 'react-native-mmkv'
import { IStorageGateway } from '@/core/gateways/i-storage-gateway'

const storage = new MMKV({ id: 'orbital-guardian' })

export class MmkvStorageGateway implements IStorageGateway {
  get<T>(key: string): T | null {
    const raw = storage.getString(key)
    if (raw === undefined) return null
    try {
      return JSON.parse(raw) as T
    } catch {
      return null
    }
  }

  set<T>(key: string, value: T): void {
    storage.set(key, JSON.stringify(value))
  }

  remove(key: string): void {
    storage.delete(key)
  }
}
