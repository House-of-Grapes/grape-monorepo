import dayjs from 'dayjs'
import { FC } from 'react'
import useCountdown from '../hooks/useCountdown'
import duration from 'dayjs/plugin/duration'
import styled from 'styled-components'

dayjs.extend(duration)

const Container = styled.div`
  margin-bottom: 1rem;
`
const Countdown: FC = () => {
  const { diff } = useCountdown()

  if (!diff) {
    return null
  }

  const diffDate = dayjs.duration(diff)
  const formatNumber = (num: number) => (num < 10 ? '0' + num : num)
  const minute = formatNumber(diffDate.minutes())
  const hour = formatNumber(diffDate.hours())
  const seconds = formatNumber(diffDate.seconds())
  return (
    <Container>
      Can harvest new $GRAPE in:
      <h3>
        {hour}:{minute}:{seconds}
      </h3>
    </Container>
  )
}

export default Countdown
