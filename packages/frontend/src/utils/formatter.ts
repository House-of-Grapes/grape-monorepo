import { BigNumber } from '@ethersproject/bignumber'
import { ethers } from 'ethers'
import { Decimal } from 'decimal.js'

export const formatBalance = (balance: BigNumber): string => {
  return new Decimal(ethers.utils.formatEther(balance))
    .toDecimalPlaces(2)
    .toString()
}

export const formatAddressToShort = (
  address: string,
  options?: { start?: number; end?: number }
): string =>
  [
    address.slice(0, options?.start || 4),
    '...',
    address.slice(-(options?.end || 4)),
  ].join('')
