import * as React from 'react'
import { FC } from 'react'
import styled from 'styled-components'
import { useWeb3 } from '../context/Web3Context'
import { formatAddressToShort } from '../utils/formatter'
import Button from './Button'

const Container = styled.div``

const ConnectArea: FC = () => {
  const { connect, isConnected, isConnecting, selectedAccount } = useWeb3()

  const showButton = !isConnected || isConnecting

  if (showButton) {
    return (
      <Button onClick={connect}>
        {isConnecting ? 'Connecting ...' : 'Connect wallet'}
      </Button>
    )
  }

  return <div>{formatAddressToShort(selectedAccount)}</div>
}

export default ConnectArea
