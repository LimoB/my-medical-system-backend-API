import { ZodError, type AnyZodObject } from 'zod';
import type { Request, Response, NextFunction } from 'express';

type Schemas = {
  body?: AnyZodObject | AnyZodObject[];
  params?: AnyZodObject;
  query?: AnyZodObject;
};

const validate = (schemas: Schemas) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      // ──────────────
      // Body Validation
      // ──────────────
      if (schemas.body) {
        const bodySchemas = Array.isArray(schemas.body) ? schemas.body : [schemas.body];

        let parsedBody;
        let matched = false;

        for (const schema of bodySchemas) {
          try {
            parsedBody = schema.parse(req.body);
            matched = true;
            break;
          } catch (_) {
            continue;
          }
        }

        if (!matched) {
          throw new ZodError([
            {
              path: ['body'],
              message: 'Request body does not match any of the expected schemas',
              code: 'custom',
            },
          ]);
        }

        req.body = parsedBody;
      }

      // ──────────────
      // Params Validation
      // ──────────────
      if (schemas.params) {
        const parsedParams = schemas.params.parse(req.params);
        req.params = parsedParams;
      }

      // ──────────────
      // Query Validation
      // ──────────────
      if (schemas.query) {
        const parsedQuery = schemas.query.parse(req.query);
        req.query = parsedQuery;
      }

      next();
    } catch (err) {
      if (err instanceof ZodError) {
        res.status(400).json({
          error: 'Validation failed',
          details: err.flatten().fieldErrors,
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
