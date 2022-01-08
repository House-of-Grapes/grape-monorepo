import { createContext, FC, useContext, useEffect } from 'react'
import { Contracts } from '@grape/shared'
import useBalance, { UseBalanceValue } from '../hooks/useBalance'

type BalanceContext = {
  grape: UseBalanceValue
  sRome: UseBalanceValue
  refetchBalances: () => void
}

const BalanceContext = createContext<BalanceContext>(null)

export const BalanceProvider: FC = ({ children }) => {
  const grape = useBalance(Contracts.GrapeToken)
  const sRome = useBalance(Contracts.StakingToken)

  useEffect(() => {
    const intervalId = setInterval(() => {
      refetchBalances()
    }, 1000 * 60)

    return () => {
      clearInterval(intervalId)
    }
  })

  const refetchBalances = () => {
    grape.refetch()
    sRome.refetch()
  }

  const value = {
    grape,
    sRome,
    refetchBalances,
  }

  return (
    <BalanceContext.Provider value={value}>{children}</BalanceContext.Provider>
  )
}

export const useBalanceContext = () => {
  const ctx = useContext(BalanceContext)
  if (!ctx) {
    throw new Error('Missing BalanceContext.Provider')
  }
  return ctx
}
