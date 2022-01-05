import * as React from 'react'
import { FC, useState } from 'react'
import styled, { css } from 'styled-components'
import { useWeb3 } from '../context/Web3Context'
import useConscription from '../hooks/useConscription'
import useGrapeBalance from '../hooks/useGrapeBalance'
import useStakedBalance from '../hooks/useStakedBalance'
import { formatAddressToShort, formatBalance } from '../utils/formatter'
import { Check, PlusCircle } from 'react-feather'
import { PuffLoader } from 'react-spinners'
import { motion } from 'framer-motion'
import { useHarvestContext } from '../context/HarvestContext'
import { romeDao } from '../utils/styles'
import useRegisterGrape from '../hooks/useRegisterGrape'

const Account = styled.div`
  border-radius: 9999px;
  padding-left: 2rem;
  padding-right: 2rem;
  padding-top: 0.75rem;
  padding-bottom: 0.75rem;
  font-size: 1rem;
  line-height: 1.5rem;
  font-weight: 500;
  background: rgb(255 255 255 / 36%);
  display: inline-flex;
  align-items: center;

  svg {
    margin-right: 0.5rem;
  }
`

const HouseLink = styled.a`
  font-weight: 600;
`

const Wrapper = styled.div`
  width: 100%;
  background: #9c1048;
  padding: 30px;
  border-radius: 30px;
  box-shadow: 0.3px 1.3px 0.8px rgba(0, 0, 0, 0.012),
    0.8px 3.1px 2px rgba(0, 0, 0, 0.016), 1.5px 5.8px 3.8px rgba(0, 0, 0, 0.018),
    2.7px 10.3px 6.7px rgba(0, 0, 0, 0.022),
    5px 19.2px 12.5px rgba(0, 0, 0, 0.029), 12px 46px 30px rgba(0, 0, 0, 0.05);
  border-radius: 16px;
  border: 1px solid rgb(255 255 255 / 20%);
  max-width: 100%;

  @media (min-width: 930px) {
    width: 350px;
  }

  @media (min-width: 1230px) {
    width: 550px;
  }
`

const variants = {
  show: {
    x: 0,
    opacity: 1,
  },
  hide: {
    x: 20,
    opacity: 0,
  },
}

const Item = styled(motion.div).attrs(() => ({
  variants,
}))<{ header?: boolean; last?: boolean }>`
  border-bottom: 1px solid rgb(255 255 255 / 16%);
  padding: 0.5rem 0;

  a {
    color: white;
    text-decoration: none;
    display: block;
    transition: opacity 0.4s ease;

    &:hover {
      opacity: 0.7;
      color: white;
    }
  }

  ${(props) =>
    props.header &&
    css`
      font-weight: bold;
      font-size: 1.2rem;
    `}

  ${(props) =>
    props.last &&
    css`
      border: none;
    `}
`
const Spacer = styled.div`
  height: 3rem;
`
const Loader = styled.div`
  margin: 2rem;
  display: flex;
  align-items: center;
  justify-content: center;
`

const Topbar = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1rem;
`

const Register = styled.div`
  display: flex;
  align-items: center;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: opacity 0.4s ease;
  &:hover {
    opacity: 0.7;
  }

  svg {
    margin-right: 4px;
  }
`

const InfoArea: FC = () => {
  const { selectedAccount } = useWeb3()
  const { canInitialClaim } = useHarvestContext()
  const grape = useGrapeBalance([canInitialClaim])
  const rome = useStakedBalance()
  const { profile, isLoading: isLoadingProfile } = useConscription()
  const isLoading = isLoadingProfile || grape.isLoading || rome.isLoading
  const [mounted, setMounted] = useState(false)
  const { visible, registerToken } = useRegisterGrape()

  React.useEffect(() => {
    setMounted(true)
  }, [])

  if (isLoading || !mounted) {
    return (
      <Wrapper>
        <Loader>
          <PuffLoader color="white" />
        </Loader>
      </Wrapper>
    )
  }

  return (
    <Wrapper>
      <Topbar>
        {selectedAccount && (
          <>
            <Account>
              <Check />
              {formatAddressToShort(selectedAccount)}
            </Account>
            <Spacer />
          </>
        )}
        {visible && (
          <Register onClick={() => registerToken()}>
            <PlusCircle />
            <span>Add $GRAPE to Metamask</span>
          </Register>
        )}
      </Topbar>
      <motion.div
        transition={{
          staggerChildren: 0.12,
        }}
        animate={'show'}
        initial="hide"
      >
        <Item header>$GRAPE</Item>
        <Item>Your $GRAPE balance: {formatBalance(grape.balance)}</Item>
        <Item last>You have staked: {formatBalance(rome.balance)} $ROME</Item>
        <Spacer />

        <div>
          <Item header>House and Conscription</Item>
          <Item last>
            {profile && (
              <div>
                {profile.romeClass} for House of {profile.house}
              </div>
            )}
            {!profile && (
              <div>
                You are not part of a House yet. Select your class and
                allegiance at{' '}
                <HouseLink href="https://romedao.finance/house">
                  https://romedao.finance/house
                </HouseLink>
              </div>
            )}
          </Item>
          <Spacer />
        </div>

        <Item header>Social</Item>
        <Item>
          <a
            href="https://twitter.com/House_of_Grapes"
            target="_blank"
            rel="noreferrer"
          >
            Twitter
          </a>
        </Item>
        <Item last>
          <a
            href="https://discord.gg/Mt6pFxmz"
            target="_blank"
            rel="noreferrer"
          >
            Discord
          </a>
        </Item>
      </motion.div>
    </Wrapper>
  )
}

export default InfoArea
