import { useMemo, useEffect, useState } from 'react'
import { Contracts, getAddress } from '@grape/shared'
import { useWeb3 } from '../context/Web3Context'
import { RomeConscription__factory } from '@grape/contracts'
import { BigNumber } from '@ethersproject/bignumber'
import toast from 'react-hot-toast'
import { mainNetProvider } from '../utils/web3'
import { ethers } from 'ethers'

type Profile = null | { romeClass: string; house: string }
const useConscription = (): { isLoading: boolean; profile: Profile } => {
  const [isLoading, setIsLoading] = useState(false)
  const [profile, setProfile] = useState<Profile>(null)
  const { chainId, selectedAccount } = useWeb3()
  const address = getAddress(chainId, Contracts.RomeConscription)

  const contract = useMemo(
    () => RomeConscription__factory.connect(address, mainNetProvider),
    [address, mainNetProvider]
  )

  const getProfile = async () => {
    setProfile(null)
    try {
      const profile = await contract.profiles(selectedAccount)
      if (BigNumber.from(profile.house).eq(ethers.constants.Zero)) {
        return
      }

      const [selectedHouseId] = await Promise.all([
        contract.getIdForHouse(profile.house),
      ])
      const houseMap = {
        '1': 'Vagabond',
        '2': 'Sempronia',
        '3': 'Consul',
        '4': 'Grapes',
        '5': 'Chaos',
        '6': 'Kek',
      }

      const classesMap = {
        '0': 'Infantry',
        '1': 'Archer',
        '2': 'Cavalry',
      }

      setProfile({
        romeClass:
          classesMap[profile.classId.toString() as keyof typeof classesMap],
        house: houseMap[selectedHouseId.toString() as keyof typeof houseMap],
      })
    } catch (e) {
      toast.error('Could not fetch balance: ', e.message)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (contract && selectedAccount) {
      setIsLoading(true)
      getProfile()
    }
  }, [Boolean(contract), selectedAccount])

  return { profile, isLoading }
}

export default useConscription
