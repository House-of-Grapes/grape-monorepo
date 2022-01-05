import { solidityKeccak256 } from 'ethers/lib/utils'
import _airdrop from '../airdrop.json'
import _merkle from '../merkle.json'

export const airdrop = _airdrop
export const merkle = _merkle

export const generateLeaf = (address: string, value: string): Buffer =>
  Buffer.from(
    // Hash in appropriate Merkle format
    solidityKeccak256(['address', 'uint256'], [address, value]).slice(2),
    'hex'
  )
