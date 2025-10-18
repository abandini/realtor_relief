/**
 * Agent's Exclusive Access Platform - Main Worker Entry Point
 *
 * A Cloudflare Worker application for real estate agents to create and monetize
 * AI-generated market content with built-in lead capture.
 */

import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { getCookie, setCookie, deleteCookie } from 'hono/cookie';
import { serveStatic } from 'hono/cloudflare-workers';
import { renderToString } from 'preact-render-to-string';

import type { Env, User, ContentAsset, Subscriber, HonoVariables } from './types';

// Middleware
import { requireAuth, optionalAuth } from './middleware/auth';
import { rateLimits } from './middleware/ratelimit';

// Auth utilities
import {
  initializeLucia,
  createOrGetUser,
  createMagicLink,
  verifyMagicLink,
  sendMagicLinkEmail,
} from './lib/auth';

// Views
import { LandingPage } from './views/landing';
import { LoginPage } from './views/login';
import { Dashboard } from './views/dashboard';
import { ContentNewPage } from './views/content-new';
import { ContentDetailPage } from './views/content-detail';
import { PublicContentPage } from './views/public-content';

// Utils
import { generatePDF, formatContentForPDF } from './utils/pdf';

const app = new Hono<{ Bindings: Env; Variables: HonoVariables }>();

// Middleware
app.use('*', logger());
app.use('*', cors());

/**
 * Landing Page Route
 */
app.get('/', optionalAuth, async (c) => {
  const html = renderToString(LandingPage());
  return c.html(html);
});

/**
 * Login Page Route
 */
app.get('/login', (c) => {
  const message = c.req.query('message');
  const error = c.req.query('error');
  const html = renderToString(LoginPage({ message, error }));
  return c.html(html);
});

/**
 * POST /auth/login - Send magic link
 */
app.post('/auth/login', rateLimits.auth, async (c) => {
  try {
    const body = await c.req.parseBody();
    const email = body.email as string;

    if (!email || !email.includes('@')) {
      return c.redirect('/login?error=' + encodeURIComponent('Invalid email address'));
    }

    // Create magic link
    const token = await createMagicLink(c.env.DB, email);

    // Send email (mock for now)
    const baseUrl = new URL(c.req.url).origin;
    await sendMagicLinkEmail(email, token, baseUrl);

    return c.redirect(
      '/login?message=' +
        encodeURIComponent(
          'Check your email! We sent you a magic link to log in.'
        )
    );
  } catch (error) {
    console.error('Login error:', error);
    return c.redirect('/login?error=' + encodeURIComponent('An error occurred'));
  }
});

/**
 * GET /auth/callback - Verify magic link and create session
 */
app.get('/auth/callback', async (c) => {
  try {
    const token = c.req.query('token');

    if (!token) {
      return c.redirect('/login?error=' + encodeURIComponent('Invalid token'));
    }

    // Verify token
    const email = await verifyMagicLink(c.env.DB, token);

    if (!email) {
      return c.redirect(
        '/login?error=' + encodeURIComponent('Token expired or invalid')
      );
    }

    // Create or get user
    const user = await createOrGetUser(c.env.DB, email);

    // Create session using Lucia
    const lucia = initializeLucia(c.env.DB);
    const sessionObj = await lucia.createSession(user.id, {});
    const sessionCookie = lucia.createSessionCookie(sessionObj.id);

    // Set cookie and redirect
    c.header('Set-Cookie', sessionCookie.serialize());
    return c.redirect('/dashboard');
  } catch (error) {
    console.error('Callback error:', error);
    return c.redirect('/login?error=' + encodeURIComponent('An error occurred'));
  }
});

/**
 * POST /auth/logout - Destroy session
 */
app.post('/auth/logout', requireAuth, async (c) => {
  try {
    const sessionData = c.get('session');
    const lucia = initializeLucia(c.env.DB);

    await lucia.invalidateSession(sessionData.id);

    const sessionCookie = lucia.createBlankSessionCookie();
    c.header('Set-Cookie', sessionCookie.serialize());

    return c.redirect('/');
  } catch (error) {
    console.error('Logout error:', error);
    return c.redirect('/dashboard');
  }
});

/**
 * GET /dashboard - Main dashboard
 */
app.get('/dashboard', requireAuth, async (c) => {
  try {
    const user = c.get('user') as User;

    // Fetch user's content assets
    const assets = await c.env.DB.prepare(
      'SELECT * FROM content_assets WHERE user_id = ? AND status = ? ORDER BY created_at DESC'
    )
      .bind(user.id, 'active')
      .all<ContentAsset>();

    // Calculate stats
    const stats = {
      totalAssets: assets.results?.length || 0,
      totalViews: assets.results?.reduce((sum, a) => sum + a.view_count, 0) || 0,
      totalSubscribers: assets.results?.reduce((sum, a) => sum + a.subscriber_count, 0) || 0,
    };

    const html = renderToString(
      Dashboard({ user, assets: assets.results || [], stats })
    );
    return c.html(html);
  } catch (error) {
    console.error('Dashboard error:', error);
    return c.text('Error loading dashboard', 500);
  }
});

/**
 * GET /content/new - Create new content page
 */
app.get('/content/new', requireAuth, async (c) => {
  const user = c.get('user') as User;
  const html = renderToString(ContentNewPage({ user }));
  return c.html(html);
});

/**
 * POST /api/content - Create new content asset using AI
 */
app.post('/api/content', requireAuth, rateLimits.api, async (c) => {
  try {
    const user = c.get('user') as User;
    const body = await c.req.parseBody();

    const title = body.title as string;
    const description = (body.description as string) || '';
    const prompt = body.prompt as string;
    const content_type = (body.content_type as string) || 'pdf';

    if (!title || !prompt) {
      return c.json({ error: 'Title and prompt are required' }, 400);
    }

    // Generate content using Workers AI
    const aiResponse = await c.env.AI.run('@cf/meta/llama-3-8b-instruct', {
      messages: [
        {
          role: 'system',
          content: 'You are a professional real estate market analyst. Generate detailed, accurate, and professional market reports and guides.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
    });

    const generatedContent = (aiResponse as any).response || '';

    // Format and generate PDF
    const formattedContent = formatContentForPDF(generatedContent, {
      title,
      generatedBy: user.email,
      date: new Date().toLocaleDateString(),
    });

    const pdfBuffer = await generatePDF(formattedContent, title);

    // Upload to R2
    const assetId = crypto.randomUUID();
    const r2Key = `content/${user.id}/${assetId}.pdf`;

    await c.env.CONTENT_BUCKET.put(r2Key, pdfBuffer, {
      httpMetadata: {
        contentType: 'application/pdf',
      },
    });

    // Save to D1
    const now = Date.now();
    await c.env.DB.prepare(
      `INSERT INTO content_assets
       (id, user_id, title, description, content_type, r2_key, file_size, ai_prompt, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    )
      .bind(
        assetId,
        user.id,
        title,
        description,
        content_type,
        r2Key,
        pdfBuffer.length,
        prompt,
        now,
        now
      )
      .run();

    // Track analytics
    await c.env.DB.prepare(
      'INSERT INTO analytics_events (id, user_id, event_type, event_data, created_at) VALUES (?, ?, ?, ?, ?)'
    )
      .bind(
        crypto.randomUUID(),
        user.id,
        'content_created',
        JSON.stringify({ asset_id: assetId, content_type }),
        now
      )
      .run();

    return c.redirect(`/content/${assetId}`);
  } catch (error) {
    console.error('Content creation error:', error);
    return c.json({ error: 'Failed to create content' }, 500);
  }
});

/**
 * GET /content/:id - View content details
 */
app.get('/content/:id', requireAuth, async (c) => {
  try {
    const user = c.get('user') as User;
    const assetId = c.req.param('id');

    // Fetch asset
    const asset = await c.env.DB.prepare(
      'SELECT * FROM content_assets WHERE id = ? AND user_id = ?'
    )
      .bind(assetId, user.id)
      .first<ContentAsset>();

    if (!asset) {
      return c.text('Asset not found', 404);
    }

    // Fetch subscribers
    const subscribers = await c.env.DB.prepare(
      'SELECT * FROM subscribers WHERE source_asset_id = ? ORDER BY created_at DESC'
    )
      .bind(assetId)
      .all<Subscriber>();

    const html = renderToString(
      ContentDetailPage({
        user,
        asset,
        subscribers: subscribers.results || [],
      })
    );
    return c.html(html);
  } catch (error) {
    console.error('Content detail error:', error);
    return c.text('Error loading content', 500);
  }
});

/**
 * DELETE /api/content/:id - Delete content asset
 */
app.delete('/api/content/:id', requireAuth, async (c) => {
  try {
    const user = c.get('user') as User;
    const assetId = c.req.param('id');

    // Verify ownership
    const asset = await c.env.DB.prepare(
      'SELECT * FROM content_assets WHERE id = ? AND user_id = ?'
    )
      .bind(assetId, user.id)
      .first<ContentAsset>();

    if (!asset) {
      return c.json({ error: 'Asset not found' }, 404);
    }

    // Delete from R2
    await c.env.CONTENT_BUCKET.delete(asset.r2_key);

    // Soft delete from D1
    await c.env.DB.prepare(
      'UPDATE content_assets SET status = ? WHERE id = ?'
    )
      .bind('deleted', assetId)
      .run();

    return c.json({ success: true });
  } catch (error) {
    console.error('Delete error:', error);
    return c.json({ error: 'Failed to delete content' }, 500);
  }
});

/**
 * GET /v/:assetId - Public content access with lead capture
 */
app.get('/v/:assetId', rateLimits.content, async (c) => {
  try {
    const assetId = c.req.param('assetId');

    // Fetch asset
    const asset = await c.env.DB.prepare(
      'SELECT * FROM content_assets WHERE id = ? AND status = ?'
    )
      .bind(assetId, 'active')
      .first<ContentAsset>();

    if (!asset) {
      return c.text('Content not found', 404);
    }

    // Fetch owner
    const owner = await c.env.DB.prepare('SELECT * FROM users WHERE id = ?')
      .bind(asset.user_id)
      .first<User>();

    if (!owner) {
      return c.text('Owner not found', 404);
    }

    // Check if user already has access (via cookie)
    const subscriberId = getCookie(c, `access_${assetId}`);
    const hasAccess = !!subscriberId;

    // Increment view count
    await c.env.DB.prepare(
      'UPDATE content_assets SET view_count = view_count + 1 WHERE id = ?'
    )
      .bind(assetId)
      .run();

    const html = renderToString(
      PublicContentPage({ asset, owner, hasAccess })
    );
    return c.html(html);
  } catch (error) {
    console.error('Public content error:', error);
    return c.text('Error loading content', 500);
  }
});

/**
 * POST /v/:assetId - Handle lead capture and grant access
 */
app.post('/v/:assetId', rateLimits.content, async (c) => {
  try {
    const assetId = c.req.param('assetId');
    const body = await c.req.parseBody();

    const email = body.email as string;
    const name = (body.name as string) || null;
    const phone = (body.phone as string) || null;

    if (!email || !email.includes('@')) {
      return c.redirect(`/v/${assetId}?error=` + encodeURIComponent('Invalid email'));
    }

    // Fetch asset
    const asset = await c.env.DB.prepare(
      'SELECT * FROM content_assets WHERE id = ? AND status = ?'
    )
      .bind(assetId, 'active')
      .first<ContentAsset>();

    if (!asset) {
      return c.text('Content not found', 404);
    }

    // Create subscriber
    const subscriberId = crypto.randomUUID();
    const now = Date.now();

    await c.env.DB.prepare(
      'INSERT OR IGNORE INTO subscribers (id, user_id, email, name, phone, source_asset_id, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)'
    )
      .bind(subscriberId, asset.user_id, email, name, phone, assetId, now)
      .run();

    // Track access
    const ip = c.req.header('cf-connecting-ip') || 'unknown';
    const userAgent = c.req.header('user-agent') || 'unknown';

    await c.env.DB.prepare(
      'INSERT INTO asset_access (id, subscriber_id, asset_id, accessed_at, ip_address, user_agent) VALUES (?, ?, ?, ?, ?, ?)'
    )
      .bind(crypto.randomUUID(), subscriberId, assetId, now, ip, userAgent)
      .run();

    // Update subscriber count
    await c.env.DB.prepare(
      'UPDATE content_assets SET subscriber_count = subscriber_count + 1 WHERE id = ?'
    )
      .bind(assetId)
      .run();

    // Set access cookie and redirect
    setCookie(c, `access_${assetId}`, subscriberId, {
      path: '/',
      maxAge: 86400,
      httpOnly: true,
      secure: true,
      sameSite: 'Lax',
    });
    return c.redirect(`/v/${assetId}`);
  } catch (error) {
    console.error('Lead capture error:', error);
    const currentAssetId = c.req.param('assetId');
    return c.redirect(`/v/${currentAssetId}?error=` + encodeURIComponent('An error occurred'));
  }
});

/**
 * GET /api/content/:id/download - Download content file
 */
app.get('/api/content/:id/download', rateLimits.content, async (c) => {
  try {
    const contentId = c.req.param('id');

    // Verify access via cookie
    const subscriberId = getCookie(c, `access_${contentId}`);
    if (!subscriberId) {
      return c.json({ error: 'Access denied' }, 403);
    }

    // Fetch asset
    const asset = await c.env.DB.prepare(
      'SELECT * FROM content_assets WHERE id = ?'
    )
      .bind(contentId)
      .first<ContentAsset>();

    if (!asset) {
      return c.json({ error: 'Asset not found' }, 404);
    }

    // Fetch from R2
    const object = await c.env.CONTENT_BUCKET.get(asset.r2_key);

    if (!object) {
      return c.json({ error: 'File not found' }, 404);
    }

    // Return file
    return new Response(object.body as any, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${asset.title}.pdf"`,
      },
    });
  } catch (error) {
    console.error('Download error:', error);
    return c.json({ error: 'Download failed' }, 500);
  }
});

/**
 * POST /api/stripe/checkout - Create Stripe checkout session
 */
app.post('/api/stripe/checkout', requireAuth, async (c) => {
  try {
    const user = c.get('user') as User;

    // TODO: Implement Stripe checkout
    // This requires the Stripe SDK and proper configuration

    return c.json({
      message: 'Stripe integration coming soon',
      checkoutUrl: 'https://stripe.com',
    });
  } catch (error) {
    console.error('Stripe checkout error:', error);
    return c.json({ error: 'Checkout failed' }, 500);
  }
});

/**
 * POST /api/stripe/webhook - Handle Stripe webhooks
 */
app.post('/api/stripe/webhook', async (c) => {
  try {
    // TODO: Implement Stripe webhook verification and handling
    // This requires verifying the webhook signature

    return c.json({ received: true });
  } catch (error) {
    console.error('Stripe webhook error:', error);
    return c.json({ error: 'Webhook processing failed' }, 500);
  }
});

export default app;
