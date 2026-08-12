import React from 'react';
import Link from 'next/link';
import { Sparkles, Shield, Users, ArrowRight, CheckCircle2, Lock, ExternalLink } from 'lucide-react';
import { BUSINESS_INFO } from '@/lib/constants';

export default function RootHomePage() {
  return (
    <main className="min-h-screen bg-slate-950 text-white flex flex-col justify-between p-6 sm:p-12 relative overflow-hidden">
      {/* Background Ambient Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-96 bg-amber-500/10 blur-[140px] pointer-events-none rounded-full" />

      {/* Top Header */}
      <header className="max-w-6xl w-full mx-auto flex items-center justify-between relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-amber-500/20 border border-amber-400/40 rounded-full flex items-center justify-center text-amber-300">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-bold text-xl font-serif-heading text-amber-300">{BUSINESS_INFO.name}</h1>
            <p className="text-[11px] text-slate-400 font-medium uppercase tracking-widest">Enterprise CRM & Client Engine</p>
          </div>
        </div>

        <Link
          href="/login"
          className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl shadow transition"
        >
          Staff Sign In
        </Link>
      </header>

      {/* Main Hero & Portals Section */}
      <div className="max-w-4xl w-full mx-auto my-12 space-y-10 relative z-10 text-center">
        <div className="space-y-4">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-500/10 border border-amber-500/30 rounded-full text-xs font-semibold text-amber-300 uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" /> 13th Generation Vedic Astrologer & Vastu Consultant
          </span>

          <h2 className="text-4xl sm:text-5xl font-bold font-serif-heading text-white leading-tight">
            Production-Ready CRM & Lead Management System
          </h2>

          <p className="text-slate-400 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
            Full client lifecycle management — from first enquiry to consultation, payment tracking, Mahapuja booking, remedy delivery, and customer portal timeline.
          </p>
        </div>

        {/* Portal Access Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
          {/* Card 1: Admin Panel */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 hover:border-amber-500/40 transition space-y-4 flex flex-col justify-between">
            <div className="space-y-2">
              <div className="w-10 h-10 bg-amber-500/10 text-amber-400 rounded-2xl flex items-center justify-center">
                <Shield className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-lg text-white font-serif-heading">Admin & Staff CRM</h3>
              <p className="text-slate-400 text-xs leading-relaxed">
                14-stage Kanban pipeline, team RBAC, payment dues, and smart reminders engine.
              </p>
            </div>

            <a
              href="/admin/dashboard"
              className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl shadow transition flex items-center justify-center gap-1.5"
            >
              Enter Admin Panel <ArrowRight className="w-4 h-4" />
            </a>
          </div>

          {/* Card 2: Public Enquiry Form */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 hover:border-amber-500/40 transition space-y-4 flex flex-col justify-between">
            <div className="space-y-2">
              <div className="w-10 h-10 bg-blue-500/10 text-blue-400 rounded-2xl flex items-center justify-center">
                <ExternalLink className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-lg text-white font-serif-heading">Public Enquiry Form</h3>
              <p className="text-slate-400 text-xs leading-relaxed">
                Embeddable form for <code className="text-amber-300">dharmikshree.com</code> with auto WhatsApp notifications.
              </p>
            </div>

            <Link
              href="/enquiry"
              className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow transition flex items-center justify-center gap-1.5"
            >
              Open Lead Capture Form <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Card 3: Customer Portal */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 hover:border-amber-500/40 transition space-y-4 flex flex-col justify-between">
            <div className="space-y-2">
              <div className="w-10 h-10 bg-emerald-500/10 text-emerald-400 rounded-2xl flex items-center justify-center">
                <Users className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-lg text-white font-serif-heading">Client Portal</h3>
              <p className="text-slate-400 text-xs leading-relaxed">
                Customer-facing spiritual journey timeline, receipts, and remedy downloads.
              </p>
            </div>

            <a
              href="/portal/dashboard"
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow transition flex items-center justify-center gap-1.5"
            >
              Enter Client Portal <ArrowRight className="w-4 h-4" />
            </a>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="max-w-6xl w-full mx-auto text-center text-slate-500 text-xs border-t border-slate-800 pt-6 relative z-10">
        <p>© {new Date().getFullYear()} {BUSINESS_INFO.name}. Built for Enterprise Performance & Security.</p>
      </footer>
    </main>
  );
}
