import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Sync current user with team-members.json
    const user = await db.user.findUnique({
      where: { id: session.user.id },
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Find if this email exists in team-members.json
    const teamMembers = (await import('@/lib/team-members.json')).default
    const teamMember = teamMembers.find((member: any) => member.email === user.email)

    let syncedUser = user

    if (teamMember) {
      // Update user with team member info
      syncedUser = await db.user.update({
        where: { id: user.id },
        data: {
          teamMemberId: teamMember.id,
          name: user.name || teamMember.name,
        },
      })
    }

    return NextResponse.json({
      user: {
        id: syncedUser.id,
        email: syncedUser.email,
        name: syncedUser.name,
        image: syncedUser.image,
        isAdmin: syncedUser.isAdmin,
        teamMemberId: syncedUser.teamMemberId,
      },
      isLinkedToTeamMember: !!teamMember,
      teamMember: teamMember || null,
    })
  } catch (error) {
    console.error('Error syncing user:', error)
    return NextResponse.json(
      { error: 'Failed to sync user' },
      { status: 500 }
    )
  }
}
