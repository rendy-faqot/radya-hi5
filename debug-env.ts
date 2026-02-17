#!/usr/bin/env bun
// Debug script to check if Bun can read environment variables

console.log('='.repeat(60))
console.log('🔍 Environment Variable Debug Check')
console.log('='.repeat(60))

// Check if .env file exists
import { existsSync, readFileSync } from 'fs'
import { join } from 'path'

const envPath = join(process.cwd(), '.env')
const envExists = existsSync(envPath)

console.log('\n📁 .env File Status:')
console.log(`   Exists: ${envExists ? '✅ Yes' : '❌ No'}`)

if (envExists) {
  try {
    const envContent = readFileSync(envPath, 'utf-8')
    const lines = envContent.split('\n').filter(line => line.trim() && !line.startsWith('#'))

    console.log(`   Total variables: ${lines.length}`)
    console.log(`   File size: ${envContent.length} bytes`)
  } catch (error) {
    console.log(`   Error reading file: ${error}`)
  }
}

// Check environment variables
console.log('\n🔐 Environment Variables:')

const vars = [
  'DATABASE_URL',
  'NEXTAUTH_URL',
  'NEXTAUTH_SECRET',
  'GOOGLE_CLIENT_ID',
  'GOOGLE_CLIENT_SECRET',
  'RESEND_API_KEY',
]

vars.forEach(varName => {
  const value = process.env[varName]
  const hasValue = !!value && value !== ''

  console.log(`\n   ${varName}:`)
  console.log(`     Status: ${hasValue ? '✅ Loaded' : '❌ Missing'}`)

  if (hasValue) {
    // Show masked value for security
    if (varName === 'DATABASE_URL') {
      console.log(`     Value: ${value.replace(/:[^:@]+@/, ':****@').slice(0, 50)}...`)
    } else if (varName.includes('SECRET') || varName.includes('KEY')) {
      console.log(`     Value: ${value.substring(0, 8)}... (masked)`)
    } else if (varName.includes('generate-with')) {
      console.log(`     Value: ${value} (⚠️ Needs real value)`)
    } else {
      console.log(`     Value: ${value.substring(0, 30)}...`)
    }
  }
})

// Check .env.example for reference
const examplePath = join(process.cwd(), '.env.example')
const exampleExists = existsSync(examplePath)

console.log('\n📝 .env.example Status:')
console.log(`   Exists: ${exampleExists ? '✅ Yes' : '❌ No'}`)

// Bun env loading info
console.log('\n🥟 Bun Environment Info:')
console.log(`   cwd(): ${process.cwd()}`)
console.log(`   NODE_ENV: ${process.env.NODE_ENV || 'not set'}`)
console.log(`   env.bun support: ${process.env.DOTENV_KEY ? '✅ Yes' : '⚠️ Using auto-loading'}`)

console.log('\n' + '='.repeat(60))
console.log('✅ Debug Complete!')
console.log('='.repeat(60))
