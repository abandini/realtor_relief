/**
 * Rate limiting middleware using Cloudflare KV
 */

import type { Context, Next } from 'hono';
import type { Env } from '../types';

interface RateLimitConfig {
  windowMs: number; // Time window in milliseconds
  maxRequests: number; // Maximum requests per window
}

/**
 * Rate limit middleware factory
 */
export function rateLimit(config: RateLimitConfig) {
  return async (c: Context<{ Bindings: Env }>, next: Next) => {
    const ip = c.req.header('cf-connecting-ip') || c.req.header('x-real-ip') || 'unknown';
    const key = `ratelimit:${ip}:${c.req.path}`;

    const kv = c.env.RATE_LIMITING;

    // Get current count
    const data = await kv.get(key, 'json') as { count: number; resetAt: number } | null;

    const now = Date.now();

    if (data && data.resetAt > now) {
      if (data.count >= config.maxRequests) {
        return c.json(
          {
            error: 'Rate limit exceeded',
            retryAfter: Math.ceil((data.resetAt - now) / 1000)
          },
          429
        );
      }

      // Increment count
      await kv.put(
        key,
        JSON.stringify({ count: data.count + 1, resetAt: data.resetAt }),
        { expirationTtl: Math.ceil((data.resetAt - now) / 1000) }
      );
    } else {
      // Start new window
      const resetAt = now + config.windowMs;
      await kv.put(
        key,
        JSON.stringify({ count: 1, resetAt }),
        { expirationTtl: Math.ceil(config.windowMs / 1000) }
      );
    }

    await next();
  };
}

/**
 * Predefined rate limit configurations
 */
export const rateLimits = {
  // Strict rate limit for auth endpoints
  auth: rateLimit({ windowMs: 15 * 60 * 1000, maxRequests: 5 }), // 5 per 15 minutes

  // Standard API rate limit
  api: rateLimit({ windowMs: 60 * 1000, maxRequests: 60 }), // 60 per minute

  // Generous limit for content viewing
  content: rateLimit({ windowMs: 60 * 1000, maxRequests: 100 }), // 100 per minute
};
