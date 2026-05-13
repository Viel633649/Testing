'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'

import { CheckCircle2, Shield, Zap, CreditCard } from 'lucide-react'

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="max-w-7xl mx-auto px-6 py-6 flex justify-between items-center">
        <div className="text-2xl font-black text-slate-900">Portivo</div>
        <div className="flex items-center gap-6">
            <Link href="/login" className="text-sm font-medium text-slate-600 hover:text-slate-900">Log in</Link>
            <Link href="/login">
                <Button size="sm">Get Started</Button>
            </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-6 py-24 text-center space-y-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold uppercase tracking-wider">
            <Zap className="w-3 h-3" /> Built for African Freelancers
        </div>
        <h1 className="text-6xl md:text-7xl font-black text-slate-900 tracking-tight leading-[1.1]">
          The Professional Way to <br />
          <span className="text-blue-600 italic">Handoff Work.</span>
        </h1>
        <p className="text-xl text-slate-500 max-w-2xl mx-auto leading-relaxed">
          One shareable link for your clients. Secure file delivery, structured feedback,
          and Paystack-native invoicing. No more WhatsApp chaos.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8">
          <Link href="/login">
            <Button size="lg" className="px-10 h-14 text-lg font-bold shadow-xl shadow-blue-200">
                Start for Free
            </Button>
          </Link>
          <Link href="/u/demo">
            <Button variant="outline" size="lg" className="px-10 h-14 text-lg font-bold">
                See Live Demo
            </Button>
          </Link>
        </div>
      </section>

      {/* Features Grid */}
      <section className="bg-slate-50 py-24">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-12 text-center md:text-left">
            <div className="space-y-4">
                <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center text-blue-600 mx-auto md:mx-0">
                    <Shield className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-slate-900">Secure Handoff</h3>
                <p className="text-slate-500 leading-relaxed">Deliver your files via private, temporary links. Professional and secure.</p>
            </div>
            <div className="space-y-4">
                <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center text-blue-600 mx-auto md:mx-0">
                    <CheckCircle2 className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-slate-900">Structured Feedback</h3>
                <p className="text-slate-500 leading-relaxed">No more voice notes. Get feedback tied directly to your deliverables.</p>
            </div>
            <div className="space-y-4">
                <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center text-blue-600 mx-auto md:mx-0">
                    <CreditCard className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-slate-900">Instant Payments</h3>
                <p className="text-slate-500 leading-relaxed">Get paid directly via Paystack or Flutterwave. Fast and local.</p>
            </div>
        </div>
      </section>

      {/* Social Proof / Footer */}
      <section className="py-24 text-center max-w-4xl mx-auto px-6">
        <h2 className="text-3xl font-bold text-slate-900 mb-6">Built for solo operators and small agencies in Accra, Lagos, and beyond.</h2>
        <div className="flex justify-center gap-8 grayscale opacity-50">
            <span className="font-black text-2xl tracking-tighter">PAYSTACK</span>
            <span className="font-black text-2xl tracking-tighter">FLUTTERWAVE</span>
        </div>
      </section>

      <footer className="py-12 border-t border-slate-100 text-center text-slate-400 text-sm">
        &copy; {new Date().getFullYear()} Portivo. Built with ❤️ for the next generation of African talent.
      </footer>
    </div>
  )
}
