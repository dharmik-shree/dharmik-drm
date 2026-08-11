'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Sparkles, Phone, Mail, ArrowRight, ShieldCheck } from 'lucide-react';
import { BUSINESS_INFO } from '@/lib/constants';

export default function CustomerPortalLoginPage() {
  const router = useRouter();
  const [method, setMethod] = useState<'magic' | 'otp'>('magic');
  const [email, setEmail] = useState('rajesh.sharma@example.com');
  const [phone, setPhone] = useState('9820012345');
  const [sent, setSent] = useState(false);

  const handleDemoCustomerLogin = () => {
    document.cookie = `dharmik_demo_role=customer; path=/; max-age=86400`;
    router.push('/portal/dashboard');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSent(true);
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

        {/* Demo Login Button */}
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-center space-y-2">
          <p className="text-xs font-bold text-amber-900 uppercase tracking-wider">
            Explore Demo Client Portal
          </p>
          <button
            onClick={handleDemoCustomerLogin}
            className="w-full py-2.5 bg-[#1A3C5E] hover:bg-[#15304b] text-amber-300 text-xs font-bold rounded-xl transition shadow"
          >
            Enter Client Portal as Demo Client (Rajesh Sharma)
          </button>
        </div>

        {sent ? (
          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6 text-center space-y-3">
            <div className="w-10 h-10 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto">
              ✓
            </div>
            <h3 className="font-bold text-emerald-900 text-base">Access Link Sent!</h3>
            <p className="text-xs text-slate-600">
              We have sent a secure login link to <strong className="text-slate-900">{method === 'magic' ? email : `+91 ${phone}`}</strong>.
            </p>
            <button
              onClick={handleDemoCustomerLogin}
              className="text-xs text-emerald-700 underline font-semibold pt-2"
            >
              Continue to Portal Now →
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex border border-slate-200 rounded-xl p-1 bg-slate-50 text-xs">
              <button
                type="button"
                onClick={() => setMethod('magic')}
                className={`flex-1 py-2 font-medium rounded-lg transition ${
                  method === 'magic' ? 'bg-white text-[#1A3C5E] shadow-sm' : 'text-slate-500'
                }`}
              >
                Magic Link (Email)
              </button>
              <button
                type="button"
                onClick={() => setMethod('otp')}
                className={`flex-1 py-2 font-medium rounded-lg transition ${
                  method === 'otp' ? 'bg-white text-[#1A3C5E] shadow-sm' : 'text-slate-500'
                }`}
              >
                WhatsApp / SMS OTP
              </button>
            </div>

            {method === 'magic' ? (
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                  Registered Email
                </label>
                <div className="relative">
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl text-sm outline-none focus:border-amber-500"
                  />
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                </div>
              </div>
            ) : (
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                  WhatsApp Number
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-3.5 text-sm font-semibold text-slate-500">+91</span>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 border border-slate-200 rounded-xl text-sm outline-none focus:border-amber-500"
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              className="w-full py-3.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-xl shadow transition flex items-center justify-center gap-2"
            >
              Send Secure Access Code
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
