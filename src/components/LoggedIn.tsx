import React from "react"
import { useVoteStatus } from "../hooks/useVoteStatus"

interface LoggedInProps {
  children: React.ReactNode
  fallback?: React.ReactNode
}

export function LoggedIn({ children, fallback = null }: LoggedInProps) {
  const { isLoggedIn } = useVoteStatus()

  if (!isLoggedIn) {
    return <>{fallback}</>
  }

  return <>{children}</>
}
