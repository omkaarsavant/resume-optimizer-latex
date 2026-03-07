import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';

export function requestLogger(req: Request, res: Response, next: NextFunction) {
  const start = Date.now();
  const { method, url, ip } = req;

  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`[${new Date().toISOString()}] ${method} ${url} ${res.statusCode} ${duration}ms - ${ip}`);
  });

  next();
}

export function errorHandler(err: Error, req: Request, res: Response, next: NextFunction) {
  console.error('Unhandled error:', err.stack);

  res.status(500).json({
    error: 'Internal server error',
    message: err.message,
  });
}

export function corsMiddleware(req: Request, res: Response, next: NextFunction) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');

  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
}

export function rateLimitMiddleware(req: Request, res: Response, next: NextFunction) {
  // Simple rate limiting - can be enhanced with Redis or similar
  const maxRequests = 100;
  const windowMs = 60 * 1000; // 1 minute

  const now = Date.now();
  const key = req.ip || 'default';

  let requests = req.app.get(`rateLimit:${key}`) || [];
  requests = requests.filter(timestamp => now - timestamp < windowMs);

  if (requests.length >= maxRequests) {
    return res.status(429).json({
      error: 'Rate limit exceeded',
      message: `You can make ${maxRequests} requests per minute. Please try again later.`
    });
  }

  requests.push(now);
  req.app.set(`rateLimit:${key}`, requests);

  next();
}