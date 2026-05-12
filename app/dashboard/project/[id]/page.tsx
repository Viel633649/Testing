'use client'

import { useEffect, useState, use } from 'react'
import { createClient } from '@/lib/supabase-client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card'
import { Trash2, Plus, Download, MessageSquare } from 'lucide-react'

export default function ProjectManagementPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [loading, setLoading] = useState(true)
  const [project, setProject] = useState<any>(null)
  const [invoice, setInvoice] = useState<any>(null)
  const [items, setItems] = useState<any[]>([{ description: '', quantity: 1, unit_price: 0 }])
  const [feedback, setFeedback] = useState<any[]>([])
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

      setLoading(false)
    }
    loadData()
  }, [id, supabase])

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
          currency: 'NGN',
          status: 'draft'
        })
        .select()
        .single()

      if (newInvoice) currentInvoiceId = newInvoice.id
    }

    // Delete old items and insert new ones
    if (currentInvoiceId) {
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

  if (loading && !project) return <div className="p-8">Loading...</div>

  const total = items.reduce((acc, item) => acc + (item.quantity * item.unit_price), 0)

  return (
    <div className="max-w-5xl mx-auto p-8 space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">{project.title}</h1>
          <p className="text-slate-500">Client: {project.client_name} ({project.client_email})</p>
        </div>
        <Button variant="outline" onClick={() => window.open(`/p/${project.public_slug}`, '_blank')}>
          View Client Link
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <section className="space-y-6">
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
                <span>NGN {total.toLocaleString()}</span>
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
