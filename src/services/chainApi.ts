import { createPublicClient, createWalletClient, http } from "viem"
import { mnemonicToAccount } from "viem/accounts"
import { mainnet } from "viem/chains"
import { RPC_URL, VOTING_CONTRACT_ADDRESS } from "../constants"

// Function selector for user profile function (0xa87430ba)
const USER_PROFILE_FUNCTION = "0xa87430ba"

export class ChainApiService {
  private publicClient: ReturnType<typeof createPublicClient>
  private walletClient?: ReturnType<typeof createWalletClient>
  private account?: ReturnType<typeof mnemonicToAccount>

  constructor() {
    this.publicClient = createPublicClient({
      chain: mainnet,
      transport: http(RPC_URL),
    })
  }

  /**
   * Generate wallet from 12-word mnemonic using BIP44 HD derivation
   */
  async generateWalletFromMnemonic(mnemonic: string): Promise<string> {
    try {
      // Create account from mnemonic (uses BIP44 derivation path by default)
      this.account = mnemonicToAccount(mnemonic)

      // Create wallet client
      this.walletClient = createWalletClient({
        account: this.account,
        chain: mainnet,
        transport: http(RPC_URL),
      })

      return this.account.address
    } catch (error) {
      console.error("Error generating wallet from mnemonic:", error)
      throw new Error("Invalid mnemonic phrase")
    }
  }

  /**
   * Fetch user profile data from smart contract
   */
  async fetchUserProfile(walletAddress: string): Promise<unknown> {
    try {
      if (!this.publicClient) {
        throw new Error("Public client not initialized")
      }

      // Call the smart contract function with the wallet address
      const result = await this.publicClient.call({
        to: VOTING_CONTRACT_ADDRESS,
        data: `${USER_PROFILE_FUNCTION}${walletAddress.slice(2).padStart(64, "0")}`,
      })

      console.log("User profile data from smart contract:", result)
      return result
    } catch (error) {
      console.error("Error fetching user profile:", error)
      throw new Error("Failed to fetch user profile from smart contract")
    }
  }

  /**
   * Get current account address
   */
  getCurrentAddress(): string | null {
    return this.account?.address || null
  }

  /**
   * Check if wallet is connected
   */
  isConnected(): boolean {
    return !!this.account
  }

  /**
   * Get wallet client
   */
  getWalletClient() {
    return this.walletClient
  }

  /**
   * Disconnect wallet
   */
  disconnect(): void {
    this.account = undefined
    this.walletClient = undefined
  }
}

export const chainApiService = new ChainApiService()
