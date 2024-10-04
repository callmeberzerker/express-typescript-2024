import { type UserRateLimit, users } from '@/common/middleware/rate-limiter-store';
import type { RequestWithUser } from '@/common/types';
import { ENV } from '@/common/utils/env';
import type { NextFunction, Response } from 'express';

const createRateLimiter = ({
  windowMs = ENV.COMMON_RATE_LIMIT_WINDOW_MS,
  maxRequests = ENV.COMMON_RATE_LIMIT_MAX_REQUESTS,
}: {
  windowMs?: number;
  maxRequests?: number;
}) => {
  return (req: RequestWithUser, res: Response, next: NextFunction) => {
    // first try to use the username - fallback to the IP
    const key = (req?.user?.username || (req.ip as string)) as string;
    const now = Date.now();

    if (!users[key]) {
      users[key] = { endpoints: {} };
    }

    const user: UserRateLimit = users[key];
    const endpoint = req.path;

    if (!user.endpoints[endpoint]) {
      user.endpoints[endpoint] = [];
    }

    let requests = user.endpoints[endpoint];

    // Remove requests outside the current window
    requests = requests.filter((time: number) => now - time < windowMs);
    user.endpoints[endpoint] = requests;

    if (requests.length >= maxRequests) {
      const oldestRequest = requests[0];
      const resetTime = oldestRequest + windowMs;
      const retryAfter = Math.ceil((resetTime - now) / 1000);

      // Set headers
      res.set({
        'X-RateLimit-Limit': String(maxRequests),
        'X-RateLimit-Remaining': '0',
        'X-RateLimit-Reset': String(resetTime),
        'Retry-After': String(retryAfter),
      });

      return res.status(429).send('Too many requests, please try again later.');
    }

    // Add current request
    requests.push(now);

    // Set remaining requests header
    res.set('X-RateLimit-Remaining', String(maxRequests - requests.length));

    next();
  };
};

// Default rate limiter
export const defaultRateLimiter = createRateLimiter({});

// Higher-order function for creating endpoint-specific rate limiters
export const createEndpointRateLimiter = createRateLimiter;
