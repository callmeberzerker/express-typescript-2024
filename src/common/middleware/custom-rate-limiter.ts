import type { RequestWithUser } from "@/common/types";
import { ENV } from "@/common/utils/env";
import type { NextFunction, Response } from "express";

const rateLimiter = (windowMs: number, maxRequests: number) => {
  const users: Record<string, { requests: number[] }> = {};

  const cleanup = () => {
    const now = Date.now();
    for (const key in users) {
      users[key].requests = users[key].requests.filter(
        (time) => now - time < windowMs
      );
      if (users[key].requests.length === 0) {
        delete users[key];
      }
    }
  };

  // Run cleanup every 5 minutes
  setInterval(cleanup, 5 * 60 * 1000);

  return (req: RequestWithUser, res: Response, next: NextFunction) => {
    // first try to use the username - fallback to the IP
    const key = (req?.user?.username || (req.ip as string)) as string;
    const now = Date.now();
    const user = users[key] || { requests: [] };

    // Remove requests outside the current window
    user.requests = user.requests.filter((time) => now - time < windowMs);

    if (user.requests.length >= maxRequests) {
      const oldestRequest = user.requests[0];
      const resetTime = oldestRequest + windowMs;
      const retryAfter = Math.ceil((resetTime - now) / 1000);

      // Set headers
      res.set({
        "X-RateLimit-Limit": String(maxRequests),
        "X-RateLimit-Remaining": "0",
        "X-RateLimit-Reset": String(resetTime),
        "Retry-After": String(retryAfter),
      });

      return res.status(429).send("Too many requests, please try again later.");
    }

    // Add current request
    user.requests.push(now);
    users[key] = user;

    // Set remaining requests header
    res.set(
      "X-RateLimit-Remaining",
      String(maxRequests - user.requests.length)
    );

    next();
  };
};

export default rateLimiter(
  15 * 60 * ENV.COMMON_RATE_LIMIT_WINDOW_MS,
  ENV.COMMON_RATE_LIMIT_MAX_REQUESTS
);
