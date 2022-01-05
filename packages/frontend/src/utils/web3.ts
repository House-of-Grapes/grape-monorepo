import { Chains, RPC_URL } from '@grape/shared'
import { ethers } from 'ethers'

export const mainNetProvider = new ethers.providers.JsonRpcProvider(
  RPC_URL[Chains.MOONRIVER]
)
