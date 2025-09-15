import { Policy } from "../types/Policy"

const CACHE_KEY = "restore-vote-policies-cache"
const CACHE_EXPIRY_MS = 5 * 60 * 1000 // 5 minutes
const MAX_CACHE_SIZE = 2 * 1024 * 1024 // 2MB limit

interface CacheData {
  policies: Policy[]
  timestamp: number
}

export class PolicyCacheService {
  private isValidCache(data: CacheData): boolean {
    const now = Date.now()
    const age = now - data.timestamp
    return age < CACHE_EXPIRY_MS
  }

  private getCacheSize(data: any): number {
    try {
      return JSON.stringify(data).length
    } catch {
      return 0
    }
  }

  async getCachedPolicies(): Promise<Policy[] | null> {
    try {
      const cached = localStorage.getItem(CACHE_KEY)
      if (!cached) {
        return null
      }

      const data: CacheData = JSON.parse(cached)

      if (!this.isValidCache(data)) {
        this.clearCache()
        return null
      }

      return data.policies
    } catch (error) {
      console.error("Error reading policy cache:", error)
      this.clearCache()
      return null
    }
  }

  async setCachedPolicies(policies: Policy[]): Promise<void> {
    try {
      const data: CacheData = {
        policies,
        timestamp: Date.now(),
      }

      const size = this.getCacheSize(data)
      if (size > MAX_CACHE_SIZE) {
        console.warn("Cache size exceeds limit, not caching")
        return
      }

      localStorage.setItem(CACHE_KEY, JSON.stringify(data))
    } catch (error) {
      console.error("Error setting policy cache:", error)
      if (
        error instanceof DOMException &&
        error.name === "QuotaExceededError"
      ) {
        this.clearCache()
      }
    }
  }

  getCacheAge(): number | null {
    try {
      const cached = localStorage.getItem(CACHE_KEY)
      if (!cached) {
        return null
      }

      const data: CacheData = JSON.parse(cached)
      return Date.now() - data.timestamp
    } catch {
      return null
    }
  }

  clearCache(): void {
    try {
      localStorage.removeItem(CACHE_KEY)
    } catch (error) {
      console.error("Error clearing policy cache:", error)
    }
  }

  isCacheExpired(): boolean {
    const age = this.getCacheAge()
    if (age === null) return true
    return age >= CACHE_EXPIRY_MS
  }
}

export const policyCacheService = new PolicyCacheService()
