import LogRocket from "logrocket"

export class Analytics {
  private static initialized = false

  static init(): void {
    if (this.initialized) {
      return
    }

    LogRocket.init("zjtinw/restore-vote")
    this.initialized = true
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
