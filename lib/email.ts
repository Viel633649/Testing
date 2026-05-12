import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function sendNotificationEmail({
  to,
  subject,
  text
}: {
  to: string
  subject: string
  text: string
}) {
  if (!process.env.RESEND_API_KEY) {
    console.log('Email simulated:', { to, subject, text })
    return
  }

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
