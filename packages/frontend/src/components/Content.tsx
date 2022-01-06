import * as React from 'react'
import { FC } from 'react'
import styled from 'styled-components'
import ClaimArea from './ClaimArea'
import InfoArea from './InfoArea'

const Container = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;

  @media (max-width: 930px) {
    flex-flow: column;
    flex-direction: column-reverse;
    margin-top: 2rem;
    padding: 2rem;
  }

  @media (max-width: 500px) {
    padding: 0rem;
    margin-top: 4rem;
  }
`
const Part = styled.div`
  @media (max-width: 930px) {
    margin: 0 auto;
    margin-bottom: 3rem;
    width: 100%;
    max-width: 500px;
  }
`
const SecondPart = styled(Part)``

const Content: FC = () => {
  return (
    <Container>
      <Part>
        <InfoArea />
      </Part>
      <SecondPart>
        <ClaimArea />
      </SecondPart>
    </Container>
  )
}

export default Content
