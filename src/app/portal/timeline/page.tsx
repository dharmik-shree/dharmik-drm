'use client';

import React, { useEffect, useState } from 'react';
import { Sparkles, CheckCircle2, Package, Calendar, Flame, Clock, Award } from 'lucide-react';
import { formatDateIN } from '@/lib/formatters';

export default function CustomerTimelinePage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/portal/me')
      .then((res) => res.json())
      .then((resData) => {
        if (resData.success) setData(resData);
      })
      .catch((err) => console.error('Failed to fetch timeline:', err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="py-20 text-center text-slate-400 font-serif space-y-2">
        <Sparkles className="w-6 h-6 animate-spin mx-auto text-amber-500" />
        <p>Loading your spiritual timeline...</p>
      </div>
    );
  }

  const profile = data?.profile || {};
  const lead = data?.lead || {};
  const dbTimeline = data?.timeline || [];
  const activities = data?.activities || [];

  // Synthesize timeline entries
  const milestoneList: any[] = [];

  if (dbTimeline.length > 0) {
    dbTimeline.forEach((t: any) => {
      milestoneList.push({
        id: t.id,
        date: t.consultation_date || t.created_at,
        title: `${t.service || 'Vedic Guidance'} — Recorded Milestone`,
        icon: CheckCircle2,
        color: 'bg-emerald-500',
        summary: t.summary || 'Consultation session conducted.',
        remedy: t.remedy_shared,
      });
    });
  }

  if (lead?.id) {
    milestoneList.push({
      id: 'm-initial',
      date: lead.created_at || new Date().toISOString(),
      title: `${(lead.service_interest || 'Divine Consultation').replace(/_/g, ' ')} — Journey Commenced`,
      icon: Sparkles,
      color: 'bg-amber-500',
      summary: `Client profile created. Consultation mode: ${(lead.consultation_mode || 'online').toUpperCase()}.`,
      remedy: profile.kundali_notes ? `Kundali Notes: ${profile.kundali_notes}` : undefined,
    });

    if (profile.remedy_status === 'sent' || profile.remedy_status === 'accepted') {
      milestoneList.push({
        id: 'm-remedy',
        date: lead.updated_at || new Date().toISOString(),
        title: 'Prescribed Vedic Remedies Shared',
        icon: Award,
        color: 'bg-sky-500',
        summary: 'Personalized gemstone, mantra, and ritual guidance prescribed by Dharmikshree.',
      });
    }

    if (profile.puja_status === 'booked' || profile.puja_status === 'completed') {
      milestoneList.push({
        id: 'm-puja',
        date: lead.updated_at || new Date().toISOString(),
        title: `Special Mahapuja — ${profile.puja_status === 'completed' ? 'Completed' : 'Booked'}`,
        icon: Flame,
        color: 'bg-orange-500',
        summary: 'Vedic Mahapuja arranged with Vedic Pandits.',
      });
    }
  }

  activities.forEach((act: any) => {
    milestoneList.push({
      id: act.id,
      date: act.created_at,
      title: `System Update (${act.activity_type})`,
      icon: Clock,
      color: 'bg-[#1A3C5E]',
      summary: act.content,
    });
  });

  return (
    <div className="space-y-6 pb-12 max-w-3xl mx-auto">
      <div className="border-b border-amber-200 pb-4">
        <h1 className="text-2xl font-bold font-serif-heading text-[#1A3C5E]">
          My Spiritual Journey Timeline
        </h1>
        <p className="text-xs text-slate-600 font-serif">
          Verified milestones, consultations, pujas, and remedy progress with Dharmikshree.
        </p>
      </div>

      {milestoneList.length === 0 ? (
        <div className="py-12 text-center text-slate-400 font-serif">
          No milestone history recorded yet.
        </div>
      ) : (
        <div className="relative border-l-2 border-amber-300 ml-4 space-y-8 py-2">
          {milestoneList.map((m) => {
            const Icon = m.icon || CheckCircle2;

            return (
              <div key={m.id} className="relative pl-8 space-y-2">
                <div className={`absolute -left-[17px] top-0 w-8 h-8 rounded-full ${m.color || 'bg-amber-500'} text-white flex items-center justify-center shadow ring-4 ring-[#FFF8E7]`}>
                  <Icon className="w-4 h-4" />
                </div>

                <div className="bg-white p-5 rounded-2xl border border-amber-200 shadow-sm space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-[#1A3C5E] text-sm font-serif-heading capitalize">{m.title}</span>
                    <span className="text-slate-400 font-mono">{formatDateIN(m.date)}</span>
                  </div>

                  <p className="text-xs text-slate-700 leading-relaxed">{m.summary}</p>

                  {m.remedy && (
                    <div className="p-2.5 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-900 font-serif">
                      <span className="font-bold">Prescribed Remedy: </span> {m.remedy}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
