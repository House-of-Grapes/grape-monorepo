import { Contracts } from '@grape/shared'
import { BigNumber } from '@ethersproject/bignumber'
import useBalance from './useBalance'

const useGrapeBalance = (
  deps: any[] = []
): { isLoading: boolean; balance: BigNumber } => {
  return useBalance(Contracts.GrapeToken, deps)
}

export default useGrapeBalance
