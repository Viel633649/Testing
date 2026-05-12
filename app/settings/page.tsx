'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase-client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card'

export default function SettingsPage() {
  const [loading, setLoading] = useState(true)
  const [profile, setProfile] = useState<any>({
    full_name: '',
    username: '',
    discipline: '',
    bio: '',
    paystack_secret_key: '',
    flutterwave_secret_key: '',
    preferred_currency: 'NGN'
  })
  const [message, setMessage] = useState('')
  const supabase = createClient()

  useEffect(() => {
    async function loadProfile() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (data) setProfile(data)
      setLoading(false)
    }
    loadProfile()
  }, [supabase])

  const handleUpdate = async () => {
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { error } = await supabase
      .from('profiles')
      .upsert({
        id: user.id,
        email: user.email,
        ...profile,
        updated_at: new Date().toISOString(),
      })

    if (error) setMessage(error.message)
    else setMessage('Profile updated successfully!')
    setLoading(false)
  }

  if (loading && !profile.email) return <div className="p-8">Loading...</div>

  return (
    <div className="max-w-4xl mx-auto p-8">
      <h1 className="text-3xl font-bold mb-8">Settings</h1>

      <div className="grid gap-8">
        <Card>
          <CardHeader>
            <CardTitle>Profile Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Full Name</label>
                <Input
                  value={profile.full_name || ''}
                  onChange={(e) => setProfile({...profile, full_name: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Username</label>
                <Input
                  value={profile.username || ''}
                  onChange={(e) => setProfile({...profile, username: e.target.value})}
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Discipline (e.g. Graphic Designer)</label>
              <Input
                value={profile.discipline || ''}
                onChange={(e) => setProfile({...profile, discipline: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Bio</label>
              <textarea
                className="w-full min-h-[100px] rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={profile.bio || ''}
                onChange={(e) => setProfile({...profile, bio: e.target.value})}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Payment Integrations</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Paystack Secret Key</label>
              <Input
                type="password"
                value={profile.paystack_secret_key || ''}
                onChange={(e) => setProfile({...profile, paystack_secret_key: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Flutterwave Secret Key</label>
              <Input
                type="password"
                value={profile.flutterwave_secret_key || ''}
                onChange={(e) => setProfile({...profile, flutterwave_secret_key: e.target.value})}
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button onClick={handleUpdate} disabled={loading}>
              {loading ? 'Saving...' : 'Save Changes'}
            </Button>
            {message && <p className="ml-4 text-sm text-green-600">{message}</p>}
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
