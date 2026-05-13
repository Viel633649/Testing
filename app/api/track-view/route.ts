import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'
import { sendNotificationEmail } from '@/lib/email'

export async function POST(request: Request) {
  const { projectId, freelancerEmail, clientName, projectTitle } = await request.json()
  const supabase = await createClient()

  const { data: existingViews } = await supabase
    .from('link_events')
    .select('id')
    .eq('project_id', projectId)
    .eq('event_type', 'viewed')
    .limit(1)

  await supabase.from('link_events').insert({
    project_id: projectId,
    event_type: 'viewed'
  })

  if (!existingViews || existingViews.length === 0) {
    await sendNotificationEmail({
      to: freelancerEmail,
      subject: `Project Viewed: ${projectTitle}`,
      text: `Client ${clientName} just viewed the project link for the first time.`
    })
  }

  return NextResponse.json({ success: true })
}
