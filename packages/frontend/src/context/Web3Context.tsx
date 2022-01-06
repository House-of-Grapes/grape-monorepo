import {
  createContext,
  FC,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'
import Web3Modal, { getProviderInfo } from 'web3modal'
import WalletConnectProvider from '@walletconnect/web3-provider'
import { Chains, RPC_URL } from '@grape/shared'
import { ethers } from 'ethers'

let CHAIN = Chains.LOCALHOST
if (process.env.NEXT_PUBLIC_CHAIN == '1287') {
  CHAIN = Chains.MOONBASE
}
if (process.env.NEXT_PUBLIC_CHAIN == '1285') {
  CHAIN = Chains.MOONRIVER
}

const standardProvider = new ethers.providers.JsonRpcProvider(RPC_URL[CHAIN])

type Web3ModalProvider = any
type Web3Context = {
  connect: () => Promise<void>
  isConnecting: boolean
  isConnected: boolean
  isCorrectChain: boolean
  selectedAccount: string
  chainId: Chains
  web3Provider: ethers.providers.Web3Provider
  standardProvider: ethers.providers.JsonRpcProvider
  switchToChain: () => Promise<void>
  isMetamask: boolean
}

const Web3Context = createContext<Web3Context>(null)

export const Web3Provider: FC = ({ children }) => {
  const [isConnecting, setIsConnecting] = useState(false)
  const [web3ModalProvider, setWeb3ModalProvider] =
    useState<null | Web3ModalProvider>(null)
  const [web3Provider, setWeb3Provider] =
    useState<ethers.providers.Web3Provider | null>(null)
  const [selectedAccount, setSelectedAccount] = useState<string>('')
  const [selectedChain, setSelectedChain] = useState<number | null>(null)
  const [isMetamask, setIsMetaMask] = useState(false)

  const promptChain = async () => {
    const chainId = CHAIN
    const chainName = CHAIN === Chains.MOONBASE ? 'Moonbase Alpha' : 'Moonriver'
    const blockExplorer =
      CHAIN === Chains.MOONBASE
        ? 'https://moonbase.moonscan.io/'
        : 'https://moonscan.io/'
    const name = CHAIN === Chains.MOONBASE ? 'DEV' : 'MOVR'
    const rpcUrls = RPC_URL[CHAIN]

    try {
      await window.ethereum.request({
        method: 'wallet_addEthereumChain',
        params: [
          {
            chainId: `0x${chainId.toString(16)}`,
            chainName: chainName,
            nativeCurrency: {
              name: name,
              symbol: name,
              decimals: 18,
            },
            rpcUrls: [rpcUrls],
            blockExplorerUrls: [blockExplorer],
          },
        ],
      })
    } catch (err) {}
  }

  const switchToChain = async (): Promise<void> => {
    await promptChain()
    if (window.ethereum) {
      try {
        const switchToChainResponse = await window.ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [
            {
              chainId: `0x${CHAIN.toString(16)}`,
            },
          ],
        })
      } catch (e) {
        console.error(e)
      }
    }
  }

  const web3Modal = useMemo(
    () =>
      typeof window === 'undefined'
        ? undefined
        : new Web3Modal({
            cacheProvider: true,
            disableInjectedProvider: false,
            providerOptions: {
              walletconnect: {
                package: WalletConnectProvider,
                options: {
                  network: 'Moonriver',
                  chainId: Chains.MOONRIVER,
                  rpc: {
                    [Chains.MOONRIVER]: RPC_URL[Chains.MOONRIVER],
                    [Chains.MOONBASE]: RPC_URL[Chains.MOONBASE],
                  },
                },
              },
            },
          }),
    []
  )

  useEffect(() => {
    if (web3Modal.cachedProvider) {
      setIsConnecting(true)
      try {
        web3Modal?.connect().then(connect)
      } catch (e) {
        setIsConnecting(false)
      }
      setIsConnecting(false)
    }
  }, [web3Modal])

  const connectWallet = async (): Promise<void> => {
    let web3ModalProvider
    setIsConnecting(true)
    try {
      web3ModalProvider = await web3Modal?.connect()
      setIsConnecting(false)
    } catch (error) {
      setIsConnecting(false)
      return
    }

    connect(web3ModalProvider)
  }

  const connect = async (
    web3ModalProvider: Web3ModalProvider
  ): Promise<void> => {
    setWeb3ModalProvider(web3ModalProvider)
    const _web3Provider = new ethers.providers.Web3Provider(
      web3ModalProvider as ethers.providers.ExternalProvider,
      'any'
    )
    setIsMetaMask(getProviderInfo(web3ModalProvider).check === 'isMetaMask')
    setWeb3Provider(_web3Provider)

    const network = await _web3Provider?.getNetwork()
    const [_selectedAccount] = await _web3Provider.listAccounts()
    setSelectedAccount(_selectedAccount)
    setSelectedChain(network.chainId)
  }

  useEffect(() => {
    const onAccountsChanged = (accounts: string[]) => {
      setSelectedAccount(accounts[0])
    }

    const onDisconnect = (args) => {
      setSelectedAccount('')
      console.log(args)
      web3Modal.clearCachedProvider()
    }

    const onChainChanged = (chainId: number) => {
      window.location.reload()

      if (
        /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
          navigator.userAgent
        )
      ) {
        window.location.reload()
      } else {
        setSelectedChain(Number(chainId))
      }
    }
    if (web3ModalProvider) {
      web3ModalProvider.on('disconnect', onDisconnect)
      web3ModalProvider.on('accountsChanged', onAccountsChanged)
      web3ModalProvider.on('chainChanged', onChainChanged)
    }

    return () => {}
  }, [web3ModalProvider])

  const isCorrectChain = CHAIN === selectedChain
  const value = {
    connect: connectWallet,
    isConnecting,
    isConnected: Boolean(selectedAccount),
    selectedAccount,
    chainId: CHAIN,
    web3Provider,
    standardProvider,
    isCorrectChain,
    switchToChain,
    isMetamask,
  }
  return <Web3Context.Provider value={value}>{children}</Web3Context.Provider>
}

export const useWeb3 = () => {
  const ctx = useContext(Web3Context)
  if (!ctx) {
    throw new Error('Missing Web3Context.Provider')
  }
  return ctx
}
