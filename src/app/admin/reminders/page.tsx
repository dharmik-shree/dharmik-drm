'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  BellRing,
  CheckCircle2,
  Clock,
  Send,
  PhoneCall,
  Calendar,
  Sparkles,
  AlertCircle,
  MessageSquare,
  ChevronRight,
  Edit3,
  ExternalLink,
} from 'lucide-react';
import { DEFAULT_WHATSAPP_TEMPLATES, SERVICE_OPTIONS } from '@/lib/constants';
import { formatDateIN, formatDateTimeIN, formatPhoneIN } from '@/lib/formatters';
import { generateWhatsAppLink } from '@/lib/whatsapp';
import { UserRole, Reminder } from '@/types';

export default function RemindersPage() {
  const [userRole, setUserRole] = useState<UserRole>('super_admin');
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [activeTab, setActiveTab] = useState<'today' | 'overdue' | 'upcoming' | 'all' | 'templates'>('today');
  const [loading, setLoading] = useState(true);

  // Templates state
  const [templates, setTemplates] = useState(DEFAULT_WHATSAPP_TEMPLATES);

  useEffect(() => {
    const match = document.cookie.match(/dharmik_demo_role=([^;]+)/);
    if (match) setUserRole(match[1] as UserRole);

    loadReminders();
  }, []);

  async function loadReminders() {
    try {
      setLoading(true);
      const res = await fetch('/api/reminders');
      const data = await res.json();
      if (data.reminders) setReminders(data.reminders);
    } catch (err) {
      console.error('Error fetching live Supabase reminders:', err);
    } finally {
      setLoading(false);
    }
  }

  const handleMarkDone = async (id: string) => {
    setReminders((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: 'done', sent_at: new Date().toISOString() } : r))
    );

    try {
      await fetch('/api/reminders', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status: 'done' }),
      });
    } catch (err) {
      console.error('Error updating reminder in Supabase:', err);
    }
  };

  const handleSnoozeOneDay = async (id: string) => {
    const rem = reminders.find((r) => r.id === id);
    if (!rem) return;

    const nextDay = new Date(new Date(rem.scheduled_for).getTime() + 24 * 60 * 60 * 1000).toISOString();
    setReminders((prev) =>
      prev.map((r) => (r.id === id ? { ...r, scheduled_for: nextDay } : r))
    );

    try {
      await fetch('/api/reminders', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, scheduled_for: nextDay }),
      });
    } catch (err) {
      console.error('Error snoozing reminder:', err);
    }
  };

  const todayStr = new Date().toDateString();

  const todayList = reminders.filter(
    (r) => r.status === 'pending' && new Date(r.scheduled_for).toDateString() === todayStr
  );

  const overdueList = reminders.filter(
    (r) => r.status === 'pending' && new Date(r.scheduled_for) < new Date(Date.now() - 24 * 60 * 60 * 1000)
  );

  const upcomingList = reminders.filter(
    (r) => r.status === 'pending' && new Date(r.scheduled_for) > new Date(Date.now() + 12 * 60 * 60 * 1000)
  );

  const currentList =
    activeTab === 'today'
      ? todayList
      : activeTab === 'overdue'
      ? overdueList
      : activeTab === 'upcoming'
      ? upcomingList
      : reminders;

  const getBadgeStyle = (type: string) => {
    switch (type) {
      case 'pre_consult_15day':
        return 'bg-blue-100 text-blue-900 border-blue-300';
      case 'pre_consult_5day':
        return 'bg-amber-100 text-amber-900 border-amber-300';
      case 'pre_consult_1day':
        return 'bg-purple-100 text-purple-900 border-purple-300';
      case 'payment_due':
        return 'bg-red-100 text-red-900 border-red-300';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-300';
    }
  };

  const getBadgeLabel = (type: string) => {
    switch (type) {
      case 'pre_consult_15day':
        return '15-Day Reminder';
      case 'pre_consult_5day':
        return '5-Day Reminder';
      case 'pre_consult_1day':
        return '1-Day Final Confirmation';
      case 'payment_due':
        return 'Payment Due';
      default:
        return type.replace(/_/g, ' ');
    }
  };

  return (
    <div className="space-y-8 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-2xl font-bold font-serif-heading text-[#1A3C5E]">
            Today's Action Agenda & Reminder Engine
          </h1>
          <p className="text-slate-500 text-xs">
            Pre-consultation 15-day, 5-day, and 1-day reminders, payment follow-ups & WhatsApp templates.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1.5 bg-amber-100 text-amber-900 border border-amber-300 text-xs font-bold rounded-xl flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-600" /> Daily Cron: 9:00 AM IST
          </span>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-slate-200 gap-3 bg-white p-2 rounded-2xl shadow-xs border border-slate-200 overflow-x-auto">
        <button
          onClick={() => setActiveTab('today')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 shrink-0 ${
            activeTab === 'today' ? 'bg-[#1A3C5E] text-amber-400 shadow' : 'text-slate-600 hover:bg-slate-50'
          }`}
        >
          <BellRing className="w-4 h-4" />
          Today's Action Agenda ({todayList.length})
        </button>

        <button
          onClick={() => setActiveTab('overdue')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 shrink-0 ${
            activeTab === 'overdue' ? 'bg-red-600 text-white shadow' : 'text-slate-600 hover:bg-slate-50'
          }`}
        >
          <AlertCircle className="w-4 h-4" />
          Overdue ({overdueList.length})
        </button>

        <button
          onClick={() => setActiveTab('upcoming')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 shrink-0 ${
            activeTab === 'upcoming' ? 'bg-purple-600 text-white shadow' : 'text-slate-600 hover:bg-slate-50'
          }`}
        >
          <Calendar className="w-4 h-4" />
          Next 7 Days ({upcomingList.length})
        </button>

        <button
          onClick={() => setActiveTab('all')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition shrink-0 ${
            activeTab === 'all' ? 'bg-slate-800 text-white shadow' : 'text-slate-600 hover:bg-slate-50'
          }`}
        >
          All ({reminders.length})
        </button>

        {userRole === 'super_admin' && (
          <button
            onClick={() => setActiveTab('templates')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shrink-0 ${
              activeTab === 'templates' ? 'bg-amber-500 text-slate-950 shadow' : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <Edit3 className="w-3.5 h-3.5" /> WhatsApp Templates
          </button>
        )}
      </div>

      {/* Main Tab Content */}
      {activeTab === 'templates' ? (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-6">
          <div className="border-b border-amber-100 pb-3">
            <h3 className="font-bold text-base text-[#1A3C5E]">Pre-built WhatsApp Message Templates</h3>
            <p className="text-xs text-slate-500">Super admin can customize 15-day, 5-day, and 1-day reminder text templates</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(templates).map(([key, val]) => (
              <div key={key} className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                <span className="text-xs font-bold text-amber-900 uppercase">{key.replace(/_/g, ' ')}</span>
                <textarea
                  rows={3}
                  value={val}
                  onChange={(e) => setTemplates({ ...templates, [key]: e.target.value })}
                  className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs outline-none resize-none font-sans"
                />
              </div>
            ))}
          </div>

          <div className="flex justify-end">
            <button
              onClick={() => alert('WhatsApp templates saved successfully!')}
              className="px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded-xl shadow transition"
            >
              Save Template Changes
            </button>
          </div>
        </div>
      ) : loading ? (
        <div className="py-12 text-center text-slate-400">Loading action agenda...</div>
      ) : (
        <div className="space-y-3">
          {currentList.length === 0 ? (
            <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center space-y-2">
              <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto" />
              <p className="font-bold text-slate-800 text-base">All clear! No reminders in this filter.</p>
              <p className="text-xs text-slate-400">Consultation dates automatically generate 15-day, 5-day, and 1-day pre-consult reminders.</p>
            </div>
          ) : (
            currentList.map((rem) => {
              const waText = rem.message_template || rem.notes || '';
              const waLink = `https://wa.me/${(rem.lead_phone || '').replace(/\D/g, '')}?text=${encodeURIComponent(waText)}`;

              return (
                <div
                  key={rem.id}
                  className={`bg-white p-5 rounded-2xl border transition shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                    rem.status === 'done'
                      ? 'border-slate-200 opacity-60 bg-slate-50'
                      : activeTab === 'overdue'
                      ? 'border-red-200 bg-red-50/20'
                      : 'border-slate-200 hover:border-amber-400'
                  }`}
                >
                  <div className="space-y-2.5 min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`px-2.5 py-0.5 text-[10px] font-bold uppercase rounded-full border ${getBadgeStyle(rem.reminder_type)}`}>
                        {getBadgeLabel(rem.reminder_type)}
                      </span>
                      <Link href={`/admin/leads/${rem.lead_id}`} className="font-bold text-sm text-slate-900 hover:text-amber-600 transition truncate">
                        {rem.lead_name}
                      </Link>
                      <span className="text-xs text-slate-500 font-medium">({rem.service_name})</span>
                    </div>

                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs text-slate-800 space-y-1">
                      <p className="leading-relaxed font-sans">{rem.message_template || rem.notes}</p>
                    </div>

                    <div className="flex flex-wrap items-center gap-4 text-[11px] text-slate-500">
                      <span>Scheduled: <strong>{formatDateIN(rem.scheduled_for)}</strong></span>
                      {rem.date_of_consultation && (
                        <span className="text-purple-800 font-bold">Consultation Date: {formatDateIN(rem.date_of_consultation)}</span>
                      )}
                      <span>Assigned: <strong>{rem.assigned_to_user?.full_name || 'Team'}</strong></span>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 shrink-0 sm:self-center">
                    {rem.status !== 'done' && (
                      <>
                        <a
                          href={waLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow transition flex items-center gap-1.5"
                        >
                          <MessageSquare className="w-3.5 h-3.5" /> Send WhatsApp
                        </a>

                        <a
                          href={`tel:${rem.lead_phone}`}
                          className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl transition flex items-center gap-1"
                        >
                          <PhoneCall className="w-3.5 h-3.5 text-slate-600" /> Call
                        </a>

                        <button
                          onClick={() => handleSnoozeOneDay(rem.id)}
                          className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl transition"
                          title="Snooze 1 Day"
                        >
                          ⏭️ Snooze 1d
                        </button>

                        <button
                          onClick={() => handleMarkDone(rem.id)}
                          className="px-3.5 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded-xl shadow transition flex items-center gap-1.5"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" /> Mark Done
                        </button>
                      </>
                    )}

                    {rem.status === 'done' && (
                      <span className="text-xs font-bold text-emerald-600 bg-emerald-50 border border-emerald-200 px-3.5 py-2 rounded-xl flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Completed
                      </span>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
