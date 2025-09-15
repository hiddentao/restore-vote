import React, { createContext, useCallback, useState } from "react"
import { chainApiService } from "../services/chainApi"
import { ChainContextType, UserProfile, WalletState } from "../types/Chain"

export const ChainContext = createContext<ChainContextType | null>(null)

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

  const logout = useCallback(() => {
    chainApiService.disconnect()
    setWalletState({
      isConnected: false,
      address: null,
      isLoading: false,
      error: null,
    })
    setUserProfile(null)
  }, [])

  const value: ChainContextType = {
    walletState,
    userProfile,
    login,
    logout,
  }

  return <ChainContext.Provider value={value}>{children}</ChainContext.Provider>
}
