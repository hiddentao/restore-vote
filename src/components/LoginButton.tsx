import { LogIn, LogOut } from "lucide-react"
import React, { useState } from "react"
import { createAvatar } from "web3-avatar"
import { useChain } from "../hooks/useChain"
import { LoginModal } from "./LoginModal"

export const LoginButton: React.FC = () => {
  const { walletState, logout } = useChain()
  const [showLoginModal, setShowLoginModal] = useState(false)
  const [avatarRef, setAvatarRef] = useState<HTMLDivElement | null>(null)

  // Generate avatar when wallet is connected
  React.useEffect(() => {
    if (walletState.isConnected && walletState.address && avatarRef) {
      try {
        createAvatar(avatarRef, walletState.address)
      } catch (error) {
        console.warn("Could not generate avatar:", error)
      }
    }
  }, [walletState.isConnected, walletState.address, avatarRef])

  const handleLoginClick = () => {
    setShowLoginModal(true)
  }

  const handleLogoutClick = () => {
    logout()
  }

  const handleCloseModal = () => {
    setShowLoginModal(false)
  }

  if (walletState.isConnected) {
    return (
      <div className="flex items-center gap-2">
        <div
          ref={setAvatarRef}
          className="w-8 h-8 rounded-full overflow-hidden"
        />
        <span className="text-sm text-gray-600 hidden sm:block">
          {walletState.address?.slice(0, 6)}...{walletState.address?.slice(-4)}
        </span>
        <button
          onClick={handleLogoutClick}
          className="flex items-center gap-2 px-3 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
        >
          <LogOut size={16} />
          <span className="hidden sm:block">Logout</span>
        </button>
      </div>
    )
  }

  return (
    <>
      <button
        onClick={handleLoginClick}
        disabled={walletState.isLoading}
        className="flex items-center gap-2 px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        <LogIn size={16} />
        {walletState.isLoading ? "Connecting..." : "Login"}
      </button>

      <LoginModal isOpen={showLoginModal} onClose={handleCloseModal} />
    </>
  )
}
