import { createEndpointRateLimiter } from '@/common/utils/rate-limiter';

describe('Rate Limiter', () => {
  it('should limit the number of requests', () => {
    const limiter = createEndpointRateLimiter({
      maxRequests: 2,
      windowMs: 1000,
    });
  });
});
