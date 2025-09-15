import toast from "react-hot-toast"
import {
  createPublicClient,
  createWalletClient,
  encodeAbiParameters,
  http,
} from "viem"
import { mnemonicToAccount } from "viem/accounts"
import { mainnet } from "viem/chains"
import { RPC_URL, VOTING_CONTRACT_ADDRESS } from "../constants"

// Function selectors
const HAS_USER_VOTED_FUNCTION = "0x982702a8"
const VOTE_FOR_POLICY_FUNCTION = "0x5f907d08"
const UNDO_VOTE_FOR_POLICY_FUNCTION = "0x4cc764c6"

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
   * Fetch the current chain ID from the RPC endpoint
   */
  private async getChainId(): Promise<number> {
    try {
      const chainId = await this.publicClient.getChainId()
      console.log("Current chainId:", chainId)
      return chainId
    } catch (error) {
      console.error("Error fetching chain ID:", error)
      throw new Error("Failed to fetch chain ID")
    }
  }

  /**
   * Generic method to call smart contract functions
   */
  private async callContractFunction(
    functionSelector: string,
    parameters: { name: string; type: string; value: any }[],
    isWrite = false,
  ) {
    try {
      const client = isWrite ? this.walletClient : this.publicClient
      if (!client) {
        throw new Error(
          `${isWrite ? "Wallet" : "Public"} client not initialized`,
        )
      }

      if (isWrite && !this.account) {
        throw new Error("Account not connected for write operation")
      }

      // For write operations, fetch the current chain ID first
      let currentChainId: number | undefined
      if (isWrite) {
        currentChainId = await this.getChainId()
      }

      // Encode parameters
      const types = parameters.map((p) => ({ name: p.name, type: p.type }))
      const values = parameters.map((p) => p.value)
      const encodedParams = encodeAbiParameters(types, values)

      // Combine function selector with encoded parameters
      const data =
        `${functionSelector}${encodedParams.slice(2)}` as `0x${string}`

      if (isWrite) {
        // Estimate gas before sending transaction
        const estimatedGas = await this.publicClient.estimateGas({
          account: this.account!,
          to: VOTING_CONTRACT_ADDRESS,
          data,
        })
        console.log("Estimated gas:", estimatedGas)

        // For write operations, send transaction with dynamic chain ID and estimated gas
        const hash = await this.walletClient!.sendTransaction({
          account: this.account!,
          to: VOTING_CONTRACT_ADDRESS,
          data,
          chain: null,
          chainId: currentChainId,
          gas: estimatedGas,
        })
        return { hash }
      } else {
        // For read operations, call the contract
        const result = await this.publicClient.call({
          to: VOTING_CONTRACT_ADDRESS,
          data,
        })
        return { data: result?.data }
      }
    } catch (error) {
      console.error("Contract function call error:", error)
      throw error
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
      const result = await this.callContractFunction(
        HAS_USER_VOTED_FUNCTION,
        [
          {
            name: "user",
            type: "address",
            value: walletAddress as `0x${string}`,
          },
          { name: "policyId", type: "string", value: policyId },
        ],
        false,
      )

      // Parse the boolean result from the contract call
      if (result.data) {
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
   * Vote for a specific policy
   */
  async voteForPolicy(policyId: string): Promise<string> {
    try {
      const result = await this.callContractFunction(
        VOTE_FOR_POLICY_FUNCTION,
        [{ name: "policyId", type: "string", value: policyId }],
        true,
      )

      toast.success("Vote submitted successfully!")
      return result.hash as string
    } catch (error) {
      console.error("Error voting for policy:", error)
      const errorMessage =
        error instanceof Error ? error.message : "Failed to submit vote"
      toast.error(`Vote failed: ${errorMessage}`)
      throw error
    }
  }

  /**
   * Remove vote for a specific policy
   */
  async undoVoteForPolicy(policyId: string): Promise<string> {
    try {
      const result = await this.callContractFunction(
        UNDO_VOTE_FOR_POLICY_FUNCTION,
        [{ name: "policyId", type: "string", value: policyId }],
        true,
      )

      toast.success("Vote removed successfully!")
      return result.hash as string
    } catch (error) {
      console.error("Error removing vote for policy:", error)
      const errorMessage =
        error instanceof Error ? error.message : "Failed to remove vote"
      toast.error(`Remove vote failed: ${errorMessage}`)
      throw error
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
