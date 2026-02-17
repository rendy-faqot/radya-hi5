# 🔄 User Sync & Migration Strategy

This document explains how the system now handles user synchronization with `team-members.json` and how to rollback to a relational model if needed.

## Current Approach: JSON Storage with User Sync

### How It Works

1. **User Sign-In Process**
   - User signs in with Google OAuth
   - System checks if their email exists in `team-members.json`
   - If yes, updates the User record with:
     - `teamMemberId`: The ID from JSON
     - `department`: The department from JSON
     - `name`: Synced name (Google or JSON)

2. **User Schema**
   ```prisma
   model User {
     id           String   @id @default(cuid())
     email        String   @unique
     name         String?
     image        String?
     isAdmin      Boolean  @default(false)
     teamMemberId String?  // NEW: Links to team-members.json
     department   String?  // NEW: From team-members.json
     createdAt    DateTime @default(now())
     updatedAt    DateTime @updatedAt

     sentKudos    Kudos[]  @relation("KudosSender")
   }
   ```

3. **Kudos Storage**
   ```prisma
   model Kudos {
     id          String   @id @default(cuid())
     value       String
     message     String
     senderId    String
     recipients  String   // JSON array of recipient info
     createdAt   DateTime @default(now())
     emailSent   Boolean  @default(false)

     sender      User     @relation("KudosSender", fields: [senderId], references: [id], onDelete: Cascade)
   }
   ```

### Benefits

✅ **No OAuth conflicts** - Recipients can sign in anytime
✅ **User tracking** - We know which users are in the team
✅ **Migration ready** - `teamMemberId` allows future rollback
✅ **Department info** - Available for analytics
✅ **Flexible** - Can still use JSON for now

## How to Check User Sync Status

### API Endpoint

```bash
POST /api/admin/sync-user
```

**Response:**
```json
{
  "user": {
    "id": "user-123",
    "email": "alice@example.com",
    "name": "Alice Johnson",
    "teamMemberId": "user-001",
    "department": "Engineering",
    "isAdmin": false
  },
  "isLinkedToTeamMember": true,
  "teamMember": {
    "id": "user-001",
    "name": "Alice Johnson",
    "email": "alice@example.com",
    "department": "Engineering"
  }
}
```

### Usage in Frontend

```typescript
// Sync current user on page load
useEffect(() => {
  const syncUser = async () => {
    await fetch('/api/admin/sync-user', { method: 'POST' })
  }
  syncUser()
}, [])
```

### Admin Stats Enhancement

The admin stats now include user linking information:

```json
{
  "userStats": {
    "totalUsers": 15,
    "linkedUsers": 10,
    "unlinkedUsers": 5
  }
}
```

## Rolling Back to Relational Model

### Step 1: Run Migration Script

I've created a migration script that guides you through the rollback:

```bash
bun run scripts/migrate-recipients-to-relational.ts
```

This script will:
1. Show you the schema changes needed
2. Create Recipient records from `team-members.json`
3. Migrate existing JSON recipients to relational links
4. Provide instructions for API updates

### Step 2: Update Schema

Add these models to `prisma/schema.prisma`:

```prisma
model Recipient {
  id          String   @id @default(cuid())
  teamMemberId String   @unique
  name        String
  email       String   @unique
  department  String?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  receivedKudos KudosRecipient[]
}

model KudosRecipient {
  id          String   @id @default(cuid())
  kudosId     String
  recipientId String
  createdAt   DateTime @default(now())

  kudos       Kudos    @relation(fields: [kudosId], references: [id], onDelete: Cascade)
  recipient   Recipient @relation(fields: [recipientId], references: [id], onDelete: Cascade)

  @@unique([kudosId, recipientId])
  @@index([recipientId])
  @@index([createdAt])
}
```

### Step 3: Update Kudos Model (After Migration)

```prisma
model Kudos {
  id          String   @id @default(cuid())
  value       String
  message     String
  senderId    String
  recipients  KudosRecipient[]  // Change from String to relation
  createdAt   DateTime @default(now())
  emailSent   Boolean  @default(false)

  sender      User     @relation("KudosSender", fields: [senderId], references: [id], onDelete: Cascade)
}
```

### Step 4: Update API Endpoints

**`/api/kudos/route.ts`**

```typescript
// Before: Store as JSON
const kudos = await db.kudos.create({
  data: {
    value: valueId,
    message: message.trim(),
    senderId: session.user.id,
    recipients: JSON.stringify(selectedMembers),
  },
})

// After: Create recipients and link
const recipientIds: string[] = []
for (const member of selectedMembers) {
  let recipient = await db.recipient.findUnique({
    where: { email: member.email },
  })

  if (!recipient) {
    recipient = await db.recipient.create({
      data: {
        teamMemberId: member.id,
        name: member.name,
        email: member.email,
        department: member.department,
      },
    })
  }

  recipientIds.push(recipient.id)
}

const kudos = await db.kudos.create({
  data: {
    value: valueId,
    message: message.trim(),
    senderId: session.user.id,
    recipients: {
      create: recipientIds.map((recipientId) => ({ recipientId })),
    },
  },
  include: {
    recipients: {
      include: { recipient: true },
    },
  },
})
```

### Step 5: Update Frontend

No major changes needed! The data structure remains similar:

```typescript
// Before (JSON)
{kudo.recipients.map((r) => r.name)}

// After (Relational)
{kudo.recipients.map((r) => r.recipient.name)}
```

Just update the property access from direct fields to `recipient.*`.

### Step 6: Re-enable Admin Stats

Update `/api/admin/stats/route.ts`:

```typescript
// Most received kudos
const mostReceived = await db.kudosRecipient.groupBy({
  by: ['recipientId'],
  where: {
    createdAt: { gte: startDate },
  },
  _count: {
    id: true,
  },
  orderBy: {
    _count: {
      id: 'desc',
    },
  },
  take: 10,
})
```

## Migration Timeline

### Phase 1: Current (JSON Storage + User Sync)
- ✅ Users stored in database
- ✅ Recipients stored as JSON
- ✅ User sync on sign-in
- ✅ `teamMemberId` and `department` tracked
- ✅ Ready for migration

### Phase 2: Prepare for Migration
- ⏳ Create Recipient table
- ⏳ Create KudosRecipient table
- ⏳ Run migration script
- ⏳ Test with both storage methods

### Phase 3: Migrate (Relational Storage)
- ⏳ Update API endpoints
- ⏳ Update frontend (minimal changes)
- ⏳ Re-enable recipient statistics
- ⏳ Remove JSON field after verification

### Phase 4: Complete
- ⏳ Full relational model
- ⏅ "Most received" statistics enabled
- ⏅ Recipients can view received kudos

## Testing the Sync

### Test 1: New User (Not in JSON)

1. Sign in with Google (email not in `team-members.json`)
2. Check User record:
   ```bash
   bun run db:studio
   ```
3. Verify:
   - `teamMemberId` is `null`
   - `department` is `null`

### Test 2: Existing Team Member (In JSON)

1. Add your email to `team-members.json`
2. Sign in with Google
3. Check User record
4. Verify:
   - `teamMemberId` is set (e.g., "user-001")
   - `department` is set (e.g., "Engineering")
   - Name is synced

### Test 3: Sync API

```bash
curl -X POST http://localhost:3000/api/admin/sync-user \
  -H "Content-Type: application/json" \
  -H "Cookie: next-auth.session-token=YOUR_SESSION_TOKEN"
```

## Advantages of This Approach

### Immediate Benefits
- ✅ Solves OAuth conflict issue
- ✅ Tracks team member relationships
- ✅ Enables future rollback
- ✅ No breaking changes now

### Future Benefits (After Migration)
- ✅ Recipient statistics
- ✅ Recipients can view received kudos
- ✅ Better data integrity
- ✅ More efficient queries

## Rollback Path

If you want to rollback to the previous relational model now:

1. **Keep current changes** - They don't break anything
2. **Run migration script** - It guides you through the process
3. **Update APIs** - Switch from JSON to relational
4. **Test thoroughly** - Ensure everything works
5. **Deploy** - Push changes to production

The current setup is a **bridge** that allows you to:
- Use JSON storage now (simple, flexible)
- Track user relationships (future-proof)
- Migrate to relational model when ready (planned path)

## Need Help?

- **Migration script**: `scripts/migrate-recipients-to-relational.ts`
- **User sync API**: `/api/admin/sync-user`
- **Admin stats**: Includes user linking counts

Run the migration script anytime you're ready to rollback to relational storage!
