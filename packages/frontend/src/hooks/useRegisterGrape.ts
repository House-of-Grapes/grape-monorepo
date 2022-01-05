import * as React from 'react'
import { useEffect, useState } from 'react'
import { useWeb3 } from '../context/Web3Context'
import { Contracts, getAddress } from '@grape/shared'

const useRegisterGrape = (): {
  visible: boolean
  registerToken: () => void
} => {
  const { isMetamask, selectedAccount, chainId } = useWeb3()
  const [show, setShow] = useState(false)

  useEffect(() => {
    const stored = window.localStorage.getItem('grape-added' + selectedAccount)
    if (!stored && selectedAccount) {
      setShow(true)
    }
  }, [selectedAccount])

  const registerToken = async () => {
    try {
      const tokenRegistered = await window.ethereum.request({
        method: 'wallet_watchAsset',
        params: {
          type: 'ERC20',
          options: {
            address: getAddress(chainId, Contracts.GrapeToken),
            symbol: 'GRAPE',
            decimals: 18,
            image: `${window.location.origin}/grape-logo.png`,
          },
        },
      })

      if (tokenRegistered) {
        window.localStorage.setItem('grape-added' + selectedAccount, 'true')
        setShow(false)
      }
    } catch (e) {
      setShow(true)
    }
  }

  const visible = show && isMetamask

  return {
    visible,
    registerToken,
  }
}

export default useRegisterGrape
