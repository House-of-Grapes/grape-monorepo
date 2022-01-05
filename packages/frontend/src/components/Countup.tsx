import Decimal from 'decimal.js'
import * as React from 'react'
import { FC, useRef } from 'react'
import styled, { css } from 'styled-components'

import useCounter from '../hooks/useCounter'

export type Props = {
  value: number | string
}

const Item = styled.span``

const Countup: FC<Props> = ({ value, ...props }) => {
  const nodeRef = useRef<HTMLElement>()
  useCounter({
    value,
    onUpdate: (updated) => {
      if (nodeRef.current) {
        nodeRef.current.textContent = new Decimal(updated)
          .toDecimalPlaces(2)
          .toString()
      }
    },
  })

  if (typeof window === 'undefined') {
    return (
      <Item {...props} ref={nodeRef}>
        {value}
      </Item>
    )
  }

  return <Item {...props} ref={nodeRef} />
}

export default Countup
