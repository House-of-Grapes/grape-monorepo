import type { NextPage } from 'next'
import React from 'react'
import Main from '../components/Main'
import SEO from '../components/SEO'

const Home: NextPage = () => {
  return (
    <>
      <SEO />

      <Main />
    </>
  )
}

export default Home
