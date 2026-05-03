import { createContext, useContext, useEffect, useState } from "react"
import { Analytics } from "../analytics"

interface AnalyticsContextType {
  showConsentBanner: boolean
  acceptConsent: () => void
  rejectConsent: () => void
}

const AnalyticsContext = createContext<AnalyticsContextType | null>(null)

export function useAnalytics() {
  const context = useContext(AnalyticsContext)
  if (!context) {
    throw new Error("useAnalytics must be used within an AnalyticsProvider")
  }
  return context
}

interface AnalyticsProviderProps {
  children: React.ReactNode
}

export function AnalyticsProvider({ children }: AnalyticsProviderProps) {
  const [showConsentBanner, setShowConsentBanner] = useState(false)

  useEffect(() => {
    setShowConsentBanner(Analytics.needsConsent())
    Analytics.init()
  }, [])

  const acceptConsent = () => {
    Analytics.setConsent(true)
    setShowConsentBanner(false)
  }

  const rejectConsent = () => {
    Analytics.setConsent(false)
    setShowConsentBanner(false)
  }

  const value: AnalyticsContextType = {
    showConsentBanner,
    acceptConsent,
    rejectConsent,
  }

  return (
    <AnalyticsContext.Provider value={value}>
      {children}
    </AnalyticsContext.Provider>
  )
}
