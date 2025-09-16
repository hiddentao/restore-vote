import { useState } from "react"
import { Analytics } from "../analytics"

export function CookieConsent() {
  const [isVisible, setIsVisible] = useState(Analytics.needsConsent())

  if (!isVisible) {
    return null
  }

  const handleAccept = () => {
    Analytics.setConsent(true)
    setIsVisible(false)
  }

  const handleReject = () => {
    Analytics.setConsent(false)
    setIsVisible(false)
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-gray-900 text-white p-4 shadow-lg z-50">
      <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex-1 text-sm">
          <p>
            We use cookies and analytics to improve your experience. By
            accepting, you agree to our use of analytics tools including Matomo
            and LogRocket.
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleReject}
            className="px-4 py-2 border border-gray-600 text-gray-300 hover:bg-gray-800 rounded transition-colors"
          >
            Reject
          </button>
          <button
            onClick={handleAccept}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors"
          >
            Accept
          </button>
        </div>
      </div>
    </div>
  )
}
