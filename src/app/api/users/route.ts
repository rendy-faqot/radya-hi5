import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import teamMembers from '@/lib/team-members.json'

interface TeamMember {
  id: string
  name: string
  email: string
}

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const currentUserId = (session.user as any).id

    const dbUsers = await db.user.findMany({
      where: {
        id: { not: currentUserId },
      },
      select: {
        id: true,
        email: true,
        name: true,
        image: true,
        teamMemberId: true,
      },
    })

    const usersWithoutTeamMemberId = dbUsers.filter((u) => !u.teamMemberId)

    const dbUserNames = new Set(dbUsers.map((u) => u.name?.toLowerCase()))

    const remainingTeamMembers = (teamMembers as TeamMember[]).filter(
      (tm) => !dbUserNames.has(tm.name.toLowerCase())
    )

    const mergedUsers = [
      ...usersWithoutTeamMemberId.map((dbUser) => ({
        id: dbUser.id,
        email: dbUser.email,
        name: dbUser.name,
        image: dbUser.image,
        teamMemberId: null,
      })),
      ...remainingTeamMembers.map((tm) => ({
        id: tm.id,
        email: tm.email,
        name: tm.name,
        image: null,
        teamMemberId: tm.id,
      })),
    ]

    const users = mergedUsers.sort((a, b) => (a.name || '').localeCompare(b.name || ''))

    return NextResponse.json({ users })
  } catch (error) {
    console.error('Error fetching users:', error)
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    )
  }
}
