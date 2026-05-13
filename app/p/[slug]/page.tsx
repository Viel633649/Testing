'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase-client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardHeader, CardTitle, CardContent, CardFooter, CardDescription } from '@/components/ui/card'
import { Download, CheckCircle, CreditCard } from 'lucide-react'

interface PageProps {
  params: { slug: string }
}

export default function ClientPortalPage({ params }: PageProps) {
  const { slug } = params
  const [loading, setLoading] = useState(true)
  const [project, setProject] = useState<any>(null)
  const [invoice, setInvoice] = useState<any>(null)
  const [freelancer, setFreelancer] = useState<any>(null)
  const [feedback, setFeedback] = useState('')
  const [selectedFile, setSelectedFile] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    async function loadProject() {
      const { data: projectData } = await supabase
        .from('projects')
        .select('*, deliverables(*), profiles:user_id(*)')
        .eq('public_slug', slug)
        .single()

      if (projectData) {
        setProject(projectData)
        setFreelancer(projectData.profiles)

        const { data: invoiceData } = await supabase
          .from('invoices')
          .select('*, invoice_items(*)')
          .eq('project_id', projectData.id)
          .single()

        if (invoiceData) setInvoice(invoiceData)

        // Track view event via server-side logic
        fetch('/api/track-view', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                projectId: projectData.id,
                freelancerEmail: projectData.profiles.email,
                clientName: projectData.client_name,
                projectTitle: projectData.title
            })
        }).catch(console.error)
      }
      setLoading(false)
    }
    loadProject()
  }, [slug, supabase])

  const handleSubmitFeedback = async () => {
    if (!feedback) return
    setSubmitting(true)

    const response = await fetch('/api/feedback', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        projectId: project.id,
        deliverableId: selectedFile,
        content: feedback,
        freelancerEmail: freelancer.email,
        clientName: project.client_name,
        projectTitle: project.title
      })
    })

    if (response.ok) {
        setFeedback('')
        alert('Feedback submitted! Your freelancer has been notified.')
    } else {
        alert('Failed to submit feedback.')
    }
    setSubmitting(false)
  }

  const handlePayment = async () => {
    setSubmitting(true)

    const response = await fetch('/api/payments/initialize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            invoiceId: invoice.id,
            email: project.client_email,
            amount: total,
            currency: invoice.currency
        })
    })

    const result = await response.json()

    if (result.status) {
        // In a real app, we would redirect:
        // window.location.href = result.data.authorization_url

        // For MVP mock simulation of success:
        alert('Redirecting to Paystack... (Simulated)')

        // Simulate webhook callback after a delay
        setTimeout(async () => {
            await fetch('/api/webhooks/paystack', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    event: 'charge.success',
                    data: {
                        reference: invoice.id,
                        amount: total * 100,
                        customer: { email: project.client_email }
                    }
                })
            })
            window.location.reload()
        }, 2000)

    } else {
        alert('Failed to initialize payment.')
    }
    setSubmitting(false)
  }

  if (loading) return <div className="p-20 text-center">Loading portal...</div>
  if (!project) return <div className="p-20 text-center text-red-500">Project not found.</div>

  const total = invoice?.invoice_items?.reduce((acc: number, item: any) => acc + Number(item.total), 0) || 0

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4">
      <div className="max-w-4xl mx-auto space-y-8">
        <header className="flex justify-between items-end border-b pb-6">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">{project.title}</h1>
            <p className="text-slate-500">Client Portal • Prepared by {freelancer?.full_name || 'Freelancer'}</p>
          </div>
          {freelancer?.avatar_url && <img src={freelancer.avatar_url} className="w-12 h-12 rounded-full border shadow-sm" alt="Freelancer" />}
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <section className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Deliverables</CardTitle>
                <CardDescription>Review and download the project files below.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {project.deliverables?.map((file: any) => (
                  <div key={file.id} className="flex justify-between items-center p-4 bg-white border rounded-lg hover:border-blue-300 transition-colors">
                    <div>
                      <p className="font-medium text-sm">{file.file_name}</p>
                      <p className="text-[10px] text-slate-400">{(file.file_size_bytes / 1024 / 1024).toFixed(2)} MB</p>
                    </div>
                    <a
                      href={file.file_url}
                      download
                      className="p-2 bg-slate-50 rounded-full hover:bg-blue-50 text-blue-600"
                      onClick={() => supabase.from('link_events').insert({ project_id: project.id, event_type: 'downloaded' })}
                    >
                      <Download className="w-4 h-4" />
                    </a>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Leave Feedback</CardTitle>
                <CardDescription>Structured feedback helps the freelancer improve the work.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase text-slate-400">Which file does this apply to?</label>
                  <select
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    value={selectedFile}
                    onChange={(e) => setSelectedFile(e.target.value)}
                  >
                    <option value="">General Project Feedback</option>
                    {project.deliverables?.map((f: any) => (
                      <option key={f.id} value={f.id}>{f.file_name}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase text-slate-400">Comments</label>
                  <textarea
                    className="w-full min-h-[100px] rounded-md border border-input bg-background px-3 py-2 text-sm"
                    placeholder="Tell the freelancer what you think..."
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                  />
                </div>
              </CardContent>
              <CardFooter>
                <Button className="w-full" onClick={handleSubmitFeedback} disabled={submitting}>
                  {submitting ? 'Submitting...' : 'Submit Feedback'}
                </Button>
              </CardFooter>
            </Card>
          </section>

          <section>
            <Card className="border-2 border-slate-900 shadow-xl overflow-hidden">
              <div className="bg-slate-900 text-white p-6">
                <h3 className="text-lg font-bold">Invoice</h3>
                <p className="text-slate-400 text-xs">Status: {invoice?.status?.toUpperCase() || 'NOT ISSUED'}</p>
              </div>
              <CardContent className="p-6">
                {!invoice ? (
                  <p className="text-center py-10 text-slate-400">No invoice has been issued yet for this project.</p>
                ) : (
                  <>
                    <div className="space-y-4 mb-6">
                      {invoice.invoice_items?.map((item: any) => (
                        <div key={item.id} className="flex justify-between items-start text-sm border-b border-slate-100 pb-3 last:border-0">
                          <div>
                            <p className="font-medium">{item.description}</p>
                            <p className="text-xs text-slate-500">Qty: {item.quantity}</p>
                          </div>
                          <p className="font-semibold">{invoice.currency} {Number(item.total).toLocaleString()}</p>
                        </div>
                      ))}
                    </div>
                    <div className="flex justify-between items-center text-xl font-black border-t-2 border-slate-900 pt-4">
                      <span>TOTAL</span>
                      <span>{invoice.currency} {total.toLocaleString()}</span>
                    </div>
                  </>
                )}
              </CardContent>
              <CardFooter className="bg-slate-50 p-6 border-t">
                {invoice?.status === 'paid' ? (
                  <div className="w-full flex items-center justify-center gap-2 text-green-600 font-bold">
                    <CheckCircle className="w-6 h-6" /> Invoice Paid
                  </div>
                ) : (
                  <Button className="w-full bg-slate-900 h-12 text-lg" disabled={!invoice} onClick={handlePayment}>
                    <CreditCard className="w-5 h-5 mr-2" /> Pay Now
                  </Button>
                )}
              </CardFooter>
            </Card>
          </section>
        </div>

        <footer className="text-center text-slate-400 text-xs py-10">
          Powered by <span className="font-bold text-slate-600">Portivo</span> — The Professional Handoff Tool
        </footer>
      </div>
    </div>
  )
}
