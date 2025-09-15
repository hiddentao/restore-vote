import React, { createContext, useCallback, useEffect, useState } from "react"
import { chainApiService } from "../services/chainApi"
import { policyApiService } from "../services/policyApi"
import {
  ChainContextType,
  PolicyVoterUserData,
  UserProfile,
  WalletState,
} from "../types/Chain"

export const ChainContext = createContext<ChainContextType | null>(null)

const MNEMONIC_STORAGE_KEY = "restore-vote-mnemonic"

const encodeMnemonic = (mnemonic: string): string => {
  return btoa(mnemonic)
}

const decodeMnemonic = (encoded: string): string => {
  try {
    return atob(encoded)
  } catch {
    throw new Error("Invalid stored mnemonic")
  }
}

interface ChainProviderProps {
  children: React.ReactNode
}

export const ChainProvider: React.FC<ChainProviderProps> = ({ children }) => {
  const [walletState, setWalletState] = useState<WalletState>({
    isConnected: false,
    address: null,
    isLoading: false,
    error: null,
  })

  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)

  const login = useCallback(async (mnemonic: string) => {
    setWalletState((prev) => ({ ...prev, isLoading: true, error: null }))

    try {
      // Generate wallet from mnemonic
      const address = await chainApiService.generateWalletFromMnemonic(mnemonic)

      // Save mnemonic to localStorage after successful wallet generation
      try {
        localStorage.setItem(MNEMONIC_STORAGE_KEY, encodeMnemonic(mnemonic))
      } catch (storageError) {
        console.warn("Could not save mnemonic to localStorage:", storageError)
      }

      // Fetch user profile from PolicyVoter API - this is required for login
      try {
        const authData = await chainApiService.signPolicyVoterAuth()
        const profileData = await policyApiService.fetchUserProfile(
          authData.address,
          authData.signature,
        )

        // Update wallet state only after successful profile fetch
        setWalletState({
          isConnected: true,
          address,
          isLoading: false,
          error: null,
        })

        setUserProfile({
          address,
          data: profileData as PolicyVoterUserData,
        })
      } catch (profileError) {
        console.error(
          "Failed to fetch user profile from PolicyVoter API:",
          profileError,
        )
        // Disconnect wallet since profile fetch is required
        chainApiService.disconnect()
        setWalletState({
          isConnected: false,
          address: null,
          isLoading: false,
          error: "Failed to authenticate with PolicyVoter. Please try again.",
        })
        throw new Error("Failed to authenticate with PolicyVoter")
      }
    } catch (error) {
      setWalletState({
        isConnected: false,
        address: null,
        isLoading: false,
        error: error instanceof Error ? error.message : "Login failed",
      })
    }
  }, [])

  const initializeWallet = useCallback(async () => {
    try {
      const storedMnemonic = localStorage.getItem(MNEMONIC_STORAGE_KEY)
      if (storedMnemonic) {
        const mnemonic = decodeMnemonic(storedMnemonic)
        await login(mnemonic)
      }
    } catch (error) {
      console.warn("Could not auto-login from stored mnemonic:", error)
      // Clear invalid stored data
      localStorage.removeItem(MNEMONIC_STORAGE_KEY)
    }
  }, [login])

  const logout = useCallback(() => {
    // Clear stored mnemonic
    try {
      localStorage.removeItem(MNEMONIC_STORAGE_KEY)
    } catch (storageError) {
      console.warn("Could not clear stored mnemonic:", storageError)
    }

    chainApiService.disconnect()
    setWalletState({
      isConnected: false,
      address: null,
      isLoading: false,
      error: null,
    })
    setUserProfile(null)
  }, [])

  // Auto-login on component mount
  useEffect(() => {
    initializeWallet()
  }, [initializeWallet])

  const value: ChainContextType = {
    walletState,
    userProfile,
    login,
    logout,
  }

  return <ChainContext.Provider value={value}>{children}</ChainContext.Provider>
}
