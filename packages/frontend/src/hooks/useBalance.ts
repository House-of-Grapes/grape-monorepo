import { useMemo, useEffect, useState } from 'react'
import { Contracts, getAddress } from '@grape/shared'
import { useWeb3 } from '../context/Web3Context'
import { GrapeToken__factory, StakingToken__factory } from '@grape/contracts'
import { BigNumber } from '@ethersproject/bignumber'
import toast from 'react-hot-toast'

export type UseBalanceValue = {
  isLoading: boolean
  balance: BigNumber
  refetch: () => Promise<void>
}

const useBalance = (target: Contracts): UseBalanceValue => {
  const [isLoading, setIsLoading] = useState(false)
  const [balance, setBalance] = useState(BigNumber.from('0'))
  const { chainId, standardProvider, selectedAccount } = useWeb3()
  const address = getAddress(chainId, target)
  const factory =
    target === Contracts.GrapeToken
      ? GrapeToken__factory
      : StakingToken__factory

  const contract = useMemo(
    () => factory.connect(address, standardProvider),
    [address, standardProvider]
  )

  const getBalance = async () => {
    setBalance(BigNumber.from('0'))
    try {
      const balance = await contract.balanceOf(selectedAccount)
      setBalance(balance)
      console.log(balance, selectedAccount)
    } catch (e) {
      toast.error('Could not fetch balance: ', e.message)
    } finally {
      setIsLoading(false)
    }
  }

  const refetch = async () => {
    if (contract && selectedAccount) {
      try {
        const balance = await contract.balanceOf(selectedAccount)
        setBalance(balance)
      } catch (e) {}
    }
  }

  useEffect(() => {
    if (contract && selectedAccount) {
      setIsLoading(true)
      getBalance()
    }
  }, [Boolean(contract), selectedAccount])

  return { balance, isLoading, refetch }
}

export default useBalance
