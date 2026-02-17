# 🚀 Deploying Radya Hi5 to Vercel

This guide will help you deploy the Radya Hi5 application to Vercel.

## Prerequisites

Before deploying, make sure you have:

- [ ] A [Vercel account](https://vercel.com/signup)
- [ ] A [GitHub account](https://github.com/signup)
- [ ] A PostgreSQL database (Neon, Supabase, or Railway)
- [ ] Google OAuth credentials
- [ ] Resend API key (for email notifications)
- [ ] Bun installed locally

---

## Step 1: Prepare Your Code

### 1.1 Update Prisma Schema for Production

Update `prisma/schema.prisma` to use PostgreSQL:

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

### 1.2 Update Message Field for PostgreSQL

```prisma
model Kudos {
  id          String   @id @default(cuid())
  value       String
  message     String   @db.Text  // Remove this line or keep it (PostgreSQL supports it)
  senderId    String
  createdAt   DateTime @default(now())
  emailSent   Boolean  @default(false)
  // ... rest of the model
}
```

### 1.3 Test Locally with PostgreSQL

1. Get a PostgreSQL connection string from Neon, Supabase, or Railway
2. Update your local `.env` file:
   ```env
   DATABASE_URL="postgresql://user:password@host:port/database"
   ```
3. Run migrations:
   ```bash
   bun run db:push
   ```
4. Test the app locally:
   ```bash
   bun run dev
   ```

### 1.4 Push Code to GitHub

```bash
# Initialize git if not already done
git init
git add .
git commit -m "Ready for Vercel deployment"

# Create a new repository on GitHub first, then:
git remote add origin https://github.com/YOUR_USERNAME/radya-hi5.git
git branch -M main
git push -u origin main
```

---

## Step 2: Set Up Production Database

### Option A: Neon (Recommended)

1. Go to [Neon](https://neon.tech/)
2. Sign up and create a new project
3. Copy the connection string
4. Save it for Vercel environment variables

**Note:** Neon provides a free tier with serverless PostgreSQL!

### Option B: Supabase

1. Go to [Supabase](https://supabase.com/)
2. Create a new project
3. Go to Settings → Database
4. Copy the connection string

### Option C: Railway

1. Go to [Railway](https://railway.app/)
2. Create a new PostgreSQL database
3. Copy the connection string from variables

---

## Step 3: Deploy to Vercel

### 3.1 Import Project to Vercel

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click **"Add New..."** → **"Project"**
3. Import your GitHub repository (`radya-hi5`)
4. Vercel will auto-detect Next.js

### 3.2 Configure Build Settings

Vercel will auto-detect these settings from `package.json`:

```
Framework Preset: Next.js
Build Command: bun run build
Output Directory: .next/standalone
Install Command: bun install
```

### 3.3 Set Environment Variables

Add these in Vercel project settings (Environment Variables):

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://neondb_owner:xxx@ep-xxx.us-east-2.aws.neon.tech/neondb?sslmode=require` |
| `NEXTAUTH_URL` | Your Vercel domain | `https://your-app.vercel.app` |
| `NEXTAUTH_SECRET` | Secret key | Generate with `openssl rand -base64 32` |
| `GOOGLE_CLIENT_ID` | Google OAuth Client ID | `123456789-xxx.apps.googleusercontent.com` |
| `GOOGLE_CLIENT_SECRET` | Google OAuth Client Secret | `GOCSPX-xxx` |
| `RESEND_API_KEY` | Resend API key | `re_xxx` |

**Important:** Set `NEXTAUTH_URL` after deployment (you'll see the URL after first deploy).

### 3.4 Deploy

Click **"Deploy"** and wait for the build to complete.

---

## Step 4: Post-Deployment Configuration

### 4.1 Update Google OAuth Redirect URI

After first deployment, you'll get a Vercel URL like `https://your-app.vercel.app`

1. Go to [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
2. Find your OAuth 2.0 Client ID
3. Add this authorized redirect URI:
   ```
   https://your-app.vercel.app/api/auth/callback/google
   ```
4. Save changes

### 4.2 Update NEXTAUTH_URL in Vercel

1. Go to Vercel project → Settings → Environment Variables
2. Update `NEXTAUTH_URL` to your production URL:
   ```
   NEXTAUTH_URL=https://your-app.vercel.app
   ```
3. Redeploy or trigger a new deployment

### 4.3 Run Database Migrations

Since Vercel is serverless, you need to run migrations:

**Option A: Using Vercel CLI**

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Run migration in production
vercel env pull .env.production
bun run db:push
```

**Option B: Using Prisma Migrate API**

If using Neon, you can run migrations from their dashboard.

**Option C: Manual SQL**

You can also run the SQL directly in your database dashboard:

```sql
CREATE TABLE "User" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "email" TEXT NOT NULL UNIQUE,
  "name" TEXT,
  "image" TEXT,
  "isAdmin" BOOLEAN NOT NULL DEFAULT false,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" DATETIME NOT NULL
);

CREATE TABLE "Kudos" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "value" TEXT NOT NULL,
  "message" TEXT NOT NULL,
  "senderId" TEXT NOT NULL,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "emailSent" BOOLEAN NOT NULL DEFAULT false,
  FOREIGN KEY ("senderId") REFERENCES "User"("id") ON DELETE CASCADE
);

CREATE TABLE "KudosRecipient" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "kudosId" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY ("kudosId") REFERENCES "Kudos"("id") ON DELETE CASCADE,
  FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE
);

CREATE INDEX "User_email_idx" ON "User"("email");
CREATE INDEX "Kudos_senderId_idx" ON "Kudos"("senderId");
CREATE INDEX "Kudos_createdAt_idx" ON "Kudos"("createdAt");
CREATE INDEX "KudosRecipient_userId_idx" ON "KudosRecipient"("userId");
CREATE INDEX "KudosRecipient_createdAt_idx" ON "KudosRecipient"("createdAt");

CREATE UNIQUE INDEX "KudosRecipient_kudosId_userId_key" ON "KudosRecipient"("kudosId", "userId");
```

### 4.4 Update Email Domain in Code

Edit `src/app/api/kudos/route.ts`:

```typescript
from: "Radya Hi5 <hi5@yourdomain.com>"
```

Replace with your actual email domain (must be verified in Resend).

### 4.5 Create Admin User

After deployment, sign in with Google, then update the user to be admin:

**Using Prisma Studio:**
```bash
vercel env pull .env.production
bun run db:studio
```

Navigate to User model and set `isAdmin` to `true` for your user.

**Or using SQL:**
```sql
UPDATE "User" SET "isAdmin" = true WHERE email = 'your-email@example.com';
```

---

## Step 5: Custom Domain (Optional)

### 5.1 Add Custom Domain

1. Go to Vercel project → Settings → Domains
2. Add your domain (e.g., `hi5.yourcompany.com`)
3. Follow Vercel's DNS instructions

### 5.2 Update Configuration

Update environment variables:
- `NEXTAUTH_URL` to `https://hi5.yourcompany.com`
- Update Google OAuth redirect URI
- Update Resend verified domain

---

## Step 6: Monitoring and Logs

### View Deploy Logs

1. Go to Vercel Dashboard
2. Select your project
3. Click **"Deployments"**
4. Click on a deployment to view logs

### View Runtime Logs

1. Go to Vercel project
2. Click **"Logs"** tab
3. Filter by function or status code

### Set Up Analytics (Optional)

1. Go to Vercel project → Analytics
2. Enable Web Vitals analytics
3. Track performance metrics

---

## Troubleshooting

### Issue: Database Connection Failed

**Error:** `P1003: Database connection failed`

**Solution:**
1. Check `DATABASE_URL` is correct
2. Ensure database is online
3. Verify SSL settings (`?sslmode=require`)
4. Check firewall settings

### Issue: Google OAuth Not Working

**Error:** `client_id is required` or `redirect_uri_mismatch`

**Solution:**
1. Check Google OAuth credentials in Vercel env vars
2. Verify redirect URI matches exactly:
   ```
   https://your-app.vercel.app/api/auth/callback/google
   ```
3. Ensure OAuth consent screen is configured

### Issue: NEXTAUTH_URL Warning

**Warning:** `[next-auth][warn][NEXTAUTH_URL]`

**Solution:**
1. Set `NEXTAUTH_URL` in Vercel environment variables
2. Use full URL with https://
3. Redeploy after setting

### Issue: Build Fails

**Error:** Build timeout or compilation error

**Solution:**
1. Check build logs for specific errors
2. Ensure all dependencies are in `package.json`
3. Try increasing Vercel build timeout (upgrade to Pro if needed)
4. Check TypeScript errors locally: `bun run lint`

### Issue: Emails Not Sending

**Error:** Emails not received

**Solution:**
1. Verify `RESEND_API_KEY` is set correctly
2. Check Resend dashboard for email logs
3. Ensure sender domain is verified in Resend
4. Check spam folder

---

## Production Checklist

Before going live, ensure:

- [ ] Code pushed to GitHub
- [ ] PostgreSQL database created and accessible
- [ ] Prisma schema uses `postgresql` provider
- [ ] Database migrations run successfully
- [ ] All environment variables set in Vercel
- [ ] `NEXTAUTH_URL` set to production domain
- [ ] Google OAuth redirect URI updated
- [ ] `NEXTAUTH_SECRET` is a strong random string
- [ ] Email domain verified in Resend
- [ ] Admin user created
- [ ] Custom domain configured (if applicable)
- [ ] Team members updated in `src/lib/team-members.json`
- [ ] Test sign-in flow
- [ ] Test giving Hi5s
- [ ] Test email notifications
- [ ] Test admin dashboard
- [ ] Check mobile responsiveness
- [ ] Set up monitoring/logs

---

## Scaling Considerations

### Vercel Plan

- **Hobby (Free):** Good for testing, limited bandwidth
- **Pro ($20/mo):** Recommended for production
  - Unlimited bandwidth
  - Faster builds
  - Team collaboration
  - Priority support

### Database Scaling

- **Neon Free Tier:** Up to 3 projects, 0.5GB storage
- **Neon Pro ($29/mo):** More storage, compute, and support
- **Supabase Free:** 500MB storage, 1GB bandwidth
- **Supabase Pro ($25/mo):** 8GB storage, 50GB bandwidth

### Email Scaling

- **Resend Free:** 3,000 emails/month
- **Resend Pro ($20/mo):** 50,000 emails/month

---

## Cost Estimate

For a typical team of 10-50 users:

| Service | Tier | Monthly Cost |
|---------|------|-------------|
| Vercel | Pro | $20 |
| Neon/Supabase | Free | $0 |
| Resend | Free | $0 |
| **Total** | | **$20/month** |

**Note:** You can start with free tiers and upgrade as needed!

---

## Continuous Deployment

Vercel automatically deploys when you push to `main` branch:

```bash
git add .
git commit -m "Update team members"
git push
```

Vercel will automatically:
1. Detect the push
2. Run build
3. Deploy to production
4. Update the live site

---

## Backup and Restore

### Database Backup

Most providers offer automated backups:

- **Neon:** Settings → Backup
- **Supabase:** Database → Backups
- **Railway:** Backups tab

### Manual Backup

```bash
# Backup database
pg_dump $DATABASE_URL > backup.sql

# Restore database
psql $DATABASE_URL < backup.sql
```

---

## Support

- **Vercel Docs:** https://vercel.com/docs
- **NextAuth Docs:** https://next-auth.js.org/
- **Prisma Docs:** https://www.prisma.io/docs
- **Resend Docs:** https://resend.com/docs

---

## Next Steps

1. ✅ Complete the deployment checklist
2. ✅ Test all features in production
3. ✅ Set up custom domain (optional)
4. ✅ Configure monitoring
5. ✅ Share with your team! 🎉

---

**Deployed successfully?** Your team can now start spreading positivity with Radya Hi5! 🚀
