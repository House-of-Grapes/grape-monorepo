import { HardhatRuntimeEnvironment } from 'hardhat/types'
import { DeployFunction } from 'hardhat-deploy/types'
import chalk from 'chalk'

const name = 'GrapeToken'

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployments, getNamedAccounts, hardhatArguments } = hre
  const { deployer } = await getNamedAccounts()
  const { deploy } = deployments

  let taxTokenAddress = '0x0000000000000000000000000000000000000000'

  if (hardhatArguments.network === 'moonriver') {
    taxTokenAddress = '0xD4a7FEbD52efda82d6f8acE24908aE0aa5b4f956'
  }

  const token = await deploy(name, {
    from: deployer,
    args: [taxTokenAddress],
  })

  deployments.log(
    `Contract ${chalk.blue(name)} deployed at ${chalk.green(token.address)}`
  )
}

export default func

func.tags = [name]
