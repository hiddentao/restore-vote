import LogRocket from "logrocket"

export class Analytics {
  private static initialized = false

  static init(): void {
    if (this.initialized) {
      return
    }

    if (this.isLocalhost()) {
      console.log("Analytics disabled for localhost")
      this.initialized = true
      return
    }

    LogRocket.init("zjtinw/restore-vote")
    this.initialized = true
  }

  private static isLocalhost(): boolean {
    return (
      window.location.hostname === "localhost" ||
      window.location.hostname === "127.0.0.1" ||
      window.location.hostname.startsWith("localhost:")
    )
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
