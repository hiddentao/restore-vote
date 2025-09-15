import {
  createPublicClient,
  createWalletClient,
  encodeAbiParameters,
  http,
} from "viem"
import { mnemonicToAccount } from "viem/accounts"
import { mainnet } from "viem/chains"
import { RPC_URL, VOTING_CONTRACT_ADDRESS } from "../constants"

// Function selector for hasUserVoted function (0x982702a8)
const HAS_USER_VOTED_FUNCTION = "0x982702a8"

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
   * Sign a personal message using the wallet
   */
  async signMessage(message: string): Promise<string> {
    if (!this.walletClient || !this.account) {
      throw new Error("Wallet not connected")
    }

    try {
      const signature = await this.walletClient.signMessage({
        account: this.account,
        message,
      })
      return signature
    } catch (error) {
      console.error("Error signing message:", error)
      throw new Error("Failed to sign message")
    }
  }

  /**
   * Sign PolicyVoter authentication message
   */
  async signPolicyVoterAuth(): Promise<{ address: string; signature: string }> {
    if (!this.account) {
      throw new Error("Wallet not connected")
    }

    const address = this.account.address
    const message = `Welcome to PolicyVoter. I am signing my wallet address: ${address}`

    const signature = await this.signMessage(message)

    return {
      address,
      signature,
    }
  }

  /**
   * Check if user has voted for a specific policy
   */
  async hasUserVoted(
    walletAddress: string,
    policyId: string,
  ): Promise<boolean> {
    try {
      if (!this.publicClient) {
        throw new Error("Public client not initialized")
      }

      // Encode parameters: address + string
      const encodedParams = encodeAbiParameters(
        [
          { name: "user", type: "address" },
          { name: "policyId", type: "string" },
        ],
        [walletAddress as `0x${string}`, policyId],
      )

      // Combine function selector with encoded parameters
      const data =
        `${HAS_USER_VOTED_FUNCTION}${encodedParams.slice(2)}` as `0x${string}`

      // Call the smart contract function
      const result = await this.publicClient.call({
        to: VOTING_CONTRACT_ADDRESS,
        data,
      })

      // Parse the boolean result from the contract call
      if (result?.data) {
        // The result should be a 32-byte boolean (0x00...00 for false, 0x00...01 for true)
        const hasVoted = result.data.slice(-2) === "01"
        return hasVoted
      }

      return false
    } catch (error) {
      console.error("Error checking if user has voted:", error)
      return false
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
