# Deployment Guide - Agent's Exclusive Access Platform

This guide will walk you through deploying the Agent's Exclusive Access platform to Cloudflare Workers.

## Prerequisites

- Cloudflare account (free tier works)
- GitHub account (repository already created)
- Wrangler CLI installed: `npm install -g wrangler`
- Node.js 20+ installed

## Step 1: Authenticate with Cloudflare

```bash
wrangler login
```

This will open a browser window to authenticate with your Cloudflare account.

## Step 2: Create D1 Database

```bash
# Create the production database
wrangler d1 create agents_exclusive_access_db
```

Copy the database ID from the output and update `wrangler.toml`:

```toml
[[d1_databases]]
binding = "DB"
database_name = "agents_exclusive_access_db"
database_id = "YOUR_DATABASE_ID_HERE"  # Replace with actual ID
```

## Step 3: Create R2 Bucket

```bash
# Create the R2 bucket for content storage
wrangler r2 bucket create agent-content-assets
```

The bucket name is already configured in `wrangler.toml`.

## Step 4: Create KV Namespaces

```bash
# Create KV namespace for sessions
wrangler kv:namespace create "SESSIONS"

# Create KV namespace for rate limiting
wrangler kv:namespace create "RATE_LIMITING"
```

Update `wrangler.toml` with the namespace IDs:

```toml
[[kv_namespaces]]
binding = "SESSIONS"
id = "YOUR_SESSIONS_NAMESPACE_ID"  # Replace with actual ID

[[kv_namespaces]]
binding = "RATE_LIMITING"
id = "YOUR_RATE_LIMITING_NAMESPACE_ID"  # Replace with actual ID
```

## Step 5: Run Database Migrations

```bash
# Apply the database schema
wrangler d1 execute agents_exclusive_access_db --file=./schema.sql
```

This creates all the necessary tables and indexes.

## Step 6: Set Up Secrets

```bash
# Set authentication secret (generate a random 32+ character string)
wrangler secret put AUTH_SECRET
# Enter: your-random-secret-here-min-32-chars

# Set Stripe API key (get from https://dashboard.stripe.com/apikeys)
wrangler secret put STRIPE_API_KEY
# Enter: sk_test_your_stripe_key_here

# Set Stripe webhook secret (get from Stripe webhook settings)
wrangler secret put STRIPE_WEBHOOK_SECRET
# Enter: whsec_your_webhook_secret_here

# Optional: Set SendGrid API key for email sending
wrangler secret put SENDGRID_API_KEY
# Enter: SG.your_sendgrid_key_here
```

## Step 7: Deploy the Worker

```bash
# Deploy to Cloudflare
npm run deploy
```

The worker will be deployed to: `https://agents-exclusive-access.YOUR_SUBDOMAIN.workers.dev`

## Step 8: Configure GitHub Actions (Automated Deployments)

1. Go to your GitHub repository settings
2. Navigate to **Settings > Secrets and variables > Actions**
3. Add the following secrets:

   - `CLOUDFLARE_API_TOKEN`: Get from https://dash.cloudflare.com/profile/api-tokens
     - Use "Edit Cloudflare Workers" template
     - Or create custom token with Workers permissions

   - `CLOUDFLARE_ACCOUNT_ID`: Get from Cloudflare dashboard URL
     - Go to Workers & Pages
     - Copy the account ID from the URL

4. Now every push to `main` branch will automatically deploy!

## Step 9: Set Up Stripe Webhooks

1. Go to https://dashboard.stripe.com/webhooks
2. Click "Add endpoint"
3. Enter your worker URL: `https://agents-exclusive-access.YOUR_SUBDOMAIN.workers.dev/api/stripe/webhook`
4. Select events to listen to:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
5. Copy the webhook signing secret and update your Cloudflare secret:
   ```bash
   wrangler secret put STRIPE_WEBHOOK_SECRET
   ```

## Step 10: Test the Deployment

Visit your worker URL and verify:

1. ✅ Landing page loads
2. ✅ Login page accessible at `/login`
3. ✅ Can send magic link (check Wrangler logs for the link)
4. ✅ Dashboard requires authentication
5. ✅ Create content form accessible

### Testing with Wrangler Logs

```bash
# Stream live logs from your worker
wrangler tail
```

## Local Development

For local development with all Cloudflare services:

```bash
# Create local D1 database
wrangler d1 execute DB --local --file=./schema.sql

# Run development server
npm run dev
```

Visit http://localhost:8787

## Custom Domain Setup (Optional)

1. Go to Cloudflare Dashboard > Workers & Pages
2. Select your worker
3. Go to **Settings > Triggers > Custom Domains**
4. Add your domain (must be managed by Cloudflare)

## Monitoring and Analytics

### View Metrics
- Go to Cloudflare Dashboard > Workers & Pages
- Select your worker
- View metrics: Requests, Errors, Duration

### View Logs
```bash
wrangler tail
```

### Enable Workers Analytics
Workers analytics is automatically enabled and provides:
- Request volume
- Error rates
- Execution time
- Bandwidth usage

## Database Management

### View database contents
```bash
# List all users
wrangler d1 execute agents_exclusive_access_db --command "SELECT * FROM users"

# List all content assets
wrangler d1 execute agents_exclusive_access_db --command "SELECT * FROM content_assets"

# View subscribers
wrangler d1 execute agents_exclusive_access_db --command "SELECT * FROM subscribers"
```

### Backup database
```bash
# Export database to SQL
wrangler d1 export agents_exclusive_access_db --output=backup.sql
```

## Troubleshooting

### Issue: "Module not found" errors
**Solution**: Ensure all dependencies are installed:
```bash
npm install
```

### Issue: Database not found
**Solution**: Make sure you've updated `wrangler.toml` with the correct database ID and run migrations:
```bash
wrangler d1 execute agents_exclusive_access_db --file=./schema.sql
```

### Issue: KV namespace errors
**Solution**: Verify KV namespace IDs in `wrangler.toml` match the ones created

### Issue: Authentication not working
**Solution**: Check that AUTH_SECRET is set:
```bash
wrangler secret list
```

### Issue: AI model errors
**Solution**: Ensure your Cloudflare account has Workers AI enabled. This is available on all plans.

## Cost Estimation

Based on Cloudflare's pricing (as of 2025):

### Free Tier Includes:
- 100,000 requests/day
- D1: 5GB storage, 5M reads/day, 100K writes/day
- R2: 10GB storage, 1M Class A operations, 10M Class B operations
- KV: 100K reads/day, 1K writes/day
- Workers AI: Limited free tier

### Paid Pricing (if needed):
- Workers: $5/month for 10M requests
- D1: $5/month for 25GB + usage
- R2: $0.015/GB storage
- KV: $0.50/month for unlimited

**Estimated cost for 250 users @ $200/month = $50K/month revenue:**
- ~$20-50/month in Cloudflare costs
- **98%+ profit margin on infrastructure**

## Security Checklist

- [ ] All secrets are set via `wrangler secret put` (never in code)
- [ ] `.env` and `.dev.vars` are in `.gitignore`
- [ ] Stripe webhook signature verification is enabled
- [ ] Rate limiting is configured
- [ ] HTTPS is enforced (automatic on Cloudflare Workers)
- [ ] Session cookies are httpOnly and secure

## Next Steps

1. **Configure Email Service**: Set up SendGrid or another email provider for magic link emails
2. **Customize Branding**: Update colors, logo, and copy in views
3. **Set Up Analytics**: Integrate with Google Analytics or Plausible
4. **Create Subscription Plans**: Configure Stripe products and prices
5. **Add Custom Domain**: Set up your branded domain
6. **Monitor Performance**: Set up alerts in Cloudflare dashboard

## Support

For issues or questions:
- Check the [GitHub Issues](https://github.com/abandini/realtor_relief/issues)
- Review Cloudflare Workers documentation
- Check Wrangler logs: `wrangler tail`

---

**Deployment Checklist:**
- [x] Code repository created
- [ ] Cloudflare account set up
- [ ] D1 database created and migrated
- [ ] R2 bucket created
- [ ] KV namespaces created
- [ ] Secrets configured
- [ ] Worker deployed
- [ ] GitHub Actions configured
- [ ] Stripe webhooks configured
- [ ] Custom domain added (optional)
- [ ] Email service configured
