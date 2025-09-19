import policiesData from "../../data/policies.json"
import { Policy } from "../types/Policy"

interface PolicyData {
  policies: Policy[]
  metadata: {
    fetchedAt: string
    lastUpdated: number
    totalCount: number
    fetchDuration: number
  }
}

const data = policiesData as PolicyData

export const getPolicies = (): Policy[] => {
  return data.policies
}

export const getLastUpdated = (): number => {
  return data.metadata.lastUpdated
}

export const getTotalCount = (): number => {
  return data.metadata.totalCount
}

export const getMetadata = () => {
  return data.metadata
}
