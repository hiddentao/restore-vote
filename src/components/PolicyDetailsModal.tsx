import { Check, CheckCircle, ExternalLink, X } from "lucide-react"
import { useChain } from "../hooks/useChain"
import { Policy } from "../types/Policy"
import { Button } from "./Button"
import { Modal } from "./Modal"

interface PolicyDetailsModalProps {
  policy: Policy | null
  isOpen: boolean
  onClose: () => void
}

export function PolicyDetailsModal({
  policy,
  isOpen,
  onClose,
}: PolicyDetailsModalProps) {
  const {
    walletState,
    voteForPolicy,
    undoVoteForPolicy,
    getVoteStatus,
    isVoting,
  } = useChain()

  if (!policy) return null

  const userVoteStatus = getVoteStatus(policy.policyId)
  const isVotingForThis = isVoting(policy.policyId)
  const isLoggedIn = walletState.isConnected

  const handleVote = async () => {
    await voteForPolicy(policy.policyId)
  }

  const handleUndoVote = async () => {
    await undoVoteForPolicy(policy.policyId)
  }

  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleDateString("en-GB", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="p-6">
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="inline-flex px-3 py-1 text-sm font-semibold rounded-full bg-blue-100 text-blue-800">
              #{policy.rank} • {policy.category.name}
            </span>
            <div className="text-base text-gray-900 font-medium">
              {policy.totalVotes.toLocaleString()} votes
            </div>
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2 mt-3">
            {policy.title}
          </h2>
          {isLoggedIn && userVoteStatus === true && (
            <div className="flex items-center gap-2 mb-3 p-3 bg-green-50 border border-green-200 rounded-lg">
              <CheckCircle size={20} className="text-green-600" />
              <span className="text-green-800 font-medium">
                You voted for this policy
              </span>
            </div>
          )}
          <div className="text-sm text-gray-600 mb-4">
            by <span className="font-medium">{policy.creator.username}</span>
          </div>
        </div>

        <div className="border-t border-gray-200 pt-4 mb-6">
          <div className="text-gray-900 leading-relaxed whitespace-pre-wrap">
            {policy.description.replace(/\n\s*\n\s*\n+/g, "\n\n")}
          </div>
        </div>

        <div className="border-t border-gray-200 pt-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="text-xs text-gray-500 space-y-0">
              <div>
                <span>Created: </span>
                <span>{formatDate(policy.createdAt)}</span>
              </div>
              <div>
                <span>Updated: </span>
                <span>{formatDate(policy.updatedAt)}</span>
              </div>
            </div>
            <Button
              onClick={() =>
                window.open(
                  `https://policyvoter.com/${policy.policyId}`,
                  "_blank",
                )
              }
              variant="secondary"
              icon={<ExternalLink size={16} />}
              className="text-sm"
            >
              View on PolicyVoter
            </Button>
          </div>
        </div>
      </div>

      {/* Fixed Floating Vote Button - positioned relative to modal container */}
      {/* Temporarily hidden until contract writing is working */}
      {false && isLoggedIn && userVoteStatus !== undefined && (
        <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 z-10">
          {userVoteStatus === false ? (
            <Button
              onClick={handleVote}
              disabled={isVotingForThis}
              variant="success"
              icon={<Check size={18} />}
              title="Vote for this policy"
            >
              {isVotingForThis ? "Voting..." : "Vote for this"}
            </Button>
          ) : (
            <Button
              onClick={handleUndoVote}
              disabled={isVotingForThis}
              variant="danger"
              icon={<X size={18} />}
              title="Remove your vote"
            >
              {isVotingForThis ? "Removing..." : "Retract my vote"}
            </Button>
          )}
        </div>
      )}
    </Modal>
  )
}
