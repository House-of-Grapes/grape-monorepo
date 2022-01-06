import { HardhatRuntimeEnvironment } from 'hardhat/types'
import { DeployFunction } from 'hardhat-deploy/types'
import chalk from 'chalk'
import { ethers } from 'hardhat'
import { BigNumber } from '@ethersproject/bignumber'
import { merkle } from '@grape/generator'

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployments, getNamedAccounts, hardhatArguments } = hre
  const { deployer } = await getNamedAccounts()
  const { deploy } = deployments
  const rewardToken = await deployments.get('GrapeToken')

  const name = 'Rewards'
  let stakingTokenAddress

  if (hardhatArguments.network === 'moonriver') {
    // sROME
    stakingTokenAddress = '0x89f52002e544585b42f8c7cf557609ca4c8ce12a'
  } else {
    const stakingToken = await deployments.get('StakingToken')
    stakingTokenAddress = stakingToken.address
  }

  const rewardsContract = await deploy(name, {
    from: deployer,
    args: [rewardToken.address, stakingTokenAddress, merkle.root],
    // gasPrice: BigNumber.from('150000000000'),
  })

  deployments.log(
    `Contract ${chalk.blue(name)} deployed at ${chalk.green(
      rewardsContract.address
    )} `
  )

  deployments.log(`${merkle.tree.leaves.length} accounts added to MerkleTree`)

  const [owner] = await ethers.getSigners()
  const grapeTokenContract = await ethers.getContractAt(
    'GrapeToken',
    rewardToken.address,
    owner
  )

  const role = await grapeTokenContract.MINTER_ROLE()
  await grapeTokenContract.grantRole(role, rewardsContract.address)

  deployments.log(
    `Contract ${chalk.blue(name)} was added as minter to ${chalk.green(
      'GrapeToken'
    )} `
  )
}
export default func

func.tags = ['Rewards']
func.dependencies = ['GrapeToken', 'StakingToken']
