# 🎉 Radya Hi5 - Recognition & Appreciation System

A beautiful, mobile-first Hi5 and recognition system built with Next.js 16, featuring fun animations, Google authentication, and email notifications.

## ✨ Features

- **🔐 Google Sign-In** - Secure authentication with Google OAuth
- **👥 Select Recipients** - Choose up to 3 people to give Hi5s to
- **💎 Value-Based Recognition** - 12 predefined company values with icons and descriptions
- **✉️ Email Notifications** - Automatic email notifications to Hi5 recipients
- **📊 Admin Dashboard** - Weekly statistics and leaderboards
  - Most received Hi5s
  - Most given Hi5s
  - Most popular values
- **🎨 Sleek Design** - Mobile-first UI with beautiful gradients
- **✨ Fun Animations** - Celebration animations using Framer Motion

## 🚀 Tech Stack

- **Framework**: Next.js 16 with App Router
- **Language**: TypeScript 5
- **Database**: PostgreSQL (serverless - Neon, Supabase, etc.)
- **ORM**: Prisma
- **Authentication**: NextAuth.js v4 with Google OAuth
- **UI Components**: shadcn/ui
- **Styling**: Tailwind CSS 4
- **Animations**: Framer Motion
- **Email**: Resend

## 📋 Setup Instructions

### 1. Environment Variables

Copy `.env.example` to `.env` and fill in the required values:

```bash
cp .env.example .env
```

Update `.env` with your values:

```env
# Database - Get a free PostgreSQL database from Neon, Supabase, or Railway
DATABASE_URL="postgresql://user:password@host:port/database?schema=public"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="generate-with-openssl-rand-base64-32"

# Google OAuth
# Get credentials from: https://console.cloud.google.com/apis/credentials
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# Email - Get API key from: https://resend.com/api-keys
RESEND_API_KEY="your-resend-api-key"
```

### 2. Generate NextAuth Secret

Run this command to generate a secure secret:

```bash
openssl rand -base64 32
```

Copy the output and paste it as `NEXTAUTH_SECRET` in your `.env` file.

### 3. Set Up Google OAuth

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Navigate to **APIs & Services** → **Credentials**
4. Click **Create Credentials** → **OAuth client ID**
5. Select **Web application**
6. Add authorized redirect URI: `http://localhost:3000/api/auth/callback/google`
7. Copy the Client ID and Client Secret to your `.env` file

### 4. Set Up Resend for Email

1. Go to [Resend](https://resend.com/)
2. Sign up and create an API key
3. Copy the API key to your `.env` file
4. Update the email domain in `/src/app/api/kudos/route.ts`:
   ```typescript
   from: "Radya Hi5 <hi5@yourdomain.com>"
   ```

### 5. Set Up PostgreSQL Database

Choose one of these free options:

#### Option A: Neon (Recommended)
1. Go to [Neon](https://neon.tech/)
2. Sign up and create a new project
3. Copy the connection string to your `.env` file

#### Option B: Supabase
1. Go to [Supabase](https://supabase.com/)
2. Create a new project
3. Go to Settings → Database
4. Copy the connection string to your `.env` file

#### Option C: Railway
1. Go to [Railway](https://railway.app/)
2. Create a new PostgreSQL database
3. Copy the connection string to your `.env` file

### 6. Initialize Database

Run the database migration:

```bash
bun run db:push
```

### 7. Create Admin User

After setting up the database, you'll need to make your user an admin. Connect to your PostgreSQL database and run:

```sql
UPDATE "User" SET "isAdmin" = true WHERE email = 'your-email@example.com';
```

Or use Prisma Studio:

```bash
bun run db:studio
```

Navigate to the User model and set `isAdmin` to `true` for your user.

### 8. Start Development Server

```bash
bun run dev
```

Visit `http://localhost:3000` to see your Radya Hi5 app!

## 🔍 Debugging

If you encounter issues, use these debugging commands:

### Check Environment Variables

```bash
bun run debug-env.ts
```

This shows:
- ✅ If `.env` file exists
- ✅ All loaded environment variables
- ✅ Variable values (masked for security)
- ✅ Bun environment info

### Test Database Connection

```bash
bun run debug-prisma.ts
```

This shows:
- ✅ Database type and connection string
- ✅ Test queries to database
- ✅ User counts and existing data
- ❌ Any connection errors with solutions

### Check Dev Server Logs

```bash
tail -50 dev.log
```

Shows recent server activity and errors.

### Full Debug Guide

For comprehensive debugging instructions, see [DEBUG-ENV.md](./DEBUG-ENV.md)

## 📁 Project Structure

```
src/
├── app/
│   ├── admin/
│   │   └── page.tsx          # Admin dashboard
│   ├── api/
│   │   ├── auth/
│   │   │   └── [...nextauth]/
│   │   │       └── route.ts  # NextAuth endpoints
│   │   ├── admin/
│   │   │   └── stats/
│   │   │       └── route.ts  # Admin statistics
│   │   ├── kudos/
│   │   │   ├── route.ts      # Create kudos
│   │   │   └── list/
│   │   │       └── route.ts  # Get kudos list
│   │   └── users/
│   │       └── route.ts      # Get users list (from JSON)
│   ├── layout.tsx            # Root layout with providers
│   └── page.tsx              # Main kudos page
├── components/
│   ├── providers.tsx         # SessionProvider wrapper
│   └── ui/                   # shadcn/ui components
└── lib/
    ├── auth.ts               # NextAuth configuration
    ├── db.ts                 # Prisma client
    ├── team-members.json     # Team members list (editable)
    ├── utils.ts              # Utility functions
    ├── values.json           # Predefined company values
    └── icons.ts              # Icon utility functions
```

## 🎨 Customization

### Team Members

Edit `/src/lib/team-members.json` to manage who can receive Hi5s:

```json
[
  {
    "id": "user-001",
    "name": "Alice Johnson",
    "email": "alice@example.com",
    "department": "Engineering"
  }
]
```

**Notes:**
- Each member needs a unique `id`, `name`, and `email`
- When someone receives their first Hi5, a user account is auto-created
- They can sign in with Google later to view their Hi5s
- Changes take effect immediately

For more details, see [TEAM-MEMBERS.md](./TEAM-MEMBERS.md).

### Company Values

Edit `/src/lib/values.json` to customize the values:

```json
[
  {
    "id": "custom-value",
    "name": "Custom Value",
    "description": "Your custom description",
    "icon": "Star",
    "color": "bg-purple-500"
  }
]
```

Available icons from Lucide React: https://lucide.dev/icons/

### Email Template

Customize the email template in `/src/app/api/kudos/route.ts` in the `generateEmailTemplate` function.

## 📊 API Endpoints

### GET `/api/users`
Get list of all team members from JSON (authenticated only)
- Reads from `/src/lib/team-members.json`
- Excludes current user from the list

### POST `/api/kudos`
Create a new Hi5 (authenticated only)
```json
{
  "recipientIds": ["user-001", "user-002"],
  "valueId": "collaboration",
  "message": "Great job on the project!"
}
```
- Recipients are looked up from `team-members.json`
- Auto-creates user accounts if they don't exist
- Sends email notifications to recipients

### GET `/api/kudos/list`
Get Hi5s for current user (authenticated only)

### GET `/api/admin/stats?weeks=4`
Get admin statistics (admin only)

## 🎯 Usage

1. **Sign In**: Click "Sign in with Google"
2. **Give Hi5**:
   - Select up to 3 recipients from the list
   - Choose a value that represents what you're recognizing
   - Write a short message
   - Click "Send Hi5" 🎉
3. **View Dashboard**: As an admin, click "Dashboard" to view statistics

## 🔐 Security

- All API routes are protected with authentication
- Admin routes require `isAdmin` flag to be true
- Environment variables are never exposed to the client
- Google OAuth provides secure authentication

## 🚀 Deployment

### Vercel (Recommended)

For detailed deployment instructions, see:
- 📖 [DEPLOYMENT.md](./DEPLOYMENT.md) - Complete deployment guide
- ✅ [VERCEL-CHECKLIST.md](./VERCEL-CHECKLIST.md) - Quick reference

**Quick Start:**

1. **Prerequisites**
   - GitHub repository with your code
   - PostgreSQL database (Neon, Supabase, or Railway)
   - Google OAuth credentials
   - Resend API key

2. **Prepare Code**
   ```bash
   # Update Prisma schema to PostgreSQL
   # In prisma/schema.prisma:
   datasource db {
     provider = "postgresql"
   }

   # Push schema to database
   bun run db:push

   # Push to GitHub
   git add .
   git commit -m "Ready for deployment"
   git push origin main
   ```

3. **Deploy to Vercel**
   - Go to [Vercel Dashboard](https://vercel.com/dashboard)
   - Click "Add New..." → "Project"
   - Import your GitHub repository
   - Add environment variables:
     ```
     DATABASE_URL=postgresql://...
     NEXTAUTH_URL=https://your-app.vercel.app
     NEXTAUTH_SECRET=generate-with-openssl-rand-base64-32
     GOOGLE_CLIENT_ID=your-client-id
     GOOGLE_CLIENT_SECRET=your-client-secret
     RESEND_API_KEY=your-api-key
     ```
   - Click "Deploy"

4. **Post-Deployment**
   - Update Google OAuth redirect URI to your Vercel URL
   - Run database migrations if needed
   - Create admin user
   - Test the application

**Configuration Files:**
- `vercel.json` - Vercel build settings (auto-configured)
- `.env.example` - Environment variables template

### Other Platforms

Make sure to set the `NEXTAUTH_URL` environment variable to your production URL.

**Key Requirements for Any Platform:**
- PostgreSQL database
- Node.js runtime
- Environment variables set
- Prisma migrations run

## 📝 License

MIT

## 🙏 Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- UI components from [shadcn/ui](https://ui.shadcn.com/)
- Icons from [Lucide](https://lucide.dev/)
- Animations by [Framer Motion](https://www.framer.com/motion/)
- Auth by [NextAuth.js](https://next-auth.js.org/)
