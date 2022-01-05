import * as React from 'react'
import { FC } from 'react'
import styled, { css } from 'styled-components'
import { BeatLoader } from 'react-spinners'

const StyledButton = styled.button`
  cursor: ${(props) => (props.onClick ? 'pointer' : 'auto')};
  background: #9c1048;
  border: 2px solid white;
  padding: 15px 45px;
  text-align: center;
  text-transform: uppercase;
  transition: 0.5s;
  background-size: 200% auto;
  color: white;
  border-radius: 10px;
  display: block;
  text-transform: uppercase;
  font-size: 1rem;
  font-weight: 600;
  letter-spacing: 1px;
  width: 100%;
  background: linear-gradient(
    180deg,
    rgba(174, 38, 87, 1) 0%,
    rgba(147, 18, 64, 1) 100%
  );

  ${(props) =>
    props.disabled &&
    css`
      background: #b5b5b5;
    `}

  &:hover {
    background-position: right center; /* change the direction of the change here */
    color: #fff;
    text-decoration: none;
  }
`
type Props = React.HTMLAttributes<HTMLButtonElement> & {
  loading?: boolean
  disabled?: boolean
}

const Button: FC<Props> = ({ children, loading, disabled, ...props }) => {
  const canClick = !disabled && !loading
  return (
    <StyledButton
      {...props}
      disabled={disabled}
      onClick={canClick && props.onClick}
    >
      {loading && <BeatLoader size={8} color="#fff" />}
      {!loading && children}
    </StyledButton>
  )
}

export default Button
