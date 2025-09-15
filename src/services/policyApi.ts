import { Policy } from "../types/Policy"

const API_BASE_URL = "https://api.policyvoter.com/v1"
const CONSTITUENT_ID = "UNE079UK"

export class PolicyApiService {
  private async fetchPage(
    endpoint: string,
    page: number,
    params?: Record<string, string>,
  ): Promise<any[]> {
    const searchParams = new URLSearchParams({
      page: page.toString(),
      ...params,
    })
    const url = `${API_BASE_URL}${endpoint}?${searchParams}`

    try {
      const response = await fetch(url)
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const response_data = await response.json()

      // Handle the PolicyVoter API response format
      if (response_data && response_data.success && response_data.data) {
        const data = response_data.data

        // For policies endpoint, return policies array
        if (data.policies && Array.isArray(data.policies)) {
          return data.policies
        }

        // For other endpoints, return the data array if it exists
        if (Array.isArray(data)) {
          return data
        }
      }

      return []
    } catch (error) {
      console.error(`Failed to fetch page ${page} from ${endpoint}:`, error)
      throw error
    }
  }

  /**
   * Generic method to fetch all paginated data from any endpoint
   */
  private async fetchAllPaginated<T>(
    endpoint: string,
    params?: Record<string, string>,
  ): Promise<T[]> {
    const allItems: T[] = []
    let currentPage = 1
    const maxConcurrentRequests = 5

    try {
      const firstPage = await this.fetchPage(endpoint, 1, params)
      if (!Array.isArray(firstPage) || firstPage.length === 0) {
        return []
      }

      allItems.push(...firstPage)
      currentPage = 2

      const promises: Promise<T[]>[] = []

      while (true) {
        for (let i = 0; i < maxConcurrentRequests; i++) {
          promises.push(this.fetchPage(endpoint, currentPage + i, params))
        }

        const results = await Promise.allSettled(promises)
        const validResults = results
          .filter(
            (result): result is PromiseFulfilledResult<T[]> =>
              result.status === "fulfilled" &&
              Array.isArray(result.value) &&
              result.value.length > 0,
          )
          .map((result) => result.value)

        if (validResults.length === 0) {
          break
        }

        validResults.forEach((items) => {
          if (Array.isArray(items)) {
            allItems.push(...items)
          }
        })

        if (validResults.length < maxConcurrentRequests) {
          break
        }

        currentPage += maxConcurrentRequests
        promises.length = 0
      }

      return allItems
    } catch (error) {
      console.error(`Error fetching paginated data from ${endpoint}:`, error)
      throw new Error(
        `Failed to fetch data from ${endpoint}. Please try again later.`,
      )
    }
  }

  async fetchAllPolicies(): Promise<Policy[]> {
    try {
      const policies = await this.fetchAllPaginated<Policy>(
        "/policy/top/list",
        {
          constituentId: CONSTITUENT_ID,
        },
      )

      return policies.map((policy, index) => ({
        ...policy,
        rank: index + 1,
      }))
    } catch (error) {
      console.error("Error fetching policies:", error)
      throw new Error("Failed to fetch policies. Please try again later.")
    }
  }

  /**
   * Fetch user profile from PolicyVoter API using wallet signature authentication
   */
  async fetchUserProfile(
    walletAddress: string,
    signature: string,
  ): Promise<unknown> {
    try {
      const response = await fetch(`${API_BASE_URL}/user`, {
        method: "GET",
        headers: {
          "pv-wallet-address": walletAddress,
          "pv-tx-signature": signature,
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const userData = await response.json()
      console.log("User profile data from PolicyVoter API:", userData)

      // Check if the response follows the PolicyVoter pattern with success/data structure
      if (userData && userData.success && userData.data) {
        return userData.data
      }

      return userData
    } catch (error) {
      console.error("Error fetching user profile from PolicyVoter API:", error)
      throw new Error("Failed to fetch user profile from PolicyVoter API")
    }
  }
}

export const policyApiService = new PolicyApiService()
