import grapeTokenAbiLocalhost from '../../contracts/deployments/localhost/GrapeToken.json'
import rewardsAbiLocalhost from '../../contracts/deployments/localhost/Rewards.json'
import stakingAbiLocalhost from '../../contracts/deployments/localhost/StakingToken.json'
import grapeTokenAbiMoonbase from '../../contracts/deployments/moonbase/GrapeToken.json'
import rewardsAbiMoonbase from '../../contracts/deployments/moonbase/Rewards.json'
import stakingTokenAbiMoonbase from '../../contracts/deployments/moonbase/StakingToken.json'

export enum Chains {
  LOCALHOST = 31337,
  MOONRIVER = 1285,
  MOONBASE = 1287,
}

export const RPC_URL = {
  [Chains.LOCALHOST]: 'http://127.0.0.1:8545/',
  [Chains.MOONRIVER]: 'https://rpc.moonriver.moonbeam.network/',
  [Chains.MOONBASE]: 'https://rpc.testnet.moonbeam.network',
}

export enum Contracts {
  GrapeToken = 'GrapeToken',
  Rewards = 'Rewards',
  StakingToken = 'StakingToken',
  RomeConscription = 'RomeConscription',
}

const romeConscriptionMoonriverAddress =
  '0x3718bc4389cc4d960cedf9ff68e96c731bc8f685'
export const Address: Record<Chains, any> = {
  [Chains.LOCALHOST]: {
    [Contracts.GrapeToken]: grapeTokenAbiLocalhost.address,
    [Contracts.Rewards]: rewardsAbiLocalhost.address,
    [Contracts.StakingToken]: stakingAbiLocalhost.address,
    [Contracts.RomeConscription]: romeConscriptionMoonriverAddress,
  },
  [Chains.MOONBASE]: {
    [Contracts.GrapeToken]: grapeTokenAbiMoonbase.address,
    [Contracts.Rewards]: rewardsAbiMoonbase.address,
    [Contracts.StakingToken]: stakingTokenAbiMoonbase.address,
    [Contracts.RomeConscription]: romeConscriptionMoonriverAddress,
  },
  [Chains.MOONRIVER]: {
    [Contracts.GrapeToken]: grapeTokenAbiLocalhost.address,
    [Contracts.Rewards]: rewardsAbiLocalhost.address,
    [Contracts.StakingToken]: '0x89f52002e544585b42f8c7cf557609ca4c8ce12a',
    [Contracts.RomeConscription]: romeConscriptionMoonriverAddress,
  },
}

export const getAddress = (chain: Chains, contract: Contracts): string =>
  Address[chain][contract]
