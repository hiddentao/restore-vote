import React, { createContext, useCallback, useEffect, useState } from "react"
import { useChain } from "../hooks/useChain"
import { useVoteStatus } from "../hooks/useVoteStatus"
import { policyApiService } from "../services/policyApi"
import { policyCacheService } from "../services/policyCache"
import { Policy } from "../types/Policy"

interface ApiContextType {
  policies: Policy[]
  loading: boolean
  isRefreshing: boolean
  lastUpdated: number | null
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
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [lastUpdated, setLastUpdated] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)
  const { checkUserVote, getVoteStatus, isLoggedIn } = useVoteStatus()
  const { voteStatusCacheVersion } = useChain()

  // Function to update policies with vote status
  const updatePoliciesWithVoteStatus = useCallback(
    (policiesToUpdate: Policy[]): Policy[] => {
      return policiesToUpdate.map((policy) => ({
        ...policy,
        hasUserVoted: getVoteStatus(policy.policyId),
      }))
    },
    [getVoteStatus],
  )

  // Function to check vote status for policies that don't have it
  const checkVoteStatusForPolicies = useCallback(
    async (policiesToCheck: Policy[]) => {
      if (!isLoggedIn) return

      for (const policy of policiesToCheck) {
        if (getVoteStatus(policy.policyId) === undefined) {
          // Check vote status in background
          checkUserVote(policy.policyId)
        }
      }
    },
    [isLoggedIn, getVoteStatus, checkUserVote],
  )

  const fetchPolicies = useCallback(
    async (isBackgroundRefresh = false) => {
      try {
        if (isBackgroundRefresh) {
          setIsRefreshing(true)
        } else {
          setLoading(true)
        }
        setError(null)

        const allPolicies = await policyApiService.fetchAllPolicies()

        // Update policies with current vote status
        const policiesWithVoteStatus = updatePoliciesWithVoteStatus(allPolicies)
        setPolicies(policiesWithVoteStatus)
        setLastUpdated(Date.now())

        // Cache the fresh policies
        await policyCacheService.setCachedPolicies(allPolicies)

        // Check vote status for policies that don't have it (in background)
        checkVoteStatusForPolicies(allPolicies)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load policies")
      } finally {
        setLoading(false)
        setIsRefreshing(false)
      }
    },
    [updatePoliciesWithVoteStatus, checkVoteStatusForPolicies],
  )

  const refreshPolicies = useCallback(async () => {
    await fetchPolicies(false)
  }, [fetchPolicies])

  // Load cached policies immediately on mount
  const loadCachedPolicies = useCallback(async () => {
    try {
      const cachedPolicies = await policyCacheService.getCachedPolicies()
      if (cachedPolicies && cachedPolicies.length > 0) {
        const policiesWithVoteStatus =
          updatePoliciesWithVoteStatus(cachedPolicies)
        setPolicies(policiesWithVoteStatus)
        setLoading(false)

        const cacheAge = policyCacheService.getCacheAge()
        if (cacheAge !== null) {
          setLastUpdated(Date.now() - cacheAge)
        }

        // Check vote status for cached policies (in background)
        checkVoteStatusForPolicies(cachedPolicies)

        // Start background refresh if cache is expired or near expiry
        if (
          policyCacheService.isCacheExpired() ||
          (cacheAge && cacheAge > 3 * 60 * 1000)
        ) {
          fetchPolicies(true)
        }
      } else {
        // No cache, fetch fresh data
        fetchPolicies(false)
      }
    } catch (err) {
      console.error("Error loading cached policies:", err)
      // Fallback to fresh fetch
      fetchPolicies(false)
    }
  }, [updatePoliciesWithVoteStatus, checkVoteStatusForPolicies, fetchPolicies])

  // Initial load (cache first, then fresh)
  useEffect(() => {
    loadCachedPolicies()
  }, [loadCachedPolicies])

  // Set up polling every 60 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      fetchPolicies(true) // Background refresh
    }, 60000) // 60 seconds

    return () => clearInterval(interval)
  }, [fetchPolicies])

  // Update policies when vote status cache changes
  useEffect(() => {
    if (policies.length > 0 && isLoggedIn && voteStatusCacheVersion > 0) {
      const updatedPolicies = updatePoliciesWithVoteStatus(policies)
      const hasChanges = updatedPolicies.some(
        (policy, index) =>
          policy.hasUserVoted !== policies[index]?.hasUserVoted,
      )
      if (hasChanges) {
        setPolicies(updatedPolicies)
      }
    }
  }, [
    policies,
    voteStatusCacheVersion,
    updatePoliciesWithVoteStatus,
    isLoggedIn,
  ])

  const value: ApiContextType = {
    policies,
    loading,
    isRefreshing,
    lastUpdated,
    error,
    refreshPolicies,
  }

  return <ApiContext.Provider value={value}>{children}</ApiContext.Provider>
}
