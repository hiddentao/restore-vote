import React, { createContext, useCallback, useEffect, useState } from "react"
import { policyApiService } from "../services/policyApi"
import { Policy } from "../types/Policy"

interface ApiContextType {
  policies: Policy[]
  loading: boolean
  error: string | null
  refreshPolicies: () => Promise<void>
}

export const ApiContext = createContext<ApiContextType | null>(null)

interface ApiProviderProps {
  children: React.ReactNode
}

export const ApiProvider: React.FC<ApiProviderProps> = ({ children }) => {
  const [policies, setPolicies] = useState<Policy[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchPolicies = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const allPolicies = await policyApiService.fetchAllPolicies()
      setPolicies(allPolicies)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load policies")
    } finally {
      setLoading(false)
    }
  }, [])

  const refreshPolicies = useCallback(async () => {
    await fetchPolicies()
  }, [fetchPolicies])

  // Initial fetch
  useEffect(() => {
    fetchPolicies()
  }, [fetchPolicies])

  // Set up polling every 60 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      fetchPolicies()
    }, 60000) // 60 seconds

    return () => clearInterval(interval)
  }, [fetchPolicies])

  const value: ApiContextType = {
    policies,
    loading,
    error,
    refreshPolicies,
  }

  return <ApiContext.Provider value={value}>{children}</ApiContext.Provider>
}
