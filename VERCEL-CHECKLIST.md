# Vercel Deployment Checklist

## Files to Commit

Before deploying to Vercel, ensure these files are in your repository:

- ✅ `vercel.json` - Vercel configuration
- ✅ `prisma/schema.prisma` - Database schema (set to PostgreSQL)
- ✅ `src/lib/team-members.json` - Team members list
- ✅ `.env.example` - Environment variables template

## Environment Variables for Vercel

Add these in Vercel Dashboard → Settings → Environment Variables:

```bash
DATABASE_URL=postgresql://user:password@host:port/database?sslmode=require
NEXTAUTH_URL=https://your-app.vercel.app
NEXTAUTH_SECRET=generate-with-openssl-rand-base64-32
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
RESEND_API_KEY=your-resend-api-key
```

## Pre-Deployment Steps

1. **Update Prisma Schema**
   ```bash
   # Edit prisma/schema.prisma
   datasource db {
     provider = "postgresql"  # Must be postgresql for production
   }
   ```

2. **Set Up PostgreSQL Database**
   - Neon: https://neon.tech/
   - Supabase: https://supabase.com/
   - Railway: https://railway.app/

3. **Generate Secrets**
   ```bash
   openssl rand -base64 32
   # Use output for NEXTAUTH_SECRET
   ```

4. **Update Google OAuth**
   - Add production redirect URI: `https://your-app.vercel.app/api/auth/callback/google`

5. **Test Locally with PostgreSQL**
   ```bash
   # Update .env with PostgreSQL URL
   DATABASE_URL=postgresql://...

   # Push schema to database
   bun run db:push

   # Test the app
   bun run dev
   ```

6. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Ready for Vercel deployment"
   git push origin main
   ```

## Deployment Steps

1. **Import to Vercel**
   - Go to https://vercel.com/dashboard
   - Click "Add New..." → "Project"
   - Import your GitHub repository

2. **Configure Environment Variables**
   - Add all variables from the list above
   - Set `NEXTAUTH_URL` after first deploy

3. **Deploy**
   - Click "Deploy"
   - Wait for build to complete

4. **Post-Deployment**
   - Update Google OAuth redirect URI
   - Run database migrations: `bun run db:push`
   - Create admin user
   - Test the application

## Quick Reference

### Vercel CLI Commands

```bash
# Login
vercel login

# Pull environment variables
vercel env pull .env.production

# Deploy manually
vercel --prod

# View logs
vercel logs
```

### Database Migration

```bash
# Pull production env
vercel env pull .env.production

# Run migrations
bun run db:push

# Open Prisma Studio
bun run db:studio
```

### Common Issues

**Database Connection Failed**
- Check `DATABASE_URL` is correct
- Ensure SSL mode: `?sslmode=require`
- Verify database is online

**Google OAuth Not Working**
- Update redirect URI in Google Console
- Match exactly: `https://your-app.vercel.app/api/auth/callback/google`
- Check credentials in Vercel env vars

**Build Timeout**
- Upgrade to Vercel Pro for longer build times
- Optimize build process
- Check for unnecessary dependencies

## Need Help?

- Full guide: See [DEPLOYMENT.md](./DEPLOYMENT.md)
- Vercel Docs: https://vercel.com/docs
- Prisma Docs: https://www.prisma.io/docs/deployment/deploying-to-vercel
