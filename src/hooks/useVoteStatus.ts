import { useChain } from "./useChain"

export const useVoteStatus = () => {
  const { checkUserVote, getVoteStatus, isCheckingVote, walletState } =
    useChain()

  return {
    checkUserVote,
    getVoteStatus,
    isCheckingVote,
    isLoggedIn: walletState.isConnected,
  }
}
