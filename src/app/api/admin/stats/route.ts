import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user || !session.user.isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const searchParams = req.nextUrl.searchParams
    const weeks = parseInt(searchParams.get('weeks') || '4')

    const startDate = new Date()
    startDate.setDate(startDate.getDate() - weeks * 7)

    // Most received kudos
    const mostReceived = await db.kudosRecipient.groupBy({
      by: ['userId'],
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

    const mostReceivedWithUsers = await Promise.all(
      mostReceived.map(async (item) => {
        const user = await db.user.findUnique({
          where: { id: item.userId },
          select: { id: true, name: true, email: true, image: true, teamMemberId: true },
        })
        return {
          user,
          count: item._count.id,
        }
      })
    )

    // Most given kudos
    const mostGiven = await db.kudos.groupBy({
      by: ['senderId'],
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

    const mostGivenWithUsers = await Promise.all(
      mostGiven.map(async (item) => {
        const user = await db.user.findUnique({
          where: { id: item.senderId },
          select: { id: true, name: true, email: true, image: true, teamMemberId: true },
        })
        return {
          user,
          count: item._count.id,
        }
      })
    )

    // Most popular values
    const mostValues = await db.kudos.groupBy({
      by: ['value'],
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

    // Total kudos this week
    const weekAgo = new Date()
    weekAgo.setDate(weekAgo.getDate() - 7)

    const totalKudosThisWeek = await db.kudos.count({
      where: {
        createdAt: { gte: weekAgo },
      },
    })

    // Total kudos overall
    const totalKudosOverall = await db.kudos.count()

    // Count users linked to team members
    const linkedUsersCount = await db.user.count({
      where: {
        teamMemberId: { not: null },
      },
    })

    // Count total users
    const totalUsersCount = await db.user.count()

    return NextResponse.json({
      mostReceived: mostReceivedWithUsers,
      mostGiven: mostGivenWithUsers,
      mostValues,
      totalKudosThisWeek,
      totalKudosOverall,
      weeks,
      userStats: {
        totalUsers: totalUsersCount,
        linkedUsers: linkedUsersCount,
        unlinkedUsers: totalUsersCount - linkedUsersCount,
      },
    })
  } catch (error) {
    console.error('Error fetching stats:', error)
    return NextResponse.json(
      { error: 'Failed to fetch stats' },
      { status: 500 }
    )
  }
}
