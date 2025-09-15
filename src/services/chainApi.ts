import { createWalletClient, http } from "viem"
import { mnemonicToAccount } from "viem/accounts"
import { mainnet } from "viem/chains"
import { RPC_URL } from "../constants"

export class ChainApiService {
  private walletClient?: ReturnType<typeof createWalletClient>
  private account?: ReturnType<typeof mnemonicToAccount>

  constructor() {
    // Public client removed as it's no longer needed for user profile fetching
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
