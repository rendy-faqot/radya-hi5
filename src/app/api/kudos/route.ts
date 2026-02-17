import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import values from '@/lib/values.json'
import teamMembers from '@/lib/team-members.json'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { recipientIds, valueId, message } = body

    // Validate input
    if (!recipientIds || recipientIds.length === 0 || recipientIds.length > 3) {
      return NextResponse.json(
        { error: 'Please select 1-3 recipients' },
        { status: 400 }
      )
    }

    if (!valueId) {
      return NextResponse.json(
        { error: 'Please select a value' },
        { status: 400 }
      )
    }

    if (!message || message.trim().length === 0) {
      return NextResponse.json(
        { error: 'Please provide a message' },
        { status: 400 }
      )
    }

    // Validate value exists
    const selectedValue = values.find((v) => v.id === valueId)
    if (!selectedValue) {
      return NextResponse.json({ error: 'Invalid value' }, { status: 400 })
    }

    // Find recipients from team members JSON
    const selectedMembers = teamMembers.filter((member) =>
      recipientIds.includes(member.id)
    )

    if (selectedMembers.length !== recipientIds.length) {
      return NextResponse.json(
        { error: 'Some recipients not found' },
        { status: 400 }
      )
    }

    // Ensure users exist in database (create if not)
    const recipientUserIds: string[] = []
    for (const member of selectedMembers) {
      let user = await db.user.findUnique({
        where: { email: member.email },
      })

      if (!user) {
        // Create user if doesn't exist
        user = await db.user.create({
          data: {
            email: member.email,
            name: member.name,
            teamMemberId: member.id,
            isAdmin: false,
          },
        })
      }

      recipientUserIds.push(user.id)
    }

    // Create kudos
    const kudos = await db.kudos.create({
      data: {
        value: valueId,
        message: message.trim(),
        senderId: session.user.id,
        recipients: {
          create: recipientUserIds.map((userId) => ({
            userId,
          })),
        },
      },
      include: {
        sender: true,
        recipients: {
          include: {
            user: true,
          },
        },
      },
    })

    // Send email notifications
    try {
      for (const recipient of kudos.recipients) {
        if (recipient.user.email) {
          await resend.emails.send({
            from: 'Radya Hi5 <hi5@yourdomain.com>',
            to: recipient.user.email,
            subject: `🎉 You received a Hi5 from ${kudos.sender.name || 'someone'}!`,
            html: generateEmailTemplate(kudos, recipient.user, selectedValue),
          })
        }
      }

      // Mark email as sent
      await db.kudos.update({
        where: { id: kudos.id },
        data: { emailSent: true },
      })
    } catch (emailError) {
      console.error('Error sending emails:', emailError)
      // Don't fail the request if email fails
    }

    return NextResponse.json({ kudos }, { status: 201 })
  } catch (error) {
    console.error('Error creating kudos:', error)
    return NextResponse.json(
      { error: 'Failed to create kudos' },
      { status: 500 }
    )
  }
}

function generateEmailTemplate(kudos: any, recipient: any, value: any) {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>You received a Hi5! 🎉</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
      background-color: #f8fafc;
    }
    .container {
      background: white;
      border-radius: 16px;
      padding: 32px;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
    }
    .header {
      text-align: center;
      margin-bottom: 24px;
    }
    .emoji {
      font-size: 48px;
      margin-bottom: 16px;
    }
    h1 {
      color: #1e293b;
      font-size: 24px;
      margin: 0 0 8px 0;
    }
    .subtitle {
      color: #64748b;
      font-size: 16px;
    }
    .hi5-card {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      border-radius: 12px;
      padding: 24px;
      margin: 24px 0;
      color: white;
    }
    .sender-info {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 16px;
    }
    .sender-avatar {
      width: 48px;
      height: 48px;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.2);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 24px;
    }
    .sender-name {
      font-weight: 600;
      font-size: 18px;
    }
    .value-badge {
      display: inline-block;
      background: rgba(255, 255, 255, 0.2);
      padding: 6px 12px;
      border-radius: 20px;
      font-size: 14px;
      font-weight: 500;
      margin-bottom: 12px;
    }
    .message {
      background: rgba(255, 255, 255, 0.15);
      border-radius: 8px;
      padding: 16px;
      font-style: italic;
      margin-top: 16px;
    }
    .footer {
      text-align: center;
      margin-top: 32px;
      color: #94a3b8;
      font-size: 14px;
    }
    .cta-button {
      display: inline-block;
      background: #1e293b;
      color: white;
      padding: 12px 24px;
      border-radius: 8px;
      text-decoration: none;
      font-weight: 600;
      margin-top: 16px;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="emoji">🎉</div>
      <h1>You received a Hi5!</h1>
      <p class="subtitle">Keep up the amazing work!</p>
    </div>

    <div class="hi5-card">
      <div class="sender-info">
        <div class="sender-avatar">👤</div>
        <div class="sender-name">From: ${kudos.sender.name || 'Someone'}</div>
      </div>

      <div class="value-badge">
        ✨ ${value.name}
      </div>

      <p style="margin: 0 0 16px 0; opacity: 0.9;">
        ${value.description}
      </p>

      <div class="message">
        "${kudos.message}"
      </div>
    </div>

    <div style="text-align: center;">
      <a href="${process.env.NEXTAUTH_URL || 'http://localhost:3000'}" class="cta-button">
        View All Hi5s
      </a>
    </div>

    <div class="footer">
      <p>Received on ${new Date(kudos.createdAt).toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })}</p>
      <p style="margin-top: 8px;">Keep spreading positivity! 💜</p>
    </div>
  </div>
</body>
</html>
  `
}
