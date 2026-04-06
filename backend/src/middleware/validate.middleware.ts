import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError, ZodIssue } from 'zod';

export const validate = (schema: ZodSchema) => 
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const validatedData = await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      }) as { body?: any; query?: any; params?: any };

      // 1. req.body CAN be safely reassigned
      if (validatedData.body) {
        req.body = validatedData.body;
      }

      // 2. req.query is read-only, so we empty it and mutate it
      if (validatedData.query) {
        Object.keys(req.query).forEach(key => delete req.query[key as string]);
        Object.assign(req.query, validatedData.query);
      }
      
      // 3. req.params is read-only, so we empty it and mutate it
      if (validatedData.params) {
        Object.keys(req.params).forEach(key => delete req.params[key]);
        Object.assign(req.params, validatedData.params);
      }

      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const formattedErrors = error.issues.map((err: ZodIssue) => ({
          field: err.path.join('.'),
          message: err.message,
          code: err.code 
        }));
        
        console.warn(`[VALIDATION] Error on ${req.method} ${req.originalUrl}:`, formattedErrors);
        
        res.status(422).json({ 
          message: 'Validation failed', 
          errors: formattedErrors 
        });
        return;
      }
      
      next(error);
    }
  };