import React, { createContext, useCallback, useEffect, useState } from "react"
import { chainApiService } from "../services/chainApi"
import { ChainContextType, UserProfile, WalletState } from "../types/Chain"

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

      // Update wallet state
      setWalletState({
        isConnected: true,
        address,
        isLoading: false,
        error: null,
      })

      // Fetch user profile from smart contract
      try {
        const profileData = await chainApiService.fetchUserProfile(address)
        setUserProfile({
          address,
          data: profileData,
        })
      } catch (profileError) {
        console.warn("Could not fetch user profile:", profileError)
        // Don't fail login if profile fetch fails
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
