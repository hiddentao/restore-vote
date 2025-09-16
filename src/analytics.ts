import LogRocket from "logrocket"

declare global {
  interface Window {
    _paq?: any[]
  }
}

export class Analytics {
  private static initialized = false
  private static readonly CONSENT_KEY = "cookie-consent"

  static init(): void {
    if (this.initialized) {
      return
    }

    if (this.isLocalhost()) {
      console.log("Analytics disabled for localhost")
      this.initialized = true
      return
    }

    if (!this.hasConsent()) {
      console.log("Analytics disabled - no cookie consent")
      return
    }

    this.initLogRocket()
    this.initMatomo()
    this.initialized = true
  }

  private static initLogRocket(): void {
    LogRocket.init("zjtinw/restore-vote")
  }

  private static initMatomo(): void {
    window._paq = window._paq || []
    window._paq.push(["trackPageView"])
    window._paq.push(["enableLinkTracking"])

    const u = "//matomo.hiddentao.com/"
    window._paq.push(["setTrackerUrl", u + "matomo.php"])
    window._paq.push(["setSiteId", "4"])

    const d = document
    const g = d.createElement("script")
    const s = d.getElementsByTagName("script")[0]
    g.async = true
    g.src = u + "matomo.js"
    s.parentNode?.insertBefore(g, s)
  }

  private static isLocalhost(): boolean {
    return (
      window.location.hostname === "localhost" ||
      window.location.hostname === "127.0.0.1" ||
      window.location.hostname.startsWith("localhost:")
    )
  }

  static hasConsent(): boolean {
    const consent = localStorage.getItem(this.CONSENT_KEY)
    return consent === "accepted"
  }

  static setConsent(accepted: boolean): void {
    localStorage.setItem(this.CONSENT_KEY, accepted ? "accepted" : "rejected")
    if (accepted && !this.initialized) {
      this.init()
    }
  }

  static needsConsent(): boolean {
    return localStorage.getItem(this.CONSENT_KEY) === null
  }

  static setUser(username: string, walletAddress: string): void {
    if (!this.initialized) {
      console.warn("Analytics not initialized. Call Analytics.init() first.")
      return
    }

    LogRocket.identify(username, {
      name: username,
      wallet: walletAddress,
    })
  }
}
