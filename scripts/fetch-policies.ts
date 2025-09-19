import { mkdirSync, writeFileSync } from "node:fs"
import { resolve } from "node:path"
import { policyApiService } from "../src/services/policyApi.js"

interface PolicyData {
  policies: any[]
  metadata: {
    fetchedAt: string
    lastUpdated: number
    totalCount: number
    fetchDuration: number
  }
}

async function fetchAndSavePolicies() {
  console.log("🔄 Fetching all policies from PolicyVoter API...")

  const startTime = Date.now()

  try {
    const policies = await policyApiService.fetchAllPolicies()

    const endTime = Date.now()
    const duration = endTime - startTime

    const data: PolicyData = {
      policies,
      metadata: {
        fetchedAt: new Date().toISOString(),
        lastUpdated: Date.now(),
        totalCount: policies.length,
        fetchDuration: duration,
      },
    }

    const dataDir = resolve(process.cwd(), "data")
    const outputPath = resolve(dataDir, "policies.json")

    // Ensure data directory exists
    mkdirSync(dataDir, { recursive: true })

    writeFileSync(outputPath, JSON.stringify(data, null, 2))

    console.log(`✅ Successfully fetched ${policies.length} policies`)
    console.log(`📁 Saved to: ${outputPath}`)
    console.log(`⏱️  Fetch duration: ${(duration / 1000).toFixed(2)}s`)
  } catch (error) {
    console.error("❌ Failed to fetch policies:", error)
    process.exit(1)
  }
}

fetchAndSavePolicies()
