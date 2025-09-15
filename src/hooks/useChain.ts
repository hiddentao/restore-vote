import { useContext } from "react"
import { ChainContext } from "../providers/ChainProvider"
import { ChainContextType } from "../types/Chain"

export const useChain = (): ChainContextType => {
  const context = useContext(ChainContext)
  if (!context) {
    throw new Error("useChain must be used within a ChainProvider")
  }
  return context
}
