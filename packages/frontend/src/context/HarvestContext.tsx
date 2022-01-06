import {
  createContext,
  FC,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'
import { Rewards__factory } from '@grape/contracts'
import { Contracts, getAddress } from '@grape/shared'
import { useWeb3 } from './Web3Context'
import { BigNumber } from '@ethersproject/bignumber'
import toast from 'react-hot-toast'
import dayjs, { Dayjs } from 'dayjs'
import { serializeError } from 'eth-rpc-errors'
import { airdrop, merkle, generateLeaf } from '@grape/generator'
import { ethers } from 'ethers'
import { MerkleTree } from 'merkletreejs'
import keccak256 from 'keccak256'
import JSConfetti from 'js-confetti'
import { useBalanceContext } from './BalanceContext'

type HarvestContext = {
  isEligble: boolean
  harvestAmount: BigNumber
  lastClaimed: Dayjs
  isClaiming: boolean
  claimTokens: () => Promise<void>
  claimingInterval: number
  isLoading: boolean
  fetchData: () => Promise<void>
  haveClaimed: boolean
  canInitialClaim: boolean
  claimInitial: () => Promise<void>
  isClaimingInitial: boolean
  haveInitialClaimed: boolean
}

const HarvestContext = createContext<HarvestContext>(null)

export const HarvestProvider: FC = ({ children }) => {
  const {
    chainId,
    web3Provider,
    selectedAccount,
    isCorrectChain,
    standardProvider,
  } = useWeb3()
  const { refetchBalances } = useBalanceContext()
  const [isLoading, setIsLoading] = useState(false)
  const [isEligble, setisEligble] = useState(false)
  const [haveClaimed, setHaveClaimed] = useState(false)
  const [haveInitialClaimed, setHaveInitialClaimed] = useState(false)

  const [canInitialClaim, setCanInitialClaim] = useState(false)
  const [harvestAmount, setHarvestAmount] = useState(BigNumber.from('0'))
  const [lastClaimed, setLastClaimed] = useState<Dayjs | null>(null)
  const [isClaiming, setIsClaiming] = useState<boolean>(false)
  const [claimingInterval, setClaimingInterval] = useState<number>(0)
  const [isClaimingInitial, setIsClaimingInitial] = useState(false)

  const address = getAddress(chainId, Contracts.Rewards)
  const rewardsContract = useMemo(
    () => Rewards__factory.connect(address, standardProvider),
    [address, standardProvider]
  )

  const fetchData = async () => {
    setIsLoading(true)

    try {
      const [amount, isEligble, lastClaimed, claimInterval, hasInitialClaimed] =
        await Promise.all([
          rewardsContract.getAmount(selectedAccount),
          rewardsContract.isEligble(selectedAccount),
          rewardsContract.lastClaimed(selectedAccount),
          rewardsContract.claimInterval(),
          rewardsContract.hasInitialClaimed(selectedAccount),
        ])

      if (!hasInitialClaimed) {
        setCanInitialClaim(
          airdrop.some(
            (account) => account.toLowerCase() === selectedAccount.toLowerCase()
          )
        )
      }

      setHarvestAmount(amount)
      setisEligble(isEligble)
      setClaimingInterval(+claimInterval)

      if (lastClaimed.toString() != '0') {
        setLastClaimed(dayjs(Number(lastClaimed.toString()) * 1000))
        setHaveClaimed(false)
      }
    } catch (e) {
      console.error(e)
      toast.error(`Failed to fetch contract data. Message ${e.message}`)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    setHarvestAmount(BigNumber.from('0'))
    setisEligble(false)
    setClaimingInterval(0)
    setCanInitialClaim(false)
    setIsClaimingInitial(false)
    setLastClaimed(null)
  }, [selectedAccount])

  useEffect(() => {
    if (rewardsContract && selectedAccount) {
      fetchData()
    }
  }, [rewardsContract, selectedAccount])

  const claimTokens = async () => {
    setIsClaiming(true)

    try {
      const contractWithSigner =
        web3Provider &&
        isCorrectChain &&
        Rewards__factory.connect(address, web3Provider.getSigner(0))
      const tx = await contractWithSigner.claim()
      await tx.wait(1)
      refetchBalances()
      await fetchData()
      const jsConfetti = new JSConfetti()

      jsConfetti.addConfetti({
        emojis: ['🍇'],
        emojiSize: 110,
        confettiNumber: 270,
      })
      setHaveClaimed(true)
    } catch (e) {
      const message =
        (serializeError(e)?.data as any)?.message ||
        e.message ||
        'Unknown error'

      toast.error(`Failed to claim. Message: ${message}`)
      console.error(e)
    } finally {
      setIsClaiming(false)
    }
  }

  const claimInitial = async () => {
    setIsClaimingInitial(true)

    try {
      const contractWithSigner =
        web3Provider &&
        isCorrectChain &&
        Rewards__factory.connect(address, web3Provider.getSigner(0))

      const merkleTree = new MerkleTree(
        airdrop.map((address) =>
          generateLeaf(address, ethers.utils.parseEther('1000').toString())
        ),
        keccak256,
        {
          sortPairs: true,
        }
      )

      const leaf = generateLeaf(
        ethers.utils.getAddress(selectedAccount),
        ethers.utils.parseEther('1000').toString()
      )

      const tx = await contractWithSigner.initialClaim(
        ethers.utils.getAddress(selectedAccount),
        ethers.utils.parseEther('1000'),
        merkleTree.getHexProof(leaf)
      )
      const receipt = await tx.wait(1)
      refetchBalances()
      console.log('.....receipt', receipt)
      setHaveInitialClaimed(true)
      console.log(tx)
      setCanInitialClaim(false)
      setIsClaimingInitial(false)
    } catch (e) {
      const message =
        (serializeError(e)?.data as any)?.message ||
        e.message ||
        'Unknown error'

      toast.error(`Failed to claim. Message: ${message}`)
      console.error(e)
    } finally {
      setIsClaimingInitial(false)
    }
  }

  const value = {
    isEligble,
    harvestAmount,
    lastClaimed,
    isClaiming,
    claimTokens,
    claimingInterval,
    isLoading,
    fetchData,
    haveClaimed,
    canInitialClaim,
    isClaimingInitial,
    claimInitial,
    haveInitialClaimed,
  }

  return (
    <HarvestContext.Provider value={value}>{children}</HarvestContext.Provider>
  )
}

export const useHarvestContext = () => {
  const ctx = useContext(HarvestContext)
  if (!ctx) {
    throw new Error('Missing HarvestContext.Provider')
  }
  return ctx
}
