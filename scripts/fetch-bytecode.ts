#!/usr/bin/env tsx

import { createPublicClient, http } from "viem"
import { RPC_URL, VOTING_CONTRACT_ADDRESS } from "./constants.js"

async function fetchBytecode() {
  const client = createPublicClient({
    transport: http(RPC_URL),
  })

  try {
    console.log(`Fetching bytecode for contract: ${VOTING_CONTRACT_ADDRESS}`)
    console.log(`RPC endpoint: ${RPC_URL}`)
    console.log("---")

    const bytecode = await client.getBytecode({
      address: VOTING_CONTRACT_ADDRESS,
    })

    if (bytecode) {
      console.log("Contract bytecode:")
      console.log(bytecode)
    } else {
      console.log("No bytecode found - contract may not exist at this address")
    }
  } catch (error) {
    console.error("Error fetching bytecode:", error)
    process.exit(1)
  }
}

fetchBytecode()
