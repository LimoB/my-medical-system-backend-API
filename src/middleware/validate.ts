import { ZodError, AnyZodObject } from 'zod';
import { Request, Response, NextFunction } from 'express';

type Schemas = {
  body?: AnyZodObject;
  params?: AnyZodObject;
  query?: AnyZodObject;
};

const validate = (schemas: Schemas) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      if (schemas.body) {
        const parsedBody = schemas.body.parse(req.body);
        req.body = parsedBody;
      }

      if (schemas.params) {
        const parsedParams = schemas.params.parse(req.params);
        req.params = parsedParams;
      }

      if (schemas.query) {
        const parsedQuery = schemas.query.parse(req.query);
        req.query = parsedQuery;
      }

      next();
    } catch (err) {
      if (err instanceof ZodError) {
        res.status(400).json({
          error: 'Validation failed',
          details: err.errors,
        });
      } else {
        res.status(500).json({
          error: 'Internal server error during validation',
        });
      }
    }
  };
};

export default validate;
