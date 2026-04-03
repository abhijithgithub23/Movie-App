import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError, ZodIssue } from 'zod';

export const validate = (schema: ZodSchema) => 
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      // 1. Validate AND capture the sanitized output
      // THE FIX: Added 'as { ... }' to tell TypeScript the expected shape of the output
      const validatedData = await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      }) as { body?: any; query?: any; params?: any };

      // 2. SANITIZE: Reassign the request properties to the stripped/transformed Zod output.
      // We use `??` to ensure we don't accidentally overwrite req.query with undefined 
      // if the schema only validated req.body.
      req.body = validatedData.body ?? req.body;
      req.query = validatedData.query ?? req.query;
      req.params = validatedData.params ?? req.params;

      next();
    } catch (error) {
      if (error instanceof ZodError) {
        // 3. Better Error Structure (Include the code for frontend handling)
        const formattedErrors = error.issues.map((err: ZodIssue) => ({
          field: err.path.join('.'),
          message: err.message,
          code: err.code // e.g., 'invalid_type', 'too_small'
        }));
        
        // 4. Server-side logging for visibility
        console.warn(` Validation Error on ${req.method} ${req.originalUrl}:`, formattedErrors);
        
        // 5. Use 422 Unprocessable Entity for semantic validation failures
        res.status(422).json({ 
          message: 'Validation failed', 
          errors: formattedErrors 
        });
        return;
      }
      
      next(error);
    }
  };