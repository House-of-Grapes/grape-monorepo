import * as React from 'react'
import { FC } from 'react'
import styled from 'styled-components'
import Content from './Content'

const Container = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  position: relative;
  z-index: 4;

  @media (min-width: 930px) {
    height: 100%;
  }
`

const Inner = styled.div`
  position: relative;
  z-index: 4;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
`
const Header = styled.div`
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;

  @media (min-width: 930px) {
    position: fixed;
    top: 1rem;
    left: 0rem;
  }

  @media (max-width: 930px) {
    margin-top: 2rem;
  }
`
const Logo = styled.div`
  width: 200px;

  @media (max-width: 930px) {
    width: 150px;
  }
`

const Main: FC = () => {
  return (
    <Container>
      <Header>
        <Logo>
          <img alt="House of Grapes" src="/logo.png" />
        </Logo>
      </Header>
      <Inner>
        <Content />
      </Inner>
    </Container>
  )
}

export default Main
