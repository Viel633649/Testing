import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'
import { sendNotificationEmail } from '@/lib/email'

export async function POST(request: Request) {
  const { to, contactName, contactEmail, contactMessage } = await request.json()
  const supabase = await createClient()

  // Validate the recipient exists in our profiles to prevent open relay
  const { data: profile } = await supabase
    .from('profiles')
    .select('email')
    .eq('email', to)
    .single()

  if (!profile) {
    return NextResponse.json({ error: 'Invalid recipient' }, { status: 400 })
  }

  await sendNotificationEmail({
    to,
    subject: `New Inquiry from ${contactName}`,
    text: `You have a new message from ${contactName} (${contactEmail}):\n\n${contactMessage}`
  })

  return NextResponse.json({ success: true })
}
