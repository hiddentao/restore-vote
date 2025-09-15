import { useContext } from "react"
import { ApiContext } from "../providers/ApiProvider"
import { Policy } from "../types/Policy"

interface ApiContextType {
  policies: Policy[]
  loading: boolean
  error: string | null
  refreshPolicies: () => Promise<void>
}

export const usePolicies = (): ApiContextType => {
  const context = useContext(ApiContext)
  if (!context) {
    throw new Error("usePolicies must be used within an ApiProvider")
  }
  return context
}
