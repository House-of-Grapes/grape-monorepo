import * as React from 'react'
import { FC } from 'react'
import styled, { css } from 'styled-components'
import { useHarvestContext } from '../context/HarvestContext'
import { useWeb3 } from '../context/Web3Context'
import { brand } from '../utils/styles'
import Button from './Button'
import { AnimatePresence, motion } from 'framer-motion'
import { XSquare, CheckSquare } from 'react-feather'
import { formatBalance } from '../utils/formatter'
import Countdown from './Countdown'
import Countup from './Countup'
import { useBalanceContext } from '../context/BalanceContext'

const Wrapper = styled.div`
  position: relative;
  width: 100%;

  @media (min-width: 930px) {
    margin-left: 50px;
    width: 490px;
    max-width: 490px;
  }

  a {
    color: ${brand};
    font-weight: bold;
  }
`

const Container = styled.div`
  background: rgb(255, 255, 255);
  box-shadow: rgb(0 0 0 / 2%) 0px 3px 8px;
  border-radius: 16px;
  padding: 1.5rem;
  border: 1px solid rgba(0, 0, 0, 0.09);
  color: #222;

  box-shadow: 0.3px 1.3px 0.8px rgba(0, 0, 0, 0.012),
    0.8px 3.1px 2px rgba(0, 0, 0, 0.016), 1.5px 5.8px 3.8px rgba(0, 0, 0, 0.018),
    2.7px 10.3px 6.7px rgba(0, 0, 0, 0.022),
    5px 19.2px 12.5px rgba(0, 0, 0, 0.029), 12px 46px 30px rgba(0, 0, 0, 0.05);
`

const Title = styled.h3`
  font-size: 2rem;
  font-weight: bold;
  text-transform: uppercase;
  margin-bottom: 1rem;

  span {
    color: ${brand};
  }
`

const WrongChain = styled(motion.div)`
  margin-top: 1rem;
  font-family: 'IBM Plex Mono', monospace;
  cursor: pointer;
  position: absolute;
  left: 0%;
  width: 100%;
  bottom: -50px;
  text-align: center;

  @media (max-width: 930px) {
    bottom: 0px;
    position: relative;
    margin-top: 4rem;
  }
`

const Receive = styled.div`
  background: rgb(255, 255, 255);
  box-shadow: rgb(0 0 0 / 2%) 0px 3px 8px;
  border-radius: 16px;
  border: 1px solid rgba(0, 0, 0, 0.09);
  padding: 1.5rem;
  margin-top: 1rem;
  margin-bottom: 1rem;

  figure {
    font-size: 2rem;
    font-weight: bold;
  }
`

const EligbleStatus = styled(motion.div)<{ haveStaked?: boolean }>`
  border-radius: 9999px;
  padding-left: 2rem;
  padding-right: 2rem;
  padding-top: 0.25rem;
  padding-bottom: 0.25rem;
  font-size: 1rem;
  line-height: 1.5rem;
  display: inline-flex;
  align-self: center;
  font-weight: 500;
  position: absolute;
  background: rgb(255 255 255 / 36%);
  top: 0px;
  left: 50%;
  width: fit-content;
  align-items: center;

  @media (max-width: 930px) {
    top: -20px;
  }
  svg {
    margin-right: 6px;
  }
`

const InitialArea = styled.div`
  margin-top: 1rem;
`

const ClaimArea: FC = () => {
  const {
    connect,
    isConnected,
    isConnecting,
    selectedAccount,
    isCorrectChain,
    switchToChain,
  } = useWeb3()
  const {
    isEligble,
    harvestAmount,
    canInitialClaim,
    isClaiming,
    claimTokens,
    isLoading,
    isClaimingInitial,
    claimInitial,
  } = useHarvestContext()
  const { sRome } = useBalanceContext()
  const onClick = isConnected ? claimTokens : connect
  let buttonText = 'Connect'

  if (isConnecting) {
    buttonText = 'Connecting ...'
  } else if (selectedAccount) {
    buttonText = 'Claim'
  }
  const showEligbleStatus = !isLoading && selectedAccount && !sRome.isLoading
  const haveStaked = !sRome.balance.isZero()
  let textBody = null

  if (isConnected && !isLoading) {
    if (haveStaked) {
      textBody =
        'You are eligble for the airdrop! View your tokens below, and start the claim process. You can claim once every 24h'
    } else {
      textBody = (
        <span>
          You are not eligble for the $GRAPE token claim. You need to stake
          $ROME on{' '}
          <a href="https://romedao.finance" target="_blank" rel="noreferrer">
            https://romedao.finance
          </a>{' '}
          first
        </span>
      )
    }
  } else {
    textBody = 'Connect your wallet to start collecting your daily $GRAPE'
  }
  return (
    <Wrapper>
      <AnimatePresence>
        {showEligbleStatus && (
          <EligbleStatus
            haveStaked={haveStaked}
            initial={{ opacity: 0, y: 0, x: '-50%' }}
            animate={{ opacity: 1, y: -50, x: '-50%' }}
          >
            {haveStaked ? <CheckSquare /> : <XSquare />}
            {haveStaked
              ? 'You are eligble for the airdrop!'
              : 'You need to stake $ROME in order to be eligble'}
          </EligbleStatus>
        )}
      </AnimatePresence>
      <Container>
        <Title>
          Claim your <span>$GRAPE</span>
        </Title>
        <p>{textBody}</p>

        <Receive>
          <label>You will receive </label>
          <figure>
            {harvestAmount && <Countup value={formatBalance(harvestAmount)} />}{' '}
            $GRAPE
          </figure>
        </Receive>
        <Countdown />

        <Button
          loading={isClaiming || isConnecting}
          disabled={(!isEligble || !isCorrectChain) && isConnected}
          onClick={onClick}
        >
          {buttonText}
        </Button>
        {canInitialClaim && isConnected && (
          <InitialArea>
            <p>
              We give out an initial airdrop to everyone who staked $ROME when
              the snapshot was taken. This 1000 $GRAPES can only be claimed
              once.
            </p>
            <Receive>
              <label>You will receive </label>
              <figure>1000 $GRAPE</figure>
            </Receive>
            <Button
              loading={isClaimingInitial}
              disabled={!canInitialClaim || !isCorrectChain}
              onClick={claimInitial}
            >
              {buttonText}
            </Button>
          </InitialArea>
        )}
      </Container>

      <AnimatePresence>
        {!isCorrectChain && isConnected && (
          <>
            <WrongChain
              initial={{ opacity: 0, y: 0 }}
              animate={{ opacity: 1, y: -10 }}
              onClick={() => switchToChain()}
            >
              Incorrect Chain! Click to switch
            </WrongChain>
          </>
        )}
      </AnimatePresence>
    </Wrapper>
  )
}

export default ClaimArea
