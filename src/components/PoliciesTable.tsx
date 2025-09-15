import { formatDistanceToNow } from "date-fns"
import {
  CheckCircle,
  ChevronDown,
  ChevronsUpDown,
  ChevronUp,
  Filter,
  RefreshCw,
  Search,
} from "lucide-react"
import { useMemo, useState } from "react"
import { Policy } from "../types/Policy"
import { LoggedIn } from "./LoggedIn"

interface PoliciesTableProps {
  policies: Policy[]
  loading: boolean
  isRefreshing?: boolean
  lastUpdated?: number | null
  onPolicyClick: (policy: Policy) => void
}

type SortColumn = "rank" | "created" | "votes"
type SortDirection = "asc" | "desc"
type VoteFilter = "all" | "voted"

export function PoliciesTable({
  policies,
  loading,
  isRefreshing = false,
  lastUpdated = null,
  onPolicyClick,
}: PoliciesTableProps) {
  // Suppress unused parameter warning
  void lastUpdated
  const [searchTerm, setSearchTerm] = useState("")
  const [sortColumn, setSortColumn] = useState<SortColumn>("rank")
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc")
  const [showFilters, setShowFilters] = useState(false)
  const [voteFilter, setVoteFilter] = useState<VoteFilter>("all")

  const handleColumnClick = (column: SortColumn) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === "desc" ? "asc" : "desc")
    } else {
      setSortColumn(column)
      setSortDirection("desc")
    }
  }

  const getSortIcon = (column: SortColumn) => {
    if (sortColumn !== column) {
      return <ChevronsUpDown size={16} className="text-gray-400" />
    }
    return sortDirection === "desc" ? (
      <ChevronDown size={16} />
    ) : (
      <ChevronUp size={16} />
    )
  }

  const filteredAndSortedPolicies = useMemo(() => {
    let filtered = policies

    // Apply search filter
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase()
      filtered = filtered.filter(
        (policy) =>
          policy.title.toLowerCase().includes(term) ||
          policy.creator.username.toLowerCase().includes(term) ||
          policy.category.name.toLowerCase().includes(term),
      )
    }

    // Apply vote status filter
    if (voteFilter === "voted") {
      filtered = filtered.filter((policy) => policy.hasUserVoted === true)
    }

    return [...filtered].sort((a, b) => {
      let aValue: number
      let bValue: number

      if (sortColumn === "rank") {
        aValue = a.rank || 0
        bValue = b.rank || 0
      } else if (sortColumn === "created") {
        aValue = a.createdAt
        bValue = b.createdAt
      } else if (sortColumn === "votes") {
        aValue = a.totalVotes
        bValue = b.totalVotes
      } else {
        return 0
      }

      const result = aValue - bValue
      return sortDirection === "asc" ? result : -result
    })
  }, [policies, searchTerm, sortColumn, sortDirection, voteFilter])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading policies...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full">
      <div className="mb-6">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              size={20}
            />
            <input
              type="text"
              placeholder="Search policies by title, username, or category..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <LoggedIn>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`px-4 py-3 border rounded-lg transition-colors flex items-center gap-2 ${
                showFilters || voteFilter !== "all"
                  ? "border-blue-500 bg-blue-50 text-blue-700"
                  : "border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
              }`}
            >
              <Filter size={20} />
              <span>Filter</span>
            </button>
          </LoggedIn>
        </div>

        {/* Expandable Filter Panel */}
        <LoggedIn>
          {showFilters && (
            <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200 shadow-sm">
              <div className="space-y-3">
                <h3 className="text-sm font-medium text-gray-700">
                  Filter by vote status
                </h3>
                <div className="space-y-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="voteFilter"
                      value="all"
                      checked={voteFilter === "all"}
                      onChange={(e) =>
                        setVoteFilter(e.target.value as VoteFilter)
                      }
                      className="text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">
                      Show all policies
                    </span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="voteFilter"
                      value="voted"
                      checked={voteFilter === "voted"}
                      onChange={(e) =>
                        setVoteFilter(e.target.value as VoteFilter)
                      }
                      className="text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">
                      Only show ones I voted for
                    </span>
                  </label>
                </div>
              </div>
            </div>
          )}
        </LoggedIn>

        <div className="mt-3 flex justify-between items-center">
          <div className="text-sm text-gray-700">
            Showing {filteredAndSortedPolicies.length} of {policies.length}{" "}
            policies
            {(searchTerm || voteFilter !== "all") && (
              <span className="ml-2 text-blue-600">
                ({searchTerm && `filtered by "${searchTerm}"`}
                {searchTerm && voteFilter !== "all" && ", "}
                {voteFilter === "voted" && "showing only voted"})
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            {isRefreshing && (
              <RefreshCw size={16} className="animate-spin text-blue-600" />
            )}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 hover:text-blue-600 select-none border-b border-dotted border-gray-300"
                  onClick={() => handleColumnClick("rank")}
                >
                  <div className="flex items-center space-x-1">
                    <span>Rank</span>
                    {getSortIcon("rank")}
                  </div>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Policy
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Username
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 hover:text-blue-600 select-none border-b border-dotted border-gray-300"
                  onClick={() => handleColumnClick("created")}
                >
                  <div className="flex items-center space-x-1">
                    <span>Created</span>
                    {getSortIcon("created")}
                  </div>
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 hover:text-blue-600 select-none border-b border-dotted border-gray-300"
                  onClick={() => handleColumnClick("votes")}
                >
                  <div className="flex items-center space-x-1">
                    <span>Total Votes</span>
                    {getSortIcon("votes")}
                  </div>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredAndSortedPolicies.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-8 text-center text-gray-500"
                  >
                    {searchTerm || voteFilter !== "all"
                      ? "No policies found matching your filters."
                      : "No policies available."}
                  </td>
                </tr>
              ) : (
                filteredAndSortedPolicies.map((policy) => (
                  <tr
                    key={policy.policyId}
                    onClick={() => onPolicyClick(policy)}
                    className="hover:bg-gray-50 cursor-pointer transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {policy.rank}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900 hover:text-blue-600 transition-colors flex items-center gap-2">
                        <span>{policy.title}</span>
                        {policy.hasUserVoted && (
                          <span title="You voted for this policy">
                            <CheckCircle
                              size={16}
                              className="text-green-600 flex-shrink-0"
                            />
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                        {policy.category.name}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {policy.creator.username}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDistanceToNow(new Date(policy.createdAt * 1000), {
                        addSuffix: true,
                      })}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {policy.totalVotes.toLocaleString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {filteredAndSortedPolicies.length > 0 && (
          <div className="bg-gray-50 px-6 py-3 border-t border-gray-200">
            <div className="flex justify-between items-center">
              <div className="text-sm text-gray-700">
                Showing {filteredAndSortedPolicies.length} of {policies.length}{" "}
                policies
                {(searchTerm || voteFilter !== "all") && (
                  <span className="ml-2 text-blue-600">
                    ({searchTerm && `filtered by "${searchTerm}"`}
                    {searchTerm && voteFilter !== "all" && ", "}
                    {voteFilter === "voted" && "showing only voted"})
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                {isRefreshing && (
                  <RefreshCw size={16} className="animate-spin text-blue-600" />
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
