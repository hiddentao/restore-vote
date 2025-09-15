import React, { useState } from "react"
import { useChain } from "../hooks/useChain"
import { Modal } from "./Modal"

interface LoginModalProps {
  isOpen: boolean
  onClose: () => void
}

export const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose }) => {
  const [mnemonic, setMnemonic] = useState("")
  const [localError, setLocalError] = useState<string | null>(null)
  const { login, walletState } = useChain()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLocalError(null)

    // Basic validation
    const words = mnemonic.trim().split(/\s+/)
    if (words.length !== 12) {
      setLocalError("Please enter exactly 12 words")
      return
    }

    try {
      await login(mnemonic)
      setMnemonic("")
      onClose()
    } catch (error) {
      setLocalError(error instanceof Error ? error.message : "Login failed")
    }
  }

  const handleClose = () => {
    setMnemonic("")
    setLocalError(null)
    onClose()
  }

  return (
    <Modal isOpen={isOpen} onClose={handleClose}>
      <div className="p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Login with Wallet
        </h2>

        <p className="text-sm text-gray-600 mb-6">
          Enter your 12-word mnemonic phrase that you obtained from PolicyVoter
          to access your account.
        </p>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label
              htmlFor="mnemonic"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              12-word Mnemonic Phrase
            </label>
            <textarea
              id="mnemonic"
              value={mnemonic}
              onChange={(e) => setMnemonic(e.target.value)}
              placeholder="Enter your 12-word mnemonic phrase..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
              rows={3}
              disabled={walletState.isLoading}
              required
            />
          </div>

          {(localError || walletState.error) && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">
                {localError || walletState.error}
              </p>
            </div>
          )}

          <div className="flex gap-3 justify-end">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              disabled={walletState.isLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={walletState.isLoading || !mnemonic.trim()}
              className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {walletState.isLoading ? "Connecting..." : "Login"}
            </button>
          </div>
        </form>
      </div>
    </Modal>
  )
}
