import 'dotenv'
import axios, { AxiosError } from 'axios'

export const fetchAllHolders = async (): Promise<string[]> => {
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
      const isTestnet = true
      const baseUrl = isTestnet
        ? 'https://moonbase-blockscout.testnet.moonbeam.network'
        : 'https://blockscout.moonriver.moonbeam.network'

      const stakingTokenAddress = isTestnet
        ? '0x465f6492Eb0CCF5f3ef7C2D9D6E2ce3b8368Edb5'
        : ''
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
    console.error('Failed getting holders from covalenthq api!')
    console.error((e as AxiosError<unknown>).message)
  }

  return [...new Set(holders)]
}
