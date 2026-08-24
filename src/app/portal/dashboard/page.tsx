'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Sparkles, Calendar, MessageSquare, Video, CheckCircle2, ArrowRight } from 'lucide-react';
import { formatDateIN } from '@/lib/formatters';
import { BUSINESS_INFO } from '@/lib/constants';

export default function CustomerDashboardPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/portal/me')
      .then((res) => res.json())
      .then((resData) => {
        if (resData.success) setData(resData);
      })
      .catch((err) => console.error('Failed to fetch portal me:', err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="py-20 text-center text-slate-400 font-serif space-y-2">
        <Sparkles className="w-6 h-6 animate-spin mx-auto text-amber-500" />
        <p>Loading your personal spiritual portal...</p>
      </div>
    );
  }

  const profile = data?.profile || {
    full_name: 'Valued Client',
    city: 'India',
    service_interest: 'Divine Consultation',
  };

  const lead = data?.lead;

  return (
    <div className="space-y-6 pb-12">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-[#1A3C5E] via-[#234b75] to-[#1A3C5E] rounded-3xl p-6 sm:p-8 text-white shadow-xl space-y-3 relative overflow-hidden">
        <div className="flex items-center gap-2 text-amber-300 text-xs font-bold uppercase tracking-wider">
          <Sparkles className="w-4 h-4 text-amber-400" />
          Vedic Blessings & Divine Wisdom
        </div>
        <h1 className="text-2xl sm:text-4xl font-bold font-serif-heading text-amber-100">
          नमस्ते {profile.full_name} 🙏
        </h1>
        <p className="text-amber-100/90 text-sm max-w-xl leading-relaxed font-serif">
          Welcome to your personal spiritual journey dashboard with Dharmikshree. View your consultation milestones, remedies, and upcoming sessions below.
        </p>
      </div>

      {/* Grid: Upcoming Session & Active Service Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Upcoming Session Card */}
        <div className="bg-white p-6 rounded-3xl border border-amber-200 shadow-md space-y-4">
          <div className="flex items-center justify-between border-b border-amber-100 pb-3">
            <span className="text-xs font-bold text-amber-900 uppercase tracking-wider flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-amber-600" /> Active Guidance Session
            </span>
            <span className="px-2.5 py-0.5 text-[10px] font-bold bg-purple-100 text-purple-800 rounded-full">
              {lead?.stage?.replace(/_/g, ' ').toUpperCase() || 'CONFIRMED'}
            </span>
          </div>

          <div className="space-y-2">
            <h3 className="text-lg font-bold text-[#1A3C5E] font-serif-heading capitalize">
              {(profile.service_interest || 'Divine Consultation').replace(/_/g, ' ')}
            </h3>
            <div className="p-3 bg-purple-50 rounded-2xl border border-purple-100 space-y-1 text-xs text-purple-900 font-semibold">
              <p>📅 Date: {profile.date_of_consultation ? formatDateIN(profile.date_of_consultation) : 'Scheduled with Pandits'}</p>
              <p>⏰ Mode: {profile.consultation_mode === 'online' ? 'Online (Zoom Video Conference)' : 'In-Person Consultation'}</p>
              {profile.rashi && <p>✨ Vedic Rashi: {profile.rashi}</p>}
            </div>
          </div>

          <div className="pt-2">
            <a
              href="https://zoom.us"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-3 bg-[#1A3C5E] hover:bg-[#15304b] text-amber-300 font-bold text-xs rounded-xl shadow transition flex items-center justify-center gap-2"
            >
              <Video className="w-4 h-4 text-amber-400" /> Join Zoom Meeting Room
            </a>
          </div>
        </div>

        {/* Support & Quick Contact */}
        <div className="bg-white p-6 rounded-3xl border border-amber-200 shadow-md space-y-4">
          <div className="border-b border-amber-100 pb-3">
            <span className="text-xs font-bold text-amber-900 uppercase tracking-wider flex items-center gap-1.5">
              <MessageSquare className="w-4 h-4 text-amber-600" /> Direct Assistant Contact
            </span>
          </div>

          <p className="text-xs text-slate-600 leading-relaxed font-serif">
            Have questions regarding your Kundali chart, remedies, or upcoming Mahapuja timing? Connect directly with Team Dharmikshree.
          </p>

          <a
            href={`https://wa.me/${BUSINESS_INFO.whatsapp.replace(/\D/g, '')}`}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow transition flex items-center justify-center gap-2"
          >
            <MessageSquare className="w-4 h-4" /> Message Team on WhatsApp
          </a>
        </div>
      </div>

      {/* Journey Timeline Teaser */}
      <div className="bg-white p-6 rounded-3xl border border-amber-200 shadow-md space-y-4">
        <div className="flex items-center justify-between border-b border-amber-100 pb-3">
          <h3 className="font-bold text-[#1A3C5E] text-base font-serif-heading">Your Spiritual Milestones</h3>
          <Link href="/portal/timeline" className="text-xs font-bold text-amber-800 hover:text-amber-900 flex items-center gap-1">
            View Full Journey <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="space-y-3 text-xs">
          <div className="flex items-center gap-3 p-3 bg-emerald-50/60 rounded-2xl border border-emerald-100">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <div>
              <p className="font-bold text-slate-900">
                {(profile.service_interest || 'Divine Consultation').replace(/_/g, ' ')} — Client Profile Active
              </p>
              <span className="text-slate-500 text-[11px]">
                {profile.conclusion_notes || 'Personal Kundali overview and Mahadasha guidance recorded.'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
