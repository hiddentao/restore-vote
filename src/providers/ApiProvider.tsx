import React, { createContext, useCallback, useEffect, useState } from "react"
import { useChain } from "../hooks/useChain"
import { useVoteStatus } from "../hooks/useVoteStatus"
import { getLastUpdated, getPolicies } from "../services/staticPolicyData"
import { Policy } from "../types/Policy"

interface ApiContextType {
  policies: Policy[]
  loading: boolean
  lastUpdated: number | null
  error: string | null
}

export const ApiContext = createContext<ApiContextType | null>(null)

interface ApiProviderProps {
  children: React.ReactNode
}

export const ApiProvider: React.FC<ApiProviderProps> = ({ children }) => {
  const [policies, setPolicies] = useState<Policy[]>([])
  const [loading, setLoading] = useState(true)
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

  const loadStaticPolicies = useCallback(() => {
    try {
      setLoading(true)
      setError(null)

      const staticPolicies = getPolicies()
      const lastUpdatedTime = getLastUpdated()

      // Update policies with current vote status
      const policiesWithVoteStatus =
        updatePoliciesWithVoteStatus(staticPolicies)
      setPolicies(policiesWithVoteStatus)
      setLastUpdated(lastUpdatedTime)

      // Check vote status for policies that don't have it (in background)
      checkVoteStatusForPolicies(staticPolicies)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load policies")
    } finally {
      setLoading(false)
    }
  }, [updatePoliciesWithVoteStatus, checkVoteStatusForPolicies])

  // Initial load of static policies
  useEffect(() => {
    loadStaticPolicies()
  }, [loadStaticPolicies])

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
    lastUpdated,
    error,
  }

  return <ApiContext.Provider value={value}>{children}</ApiContext.Provider>
}
