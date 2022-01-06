import { HardhatRuntimeEnvironment } from 'hardhat/types'
import { DeployFunction } from 'hardhat-deploy/types'
import chalk from 'chalk'

const name = 'StakingToken'

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployments, getNamedAccounts } = hre
  const { deployer } = await getNamedAccounts()
  const { deploy } = deployments

  const stakingToken = await deploy(name, {
    from: deployer,
    args: [],
  })

  deployments.log(
    `Contract ${chalk.blue(name)} deployed at ${chalk.green(
      stakingToken.address
    )} `
  )
}
export default func

func.tags = [name]
func.skip = async (hre: HardhatRuntimeEnvironment) => {
  const { hardhatArguments } = hre

  return hardhatArguments.network === 'moonriver'
}
