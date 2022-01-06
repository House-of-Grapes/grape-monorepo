import type { AppProps } from 'next/app'
import Head from 'next/head'
import React from 'react'
import { useEffect } from 'react'
import toast, { Toaster } from 'react-hot-toast'
import GlobalStyles from '../components/GlobalStyles'
import { Web3Provider } from '../context//Web3Context'
import { BalanceProvider } from '../context/BalanceContext'
import { HarvestProvider } from '../context/HarvestContext'

function MyApp({ Component, pageProps }: AppProps) {
  useEffect(() => {
    if (!window.ethereum) {
      toast.error(
        'Cannot find a wallet. Please download Metamask or another wallet provider.'
      )
    }
  }, [])
  return (
    <Web3Provider>
      <Head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="true"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono&display=swap"
          rel="stylesheet"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono&family=IBM+Plex+Sans:wght@400;600&display=swap"
          rel="stylesheet"
        ></link>
      </Head>
      <BalanceProvider>
        <HarvestProvider>
          <GlobalStyles />
          <Component {...pageProps} />
          <Toaster containerClassName="toaster" />
        </HarvestProvider>
      </BalanceProvider>
    </Web3Provider>
  )
}

export default MyApp
