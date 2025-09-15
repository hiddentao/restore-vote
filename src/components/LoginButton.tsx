import { LogIn, LogOut } from "lucide-react"
import React, { useState } from "react"
import { useChain } from "../hooks/useChain"
import { Avatar } from "./Avatar"
import { LoginModal } from "./LoginModal"
import { UserProfileModal } from "./UserProfileModal"

export const LoginButton: React.FC = () => {
  const { walletState, userProfile, logout } = useChain()
  const [showLoginModal, setShowLoginModal] = useState(false)
  const [showProfileModal, setShowProfileModal] = useState(false)

  const handleLoginClick = () => {
    setShowLoginModal(true)
  }

  const handleLogoutClick = () => {
    logout()
  }

  const handleCloseModal = () => {
    setShowLoginModal(false)
  }

  const handleCloseProfileModal = () => {
    setShowProfileModal(false)
  }

  if (walletState.isConnected) {
    const username = userProfile?.data?.username
    const displayText =
      username ||
      `${walletState.address?.slice(0, 6)}...${walletState.address?.slice(-4)}`

    return (
      <>
        <div className="flex items-center gap-2">
          <div className="rounded-full">
            <Avatar username={username} size="sm" />
          </div>
          <span className="text-sm text-gray-600 hidden sm:block">
            {displayText}
          </span>
          <button
            onClick={handleLogoutClick}
            className="flex items-center gap-2 px-3 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            <LogOut size={16} />
            <span className="hidden sm:block">Logout</span>
          </button>
        </div>

        {userProfile && (
          <UserProfileModal
            isOpen={showProfileModal}
            onClose={handleCloseProfileModal}
            userProfile={userProfile}
          />
        )}
      </>
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
