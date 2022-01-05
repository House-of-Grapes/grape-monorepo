import { useMemo, useEffect, useState } from 'react'
import { Contracts, getAddress } from '@grape/shared'
import { useWeb3 } from '../context/Web3Context'
import { GrapeToken__factory, StakingToken__factory } from '@grape/contracts'
import { BigNumber } from '@ethersproject/bignumber'
import toast from 'react-hot-toast'

const useBalance = (
  target: Contracts,
  deps: any[] = []
): { isLoading: boolean; balance: BigNumber } => {
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
    } catch (e) {
      toast.error('Could not fetch balance: ', e.message)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (contract && selectedAccount) {
      setIsLoading(true)
      getBalance()
    }
  }, [Boolean(contract), selectedAccount, ...deps])

  return { balance, isLoading }
}

export default useBalance
