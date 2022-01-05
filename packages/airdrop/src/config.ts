import { ethers } from 'ethers'
import { Chains } from '../shared/src/web3-config'

if (typeof process.env.MNEMONIC !== 'string') {
  throw new Error('Missing process.env.MNEMONIC')
}

let chainId = Chains.LOCALHOST
if (process.env.CHAIN == '1287') {
  chainId = Chains.MOONBASE
}
if (process.env.CHAIN == '1285') {
  chainId = Chains.MOONRIVER
}

export const config = {
  chainId,
  MNEMONIC: process.env.MNEMONIC as ethers.utils.BytesLike,
}
