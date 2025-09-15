import { Check, Copy } from "lucide-react"
import React, { useState } from "react"
import { UserProfile } from "../types/Chain"
import { Avatar } from "./Avatar"
import { Modal } from "./Modal"

interface UserProfileModalProps {
  isOpen: boolean
  onClose: () => void
  userProfile: UserProfile
}

export const UserProfileModal: React.FC<UserProfileModalProps> = ({
  isOpen,
  onClose,
  userProfile,
}) => {
  const [copied, setCopied] = useState(false)

  const handleCopyAddress = async () => {
    try {
      await navigator.clipboard.writeText(userProfile.address)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error("Failed to copy address:", error)
    }
  }

  const username = userProfile.data?.username || "Unknown User"

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <Avatar username={username} size="md" />
          <h2 className="text-xl font-semibold text-gray-900">{username}</h2>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Wallet Address
            </label>
            <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg border">
              <code className="flex-1 text-sm font-mono text-gray-800 break-all">
                {userProfile.address}
              </code>
              <button
                onClick={handleCopyAddress}
                className="flex items-center justify-center w-8 h-8 text-gray-500 hover:text-gray-700 hover:bg-gray-200 rounded transition-colors"
                title="Copy address"
              >
                {copied ? (
                  <Check className="w-4 h-4 text-green-600" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  )
}
