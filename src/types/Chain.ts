export interface WalletState {
  isConnected: boolean
  address: string | null
  isLoading: boolean
  error: string | null
}

export interface PolicyVoterUserData {
  username?: string
  email?: string
  avatar?: string
  // Add other fields as needed based on API response
  [key: string]: any
}

export interface UserProfile {
  address: string
  data: PolicyVoterUserData
}

export interface ChainContextType {
  walletState: WalletState
  userProfile: UserProfile | null
  login: (mnemonic: string) => Promise<void>
  logout: () => void
}
