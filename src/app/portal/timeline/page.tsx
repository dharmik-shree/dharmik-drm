'use client';

import React from 'react';
import { Sparkles, CheckCircle2, Package, Award, Calendar, Flame } from 'lucide-react';
import { formatDateIN } from '@/lib/formatters';

export default function CustomerTimelinePage() {
  const milestoneList = [
    {
      id: 'm-1',
      date: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString(),
      title: 'Divine Consultation — Completed',
      icon: CheckCircle2,
      color: 'bg-emerald-500',
      summary: '45-minute comprehensive Kundali reading conducted by Dharmikshree. Mahadasha shift analysis completed.',
      remedy: 'Suggested Pearl Gemstone wearing & Rahu Shanti Mahapuja.',
    },
    {
      id: 'm-2',
      date: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
      title: 'Certified Gemstone Delivered',
      icon: Package,
      color: 'bg-sky-500',
      summary: 'Natural South Sea Pearl gemstone dispatched with lab certificate. Wearing Muhurat ritual conducted.',
    },
    {
      id: 'm-3',
      date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      title: 'Special Mahapuja Conducted',
      icon: Flame,
      color: 'bg-orange-500',
      summary: 'Rahu Shanti Mahapuja performed at Trimbakeshwar by Vedic Pandits under Dharmikshree guidance.',
    },
    {
      id: 'm-4',
      date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
      title: 'Next Follow-Up Session Scheduled',
      icon: Calendar,
      color: 'bg-purple-500',
      summary: 'Upcoming online progress review session.',
    },
  ];

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

      <div className="relative border-l-2 border-amber-300 ml-4 space-y-8 py-2">
        {milestoneList.map((m) => {
          const Icon = m.icon;

          return (
            <div key={m.id} className="relative pl-8 space-y-2">
              <div className={`absolute -left-[17px] top-0 w-8 h-8 rounded-full ${m.color} text-white flex items-center justify-center shadow ring-4 ring-[#FFF8E7]`}>
                <Icon className="w-4 h-4" />
              </div>

              <div className="bg-white p-5 rounded-2xl border border-amber-200 shadow-sm space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-[#1A3C5E] text-sm font-serif-heading">{m.title}</span>
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
    </div>
  );
}
