import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';
import { ERROR_CODES } from '@shared/schemas';

type RequestLocation = 'body' | 'query' | 'params';

export function validate(schema: ZodSchema, location: RequestLocation = 'body') {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      const data = req[location];
      const result = schema.safeParse(data);

      if (!result.success) {
        const errors = formatZodErrors(result.error);
        res.status(400).json({
          success: false,
          error: {
            code: ERROR_CODES.VALIDATION_ERROR,
            message: 'Validation failed',
            details: errors,
          },
        });
        return;
      }

      // Replace with parsed data (includes defaults and transformations)
      req[location] = result.data;
      next();
    } catch (error) {
      console.error('Validation error:', error);
      res.status(400).json({
        success: false,
        error: {
          code: ERROR_CODES.INVALID_INPUT,
          message: 'Invalid input',
        },
      });
    }
  };
}

function formatZodErrors(error: ZodError): Record<string, string> {
  const errors: Record<string, string> = {};

  for (const issue of error.issues) {
    const path = issue.path.join('.');
    errors[path] = issue.message;
  }

  return errors;
}

// Validate multiple locations
export function validateMultiple(schemas: {
  body?: ZodSchema;
  query?: ZodSchema;
  params?: ZodSchema;
}) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const allErrors: Record<string, string> = {};

    for (const [location, schema] of Object.entries(schemas)) {
      if (!schema) continue;

      const data = req[location as RequestLocation];
      const result = schema.safeParse(data);

      if (!result.success) {
        const errors = formatZodErrors(result.error);
        for (const [key, value] of Object.entries(errors)) {
          allErrors[`${location}.${key}`] = value;
        }
      } else {
        req[location as RequestLocation] = result.data;
      }
    }

    if (Object.keys(allErrors).length > 0) {
      res.status(400).json({
        success: false,
        error: {
          code: ERROR_CODES.VALIDATION_ERROR,
          message: 'Validation failed',
          details: allErrors,
        },
      });
      return;
    }

    next();
  };
}
