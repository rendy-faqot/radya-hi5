#!/usr/bin/env bun
// Debug script to test Prisma connection and database

import { PrismaClient } from '@prisma/client'
import dotenv from 'dotenv'

console.log('='.repeat(60))
console.log('🗄️  Prisma & Database Debug')
console.log('='.repeat(60))

// Load environment variables manually for debugging
dotenv.config()

console.log('\n📝 Environment Check:')
console.log(`   DATABASE_URL type: ${typeof process.env.DATABASE_URL}`)
console.log(`   DATABASE_URL exists: ${!!process.env.DATABASE_URL}`)

if (process.env.DATABASE_URL) {
  const dbUrl = process.env.DATABASE_URL

  if (dbUrl.startsWith('postgresql://')) {
    console.log('   Database Type: ✅ PostgreSQL')
  } else if (dbUrl.startsWith('file:')) {
    console.log('   Database Type: ✅ SQLite')
  } else if (dbUrl.startsWith('mysql://')) {
    console.log('   Database Type: ✅ MySQL')
  } else {
    console.log('   Database Type: ⚠️ Unknown')
  }

  // Show connection string (masked)
  const maskedUrl = dbUrl.replace(/:[^:@]+@/, ':****@')
  console.log(`   Connection: ${maskedUrl}`)
}

console.log('\n🔌 Testing Database Connection...')

try {
  const prisma = new PrismaClient({
    log: ['query', 'info', 'warn', 'error'],
  })

  console.log('   ✅ Prisma client created successfully')

  // Test connection by querying database
  console.log('\n📊 Testing Queries:')

  try {
    const userCount = await prisma.user.count()
    console.log(`   ✅ User count: ${userCount}`)
  } catch (error: any) {
    console.log(`   ❌ User query failed: ${error.message}`)
    if (error.code) {
      console.log(`      Code: ${error.code}`)
    }
  }

  try {
    const kudosCount = await prisma.kudos.count()
    console.log(`   ✅ Kudos count: ${kudosCount}`)
  } catch (error: any) {
    console.log(`   ❌ Kudos query failed: ${error.message}`)
  }

  try {
    const recipientCount = await prisma.kudosRecipient.count()
    console.log(`   ✅ KudosRecipient count: ${recipientCount}`)
  } catch (error: any) {
    console.log(`   ❌ KudosRecipient query failed: ${error.message}`)
  }

  console.log('\n✅ Database connection successful!')

  // List users if any exist
  const users = await prisma.user.findMany({
    select: {
      id: true,
      email: true,
      name: true,
      isAdmin: true,
    },
  })

  if (users.length > 0) {
    console.log(`\n👥 Existing Users (${users.length}):`)
    users.forEach((user, i) => {
      console.log(`   ${i + 1}. ${user.email} ${user.isAdmin ? '(admin)' : ''}`)
    })
  } else {
    console.log('\n📭 No users in database yet')
  }

  await prisma.$disconnect()
  console.log('\n✅ Disconnected from database')

} catch (error: any) {
  console.log(`\n❌ Connection Failed:`)
  console.log(`   Error: ${error.message}`)

  if (error.code === 'P1001') {
    console.log('\n💡 Solution: Database not reachable')
    console.log('   - Check your DATABASE_URL')
    console.log('   - Make sure database is online')
    console.log('   - Verify network connection')
  } else if (error.code === 'P1003') {
    console.log('\n💡 Solution: Database connection failed')
    console.log('   - Database might not exist')
    console.log('   - Check connection string format')
    console.log('   - Verify credentials')
  } else if (error.code === 'P1000') {
    console.log('\n💡 Solution: Authentication failed')
    console.log('   - Check username/password in DATABASE_URL')
    console.log('   - Verify database permissions')
  }

  console.log('\n📝 Your DATABASE_URL format should be:')
  console.log('   PostgreSQL: postgresql://user:password@host:port/database')
  console.log('   SQLite:     file:/path/to/database.db')
}

console.log('\n' + '='.repeat(60))
console.log('✅ Debug Complete!')
console.log('='.repeat(60))
