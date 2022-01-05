import pino from 'pino'
import pinoms from 'pino-multi-stream'
import fs from 'fs'

const prettyStream = pinoms.prettyStream({
  prettyPrint: {
    colorize: true,
    levelFirst: true,
    translateTime: 'yyyy-dd-mm, h:MM:ss TT',
  },
})

const streams = [
  { stream: fs.createWriteStream(`${process.cwd()}/logger.log`) },
  { stream: prettyStream },
]

export const logger = pino({ level: 'info' }, pinoms.multistream(streams))
