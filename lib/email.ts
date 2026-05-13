import { Resend } from 'resend'

export async function sendNotificationEmail({
  to,
  subject,
  text
}: {
  to: string
  subject: string
  text: string
}) {
  const apiKey = process.env.RESEND_API_KEY

  if (!apiKey) {
    console.log('Email simulated:', { to, subject, text })
    return
  }

  const resend = new Resend(apiKey)

  try {
    await resend.emails.send({
      from: 'Portivo <notifications@portivo.app>',
      to,
      subject,
      text
    })
  } catch (error) {
    console.error('Failed to send email:', error)
  }
}
