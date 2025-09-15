interface PolicyCategory {
  id: string
  name: string
  description: string
}

interface PolicyCreator {
  walletAddress: string
  username: string
}

export interface Policy {
  contractAddress: string
  chain: string
  policyId: string
  partnerId: string
  constituentId: string
  category: PolicyCategory
  title: string
  description: string
  titleHash: string
  descriptionHash: string
  totalVotes: number
  creator: PolicyCreator
  votedAt: number | null
  createdAt: number
  updatedAt: number
  rank?: number
}

export interface PolicyApiResponse {
  policies: Policy[]
  hasMore: boolean
  totalCount: number
}
