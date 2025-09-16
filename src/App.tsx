import { HelpCircle } from "lucide-react"
import { useEffect, useState } from "react"
import { Toaster } from "react-hot-toast"
import { Analytics } from "./analytics"
import { CookieConsent } from "./components/CookieConsent"
import { InfoModal } from "./components/InfoModal"
import { LoginButton } from "./components/LoginButton"
import { PoliciesTable } from "./components/PoliciesTable"
import { PolicyDetailsModal } from "./components/PolicyDetailsModal"
import { usePolicies } from "./hooks/usePolicies"
import { ApiProvider } from "./providers/ApiProvider"
import { ChainProvider } from "./providers/ChainProvider"
import { Policy } from "./types/Policy"

function AppContent() {
  const { policies, loading, isRefreshing, lastUpdated, error } = usePolicies()
  const [selectedPolicy, setSelectedPolicy] = useState<Policy | null>(null)
  const [showInfoModal, setShowInfoModal] = useState(false)

  useEffect(() => {
    Analytics.init()
  }, [])

  const handlePolicyClick = (policy: Policy) => {
    setSelectedPolicy(policy)
  }

  const handleCloseModal = () => {
    setSelectedPolicy(null)
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="text-red-600 mb-4">
            <svg
              className="w-12 h-12 mx-auto"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">
            Error Loading Policies
          </h2>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Restore Britain policies{" "}
                <button
                  onClick={() => setShowInfoModal(true)}
                  className="text-gray-500 hover:text-blue-600 transition-colors inline-block align-middle"
                >
                  <HelpCircle size={24} />
                </button>
              </h1>
              <p className="text-gray-600 mt-2">
                Browse and search through policies from Restore Britain's voting
                platform
              </p>
            </div>
            <LoginButton />
          </div>
        </div>

        {/* Policies Table */}
        <PoliciesTable
          policies={policies}
          loading={loading}
          isRefreshing={isRefreshing}
          lastUpdated={lastUpdated}
          onPolicyClick={handlePolicyClick}
        />
      </div>

      {/* Modals */}
      <PolicyDetailsModal
        policy={selectedPolicy}
        isOpen={!!selectedPolicy}
        onClose={handleCloseModal}
      />

      <InfoModal
        isOpen={showInfoModal}
        onClose={() => setShowInfoModal(false)}
      />

      <CookieConsent />
    </div>
  )
}

function App() {
  return (
    <ChainProvider>
      <ApiProvider>
        <AppContent />
        <Toaster
          position="bottom-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: "#333",
              color: "#fff",
            },
          }}
        />
      </ApiProvider>
    </ChainProvider>
  )
}

export default App
