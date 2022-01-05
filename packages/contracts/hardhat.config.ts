import dotenv from 'dotenv'
import '@nomiclabs/hardhat-waffle'
import '@nomiclabs/hardhat-ethers'
import '@typechain/hardhat'
import '@nomiclabs/hardhat-etherscan'
import { task } from 'hardhat/config'
import { HardhatUserConfig } from 'hardhat/types'
import 'hardhat-abi-exporter'
import 'hardhat-deploy'
import 'hardhat-gas-reporter'

dotenv.config({ path: '../../.env' })

task('accounts', 'Prints the list of accounts', async (args, hre) => {
  const accounts = await hre.ethers.getSigners()

  for (const account of accounts) {
    console.log(await account.address)
  }
})

if (typeof process.env.MNEMONIC !== 'string') {
  throw new Error('Missing process.env.MNEMONIC')
}

const [target] = process.argv.slice(2)
let accounts =
  target === 'test'
    ? undefined
    : [
        {
          privateKey: process.env.MNEMONIC,
          balance: '1000000000000000000000000000000000',
        },
      ]

const config: HardhatUserConfig = {
  defaultNetwork: 'hardhat',
  networks: {
    hardhat: {
      saveDeployments: true,
      accounts,
    },
    localhost: {
      url: 'http://127.0.0.1:8545',
      saveDeployments: true,
    },
    moonriver: {
      url: 'https://rpc.moonriver.moonbeam.network',
      chainId: 1285,
      accounts: [process.env.MNEMONIC],
    },
    moonbase: {
      url: 'https://rpc.testnet.moonbeam.network',
      chainId: 1287,
      accounts: [process.env.MNEMONIC],
    },
  },
  namedAccounts: {
    deployer: {
      default: 0,
    },
  },

  solidity: '0.8.4',

  abiExporter: {
    path: './abi',
    clear: true,
    flat: true,
    spacing: 2,
    runOnCompile: true,
  },

  typechain: {
    outDir: 'generated',
    target: 'ethers-v5',
    externalArtifacts: ['abi/*.json', 'external-abi/*.json'],
    alwaysGenerateOverloads: true,
  },

  etherscan: {
    apiKey: process.env.MOONRIVER_API_KEY,
  },
}

export default config
