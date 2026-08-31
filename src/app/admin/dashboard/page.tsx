'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Users,
  UserPlus,
  CalendarCheck,
  IndianRupee,
  AlertTriangle,
  BellRing,
  ArrowUpRight,
  ChevronRight,
  Sparkles,
  Clock,
  CheckCircle2,
  PhoneCall,
  MessageSquare,
  TrendingUp,
} from 'lucide-react';
import { PIPELINE_STAGES, SERVICE_OPTIONS, LEAD_SOURCES } from '@/lib/constants';
import { formatINR, formatDateIN, formatDateTimeIN } from '@/lib/formatters';
import { UserRole, Lead, LeadActivity, Reminder, PaymentRecord } from '@/types';

export default function DashboardPage() {
  const [userRole, setUserRole] = useState<UserRole>('super_admin');
  const [leads, setLeads] = useState<Lead[]>([]);
  const [activities, setActivities] = useState<LeadActivity[]>([]);
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Read role from cookie
    const match = document.cookie.match(/dharmik_demo_role=([^;]+)/);
    if (match) setUserRole(match[1] as UserRole);

    async function loadData() {
      try {
        const [resLeads, resAct, resRem, resPay] = await Promise.all([
          fetch('/api/leads').then((r) => r.json()),
          fetch('/api/activities?limit=10').then((r) => r.json()),
          fetch('/api/reminders?status=pending').then((r) => r.json()),
          fetch('/api/payments').then((r) => r.json()),
        ]);

        if (resLeads.leads) setLeads(resLeads.leads);
        if (resAct.activities) setActivities(resAct.activities);
        if (resRem.reminders) setReminders(resRem.reminders);
        if (resPay.payments) setPayments(resPay.payments);
      } catch (err) {
        console.error('Error loading Supabase live dashboard data:', err);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  const todayStr = new Date().toDateString();

  // Stat calculations
  const totalLeadsMonth = leads.length;
  const newLeadsToday = leads.filter((l) => new Date(l.created_at).toDateString() === todayStr).length;
  const consultationsWeek = leads.filter((l) => l.date_of_consultation).length;
  const revenueMonth = payments.reduce((sum, p) => sum + Number(p.amount), 0);
  const pendingDuesTotal = leads.reduce((sum, l) => sum + Number(l.amount_due || 0), 0);
  const remindersTodayCount = reminders.filter(
    (r) => r.status === 'pending' && new Date(r.scheduled_for).toDateString() === todayStr
  ).length;

  // Pipeline stage counts
  const stageCounts = PIPELINE_STAGES.map((s) => ({
    ...s,
    count: leads.filter((l) => l.stage === s.key).length,
  }));

  // Lead source counts
  const sourceCounts = LEAD_SOURCES.map((src) => ({
    ...src,
    count: leads.filter((l) => l.lead_source === src.key).length,
  })).filter((s) => s.count > 0);

  return (
    <div className="space-y-6 sm:space-y-8 pb-12 max-w-full overflow-x-hidden">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-[#1A3C5E] via-[#234b75] to-[#1A3C5E] rounded-2xl sm:rounded-3xl p-4 sm:p-8 text-white shadow-xl relative overflow-hidden flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-6 border border-amber-500/20">
        <div className="space-y-1.5 relative z-10">
          <div className="flex items-center gap-2 text-amber-300 text-[11px] sm:text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
            Jay Shree Mahakal • Operational Engine
          </div>
          <h1 className="text-xl sm:text-3xl font-bold font-serif-heading">
            Dharmikshree Enterprise Dashboard
          </h1>
          <p className="text-slate-200 text-xs sm:text-sm">
            Managing client consultations, remedies, Mahapujas, and daily Vedic reminders.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 sm:gap-3 relative z-10 w-full sm:w-auto">
          <Link
            href="/admin/leads/new"
            className="flex-1 sm:flex-none justify-center px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl shadow-md transition flex items-center gap-1.5"
          >
            + Add New Lead
          </Link>
          <Link
            href="/admin/reminders"
            className="flex-1 sm:flex-none justify-center px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white font-semibold text-xs rounded-xl transition border border-white/20 flex items-center gap-2"
          >
            Today's Agenda
            {remindersTodayCount > 0 ? (
              <span className="px-2 py-0.5 text-[10px] font-bold bg-amber-500 text-slate-950 rounded-full">
                {remindersTodayCount}
              </span>
            ) : (
              <span className="px-2 py-0.5 text-[10px] font-bold bg-emerald-500/30 text-emerald-300 rounded-full">
                Clear
              </span>
            )}
          </Link>
        </div>
      </div>

      {/* Top Stats Cards Grid (5 core metric cards) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
        {/* Total Leads */}
        <div className="bg-white p-3.5 sm:p-4.5 rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] sm:text-xs font-bold text-slate-500 uppercase">Total Leads</span>
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <p className="text-xl sm:text-2xl font-bold text-slate-900">{totalLeadsMonth}</p>
          <span className="text-[10px] sm:text-[11px] text-emerald-600 font-medium">Active Records</span>
        </div>

        {/* New Leads Today */}
        <div className="bg-white p-3.5 sm:p-4.5 rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] sm:text-xs font-bold text-slate-500 uppercase">New Today</span>
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <UserPlus className="w-4 h-4" />
            </div>
          </div>
          <p className="text-xl sm:text-2xl font-bold text-slate-900">{newLeadsToday}</p>
          <span className="text-[10px] sm:text-[11px] text-slate-400 font-medium">Captured today</span>
        </div>

        {/* Consultations Scheduled */}
        <div className="bg-white p-3.5 sm:p-4.5 rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] sm:text-xs font-bold text-slate-500 uppercase">Consultations</span>
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
              <CalendarCheck className="w-4 h-4" />
            </div>
          </div>
          <p className="text-xl sm:text-2xl font-bold text-slate-900">{consultationsWeek}</p>
          <span className="text-[10px] sm:text-[11px] text-purple-600 font-medium">Scheduled total</span>
        </div>

        {/* Revenue Collected */}
        {userRole !== 'team_member' ? (
          <div className="bg-white p-3.5 sm:p-4.5 rounded-2xl border border-emerald-200 bg-emerald-50/20 shadow-xs hover:shadow-md transition space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] sm:text-xs font-bold text-emerald-900 uppercase">Revenue</span>
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                <IndianRupee className="w-4 h-4" />
              </div>
            </div>
            <p className="text-xl sm:text-2xl font-bold text-emerald-900">{formatINR(revenueMonth)}</p>
            <span className="text-[10px] sm:text-[11px] text-emerald-700 font-medium">Collected total</span>
          </div>
        ) : (
          <div className="bg-slate-50 p-3.5 sm:p-4.5 rounded-2xl border border-slate-200 text-slate-400 space-y-2">
            <span className="text-[11px] sm:text-xs font-bold uppercase">Revenue Access</span>
            <p className="text-xs italic">Restricted to Admin</p>
          </div>
        )}

        {/* Pending Dues */}
        {userRole !== 'team_member' ? (
          <div className="bg-white p-3.5 sm:p-4.5 rounded-2xl border border-red-200 bg-red-50/20 shadow-xs hover:shadow-md transition space-y-2 col-span-2 sm:col-span-1">
            <div className="flex items-center justify-between">
              <span className="text-[11px] sm:text-xs font-bold text-red-900 uppercase">Pending Dues</span>
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-red-100 text-red-700 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-4 h-4" />
              </div>
            </div>
            <p className="text-xl sm:text-2xl font-bold text-red-900">{formatINR(pendingDuesTotal)}</p>
            <span className="text-[10px] sm:text-[11px] text-red-700 font-medium">Uncollected balance</span>
          </div>
        ) : (
          <div className="bg-slate-50 p-3.5 sm:p-4.5 rounded-2xl border border-slate-200 text-slate-400 space-y-2 col-span-2 sm:col-span-1">
            <span className="text-[11px] sm:text-xs font-bold uppercase">Financial Dues</span>
            <p className="text-xs italic">Restricted to Admin</p>
          </div>
        )}
      </div>

      {/* Horizontal Pipeline Funnel */}
      <div className="bg-white p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="font-bold text-sm sm:text-base text-[#1A3C5E]">Lead Pipeline Stage Distribution</h3>
            <p className="text-xs text-slate-500">Tap any stage to filter pipeline view</p>
          </div>
          <Link href="/admin/leads" className="text-xs font-bold text-amber-600 hover:text-amber-700 flex items-center gap-1">
            View Kanban Board <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
          {stageCounts.slice(0, 14).map((s) => (
            <Link
              key={s.key}
              href={`/admin/leads?stage=${s.key}`}
              className={`p-2.5 sm:p-3 rounded-2xl border transition flex flex-col justify-between hover:scale-[1.02] ${s.color}`}
            >
              <span className="text-[11px] font-bold truncate">{s.label}</span>
              <div className="flex items-baseline justify-between pt-2">
                <span className="text-lg sm:text-xl font-extrabold">{s.count}</span>
                <span className="text-[9px] sm:text-[10px] opacity-75 font-mono">Step {s.step}</span>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Main Grid: Today's Agenda & Activity Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
        {/* Left 2 Columns: Today's Action Agenda */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-slate-200 shadow-xs space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-4 gap-2">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-amber-500/10 border border-amber-500/30 text-amber-900 rounded-xl shrink-0">
                  <Clock className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm sm:text-base">Today's Action Agenda</h3>
                  <p className="text-xs text-slate-500">Scheduled consultations & pre-consult reminders</p>
                </div>
              </div>

              <Link href="/admin/reminders" className="text-xs font-bold text-[#1A3C5E] hover:text-amber-600 flex items-center gap-1 self-start sm:self-auto">
                View Full Agenda <ChevronRight className="w-4 h-4" />
              </Link>
            </div>

            {/* Today's Consultations Section */}
            <div className="space-y-3">
              <span className="text-[11px] font-bold uppercase tracking-wider text-purple-900 flex items-center gap-1.5 bg-purple-50 px-3 py-1 rounded-lg border border-purple-200">
                <CalendarCheck className="w-3.5 h-3.5 text-purple-600 shrink-0" /> Scheduled Consultations Today ({
                  leads.filter((l) => l.date_of_consultation && new Date(l.date_of_consultation).toDateString() === todayStr).length
                })
              </span>

              {leads.filter((l) => l.date_of_consultation && new Date(l.date_of_consultation).toDateString() === todayStr).length === 0 ? (
                <p className="text-xs text-slate-400 py-2 pl-1 italic">No consultations scheduled for today.</p>
              ) : (
                leads
                  .filter((l) => l.date_of_consultation && new Date(l.date_of_consultation).toDateString() === todayStr)
                  .map((l) => (
                    <div key={l.id} className="p-3 sm:p-3.5 bg-purple-50/40 border border-purple-200 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <Link href={`/admin/leads/${l.id}`} className="font-bold text-slate-900 hover:text-purple-700 text-sm">
                            {l.full_name}
                          </Link>
                          <span className="px-2 py-0.5 text-[9px] font-bold rounded-full bg-purple-100 text-purple-800 uppercase">
                            {l.consultation_mode}
                          </span>
                        </div>
                        <p className="text-slate-500 text-[11px] mt-0.5">
                          Time: {formatDateTimeIN(l.date_of_consultation!)} • Service: {SERVICE_OPTIONS.find((s) => s.key === l.service_interest)?.label || l.service_interest}
                        </p>
                      </div>

                      <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto">
                        <a
                          href={`https://wa.me/${l.phone.replace(/\D/g, '')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-1 sm:flex-none justify-center px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl shadow-xs transition flex items-center gap-1"
                        >
                          <MessageSquare className="w-3.5 h-3.5" /> WhatsApp
                        </a>
                        <Link
                          href={`/admin/leads/${l.id}`}
                          className="flex-1 sm:flex-none justify-center px-3 py-1.5 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold rounded-xl transition text-center"
                        >
                          Open Profile
                        </Link>
                      </div>
                    </div>
                  ))
              )}
            </div>

            {/* Today's Due Reminders Section */}
            <div className="space-y-3 pt-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-amber-900 flex items-center gap-1.5 bg-amber-50 px-3 py-1 rounded-lg border border-amber-200">
                <BellRing className="w-3.5 h-3.5 text-amber-600 shrink-0" /> Reminders Due Today ({remindersTodayCount})
              </span>

              {remindersTodayCount === 0 ? (
                <p className="text-xs text-slate-400 py-2 pl-1 italic">No pending reminders due today.</p>
              ) : (
                reminders
                  .filter((r) => r.status === 'pending' && new Date(r.scheduled_for).toDateString() === todayStr)
                  .map((rem) => (
                    <div
                      key={rem.id}
                      className="p-3 sm:p-3.5 rounded-2xl border border-amber-200 bg-amber-50/20 hover:border-amber-400 transition flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                    >
                      <div className="space-y-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="px-2 py-0.5 text-[9px] font-bold uppercase rounded-full bg-amber-100 text-amber-900 border border-amber-300">
                            {rem.reminder_type.replace(/_/g, ' ')}
                          </span>
                          <span className="text-xs font-bold text-slate-900 truncate">{rem.lead_name}</span>
                          <span className="text-[10px] text-slate-500">({rem.service_name})</span>
                        </div>
                        <p className="text-slate-700 bg-white p-2 rounded-xl border border-slate-200 text-[11px] break-words">
                          {rem.message_template || rem.notes}
                        </p>
                      </div>

                      <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto">
                        <a
                          href={`https://wa.me/${rem.lead_phone?.replace(/\D/g, '')}?text=${encodeURIComponent(rem.message_template || '')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-1 sm:flex-none justify-center px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl shadow-xs transition flex items-center gap-1"
                        >
                          <MessageSquare className="w-3.5 h-3.5" /> WhatsApp
                        </a>
                        <button
                          onClick={async () => {
                            await fetch('/api/reminders', {
                              method: 'PATCH',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({ id: rem.id, status: 'done' }),
                            });
                            setReminders((prev) => prev.filter((r) => r.id !== rem.id));
                          }}
                          className="flex-1 sm:flex-none justify-center px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded-xl shadow-xs transition flex items-center gap-1 cursor-pointer"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" /> Done
                        </button>
                      </div>
                    </div>
                  ))
              )}
            </div>
          </div>

          {/* Lead Sources Distribution Breakdown */}
          <div className="bg-white p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-slate-200 shadow-xs space-y-4">
            <h3 className="font-bold text-slate-900 text-sm sm:text-base">Leads by Marketing Channel Source</h3>
            {sourceCounts.length === 0 ? (
              <p className="text-xs text-slate-400 py-4 italic">No marketing channel lead records captured yet.</p>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 sm:gap-3">
                {sourceCounts.map((src) => (
                  <div key={src.key} className="p-3 bg-slate-50 border border-slate-200 rounded-2xl space-y-1">
                    <span className="text-[11px] sm:text-xs font-semibold text-slate-600">{src.label}</span>
                    <div className="flex items-baseline justify-between">
                      <span className="text-base sm:text-lg font-bold text-slate-900">{src.count}</span>
                      <span className="text-[10px] text-slate-400 font-medium">
                        {Math.round((src.count / Math.max(1, leads.length)) * 100)}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right 1 Column: Recent Chatter & Activity */}
        <div className="space-y-6">
          <div className="bg-white p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-sm sm:text-base">Recent Team Activity</h3>
              <span className="text-[9px] sm:text-[10px] uppercase font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                Live Chatter
              </span>
            </div>

            <div className="space-y-4 relative before:absolute before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-100">
              {activities.length === 0 ? (
                <p className="text-xs text-slate-400 text-center py-6">No team activities logged yet.</p>
              ) : (
                activities.map((act) => (
                  <div key={act.id} className="relative pl-7 space-y-1 text-xs">
                    <div className="absolute left-1.5 top-1.5 w-3 h-3 rounded-full bg-amber-500 ring-4 ring-white" />
                    <div className="flex items-center justify-between text-slate-400 text-[10px] flex-wrap gap-1">
                      <span className="font-semibold text-slate-700">{act.created_by_user?.full_name || 'System Auto'}</span>
                      <span>{formatDateTimeIN(act.created_at)}</span>
                    </div>
                    <p className="text-slate-800 leading-relaxed font-medium break-words">{act.content}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
