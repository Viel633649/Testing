'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase-client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card'
import { Trash2, Plus, Download, MessageSquare } from 'lucide-react'
import { Project, Invoice, InvoiceItem, Feedback } from '@/lib/types'

interface PageProps {
  params: { id: string }
}

export default function ProjectManagementPage({ params }: PageProps) {
  const { id } = params
  const [loading, setLoading] = useState(true)
  const [project, setProject] = useState<Project | null>(null)
  const [invoice, setInvoice] = useState<Invoice | null>(null)
  const [items, setItems] = useState<any[]>([])
  const [feedback, setFeedback] = useState<Feedback[]>([])
  const [events, setEvents] = useState<any[]>([])
  const [updatingStatus, setUpdatingStatus] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    async function loadData() {
      const { data: projectData } = await supabase
        .from('projects')
        .select('*, deliverables(*)')
        .eq('id', id)
        .single()

      if (projectData) setProject(projectData)

      const { data: invoiceData } = await supabase
        .from('invoices')
        .select('*, invoice_items(*)')
        .eq('project_id', id)
        .single()

      if (invoiceData) {
        setInvoice(invoiceData)
        setItems(invoiceData.invoice_items)
      }

      const { data: feedbackData } = await supabase
        .from('feedback')
        .select('*, deliverables(file_name)')
        .eq('project_id', id)

      if (feedbackData) setFeedback(feedbackData)

      const { data: eventData } = await supabase
        .from('link_events')
        .select('*')
        .eq('project_id', id)
        .order('occurred_at', { ascending: false })
        .limit(10)

      if (eventData) setEvents(eventData)

      setLoading(false)
    }
    loadData()
  }, [id, supabase])

  const handleUpdateStatus = async (newStatus: string) => {
    setUpdatingStatus(true)
    const { error } = await supabase
      .from('projects')
      .update({ status: newStatus })
      .eq('id', id)

    if (!error && project) {
      setProject({ ...project, status: newStatus as any })
    }
    setUpdatingStatus(false)
  }

  const handleSaveInvoice = async () => {
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    let currentInvoiceId = invoice?.id

    if (!currentInvoiceId) {
      const { data: newInvoice, error } = await supabase
        .from('invoices')
        .insert({
          project_id: id,
          user_id: user.id,
          currency: invoice?.currency || 'NGN',
          due_date: invoice?.due_date || null,
          status: 'draft'
        })
        .select()
        .single()

      if (newInvoice) currentInvoiceId = newInvoice.id
    }

    // Delete old items and insert new ones
    if (currentInvoiceId && invoice) {
      await supabase.from('invoices').update({
          currency: invoice.currency,
          due_date: invoice.due_date
      }).eq('id', currentInvoiceId)

      await supabase.from('invoice_items').delete().eq('invoice_id', currentInvoiceId)
      await supabase.from('invoice_items').insert(
        items.map(item => ({
          invoice_id: currentInvoiceId,
          description: item.description,
          quantity: item.quantity,
          unit_price: item.unit_price
        }))
      )
    }

    alert('Invoice saved!')
    setLoading(false)
  }

  const addItem = () => setItems([...items, { description: '', quantity: 1, unit_price: 0 }])
  const removeItem = (index: number) => setItems(items.filter((_, i) => i !== index))
  const updateItem = (index: number, field: string, value: any) => {
    const newItems = [...items]
    newItems[index][field] = value
    setItems(newItems)
  }

  if (loading || !project) return <div className="p-8">Loading...</div>

  const total = items.reduce((acc, item) => acc + (item.quantity * item.unit_price), 0)

  return (
    <div className="max-w-5xl mx-auto p-8 space-y-8">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold">{project.title}</h1>
          <p className="text-slate-500 mb-4">Client: {project.client_name} ({project.client_email})</p>

          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase text-slate-400">Status:</span>
            <select
              value={project.status}
              disabled={updatingStatus}
              onChange={(e) => handleUpdateStatus(e.target.value)}
              className="text-xs font-medium bg-slate-100 border-none rounded px-2 py-1 focus:ring-2 focus:ring-blue-500"
            >
              <option value="active">Active</option>
              <option value="awaiting_feedback">Awaiting Feedback</option>
              <option value="revision">Revision</option>
              <option value="completed">Completed</option>
              <option value="archived">Archived</option>
            </select>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => window.open(`/p/${project.public_slug}`, '_blank')}>
            View Client Link
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <section className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <MessageSquare className="w-4 h-4" /> Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              {events.length === 0 ? (
                <p className="text-sm text-slate-400 italic">No activity recorded yet.</p>
              ) : (
                <ul className="space-y-3">
                  {events.map(event => (
                    <li key={event.id} className="text-xs flex justify-between items-center text-slate-600">
                      <span className="capitalize">{event.event_type.replace('_', ' ')}</span>
                      <span className="text-slate-400">{new Date(event.occurred_at).toLocaleString()}</span>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Download className="w-4 h-4" /> Deliverables
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {project.deliverables?.map((file: any) => (
                  <li key={file.id} className="flex justify-between items-center p-2 bg-slate-50 rounded">
                    <span className="text-sm truncate max-w-[200px]">{file.file_name}</span>
                    <a href={file.file_url} target="_blank" className="text-blue-600 text-xs">Download</a>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <MessageSquare className="w-4 h-4" /> Client Feedback
              </CardTitle>
            </CardHeader>
            <CardContent>
              {feedback.length === 0 ? (
                <p className="text-sm text-slate-400 italic">No feedback received yet.</p>
              ) : (
                <div className="space-y-4">
                  {feedback.map(f => (
                    <div key={f.id} className="p-3 bg-blue-50 rounded-lg border border-blue-100">
                      <p className="text-sm">{f.content}</p>
                      {f.deliverables && (
                        <p className="text-[10px] uppercase font-bold text-blue-400 mt-2">
                          File: {f.deliverables.file_name}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </section>

        <section>
          <Card>
            <CardHeader>
              <CardTitle>Invoice Builder</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4 mb-4 pb-4 border-b border-slate-100">
                <div className="space-y-1">
                    <label className="text-xs font-bold uppercase text-slate-400">Currency</label>
                    <select
                        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                        value={invoice?.currency || 'NGN'}
                        onChange={(e) => setInvoice(prev => prev ? {...prev, currency: e.target.value} : null)}
                    >
                        <option value="NGN">NGN</option>
                        <option value="GHS">GHS</option>
                        <option value="USD">USD</option>
                    </select>
                </div>
                <div className="space-y-1">
                    <label className="text-xs font-bold uppercase text-slate-400">Due Date</label>
                    <Input
                        type="date"
                        value={invoice?.due_date || ''}
                        onChange={(e) => setInvoice(prev => prev ? {...prev, due_date: e.target.value} : null)}
                    />
                </div>
              </div>
              {items.map((item, index) => (
                <div key={index} className="grid grid-cols-12 gap-2 items-end border-b pb-4 last:border-0">
                  <div className="col-span-6 space-y-1">
                    <label className="text-[10px] uppercase font-bold text-slate-400">Description</label>
                    <Input
                      value={item.description}
                      onChange={e => updateItem(index, 'description', e.target.value)}
                      placeholder="Service name..."
                    />
                  </div>
                  <div className="col-span-2 space-y-1">
                    <label className="text-[10px] uppercase font-bold text-slate-400">Qty</label>
                    <Input
                      type="number"
                      value={item.quantity}
                      onChange={e => updateItem(index, 'quantity', Number(e.target.value))}
                    />
                  </div>
                  <div className="col-span-3 space-y-1">
                    <label className="text-[10px] uppercase font-bold text-slate-400">Price</label>
                    <Input
                      type="number"
                      value={item.unit_price}
                      onChange={e => updateItem(index, 'unit_price', Number(e.target.value))}
                    />
                  </div>
                  <div className="col-span-1">
                    <Button variant="ghost" size="icon" onClick={() => removeItem(index)}>
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </Button>
                  </div>
                </div>
              ))}

              <Button variant="outline" size="sm" className="w-full flex items-center gap-2" onClick={addItem}>
                <Plus className="w-4 h-4" /> Add Line Item
              </Button>

              <div className="pt-4 flex justify-between items-center text-xl font-bold">
                <span>Total:</span>
                <span>{invoice?.currency || 'NGN'} {total.toLocaleString()}</span>
              </div>
            </CardContent>
            <CardFooter>
              <Button className="w-full" onClick={handleSaveInvoice} disabled={loading}>
                {loading ? 'Saving...' : 'Save & Publish Invoice'}
              </Button>
            </CardFooter>
          </Card>
        </section>
      </div>
    </div>
  )
}
