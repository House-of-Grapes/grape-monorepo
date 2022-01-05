import { useMemo, useEffect, useState, useRef } from 'react'
import { useHarvestContext } from '../context/HarvestContext'
import dayjs, { Dayjs } from 'dayjs'
import { useWeb3 } from '../context/Web3Context'

const useCountdown = (): { diff: number | null } => {
  const { selectedAccount } = useWeb3()
  const { claimingInterval, lastClaimed, fetchData } = useHarvestContext()
  const claimingEnd = useMemo(
    () =>
      lastClaimed && claimingInterval && lastClaimed.add(claimingInterval, 's'),
    [claimingInterval, lastClaimed?.toString()]
  )
  const [diff, setDiff] = useState<number | undefined>()
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    setDiff(undefined)
  }, [selectedAccount])

  useEffect(() => {
    if (claimingEnd) {
      if (typeof diff === 'undefined') {
        if (claimingEnd.diff(dayjs()) < 0) {
          return
        }
      }
      intervalRef.current = setInterval(() => {
        const newDiff = claimingEnd.diff(dayjs())

        if (newDiff > 0) {
          setDiff(newDiff)
        } else {
          fetchData()
          clearInterval(intervalRef.current)
        }
      }, 1000)
    }

    return () => {
      clearInterval(intervalRef.current)
    }
  }, [claimingEnd?.toString()])

  return { diff }
}

export default useCountdown
