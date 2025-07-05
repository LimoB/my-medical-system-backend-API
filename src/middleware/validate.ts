import { ZodSchema, ZodError } from 'zod'
import { Request, Response, NextFunction } from 'express'

const validate =
  (schema: ZodSchema) =>
  (req: Request, res: Response, next: NextFunction): void => {
    try {
      const parsed = schema.parse(req.body)
      req.body = parsed
      next()
    } catch (err) {
      if (err instanceof ZodError) {
        res.status(400).json({
          error: 'Validation failed',
          details: err.errors,
        })
      } else {
        // Unexpected error
        res.status(500).json({
          error: 'Internal server error during validation',
        })
      }
    }
  }

export default validate
