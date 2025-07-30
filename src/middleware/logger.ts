import type { Request, Response, NextFunction } from 'express';

export const logger = (req: Request, res: Response, next: NextFunction) => {
  const timestamp = new Date().toISOString();
  const user = req.user ? ` | user: ${req.user.email || req.user.userId}` : ' | unauthenticated';

  console.log(`[${timestamp}] ${req.method} ${req.originalUrl}${user}`);

  // Optionally log request body for POST/PUT (disable in production)
  if (['POST', 'PUT', 'PATCH'].includes(req.method)) {
    console.log('Request Body:', req.body);
  }

  next();
};
