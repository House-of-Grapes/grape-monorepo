import { fetchAllHolders } from './api'
import fs from 'fs' // Filesystem
import path from 'path' // Path routing
import Generator from './generator' // Generator
import { logger } from './logger' // Logging

// Config file path
const airdropPath: string = path.join(__dirname, '../airdrop.json')

;(async () => {
  const holders = await fetchAllHolders()
  fs.writeFileSync(airdropPath, JSON.stringify(holders))

  // Collect config
  const decimals: number = 18
  const airdrop: Record<string, number> = {}
  for (let holder of holders) {
    airdrop[holder] = 1000
  }

  // Initialize and call generator
  const generator = new Generator(decimals, airdrop)
  await generator.process()
})()
