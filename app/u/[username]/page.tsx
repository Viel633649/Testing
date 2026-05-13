'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase-client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardHeader, CardTitle, CardContent, CardFooter, CardDescription } from '@/components/ui/card'
import { Globe, Mail, CheckCircle } from 'lucide-react'

interface PageProps {
  params: { username: string }
}

export default function PublicProfilePage({ params }: PageProps) {
  const { username } = params
  const [loading, setLoading] = useState(true)
  const [profile, setProfile] = useState<any>(null)
  const [contactName, setContactName] = useState('')
  const [contactEmail, setContactEmail] = useState('')
  const [contactMessage, setContactMessage] = useState('')
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    async function loadProfile() {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('username', username)
        .single()

      if (data) setProfile(data)
      setLoading(false)
    }
    loadProfile()
  }, [username, supabase])

  const handleContact = async (e: React.FormEvent) => {
    e.preventDefault()
    setSending(true)
    // Notify freelancer via secure server route
    await fetch('/api/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        to: profile.email,
        contactName,
        contactEmail,
        contactMessage
      })
    })
    setSending(false)
    setSent(true)
  }

  if (loading) return <div className="p-20 text-center">Loading profile...</div>
  if (!profile) return <div className="p-20 text-center text-red-500">Freelancer not found.</div>

  return (
    <div className="min-h-screen bg-slate-50 py-20 px-4">
      <div className="max-w-2xl mx-auto text-center space-y-8">
        <div className="flex flex-col items-center gap-4">
          <div className="w-32 h-32 rounded-full bg-slate-200 border-4 border-white shadow-lg overflow-hidden">
            {profile.avatar_url ? (
              <img src={profile.avatar_url} className="w-full h-full object-cover" alt={profile.full_name} />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-slate-400 text-4xl font-bold">
                {profile.full_name?.[0]}
              </div>
            )}
          </div>
          <div>
            <h1 className="text-4xl font-black text-slate-900">{profile.full_name}</h1>
            <p className="text-xl text-blue-600 font-medium">{profile.discipline}</p>
          </div>
        </div>

        <Card className="text-left border-none shadow-sm">
          <CardContent className="p-8">
            <p className="text-slate-600 leading-relaxed text-lg">
              {profile.bio || "No bio available."}
            </p>
          </CardContent>
        </Card>

        <div className="flex justify-center gap-4">
          <Button variant="outline" size="lg" className="rounded-full flex items-center gap-2">
            <Globe className="w-4 h-4" /> Portfolio
          </Button>
        </div>

        <Card className="bg-slate-900 text-white p-8 border-none shadow-2xl">
          {sent ? (
            <div className="text-center py-8 space-y-4">
              <CheckCircle className="w-16 h-16 text-green-400 mx-auto" />
              <h2 className="text-2xl font-bold mb-2">Message Sent!</h2>
              <p className="text-slate-400">Thanks for reaching out. {profile.full_name?.split(' ')[0]} will get back to you soon.</p>
              <Button variant="outline" onClick={() => setSent(false)} className="text-white border-slate-700 hover:bg-slate-800">
                Send another message
              </Button>
            </div>
          ) : (
            <>
              <h2 className="text-2xl font-bold mb-2 text-left">Work with {profile.full_name?.split(' ')[0]}</h2>
              <p className="text-slate-400 mb-6 text-left">Ready to start your next project? Get in touch today.</p>
              <form onSubmit={handleContact} className="space-y-4 text-left">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    required
                    placeholder="Your Name"
                    className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500"
                    value={contactName}
                    onChange={e => setContactName(e.target.value)}
                  />
                  <Input
                    required
                    type="email"
                    placeholder="Your Email"
                    className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500"
                    value={contactEmail}
                    onChange={e => setContactEmail(e.target.value)}
                  />
                </div>
                <textarea
                  required
                  className="w-full min-h-[120px] rounded-md border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Tell me about your project..."
                  value={contactMessage}
                  onChange={e => setContactMessage(e.target.value)}
                />
                <Button type="submit" className="w-full bg-white text-slate-900 hover:bg-slate-100 h-12 text-lg font-bold" disabled={sending}>
                  <Mail className="w-5 h-5 mr-2" />
                  {sending ? 'Sending...' : 'Send Message'}
                </Button>
              </form>
            </>
          )}
        </Card>

        <footer className="pt-20 text-slate-400 text-sm">
          Portivo — The Platform for Professional Freelancers
        </footer>
      </div>
    </div>
  )
}
