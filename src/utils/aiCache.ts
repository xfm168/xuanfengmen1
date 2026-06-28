import { AI_SCHEMA_VERSION } from '../constants/defaultAnalysis'

const DEFAULT_TTL = 24 * 60 * 60 * 1000 // 24小时

export interface AICacheEntry<T> {
  version: string
  data: T
  model: string
  createdAt: number
}

export function cacheKey(module: string, inputHash: string): string {
  return `ai:${module}:${inputHash}`
}

export function hashInput(variables: Record<string, unknown>): string {
  const str = JSON.stringify(variables)
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i)
    hash |= 0
  }
  return Math.abs(hash).toString(36)
}

export function getCache<T>(key: string, ttl: number = DEFAULT_TTL): T | null {
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return null
    const entry = JSON.parse(raw) as AICacheEntry<T>
    if (!entry || !entry.createdAt) return null
    if (Date.now() - entry.createdAt > ttl) return null
    if (entry.version !== AI_SCHEMA_VERSION) return null
    return entry.data
  } catch {
    return null
  }
}

export function setCache<T>(key: string, data: T, model: string): void {
  try {
    const entry: AICacheEntry<T> = {
      version: AI_SCHEMA_VERSION,
      data,
      model,
      createdAt: Date.now(),
    }
    localStorage.setItem(key, JSON.stringify(entry))
  } catch {
    // ignore
  }
}

export function clearCache(key: string): void {
  try {
    localStorage.removeItem(key)
  } catch {
    // ignore
  }
}
