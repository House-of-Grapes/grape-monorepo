import fs from 'fs' // Filesystem
import path from 'path' // Path
import keccak256 from 'keccak256' // Keccak256 hashing
import MerkleTree from 'merkletreejs' // MerkleTree.js
import { logger } from './logger' // Logging
import { getAddress, parseUnits } from 'ethers/lib/utils' // Ethers utils
import { generateLeaf } from '.'

// Output file path
const outputPath: string = path.join(__dirname, '../merkle.json')

// Airdrop recipient addresses and scaled token values
type AirdropRecipient = {
  // Recipient address
  address: string
  // Scaled-to-decimals token value
  value: string
}

export default class Generator {
  // Airdrop recipients
  recipients: AirdropRecipient[] = []

  /**
   * Setup generator
   * @param {number} decimals of token
   * @param {Record<string, number>} airdrop address to token claim mapping
   */
  constructor(decimals: number, airdrop: Record<string, number>) {
    // For each airdrop entry
    for (const [address, tokens] of Object.entries(airdrop)) {
      // Push:
      this.recipients.push({
        // Checksum address
        address: getAddress(address),
        // Scaled number of tokens claimable by recipient
        value: parseUnits(tokens.toString(), decimals).toString(),
      })
    }
  }

  async process(): Promise<void> {
    logger.info('Generating Merkle tree.')

    // Generate merkle tree
    const merkleTree = new MerkleTree(
      // Generate leafs
      this.recipients.map(({ address, value }) => generateLeaf(address, value)),
      // Hashing function
      keccak256,
      { sortPairs: true }
    )

    // Collect and log merkle root
    const merkleRoot: string = merkleTree.getHexRoot()
    logger.info(`Generated Merkle root: ${merkleRoot}`)

    // Collect and save merkle tree + root
    await fs.writeFileSync(
      // Output to merkle.json
      outputPath,
      // Root + full tree
      JSON.stringify({
        root: merkleRoot,
        tree: merkleTree,
      })
    )
    logger.info('Generated merkle tree and root saved to Merkle.json.')
  }
}
