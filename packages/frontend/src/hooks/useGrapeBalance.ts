import { Contracts } from '@grape/shared'
import { BigNumber } from '@ethersproject/bignumber'
import useBalance from './useBalance'

const useGrapeBalance = (): { isLoading: boolean; balance: BigNumber } => {
  return useBalance(Contracts.GrapeToken)
}

export default useGrapeBalance
