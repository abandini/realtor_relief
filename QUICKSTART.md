# Quick Start Guide

Get the Agent's Exclusive Access platform running in 10 minutes.

## Prerequisites

- Cloudflare account (sign up at https://dash.cloudflare.com/sign-up)
- Node.js 20+ installed
- Git installed

## 1. Clone and Install

```bash
git clone https://github.com/abandini/realtor_relief.git
cd realtor_relief
npm install
```

## 2. Set Up Cloudflare Resources

```bash
# Login to Cloudflare
wrangler login

# Create D1 database
wrangler d1 create agents_exclusive_access_db
# Copy the database_id from output

# Create R2 bucket
wrangler r2 bucket create agent-content-assets

# Create KV namespaces
wrangler kv:namespace create "SESSIONS"
wrangler kv:namespace create "RATE_LIMITING"
# Copy both namespace IDs from output
```

## 3. Update wrangler.toml

Edit `wrangler.toml` and replace the placeholder IDs:

```toml
[[d1_databases]]
binding = "DB"
database_name = "agents_exclusive_access_db"
database_id = "YOUR_DATABASE_ID"  # ← Paste here

[[kv_namespaces]]
binding = "SESSIONS"
id = "YOUR_SESSIONS_ID"  # ← Paste here

[[kv_namespaces]]
binding = "RATE_LIMITING"
id = "YOUR_RATE_LIMITING_ID"  # ← Paste here
```

## 4. Initialize Database

```bash
wrangler d1 execute agents_exclusive_access_db --file=./schema.sql
```

## 5. Set Secrets

```bash
# Generate and set auth secret (any random 32+ char string)
wrangler secret put AUTH_SECRET
# Enter: your-super-secret-key-here-make-it-long

# Set Stripe API key (get from https://dashboard.stripe.com/test/apikeys)
wrangler secret put STRIPE_API_KEY
# Enter: sk_test_...

# Set Stripe webhook secret (you'll get this after setting up webhooks)
wrangler secret put STRIPE_WEBHOOK_SECRET
# Enter: whsec_...
```

## 6. Deploy

```bash
npm run deploy
```

Your app will be live at: `https://agents-exclusive-access.YOUR-SUBDOMAIN.workers.dev`

## 7. Test It Out

1. Visit your worker URL
2. Click "Get Started Free"
3. Enter your email
4. Check the Wrangler logs for the magic link:
   ```bash
   wrangler tail
   ```
5. Copy the magic link from logs and paste in browser
6. You're in! Start creating content

## Local Development

```bash
# Set up local database
wrangler d1 execute DB --local --file=./schema.sql

# Create .dev.vars for local secrets
cp .dev.vars.example .dev.vars
# Edit .dev.vars and add your secrets

# Start dev server
npm run dev
```

Visit http://localhost:8787

## Next Steps

- [ ] Set up custom domain in Cloudflare dashboard
- [ ] Configure Stripe webhooks at https://dashboard.stripe.com/webhooks
- [ ] Set up SendGrid for email delivery (or use another email service)
- [ ] Customize branding in `src/views/` files
- [ ] Set up GitHub Actions for auto-deployment (see DEPLOYMENT.md)

## Getting Help

- **Full deployment guide**: See `DEPLOYMENT.md`
- **Issues**: https://github.com/abandini/realtor_relief/issues
- **Cloudflare Docs**: https://developers.cloudflare.com/workers/

## Quick Commands Reference

```bash
# View logs
wrangler tail

# Deploy
npm run deploy

# Run tests
npm test
npm run test:browser

# Type check
npm run type-check

# Query database
wrangler d1 execute agents_exclusive_access_db --command "SELECT * FROM users"

# List secrets
wrangler secret list

# Delete a secret
wrangler secret delete SECRET_NAME
```

## Troubleshooting

**Can't login?** Check wrangler tail for the magic link URL

**Database errors?** Make sure you ran the schema.sql migration

**Deployment fails?** Verify all IDs in wrangler.toml are correct

**Type errors?** Run `npm run type-check` to see details

---

That's it! You now have a fully functional AI-powered SaaS platform running on Cloudflare's global network. 🚀
