import { AnimatePresence, motion } from 'framer-motion'
import JSConfetti from 'js-confetti'
import * as React from 'react'
import { useEffect } from 'react'
import { FC } from 'react'
import styled from 'styled-components'
import { useHarvestContext } from '../context/HarvestContext'

const Container = styled(motion.div)`
  position: fixed;
  height: 100%;
  width: 100%;
  z-index: 1050;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgb(174, 38, 87);
  background: linear-gradient(
    180deg,
    rgba(174, 38, 87, 0) 0%,
    rgba(162, 29, 76, 0.6867121848739496) 42%,
    rgba(147, 18, 64, 1) 100%
  );
`

const Text = styled(motion.h1)`
  font-size: 3rem;
  text-align: center;
  text-transform: uppercase;
  position: relative;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
  text-shadow: 2px 3px 10px rgb(0 0 0 / 25%);
  font-weight: bold;
  @media (min-width: 930px) {
    font-size: 6rem;
  }

  span {
    display: inline-block;
    position: relative;
    width: auto;
  }
`

const Word = styled.div`
  margin-right: 1rem;
`

const Inner = styled.div`
  margin: 0 15vw;
  max-width: 1000px;
  margin: 0 auto;
`

const sentences = [
  'May your grapes grow with you!',
  'Fruitful ventures ahead',
  'In wine there is truth',
  'The vine prospers while the wine ages',
  'Better to spoil the grapes, then to spoil the wine',
  'Bunch together as grapes to flow forth like wine',
]

const randomInt = (prev?: number) => {
  const getInt = () =>
    Math.floor(Math.random() * (sentences.length - 1 - 0 + 1) + 0)
  let result = getInt()
  while (prev === result) {
    result = getInt()
  }

  return result
}

const SuccessScreen: FC = () => {
  const { haveClaimed, haveInitialClaimed } = useHarvestContext()
  const [show, setShow] = React.useState(false)
  const [randomIndex, setRandomIndex] = React.useState(randomInt())

  useEffect(() => {
    if (haveClaimed || haveInitialClaimed) {
      setShow(true)
      setTimeout(() => {
        const jsConfetti = new JSConfetti()

        jsConfetti.addConfetti({
          emojis: ['🍇'],
          emojiSize: 110,
          confettiNumber: 270,
        })
      }, 350)
    }
  }, [haveClaimed, haveInitialClaimed])

  const sentence = {
    hide: { transition: { staggerChildren: 0.015 } },
    show: { transition: { staggerChildren: 0.03, delayChildren: 1 } },
  }

  const letters = {
    show: {
      opacity: 1,
      y: 0,
      transition: {
        type: 'spring',
        damping: 12,
        stiffness: 200,
      },
    },
    hide: {
      opacity: 0,
      y: 20,
      transition: {
        type: 'spring',
        damping: 12,
        stiffness: 200,
      },
    },
  }

  const words = sentences[randomIndex].split(' ')

  return (
    <AnimatePresence
      onExitComplete={() => {
        setRandomIndex(randomInt(randomIndex))
      }}
    >
      {show && (
        <Container
          initial={{ opacity: 0, y: 50 }}
          exit={{ opacity: 0, transition: { delay: 1, duration: 0.8 } }}
          animate={{ opacity: 1, y: 0 }}
          key={randomIndex}
        >
          <Inner>
            <Text
              initial="hide"
              animate="show"
              exit="hide"
              variants={sentence}
              onAnimationComplete={() => {
                setTimeout(() => {
                  setShow(false)
                }, 2600)
              }}
            >
              {words.map((word, wordIndex) => (
                <Word key={wordIndex + word}>
                  {word.split('').map((char, i) => (
                    <motion.span key={i} variants={letters}>
                      {char === ' ' ? '\u00A0' : char}
                    </motion.span>
                  ))}
                </Word>
              ))}
            </Text>
          </Inner>
        </Container>
      )}
    </AnimatePresence>
  )
}

export default SuccessScreen
