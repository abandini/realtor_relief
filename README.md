# Agent's Exclusive Access Platform

> AI-powered SaaS platform for real estate agents to create, protect, and monetize hyper-local market content.

## Overview

This platform enables top-producing real estate agents to transform their market expertise into exclusive, lead-generating digital assets. By empowering agents to create AI-generated content with built-in lead capture, we help them reduce dependency on expensive lead sources like Zillow and Facebook Ads.

## Features

- **AI-Powered Content Generation**: Create professional market reports and neighborhood guides using Cloudflare Workers AI
- **Lead Capture Gates**: Protect content behind smart lead-capture forms
- **Analytics Dashboard**: Track views, conversions, and subscriber growth
- **Magic Link Authentication**: Secure, passwordless authentication
- **Stripe Integration**: Subscription-based monetization
- **R2 Storage**: Secure file storage for generated PDFs and videos
- **Rate Limiting**: Built-in API protection

## Tech Stack

- **Framework**: Hono (TypeScript)
- **Platform**: Cloudflare Workers
- **Database**: Cloudflare D1 (SQLite)
- **Storage**: Cloudflare R2
- **Cache**: Cloudflare KV
- **AI**: Cloudflare Workers AI (Llama 3)
- **Auth**: Lucia Auth
- **Frontend**: Preact + Tailwind CSS
- **Payments**: Stripe

## Getting Started

### Prerequisites

- Node.js 20+
- Cloudflare account
- Wrangler CLI installed (`npm install -g wrangler`)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd realtor_relief
```

2. Install dependencies:
```bash
npm install
```

3. Set up Cloudflare resources:

```bash
# Create D1 database
wrangler d1 create agents_exclusive_access_db

# Create R2 bucket
wrangler r2 bucket create agent-content-assets

# Create KV namespaces
wrangler kv:namespace create "SESSIONS"
wrangler kv:namespace create "RATE_LIMITING"
```

4. Update `wrangler.toml` with the IDs from the commands above.

5. Run database migrations:
```bash
npm run db:migrate:local  # For local development
npm run db:migrate         # For production
```

6. Set up secrets:
```bash
wrangler secret put STRIPE_API_KEY
wrangler secret put STRIPE_WEBHOOK_SECRET
wrangler secret put AUTH_SECRET
wrangler secret put SENDGRID_API_KEY  # Optional
```

### Development

Run the development server:
```bash
npm run dev
```

Visit `http://localhost:8787` to view the application.

### Testing

Run unit tests:
```bash
npm test
```

Run browser tests:
```bash
npm run test:ui
```

### Deployment

The application automatically deploys to Cloudflare Workers when code is pushed to the `main` branch via GitHub Actions.

Manual deployment:
```bash
npm run deploy
```

## Project Structure

```
├── src/
│   ├── index.ts           # Main worker entry point
│   ├── types.ts           # TypeScript type definitions
│   ├── lib/
│   │   └── auth.ts        # Authentication utilities
│   ├── middleware/
│   │   ├── auth.ts        # Auth middleware
│   │   └── ratelimit.ts   # Rate limiting middleware
│   ├── routes/            # API route handlers
│   ├── utils/
│   │   └── pdf.ts         # PDF generation utilities
│   └── views/             # Preact components
│       ├── layout.tsx
│       ├── landing.tsx
│       ├── login.tsx
│       ├── dashboard.tsx
│       ├── content-new.tsx
│       ├── content-detail.tsx
│       └── public-content.tsx
├── schema.sql             # Database schema
├── wrangler.toml          # Cloudflare Worker configuration
├── package.json
└── tsconfig.json
```

## API Routes

### Authentication
- `POST /auth/login` - Send magic link
- `GET /auth/callback` - Verify magic link
- `POST /auth/logout` - Logout

### Content Management
- `GET /dashboard` - Main dashboard
- `GET /content/new` - Create content form
- `POST /api/content` - Create new content asset
- `GET /content/:id` - View content details
- `DELETE /api/content/:id` - Delete content asset

### Public Access
- `GET /v/:assetId` - Public content page with lead capture
- `POST /v/:assetId` - Submit lead capture form
- `GET /api/content/:id/download` - Download content file

### Payments
- `POST /api/stripe/checkout` - Create checkout session
- `POST /api/stripe/webhook` - Handle Stripe webhooks

## Environment Variables

Required secrets (set via `wrangler secret put`):
- `STRIPE_API_KEY` - Stripe API key
- `STRIPE_WEBHOOK_SECRET` - Stripe webhook signing secret
- `AUTH_SECRET` - Secret for session encryption
- `SENDGRID_API_KEY` - SendGrid API key (optional)

## Database Schema

See `schema.sql` for complete database schema including:
- Users
- Sessions
- Magic Links
- Content Assets
- Subscribers
- Asset Access tracking
- Analytics Events

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests
5. Submit a pull request

## License

MIT

## Support

For issues and questions, please open an issue on GitHub.
