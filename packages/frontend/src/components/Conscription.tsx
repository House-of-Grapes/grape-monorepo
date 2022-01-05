import * as React from 'react'
import { FC } from 'react'
import styled from 'styled-components'
import useConscription from '../hooks/useConscription'

const Container = styled.div`
  position: fixed;
  bottom: 20px;
  right: 20px;
`

const Conscription: FC = () => {
  const { profile } = useConscription()

  if (profile) {
    return (
      <Container>
        <div>
          {profile.romeClass} for House of {profile.house}
        </div>
      </Container>
    )
  }
  return <div></div>
}

export default Conscription
