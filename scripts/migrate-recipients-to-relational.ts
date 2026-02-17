/**
 * Migration Script: Convert JSON Recipients to Relational Model
 *
 * This script can be used to migrate from JSON storage to a proper relational model.
 * Run this with: bun run scripts/migrate-recipients-to-relational.ts
 */

import { PrismaClient } from '@prisma/client'
import teamMembers from '../src/lib/team-members.json'

const prisma = new PrismaClient()

async function migrateToRelational() {
  console.log('🚀 Starting migration to relational model...\n')

  try {
    // Step 1: Create Recipient table in schema
    console.log('Step 1: Add Recipient model to prisma/schema.prisma')
    console.log(`
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
    `)
    console.log('⏸️  Please add the Recipient model to your schema first, then run: bun run db:push\n')

    // Step 2: Create recipients from team-members.json
    console.log('Step 2: Creating recipients from team-members.json')
    for (const member of teamMembers) {
      const existingRecipient = await prisma.$queryRaw`
        SELECT * FROM Recipient WHERE email = ${member.email}
      `

      if (!existingRecipient || existingRecipient.length === 0) {
        await prisma.$queryRaw`
          INSERT INTO Recipient (id, teamMemberId, name, email, department, createdAt, updatedAt)
          VALUES (${crypto.randomUUID()}, ${member.id}, ${member.name}, ${member.email}, ${member.department || null}, datetime('now'), datetime('now'))
        `
        console.log(`  ✅ Created recipient: ${member.name} (${member.email})`)
      } else {
        console.log(`  ⏭️  Recipient already exists: ${member.name} (${member.email})`)
      }
    }
    console.log()

    // Step 3: Update KudosRecipient schema
    console.log('Step 3: Update KudosRecipient model in schema')
    console.log(`
model KudosRecipient {
  id          String   @id @default(cuid())
  kudosId     String
  recipientId String   // Link to Recipient table instead of User
  createdAt   DateTime @default(now())

  kudos       Kudos    @relation(fields: [kudosId], references: [id], onDelete: Cascade)
  recipient   Recipient @relation(fields: [recipientId], references: [id], onDelete: Cascade)

  @@unique([kudosId, recipientId])
  @@index([recipientId])
  @@index([createdAt])
}
    `)
    console.log('⏸️  Please update KudosRecipient model in your schema, then run: bun run db:push\n')

    // Step 4: Migrate existing kudos recipients
    console.log('Step 4: Migrating existing kudos recipients')
    const kudos = await prisma.kudos.findMany({
      select: { id: true, recipients: true },
    })

    for (const kudosRecord of kudos) {
      const recipients = JSON.parse(kudosRecord.recipients)

      for (const recipient of recipients) {
        // Find recipient by email
        const dbRecipient = await prisma.$queryRaw`
          SELECT * FROM Recipient WHERE email = ${recipient.email}
        `

        if (dbRecipient && dbRecipient.length > 0) {
          // Check if already linked
          const existingLink = await prisma.$queryRaw`
            SELECT * FROM KudosRecipient WHERE kudosId = ${kudosRecord.id} AND recipientId = ${dbRecipient[0].id}
          `

          if (!existingLink || existingLink.length === 0) {
            await prisma.$queryRaw`
              INSERT INTO KudosRecipient (id, kudosId, recipientId, createdAt)
              VALUES (${crypto.randomUUID()}, ${kudosRecord.id}, ${dbRecipient[0].id}, datetime('now'))
            `
            console.log(`  ✅ Linked kudos ${kudosRecord.id} to recipient ${recipient.name}`)
          } else {
            console.log(`  ⏭️  Already linked: ${recipient.name}`)
          }
        } else {
          console.log(`  ❌ Recipient not found: ${recipient.name} (${recipient.email})`)
        }
      }
    }
    console.log()

    // Step 5: Update API to use relational model
    console.log('Step 5: Update API endpoints')
    console.log(`
Update /api/kudos/route.ts to:
  - Find recipients from team-members.json
  - Get or create Recipient records
  - Link kudos to Recipient instead of storing JSON

Update /api/kudos/list/route.ts to:
  - Include recipients with Recipient data

Update /api/admin/stats/route.ts to:
  - Query KudosRecipient for "most received" stats
    `)

    // Step 6: Cleanup (optional)
    console.log('\nStep 6: Cleanup (after verification)')
    console.log(`
After verifying everything works:
  1. Remove 'recipients' field from Kudos model
  2. Run: bun run db:push
  3. Update frontend to use relational data
    `)

    console.log('\n✅ Migration guide complete!')
    console.log('\n📝 Summary of changes needed:')
    console.log('  1. Add Recipient model to schema')
    console.log('  2. Update KudosRecipient model to link to Recipient')
    console.log('  3. Run database migration')
    console.log('  4. Update API endpoints')
    console.log('  5. Update frontend')
    console.log('  6. Remove JSON recipients field after verification')

  } catch (error) {
    console.error('❌ Migration failed:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

// Only run if executed directly
if (import.meta.main) {
  migrateToRelational()
    .then(() => {
      console.log('\n🎉 Migration script completed!')
      process.exit(0)
    })
    .catch((error) => {
      console.error('\n💥 Migration failed:', error)
      process.exit(1)
    })
}

export { migrateToRelational }
