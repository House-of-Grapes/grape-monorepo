import type { NextPage } from 'next'
import React from 'react'
import Main from '../components/Main'
import SEO from '../components/SEO'
import SuccessScreen from '../components/SuccessScreen'

const Home: NextPage = () => {
  return (
    <>
      <SEO />
      <SuccessScreen />
      <Main />
    </>
  )
}

export default Home
