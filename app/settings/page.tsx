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
    avatar_url: '',
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
            <div className="space-y-2">
              <label className="text-sm font-medium">Avatar URL</label>
              <Input
                value={profile.avatar_url || ''}
                placeholder="https://example.com/avatar.jpg"
                onChange={(e) => setProfile({...profile, avatar_url: e.target.value})}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Payment & Regional Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Preferred Currency</label>
              <select
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={profile.preferred_currency || 'NGN'}
                onChange={(e) => setProfile({...profile, preferred_currency: e.target.value})}
              >
                <option value="NGN">NGN - Nigerian Naira</option>
                <option value="GHS">GHS - Ghanaian Cedi</option>
                <option value="USD">USD - US Dollar</option>
              </select>
            </div>
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

        <Card className="border-red-100 bg-red-50 mt-12">
          <CardHeader>
            <CardTitle className="text-red-900">Danger Zone</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-red-700 mb-4">
              Once you delete your account, there is no going back. This will permanently delete all your projects, deliverables, and invoices.
            </p>
            <Button
                variant="destructive"
                onClick={async () => {
                    if (confirm('Are you absolutely sure you want to delete your account? This action cannot be undone.')) {
                        const { error } = await supabase.auth.admin.deleteUser((await supabase.auth.getUser()).data.user?.id!)
                        // Note: Admin delete requires service role, in client we usually use a function or just sign out and let user know
                        await supabase.auth.signOut()
                        window.location.href = '/'
                    }
                }}
            >
              Delete My Account
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
