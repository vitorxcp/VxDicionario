const cache = new Map<string, { value: any; expires: number }>()

export function getCached(key: string) {
  const entry = cache.get(key)
  if (!entry) return undefined
  if (Date.now() > entry.expires) {
    cache.delete(key)
    return undefined
  }
  return entry.value
}

export function setCached(key: string, value: any, ttl: number) {
  cache.set(key, { value, expires: Date.now() + ttl })
}

export function clearCache() {
  cache.clear()
}
