'use client'

import { useEffect, useState, use } from 'react'
import { createClient } from '@/lib/supabase-client'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent, CardFooter, CardDescription } from '@/components/ui/card'
import { Globe, Mail } from 'lucide-react'

export default function PublicProfilePage({ params }: { params: Promise<{ username: string }> }) {
  const { username } = use(params)
  const [loading, setLoading] = useState(true)
  const [profile, setProfile] = useState<any>(null)
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

        <Card className="bg-slate-900 text-white p-8">
          <h2 className="text-2xl font-bold mb-2">Work with {profile.full_name?.split(' ')[0]}</h2>
          <p className="text-slate-400 mb-6">Ready to start your next project? Get in touch today.</p>
          <Button className="w-full bg-white text-slate-900 hover:bg-slate-100 h-12 text-lg">
            <Mail className="w-5 h-5 mr-2" /> Send a Message
          </Button>
        </Card>

        <footer className="pt-20 text-slate-400 text-sm">
          Portivo — The Platform for Professional Freelancers
        </footer>
      </div>
    </div>
  )
}
