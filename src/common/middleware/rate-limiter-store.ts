import type { RequestWithUser } from '@/common/types';
import type { NextFunction, Response } from 'express';

export interface UserRateLimit {
  endpoints: {
    [index: string]: number[];
  };
}

export interface Users {
  [index: string]: UserRateLimit;
}

export const users: Users = {};

const cleanupStore = (windowMs: number) => {
  const now = Date.now();
  for (const id in users) {
    for (const endpoint in users[id]) {
      users[id].endpoints[endpoint] = users[id].endpoints[endpoint].filter((time) => now - time < windowMs);
      if (users[id].endpoints[endpoint].length === 0) {
        delete users[id].endpoints[endpoint];
      }
    }
    if (Object.keys(users[id]).length === 0) {
      delete users[id];
    }
  }
};

export const createCleanupMiddleware = (windowMs: number, cleanupInterval: number) => {
  setInterval(() => cleanupStore(windowMs), cleanupInterval);

  return (req: RequestWithUser, res: Response, next: NextFunction) => {
    // This middleware doesn't need to do anything on each request
    // It's just here to initialize the cleanup interval
    next();
  };
};

export const addRequest = (
  // either a username or an IP address
  id: string,
  endpoint: string,
  timestamp: number,
) => {
  if (!users[id]) {
    users[id] = { endpoints: {} };
  }
  if (!users[id].endpoints[endpoint]) {
    users[id].endpoints[endpoint] = [];
  }
  users[id].endpoints[endpoint].push(timestamp);
};

export const getRequests = (userId: string, endpoint: string): number[] => {
  return users[userId].endpoints[endpoint] || [];
};
