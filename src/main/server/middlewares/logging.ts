// src/middlewares/errorHandler.ts
import { Request, Response, NextFunction } from 'express'
import logger from '../utils/logger'

const log = (err: any, _req: Request, _res: Response, next: NextFunction) => {
  logger.error(err.stack)
  next(err)
}

export default log
