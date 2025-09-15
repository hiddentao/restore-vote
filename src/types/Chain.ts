export interface WalletState {
  isConnected: boolean
  address: string | null
  isLoading: boolean
  error: string | null
}

export interface UserProfile {
  address: string
  data: unknown // Will contain the smart contract response data
}

export interface ChainContextType {
  walletState: WalletState
  userProfile: UserProfile | null
  login: (mnemonic: string) => Promise<void>
  logout: () => void
}
