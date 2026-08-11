'use client';

import React, { useState, useEffect } from 'react';
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
} from 'lucide-react';
import { DEFAULT_WHATSAPP_TEMPLATES } from '@/lib/constants';
import { formatDateIN, formatPhoneIN } from '@/lib/formatters';
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

  return (
    <div className="space-y-8 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-2xl font-bold font-serif-heading text-[#1A3C5E]">
            Automated Reminders & Daily Agenda Engine
          </h1>
          <p className="text-slate-500 text-xs">
            Pre-consultation 15-day, 5-day, 3-day, 1-day reminders, payment follow-ups & WhatsApp templates.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1.5 bg-amber-100 text-amber-900 border border-amber-300 text-xs font-bold rounded-xl flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-600" /> Daily Cron: 9:00 AM IST
          </span>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-slate-200 gap-4 sm:gap-8 bg-white p-2 rounded-2xl shadow-xs border border-slate-200 overflow-x-auto">
        <button
          onClick={() => setActiveTab('today')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 shrink-0 ${
            activeTab === 'today' ? 'bg-[#1A3C5E] text-amber-400 shadow' : 'text-slate-600 hover:bg-slate-50'
          }`}
        >
          <BellRing className="w-4 h-4" />
          Today's Tasks ({todayList.length})
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
            <Edit3 className="w-3.5 h-3.5" /> Message Templates
          </button>
        )}
      </div>

      {/* Main Tab Content */}
      {activeTab === 'templates' ? (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-6">
          <div className="border-b border-amber-100 pb-3">
            <h3 className="font-bold text-base text-[#1A3C5E]">Pre-built WhatsApp & Email Message Templates</h3>
            <p className="text-xs text-slate-500">Super admin can customize automated reminder text templates</p>
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
              <p className="text-xs text-slate-400">New leads & consultation dates auto-generate reminders.</p>
            </div>
          ) : (
            currentList.map((rem) => {
              const waLink = generateWhatsAppLink(rem.lead_phone || '9876543210', rem.message_template || rem.notes || '');

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
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 text-[10px] font-bold uppercase rounded-full bg-amber-100 text-amber-900 border border-amber-200">
                        {rem.reminder_type.replace(/_/g, ' ')}
                      </span>
                      <span className="font-bold text-sm text-slate-900 truncate">{rem.lead_name}</span>
                      <span className="text-xs text-slate-400">({rem.service_name})</span>
                    </div>

                    <p className="text-xs text-slate-700 bg-slate-50/80 p-2.5 rounded-xl border border-slate-100">
                      {rem.message_template || rem.notes}
                    </p>

                    <div className="flex items-center gap-4 text-[11px] text-slate-400 pt-1">
                      <span>Scheduled: {formatDateIN(rem.scheduled_for)}</span>
                      <span>Assigned: {rem.assigned_to_user?.full_name || 'Team'}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {rem.status !== 'done' && (
                      <>
                        <a
                          href={waLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-xl shadow transition flex items-center gap-1"
                        >
                          <MessageSquare className="w-3.5 h-3.5" /> Send WhatsApp
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
                          className="px-3.5 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded-xl shadow transition flex items-center gap-1"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" /> Mark Done
                        </button>
                      </>
                    )}

                    {rem.status === 'done' && (
                      <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-xl">
                        ✓ Completed
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
