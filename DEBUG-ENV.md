# 🔍 How to Debug Environment Variables in Bun

## Quick Debug Commands

### 1. Check Environment Variables
```bash
bun run debug-env.ts
```
This shows:
- ✅ If `.env` file exists
- ✅ All environment variables loaded
- ✅ Values (masked for security)
- ✅ Bun environment info

### 2. Test Prisma/Database Connection
```bash
bun run debug-prisma.ts
```
This shows:
- ✅ Database type detected
- ✅ Connection string (masked)
- ✅ Test queries to database
- ✅ User counts and existing users
- ❌ Any connection errors with solutions

### 3. Test in Next.js App

Create a temporary API route to debug in browser:

```typescript
// src/app/api/debug/route.ts
import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({
    env: {
      DATABASE_URL: process.env.DATABASE_URL?.substring(0, 20) + '...',
      NEXTAUTH_URL: process.env.NEXTAUTH_URL,
      NODE_ENV: process.env.NODE_ENV,
    },
    cwd: process.cwd(),
  })
}
```

Visit: `http://localhost:3000/api/debug`

---

## Common Issues & Solutions

### Issue 1: Variables Not Loading

**Symptom:** Debug shows "❌ Missing"

**Solution A:** Check `.env` file location
```bash
# Should be in project root
ls -la .env

# Check if file exists and has content
cat .env
```

**Solution B:** Bun auto-loading issue
```typescript
// Manually load env in your files
import dotenv from 'dotenv'
dotenv.config()
```

**Solution C:** Wrong variable names
```bash
# Make sure variable names are UPPERCASE
DATABASE_URL ✅
database_url ❌ (lowercase)
```

### Issue 2: PostgreSQL Connection Failed

**Symptom:** `Error P1003` or `P1001`

**Check 1:** Connection string format
```
✅ Correct: postgresql://user:password@host:port/database
❌ Wrong:   postgres://user:password@host/database (no port)
❌ Wrong:   postgresql://user@host:port/database (no password)
```

**Check 2:** Database exists
- Go to your database provider (Neon, Supabase, Railway)
- Verify database is created
- Copy fresh connection string

**Check 3:** Special characters in password
If your password has special characters, URL encode them:
```
# Replace special characters with their URL-encoded versions
@ → %40
: → %3A
/ → %2F
? → %3F
# → %23
```

**Check 4:** SSL/TLS settings
```
# Try adding SSL mode
postgresql://user:password@host:port/database?sslmode=require

# Or disable SSL for testing
postgresql://user:password@host:port/database?sslmode=disable
```

### Issue 3: Prisma Client Not Generated

**Symptom:** `Cannot read properties of undefined`

**Solution:** Regenerate Prisma client
```bash
# Generate client for current database provider
bun run db:generate

# Verify client was generated
ls -la node_modules/.prisma/client/

# Push schema to database
bun run db:push
```

### Issue 4: Wrong Database Provider

**Symptom:** `Native type Text is not supported`

**Check schema.prisma provider:**
```prisma
# For PostgreSQL
datasource db {
  provider = "postgresql"
}

# For SQLite
datasource db {
  provider = "sqlite"
}

# For MySQL
datasource db {
  provider = "mysql"
}
```

**Regenerate after changing:**
```bash
bun run db:generate
bun run db:push
```

### Issue 5: Google OAuth Not Working

**Symptom:** `client_id is required`

**Check 1:** Variables are set
```bash
# Run debug script
bun run debug-env.ts

# Look for:
# ✅ GOOGLE_CLIENT_ID: Loaded
# ✅ GOOGLE_CLIENT_SECRET: Loaded
```

**Check 2:** Values are not placeholders
```bash
# Should have actual values, NOT:
❌ GOOGLE_CLIENT_ID="your-google-client-id"
❌ GOOGLE_CLIENT_SECRET="your-google-client-secret"

# Should be something like:
✅ GOOGLE_CLIENT_ID="123456789-abcde.apps.googleusercontent.com"
✅ GOOGLE_CLIENT_SECRET="GOCSPX-abc123xyz"
```

**Check 3:** Redirect URI in Google Console
Must match exactly:
```
http://localhost:3000/api/auth/callback/google
```

---

## Debugging Checklist

- [ ] `.env` file exists in project root
- [ ] `.env` has all required variables
- [ ] Variables don't contain placeholder values
- [ ] `DATABASE_URL` matches database provider (PostgreSQL/SQLite)
- [ ] Prisma client has been generated (`bun run db:generate`)
- [ ] Schema has been pushed to database (`bun run db:push`)
- [ ] Database is online and accessible
- [ ] Google OAuth credentials are configured (not placeholders)

---

## Quick Debug Commands Summary

```bash
# 1. Check env variables
bun run debug-env.ts

# 2. Test database connection
bun run debug-prisma.ts

# 3. Regenerate Prisma (if schema changed)
bun run db:generate

# 4. Push schema to database
bun run db:push

# 5. Check dev logs
tail -50 dev.log

# 6. Run linter
bun run lint
```

---

## Example Working Setup

For **PostgreSQL with Neon**:

```env
DATABASE_URL="postgresql://neondb_owner:npg_abc123@ep-xyz123.us-east-2.aws.neon.tech/neondb?sslmode=require"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="abc123def456ghi789jkl012mno345pqrs678"
GOOGLE_CLIENT_ID="123456789-abcdefghijklmnop.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="GOCSPX-AbCdEf1234567890"
RESEND_API_KEY="re_abc123def456"
```

For **SQLite (local testing)**:

```env
DATABASE_URL="file:/home/z/my-project/db/custom.db"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="abc123def456ghi789jkl012mno345pqrs678"
GOOGLE_CLIENT_ID="123456789-abcdefghijklmnop.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="GOCSPX-AbCdEf1234567890"
RESEND_API_KEY="re_abc123def456"
```

---

## Need More Help?

1. Run `bun run debug-env.ts` - Shows all env variables
2. Run `bun run debug-prisma.ts` - Tests database connection
3. Check `tail -50 dev.log` - Shows app errors
4. Check browser console - Shows client-side errors
