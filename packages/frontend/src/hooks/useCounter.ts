import Decimal from 'decimal.js'
import { animate } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'

type Options = {
  value: number | string
  onUpdate: (value: any) => void
}

const useCounter = ({ value, onUpdate }: Options) => {
  const ref = useRef<number | string>(0)
  const prev = ref.current
  const from = 0
  const to = new Decimal(value).toNumber()

  useEffect(() => {
    ref.current = value
  }, [value])

  useEffect(() => {
    const controls = animate(from, to, {
      duration: 1.7,
      onUpdate,
    })

    return () => controls.stop()
  }, [from, to])
}

export default useCounter
