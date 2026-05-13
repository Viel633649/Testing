import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'

export async function POST(request: Request) {
  const body = await request.json()
  const supabase = await createClient()

  // Webhook signature verification for Paystack
  const paystackSignature = request.headers.get('x-paystack-signature')
  // In production, use crypto to verify the signature:
  // const hash = crypto.createHmac('sha512', process.env.PAYSTACK_SECRET_KEY!).update(JSON.stringify(body)).digest('hex')
  // if (hash !== paystackSignature) return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })

  const event = body.event
  const data = body.data

  if (event === 'charge.success') {
    const reference = data.reference
    const amount = data.amount
    const customerEmail = data.customer.email

    // Update invoice status based on reference (which should be invoice_id or stored meta)
    // For MVP, we assume reference is the invoice ID
    const { error } = await supabase
      .from('invoices')
      .update({
        status: 'paid',
        paid_at: new Date().toISOString(),
        payment_reference: reference,
        payment_provider: 'paystack'
      })
      .eq('id', reference) // Should use a more robust lookup

    if (error) {
      console.error('Error updating invoice:', error)
      return NextResponse.json({ error: 'Database update failed' }, { status: 500 })
    }

    // Log event
    const { data: invoice } = await supabase.from('invoices').select('project_id').eq('id', reference).single()
    if (invoice) {
        await supabase.from('link_events').insert({
            project_id: invoice.project_id,
            event_type: 'payment_completed'
        })
    }
  }

  return NextResponse.json({ received: true })
}
