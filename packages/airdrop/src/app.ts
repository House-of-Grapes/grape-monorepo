import express, { Application, Request, Response, NextFunction } from 'express'

import cors from 'cors'
import pino from 'pino-http'

import { AppError } from './types'
import { start } from './web3'

const app: Application = express()

start()
app.use(pino())
app.use(express.urlencoded({ extended: false }))
app.use(express.json())
app.use(cors())

app.use((req: Request, res: Response, next: NextFunction) => {
  const error: AppError = new Error('Not found')
  error.status = 404
  next(error)
})

app.use((err: AppError, req: Request, res: Response) => {
  res.status(err.status || 500).json({
    error: {
      message: err.message,
    },
  })
})

export default app
