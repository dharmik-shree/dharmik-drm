'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Sparkles, Mail, ArrowRight, ShieldCheck, AlertCircle } from 'lucide-react';
import { createBrowserClient } from '@supabase/ssr';
import { BUSINESS_INFO } from '@/lib/constants';

export default function CustomerPortalLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage(null);

    try {
      const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );

      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/portal/dashboard`,
        },
      });

      if (error) throw error;
      document.cookie = `dharmik_demo_role=customer; path=/; max-age=86400`;
      setSent(true);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to send login link');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white border border-amber-200 rounded-3xl p-8 shadow-2xl space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 bg-amber-50 text-amber-800 border border-amber-200 rounded-full flex items-center justify-center mx-auto shadow-inner">
            <Sparkles className="w-7 h-7 text-amber-600 animate-pulse" />
          </div>
          <h1 className="text-2xl font-bold font-serif-heading text-[#1A3C5E]">
            Client Portal Access
          </h1>
          <p className="text-slate-500 text-xs font-serif">
            Dharmikshree Spiritual Journey & Consultation History
          </p>
        </div>

        {errorMessage && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2 text-xs text-red-700">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
            <span>{errorMessage}</span>
          </div>
        )}

        {sent ? (
          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6 text-center space-y-3">
            <div className="w-10 h-10 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto">
              ✓
            </div>
            <h3 className="font-bold text-emerald-900 text-base">Magic Link Sent!</h3>
            <p className="text-xs text-slate-600">
              We have sent a secure login link to <strong className="text-slate-900">{email}</strong>.
            </p>
            <p className="text-[11px] text-slate-500">Check your inbox to log in to your client portal.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                Registered Email Address
              </label>
              <div className="relative">
                <input
                  type="email"
                  required
                  placeholder="client@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl text-sm outline-none focus:border-amber-500"
                />
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-xl shadow transition flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? 'Sending Magic Link...' : 'Send Magic Access Link'}
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}

        <div className="text-center text-xs text-slate-400 space-y-1">
          <p className="flex items-center justify-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-amber-600" />
            End-to-End Encrypted Client History
          </p>
          <p>© {BUSINESS_INFO.name}</p>
        </div>
      </div>
    </main>
  );
}
