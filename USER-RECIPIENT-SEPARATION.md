# 🔧 User/Recipient Separation - Changes Made

## Problem Solved

Previously, when recipients from `team-members.json` tried to sign in, they got an `OAuthAccountNotLinked` error because the system was trying to create user accounts in the database for them.

## Solution

**Separation of concerns:**
- **Users** = People who sign in to GIVE kudos (stored in database with OAuth)
- **Recipients** = People listed in `team-members.json` who RECEIVE kudos (don't need to sign in)

## Changes Made

### 1. Updated Database Schema (`prisma/schema.prisma`)

**Before:**
```prisma
model KudosRecipient {
  id        String   @id @default(cuid())
  kudosId   String
  userId    String   // Linked to User table
  createdAt DateTime @default(now())
  kudos     Kudos    @relation(...)
  user      User     @relation(...)
}
```

**After:**
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

**Key Changes:**
- ❌ Removed `KudosRecipient` table
- ✅ Added `recipients` field as String (stores JSON)
- ✅ Recipients are not linked to User table anymore

### 2. Updated Kudos API (`src/app/api/kudos/route.ts`)

**Before:**
```typescript
// Find recipients and create user accounts
const selectedMembers = teamMembers.filter(...)
const recipientUserIds: string[] = []
for (const member of selectedMembers) {
  let user = await db.user.findUnique({ where: { email: member.email } })
  if (!user) {
    user = await db.user.create({ ... }) // Auto-create user
  }
  recipientUserIds.push(user.id)
}

// Create kudos with user links
const kudos = await db.kudos.create({
  data: {
    value: valueId,
    message: message.trim(),
    senderId: session.user.id,
    recipients: {
      create: recipientUserIds.map((userId) => ({ userId }))
    },
  },
})
```

**After:**
```typescript
// Find recipients from JSON only
const selectedMembers = teamMembers.filter((member) =>
  recipientIds.includes(member.id)
)

// Create kudos with recipients as JSON
const kudos = await db.kudos.create({
  data: {
    value: valueId,
    message: message.trim(),
    senderId: session.user.id,
    recipients: JSON.stringify(selectedMembers), // Store as JSON
  },
})

// Send emails to JSON member emails directly
for (const member of selectedMembers) {
  await resend.emails.send({
    to: member.email, // Use email from JSON
    html: generateEmailTemplate(kudos, member, selectedValue),
  })
}
```

### 3. Updated Kudos List API (`src/app/api/kudos/list/route.ts`)

**Before:**
```typescript
const kudos = await db.kudos.findMany({
  include: {
    sender: { ... },
    recipients: {
      include: { user: { ... } }
    }
  },
})
```

**After:**
```typescript
const kudos = await db.kudos.findMany({
  include: {
    sender: { ... },
  },
})

// Parse recipients JSON for each kudos
const kudosWithParsedRecipients = kudos.map((kudos) => ({
  ...kudos,
  recipients: JSON.parse(kudos.recipients),
}))
```

### 4. Updated Main Page (`src/app/page.tsx`)

**Before:**
```tsx
{kudo.recipients.map((recipient: any) => (
  <Avatar key={recipient.user.id}>
    <AvatarImage src={recipient.user.image} />
    <AvatarFallback>{recipient.user.name?.[0]}</AvatarFallback>
  </Avatar>
))}
```

**After:**
```tsx
{kudo.recipients.map((recipient: any) => (
  <Avatar key={recipient.id} title={recipient.name}>
    <AvatarFallback>{recipient.name?.[0]}</AvatarFallback>
  </Avatar>
))}
<span className="text-xs text-gray-500 ml-2">
  {kudo.recipients.map((r: any) => r.name).join(', ')}
</span>
```

### 5. Updated Admin Stats API (`src/app/api/admin/stats/route.ts`)

**Before:**
```typescript
// Most received kudos
const mostReceived = await db.kudosRecipient.groupBy({
  by: ['userId'],
  ...
})
```

**After:**
```typescript
// Most received kudos - not available with JSON storage
return NextResponse.json({
  mostReceived: [], // Empty array
  mostGiven: ...,
  mostValues: ...,
})
```

### 6. Updated Admin Dashboard (`src/app/admin/page.tsx`)

Added a message explaining that "Most Received Hi5s" is not available with the current JSON storage approach.

## How It Works Now

### Giving Kudos

1. User signs in with Google → Creates/updates User in database
2. User selects recipients from `team-members.json`
3. User submits Hi5
4. System stores recipient info as JSON in `Kudos.recipients` field
5. System sends emails to recipient emails from JSON
6. **No user account created for recipients**

### Receiving Kudos

1. Recipient receives email notification
2. Recipient does NOT need to sign in to receive kudos
3. If recipient later wants to sign in:
   - They sign in with Google
   - Creates their own User account (for giving kudos)
   - **No conflict with previous kudos received**

### Benefits

✅ **No OAuth conflicts** - Recipients can sign in anytime without errors
✅ **Flexibility** - Can add/remove recipients from JSON anytime
✅ **Simplified** - Don't need to pre-create user accounts
✅ **Email-based** - Notifications work regardless of sign-in status

### Limitations

❌ **No recipient statistics** - Can't track "most received" kudos efficiently
❌ **Recipient can't view received kudos** - Unless they sign in (and even then, we'd need to add a feature to show kudos received by their email)

## Recipient Data Structure

Each recipient stored in the JSON has:
```json
{
  "id": "user-001",
  "name": "Alice Johnson",
  "email": "alice@example.com",
  "department": "Engineering"
}
```

## Future Enhancements (Optional)

If you need recipient statistics or want recipients to view their received kudos:

1. **Add a `Recipient` table** to store people from JSON
2. **Link kudos to recipients** instead of storing JSON
3. **Allow recipients to claim their account** by verifying email

For now, the current solution is simpler and solves the OAuth conflict issue.
