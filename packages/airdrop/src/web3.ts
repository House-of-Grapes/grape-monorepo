import { BigNumber, ethers } from 'ethers'
import axios, { AxiosError } from 'axios'
import { Rewards__factory } from '../generated'
import { config } from './config'
import {
  RPC_URL,
  Address,
  Contracts,
  Chains,
  getAddress,
} from '../shared/src/web3-config'
import { logger } from './logger'
import { CronJob } from 'cron'
import Queue from 'queue-promise'
import chunk from 'lodash/chunk'

const provider = new ethers.providers.JsonRpcProvider(RPC_URL[config.chainId])
const wallet = new ethers.Wallet(config.MNEMONIC, provider)
const stakingTokenAddress = getAddress(config.chainId, Contracts.StakingToken)
const grapeTokenAddress = getAddress(config.chainId, Contracts.GrapeToken)
const rewardsContractAddress = getAddress(config.chainId, Contracts.Rewards)
const rewardsContract = Rewards__factory.connect(rewardsContractAddress, wallet)

logger.info('stakingTokenAddress: %s', stakingTokenAddress)
logger.info('grapeTokenAddress: %s', grapeTokenAddress)
logger.info('rewardsContractAddress: %s', rewardsContractAddress)

const dailyAirdrop = async () => {
  logger.info('Time for daily airdrop')

  try {
    logger.info('Getting holders')
    const holders = await fetchAllHolders()
    logger.info('Getting holders done, count: %s', holders.length)
    logger.info('Beginning to harvest')
    await callInChunks(holders, 'harvest')
    logger.info('Harvest done')
  } catch (e) {
    logger.error(e, 'Failed doing daily airdrop')
  }
}

export const start = async () => {
  logger.info('web3 service started')
  const [target] = process.argv.slice(2)
  logger.info('target: %s', target)

  if (target === '--airdrop') {
    logger.info('creating initial airdrop')
    initialAirdrop()
  } else {
    logger.info('creating cron job')
    const job = new CronJob(
      '0 18 * * *',
      dailyAirdrop,
      null,
      true,
      'Europe/Berlin'
    )
    job.start()
    logger.info('cron job started')
  }
}

const fetchAllHolders = async (): Promise<string[]> => {
  const PAGE_SIZE = 1000
  let PAGE_OFFSET = 0

  let done = false
  const whileGenerator = function* () {
    while (!done) {
      yield PAGE_OFFSET
    }
  }

  let holders: string[] = []

  try {
    for (let i of whileGenerator()) {
      const baseUrl =
        config.chainId === Chains.MOONBASE
          ? 'https://moonbase-blockscout.testnet.moonbeam.network'
          : 'https://blockscout.moonriver.moonbeam.network'

      const url = `${baseUrl}/api?module=token&action=getTokenHolders&contractaddress=${stakingTokenAddress}&page=${PAGE_OFFSET}&offset=${PAGE_SIZE}`
      const { data } = await axios.get<{
        result: { address: string; value: string }[]
      }>(url)

      const items = data.result.map((item) => item.address)

      PAGE_OFFSET += 1
      holders = [...holders, ...items]

      if (items.length === 0) {
        done = true
      }
    }
  } catch (e: unknown) {
    logger.error('Failed getting holders from covalenthq api!')
    logger.error((e as AxiosError<unknown>).message)
  }

  return [...new Set(holders)]
}

const sleep = (duration: number): Promise<any> =>
  new Promise((resolve) => setTimeout(resolve, duration))

const listenToEmitDifference = (
  holders: string[],
  method: 'release' | 'harvest'
): (() => {
  totalCount: number
  didNotRecieve: string[]
  didRecieve: string[]
}) => {
  const accounts: string[] = []

  const event = method === 'release' ? 'Release' : 'Airdrop'
  const handleEvent = (account: string) => {
    accounts.push(account.toString().toLowerCase())
  }
  rewardsContract.on(event, handleEvent)

  return () => {
    const didNotRecieve = holders.filter(
      (holder) => !accounts.includes(holder.toLowerCase())
    )
    rewardsContract.off(event, handleEvent)

    return {
      totalCount: accounts.length,
      didNotRecieve,
      didRecieve: accounts,
    }
  }
}

export const callInChunks = (
  holders: string[],
  method: 'release' | 'harvest',
  amount?: BigNumber
): Promise<boolean> => {
  return new Promise((resolve, reject) => {
    const getEmitDifference = listenToEmitDifference(holders, method)

    logger.info(`Calling %s with %s holders`, method, holders.length)
    const chunkQueue = new Queue({
      concurrent: 1,
      interval: 5000,
    })

    const CHUNK_LIMIT = 25
    const chunks = chunk(holders, CHUNK_LIMIT)
    logger.info(`Chunked it to %s groupes`, chunks.length)

    const callMethod = async (selectedHolders: string[], retryCount = 0) => {
      try {
        let tx: ethers.ContractTransaction
        let receipt: ethers.ContractReceipt
        if (method === 'harvest') {
          tx = await rewardsContract.harvest(selectedHolders)
          receipt = await tx.wait(1)
          logger.debug(tx)
        } else if (method === 'release' && amount) {
          tx = await rewardsContract.release(selectedHolders, amount)
          receipt = await tx.wait(1)
          logger.debug(tx)
        }
      } catch (e) {
        logger.error(e, `%s failed. Retry count: %s`, method, retryCount)
        if (retryCount < 5) {
          logger.debug('Waiting to retry.')
          await sleep(10000)
          logger.debug('Trying again.')
          await callMethod(selectedHolders, retryCount + 1)
        } else {
          logger.error(
            {},
            `Holders that did not recieve %s : %s`,
            method,
            selectedHolders
          )
        }
      }
    }

    chunks.forEach((selectedHolders, i) => {
      chunkQueue.enqueue(async () => {
        logger.info('Process chunk %s', i)
        await callMethod(selectedHolders)
      })
    })

    chunkQueue.on('end', async () => {
      logger.info(`%s completed!`, method)
      logger.info('waiting for remaining events...')
      await sleep(10000)
      const diff = getEmitDifference()
      logger.info(`%s addresses got $GRAPE!`, diff.totalCount)
      if (diff.didNotRecieve.length > 0) {
        logger.error(
          `%s users did not recieve their $GRAPE!`,
          diff.didNotRecieve.length
        )
        logger.error(diff.didNotRecieve)
      }

      logger.debug('accounts that recieved', diff.didRecieve)

      resolve(true)
    })

    chunkQueue.on('reject', (e) => {
      logger.error(e, `Error in queue`)
    })
  })
}

export const initialAirdrop = async () => {
  try {
    const amount = ethers.utils.parseEther('1000')
    logger.info('Getting holders')
    const holders = await fetchAllHolders()
    logger.info('Getting holders done, count: %s', holders.length)
    logger.info('Beginning to release')

    await callInChunks(holders, 'release', amount)
    logger.info(
      'Release airdrop done of %s GRAPE',
      ethers.utils.formatEther(amount)
    )
  } catch (e) {
    logger.error(e, 'Failed doing initial airdrop')
  }
}
