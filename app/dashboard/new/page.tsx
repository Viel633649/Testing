'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase-client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card'
import { v4 as uuidv4 } from 'uuid'
import { useToast } from '@/components/ui/toast'
import * as z from 'zod'

const projectSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  client_name: z.string().min(2, 'Client name is required'),
  client_email: z.string().email('Invalid email address'),
  deadline: z.string().optional()
})

export default function NewProjectPage() {
  const { showToast, ToastComponent } = useToast()
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    title: '',
    client_name: '',
    client_email: '',
    deadline: ''
  })
  const [files, setFiles] = useState<File[]>([])

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const project_id = uuidv4()
    const public_slug = Math.random().toString(36).substring(2, 15)

    // Validation
    const validation = projectSchema.safeParse(form)
    if (!validation.success) {
      showToast(validation.error.issues[0].message, 'error')
      setLoading(false)
      return
    }

    // 1. Create Project
    const { error: projectError } = await supabase.from('projects').insert({
      id: project_id,
      user_id: user.id,
      title: form.title,
      client_name: form.client_name,
      client_email: form.client_email,
      deadline: form.deadline || null,
      public_slug
    })

    if (projectError) {
      showToast(projectError.message, 'error')
      setLoading(false)
      return
    }

    // 2. Upload Files
    for (const file of files) {
      const filePath = `${user.id}/${project_id}/${file.name}`
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('deliverables')
        .upload(filePath, file)

      if (uploadData) {
        // Use signed URL for private storage as per spec
        const { data: signedUrlData, error: signedUrlError } = await supabase.storage
          .from('deliverables')
          .createSignedUrl(filePath, 60 * 60 * 24 * 7) // 7 days

        await supabase.from('deliverables').insert({
          project_id,
          file_name: file.name,
          file_url: signedUrlData?.signedUrl || '',
          file_size_bytes: file.size
        })
      }
    }

    showToast('Project created successfully!', 'success')
    setTimeout(() => router.push(`/dashboard`), 1500)
    setLoading(false)
  }

  return (
    <div className="max-w-2xl mx-auto p-8">
      {ToastComponent}
      <h1 className="text-3xl font-bold mb-8">Create New Project</h1>
      <form onSubmit={handleCreate}>
        <Card>
          <CardContent className="space-y-4 pt-6">
            <div className="space-y-2">
              <label className="text-sm font-medium">Project Title</label>
              <Input
                required
                value={form.title}
                onChange={e => setForm({...form, title: e.target.value})}
                placeholder="e.g. Logo Design for Acme Corp"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Client Name</label>
                <Input
                  required
                  value={form.client_name}
                  onChange={e => setForm({...form, client_name: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Client Email</label>
                <Input
                  required
                  type="email"
                  value={form.client_email}
                  onChange={e => setForm({...form, client_email: e.target.value})}
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Deadline (Optional)</label>
              <Input
                type="date"
                value={form.deadline}
                onChange={e => setForm({...form, deadline: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Upload Deliverables</label>
              <Input
                type="file"
                multiple
                onChange={e => setFiles(Array.from(e.target.files || []))}
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" disabled={loading}>
              {loading ? 'Creating...' : 'Create Project'}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  )
}
