declare global {
  interface Window {
    umami?: {
      identify: (id: string, data?: Record<string, unknown>) => void
    }
  }
}

export class Analytics {
  private static initialized = false
  private static readonly CONSENT_KEY = "cookie-consent"
  private static readonly UMAMI_HOST = "https://umami.hiddentao.com"
  private static readonly UMAMI_WEBSITE_ID =
    "cd9601d8-0a2f-41f0-ac01-af1e6956aadf"

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

    this.initUmami()
    this.initialized = true
  }

  private static initUmami(): void {
    const tracker = document.createElement("script")
    tracker.defer = true
    tracker.src = `${this.UMAMI_HOST}/script.js`
    tracker.dataset.websiteId = this.UMAMI_WEBSITE_ID
    document.head.appendChild(tracker)

    const recorder = document.createElement("script")
    recorder.defer = true
    recorder.src = `${this.UMAMI_HOST}/recorder.js`
    recorder.dataset.websiteId = this.UMAMI_WEBSITE_ID
    recorder.dataset.sampleRate = "0.1"
    recorder.dataset.maskLevel = "moderate"
    recorder.dataset.maxDuration = "300000"
    document.head.appendChild(recorder)
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

    window.umami?.identify(username, {
      name: username,
      wallet: walletAddress,
    })
  }
}
