/**
 * Authentication middleware
 */

import type { Context, Next } from 'hono';
import type { Env } from '../types';
import { initializeLucia } from '../lib/auth';

/**
 * Middleware to verify user session
 */
export async function requireAuth(c: Context<{ Bindings: Env }>, next: Next) {
  const lucia = initializeLucia(c.env.DB);

  const sessionId = c.req.cookie('auth_session');

  if (!sessionId) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  const { session, user } = await lucia.validateSession(sessionId);

  if (!session) {
    return c.json({ error: 'Invalid or expired session' }, 401);
  }

  // Attach user to context
  c.set('user', user);
  c.set('session', session);

  await next();
}

/**
 * Optional auth middleware - doesn't block if not authenticated
 */
export async function optionalAuth(c: Context<{ Bindings: Env }>, next: Next) {
  const lucia = initializeLucia(c.env.DB);

  const sessionId = c.req.cookie('auth_session');

  if (sessionId) {
    const { session, user } = await lucia.validateSession(sessionId);

    if (session && user) {
      c.set('user', user);
      c.set('session', session);
    }
  }

  await next();
}
