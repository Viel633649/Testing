'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase-client'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import Link from 'next/link'
import { Plus, ExternalLink, FileText } from 'lucide-react'

export default function DashboardPage() {
  const [projects, setProjects] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    async function loadProjects() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        window.location.href = '/login'
        return
      }

      const { data, error } = await supabase
        .from('projects')
        .select(`
          *,
          invoices (
            status,
            currency,
            invoice_items (total)
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (data) setProjects(data)
      setLoading(false)
    }
    loadProjects()
  }, [supabase])

  if (loading) return <div className="p-8 text-center">Loading your projects...</div>

  return (
    <div className="max-w-6xl mx-auto p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Your Projects</h1>
        <div className="flex gap-4">
          <Link href="/settings">
            <Button variant="outline">Settings</Button>
          </Link>
          <Link href="/dashboard/new">
            <Button className="flex items-center gap-2">
              <Plus className="w-4 h-4" /> New Project
            </Button>
          </Link>
        </div>
      </div>

      {projects.length === 0 ? (
        <Card className="p-12 text-center">
          <p className="text-slate-500 mb-4">No projects yet. Create your first one to get started!</p>
          <Link href="/dashboard/new">
            <Button>Create Project</Button>
          </Link>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map(project => {
            const invoice = project.invoices?.[0]
            const total = invoice?.invoice_items?.reduce((acc: number, item: any) => acc + Number(item.total), 0) || 0

            return (
              <Card key={project.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <CardTitle className="flex justify-between items-start">
                    <span className="truncate">{project.title}</span>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      project.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-700'
                    }`}>
                      {project.status}
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-sm text-slate-500">
                    <p>Client: {project.client_name}</p>
                    <p>Deadline: {project.deadline || 'No deadline'}</p>
                  </div>

                  <div className="pt-4 border-t border-slate-100 flex flex-col gap-2">
                    <div className="flex justify-between items-center text-sm font-medium">
                      <span>Invoice: {invoice ? `${invoice.currency} ${total.toLocaleString()}` : 'None'}</span>
                      <span className="text-xs uppercase text-slate-400">{invoice?.status || 'Missing'}</span>
                    </div>

                    <div className="flex gap-2 pt-2">
                      <Link href={`/dashboard/project/${project.id}`} className="flex-1">
                        <Button variant="outline" size="sm" className="w-full">Manage</Button>
                      </Link>
                      <Link href={`/p/${project.public_slug}`} target="_blank">
                        <Button variant="ghost" size="sm" className="px-2">
                          <ExternalLink className="w-4 h-4" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
