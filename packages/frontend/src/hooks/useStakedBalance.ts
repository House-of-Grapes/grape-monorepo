import { Contracts } from '@grape/shared'
import { BigNumber } from '@ethersproject/bignumber'
import useBalance from './useBalance'

const useStakedBalance = (): { isLoading: boolean; balance: BigNumber } => {
  return useBalance(Contracts.StakingToken)
}

export default useStakedBalance
