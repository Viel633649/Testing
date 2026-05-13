import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'
import { sendNotificationEmail } from '@/lib/email'

export async function POST(request: Request) {
  const { projectId, deliverableId, content, freelancerEmail, clientName, projectTitle } = await request.json()
  const supabase = await createClient()

  const { error } = await supabase.from('feedback').insert({
    project_id: projectId,
    deliverable_id: deliverableId || null,
    content: content
  })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  await supabase.from('link_events').insert({
    project_id: projectId,
    event_type: 'feedback_submitted'
  })

  // Send email notification from server-side
  await sendNotificationEmail({
    to: freelancerEmail,
    subject: `New Feedback: ${projectTitle}`,
    text: `Client ${clientName} submitted feedback: "${content}"`
  })

  return NextResponse.json({ success: true })
}
