'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8 text-center bg-slate-50">
      <main className="max-w-4xl space-y-8">
        <h1 className="text-6xl font-black text-slate-900 tracking-tight">
          Professional handoffs for <span className="text-blue-600">African Freelancers.</span>
        </h1>
        <p className="text-xl text-slate-600 max-w-2xl mx-auto">
          Collapse your workflow into one shareable link. Deliver files, get structured feedback,
          and get paid via Paystack — all in one place.
        </p>

        <div className="flex gap-4 justify-center pt-8">
          <Link href="/login">
            <Button size="lg" className="px-8 h-12 text-lg">Get Started</Button>
          </Link>
          <Link href="/u/demo">
            <Button variant="outline" size="lg" className="px-8 h-12 text-lg">View Sample Profile</Button>
          </Link>
        </div>
      </main>

      <footer className="mt-20 text-slate-400 text-sm">
        &copy; {new Date().getFullYear()} Portivo. Built for the next generation of African talent.
      </footer>
    </div>
  )
}
