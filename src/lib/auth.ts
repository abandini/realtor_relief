/**
 * Authentication utilities using Lucia Auth
 */

import { Lucia } from 'lucia';
import { D1Adapter } from '@lucia-auth/adapter-sqlite';
import type { Env, User } from '../types';

/**
 * Initialize Lucia Auth with D1 adapter
 */
export function initializeLucia(db: D1Database) {
  const adapter = new D1Adapter(db, {
    user: 'users',
    session: 'sessions',
  });

  return new Lucia(adapter, {
    sessionCookie: {
      attributes: {
        secure: true,
        sameSite: 'lax',
      },
    },
    getUserAttributes: (attributes: any) => {
      return {
        email: attributes.email,
        stripe_customer_id: attributes.stripe_customer_id,
        subscription_status: attributes.subscription_status,
        subscription_tier: attributes.subscription_tier,
      };
    },
  });
}

/**
 * Generate a secure random token for magic links
 */
export async function generateToken(): Promise<string> {
  const buffer = new Uint8Array(32);
  crypto.getRandomValues(buffer);
  return Array.from(buffer, (byte) => byte.toString(16).padStart(2, '0')).join('');
}

/**
 * Create or get user by email
 */
export async function createOrGetUser(db: D1Database, email: string): Promise<User> {
  const existing = await db
    .prepare('SELECT * FROM users WHERE email = ?')
    .bind(email)
    .first<User>();

  if (existing) {
    return existing;
  }

  const id = crypto.randomUUID();
  const now = Date.now();

  await db
    .prepare(
      'INSERT INTO users (id, email, created_at, updated_at) VALUES (?, ?, ?, ?)'
    )
    .bind(id, email, now, now)
    .run();

  return {
    id,
    email,
    stripe_customer_id: null,
    subscription_status: 'trial',
    subscription_tier: 'basic',
    created_at: now,
    updated_at: now,
  };
}

/**
 * Create a magic link token
 */
export async function createMagicLink(
  db: D1Database,
  email: string
): Promise<string> {
  const token = await generateToken();
  const id = crypto.randomUUID();
  const expiresAt = Date.now() + 15 * 60 * 1000; // 15 minutes
  const now = Date.now();

  await db
    .prepare(
      'INSERT INTO magic_links (id, email, token, expires_at, created_at) VALUES (?, ?, ?, ?, ?)'
    )
    .bind(id, email, token, expiresAt, now)
    .run();

  return token;
}

/**
 * Verify and consume a magic link token
 */
export async function verifyMagicLink(
  db: D1Database,
  token: string
): Promise<string | null> {
  const link = await db
    .prepare('SELECT * FROM magic_links WHERE token = ? AND used = FALSE')
    .bind(token)
    .first<{ email: string; expires_at: number }>();

  if (!link) {
    return null;
  }

  if (link.expires_at < Date.now()) {
    return null;
  }

  // Mark as used
  await db
    .prepare('UPDATE magic_links SET used = TRUE WHERE token = ?')
    .bind(token)
    .run();

  return link.email;
}

/**
 * Send magic link email (mock implementation)
 */
export async function sendMagicLinkEmail(
  email: string,
  token: string,
  baseUrl: string
): Promise<void> {
  const magicLink = `${baseUrl}/auth/callback?token=${token}`;

  // TODO: Integrate with SendGrid or other email service
  console.log(`
    ====================================
    MAGIC LINK EMAIL (MOCK)
    ====================================
    To: ${email}
    Subject: Login to Agent's Exclusive Access

    Click the link below to log in:
    ${magicLink}

    This link expires in 15 minutes.
    ====================================
  `);

  // In production, use SendGrid:
  // await fetch('https://api.sendgrid.com/v3/mail/send', {
  //   method: 'POST',
  //   headers: {
  //     'Authorization': `Bearer ${env.SENDGRID_API_KEY}`,
  //     'Content-Type': 'application/json',
  //   },
  //   body: JSON.stringify({
  //     personalizations: [{ to: [{ email }] }],
  //     from: { email: 'noreply@agentexclusiveaccess.com' },
  //     subject: 'Login to Agent\'s Exclusive Access',
  //     content: [{ type: 'text/html', value: emailHtml }],
  //   }),
  // });
}
