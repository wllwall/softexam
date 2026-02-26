import type { StorageKey } from '@/types'

export function getStorage<T>(key: StorageKey, defaultValue: T): T {
  const val = uni.getStorageSync(key as unknown as string)
  if (val === null || val === undefined || val === '')
    return defaultValue
  return val as T
}

export function setStorage<T>(key: StorageKey, value: T) {
  uni.setStorageSync(key as unknown as string, value)
}

export function removeStorage(key: StorageKey) {
  uni.removeStorageSync(key as unknown as string)
}
