import { NextResponse } from 'next/server'
import { sendNotificationEmail } from '@/lib/email'

export async function POST(request: Request) {
  try {
    const { to, subject, text } = await request.json()
    await sendNotificationEmail({ to, subject, text })
    return NextResponse.json({ sent: true })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to send notification' }, { status: 500 })
  }
}
