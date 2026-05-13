'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from '@/components/ui/card'
import { Users, Mail, Shield } from 'lucide-react'

export default function TeamSettingsPage() {
  const [email, setEmail] = useState('')
  const [members, setMembers] = useState([
    { id: '1', email: 'owner@example.com', role: 'Owner', status: 'Active' }
  ])

  const handleInvite = (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return
    setMembers([...members, { id: Math.random().toString(), email, role: 'Member', status: 'Pending' }])
    setEmail('')
  }

  return (
    <div className="max-w-4xl mx-auto p-8">
      <h1 className="text-3xl font-bold mb-8 text-slate-900">Agency Settings</h1>

      <div className="grid gap-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-600" /> Team Members
            </CardTitle>
            <CardDescription>Manage your team and their access levels.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {members.map(member => (
                <div key={member.id} className="flex justify-between items-center p-4 bg-slate-50 rounded-lg border">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold">
                        {member.email[0].toUpperCase()}
                    </div>
                    <div>
                        <p className="text-sm font-medium text-slate-900">{member.email}</p>
                        <p className="text-xs text-slate-500">{member.role}</p>
                    </div>
                  </div>
                  <span className={`text-[10px] uppercase font-bold px-2 py-1 rounded-full ${
                    member.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                  }`}>
                    {member.status}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
          <CardFooter className="bg-slate-50 border-t p-6">
            <form onSubmit={handleInvite} className="flex gap-4 w-full">
                <div className="relative flex-1">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input
                        placeholder="colleague@agency.com"
                        className="pl-10"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                    />
                </div>
                <Button type="submit">Invite Member</Button>
            </form>
          </CardFooter>
        </Card>

        <Card className="border-blue-100 bg-blue-50">
          <CardContent className="p-6 flex items-start gap-4">
            <Shield className="w-6 h-6 text-blue-600 mt-1" />
            <div>
                <h3 className="font-bold text-blue-900">Agency Plan Required</h3>
                <p className="text-sm text-blue-700 mt-1">
                    Team collaboration is available on the Agency plan ($24/month).
                    Your current plan is Free.
                </p>
                <Button className="mt-4 bg-blue-600 hover:bg-blue-700">Upgrade to Agency</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
