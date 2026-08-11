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
          fetch('/api/leads').then(r => r.json()),
          fetch('/api/activities?limit=10').then(r => r.json()),
          fetch('/api/reminders?status=pending').then(r => r.json()),
          fetch('/api/payments').then(r => r.json()),
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

  // Stat calculations
  const totalLeadsMonth = leads.length;
  const newLeadsToday = leads.filter(l => new Date(l.created_at).toDateString() === new Date().toDateString()).length;
  const consultationsWeek = leads.filter(l => l.date_of_consultation).length;
  const revenueMonth = payments.reduce((sum, p) => sum + Number(p.amount), 0);
  const pendingDuesTotal = leads.reduce((sum, l) => sum + Number(l.amount_due || 0), 0);
  const remindersTodayCount = reminders.filter(r => r.status === 'pending').length;

  // Pipeline stage counts
  const stageCounts = PIPELINE_STAGES.map(s => ({
    ...s,
    count: leads.filter(l => l.stage === s.key).length,
  }));

  // Lead source counts
  const sourceCounts = LEAD_SOURCES.map(src => ({
    ...src,
    count: leads.filter(l => l.lead_source === src.key).length,
  })).filter(s => s.count > 0);

  return (
    <div className="space-y-8 pb-12">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-[#1A3C5E] via-[#234b75] to-[#1A3C5E] rounded-2xl p-6 sm:p-8 text-white shadow-lg relative overflow-hidden flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1 relative z-10">
          <div className="flex items-center gap-2 text-amber-300 text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-4 h-4" />
            Jay Shree Mahakal • Real-time CRM Sync
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold font-serif-heading">
            Dharmikshree CRM Overview
          </h1>
          <p className="text-slate-200 text-xs sm:text-sm">
            Managing client consultations, remedies, Mahapujas, and daily Vedic reminders.
          </p>
        </div>

        <div className="flex items-center gap-3 relative z-10">
          <Link
            href="/admin/leads/new"
            className="px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl shadow transition flex items-center gap-1.5"
          >
            + Add New Lead
          </Link>
          <Link
            href="/admin/reminders"
            className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white font-semibold text-xs rounded-xl transition border border-white/20"
          >
            Today's Agenda ({remindersTodayCount})
          </Link>
        </div>
      </div>

      {/* Top Stats Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {/* Total Leads */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase">Total Leads</span>
            <Users className="w-4 h-4 text-blue-600" />
          </div>
          <p className="text-2xl font-bold text-slate-900">{totalLeadsMonth}</p>
          <span className="text-[11px] text-emerald-600 font-medium">Active Records</span>
        </div>

        {/* New Leads Today */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase">New Today</span>
            <UserPlus className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-bold text-slate-900">{newLeadsToday}</p>
          <span className="text-[11px] text-slate-400 font-medium">Captured today</span>
        </div>

        {/* Consultations Week */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase">Consultations</span>
            <CalendarCheck className="w-4 h-4 text-purple-600" />
          </div>
          <p className="text-2xl font-bold text-slate-900">{consultationsWeek}</p>
          <span className="text-[11px] text-purple-600 font-medium">Scheduled week</span>
        </div>

        {/* Reminders Due */}
        <div className="bg-white p-4 rounded-2xl border border-amber-200 bg-amber-50/30 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-amber-800 uppercase">Reminders Due</span>
            <BellRing className="w-4 h-4 text-amber-600" />
          </div>
          <p className="text-2xl font-bold text-amber-900">{remindersTodayCount}</p>
          <span className="text-[11px] text-amber-700 font-medium">Requires action</span>
        </div>

        {/* Revenue This Month (Hidden for team_member) */}
        {userRole !== 'team_member' ? (
          <div className="bg-white p-4 rounded-2xl border border-emerald-200 bg-emerald-50/30 shadow-xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-emerald-800 uppercase">Revenue</span>
              <IndianRupee className="w-4 h-4 text-emerald-600" />
            </div>
            <p className="text-2xl font-bold text-emerald-900">{formatINR(revenueMonth)}</p>
            <span className="text-[11px] text-emerald-700 font-medium">Collected month</span>
          </div>
        ) : (
          <div className="bg-slate-100 p-4 rounded-2xl border border-slate-200 text-slate-400 space-y-2">
            <span className="text-xs font-semibold uppercase">Revenue Access</span>
            <p className="text-xs italic">Restricted to Admin</p>
          </div>
        )}

        {/* Pending Dues (Hidden for team_member) */}
        {userRole !== 'team_member' ? (
          <div className="bg-white p-4 rounded-2xl border border-red-200 bg-red-50/30 shadow-xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-red-800 uppercase">Pending Dues</span>
              <AlertTriangle className="w-4 h-4 text-red-600" />
            </div>
            <p className="text-2xl font-bold text-red-900">{formatINR(pendingDuesTotal)}</p>
            <span className="text-[11px] text-red-700 font-medium">Uncollected balance</span>
          </div>
        ) : (
          <div className="bg-slate-100 p-4 rounded-2xl border border-slate-200 text-slate-400 space-y-2">
            <span className="text-xs font-semibold uppercase">Financial Dues</span>
            <p className="text-xs italic">Restricted to Admin</p>
          </div>
        )}
      </div>

      {/* Horizontal Pipeline Funnel */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-base text-[#1A3C5E]">Lead Pipeline Stage Distribution</h3>
            <p className="text-xs text-slate-500">Click any stage to filter pipeline view</p>
          </div>
          <Link href="/admin/leads" className="text-xs font-semibold text-amber-600 hover:text-amber-700 flex items-center gap-1">
            View Kanban Board <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
          {stageCounts.slice(0, 14).map((s) => (
            <Link
              key={s.key}
              href={`/admin/leads?stage=${s.key}`}
              className={`p-3 rounded-xl border transition flex flex-col justify-between hover:scale-[1.02] ${s.color}`}
            >
              <span className="text-[11px] font-bold truncate">{s.label}</span>
              <div className="flex items-baseline justify-between pt-2">
                <span className="text-xl font-extrabold">{s.count}</span>
                <span className="text-[10px] opacity-75 font-mono">Step {s.step}</span>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Main Grid: Today's Agenda & Activity Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Columns: Today's Agenda */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-amber-100 text-amber-800 rounded-xl">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base">Today's Action Agenda</h3>
                  <p className="text-xs text-slate-500">Reminders, consultations, and payment collections for today</p>
                </div>
              </div>

              <Link href="/admin/reminders" className="text-xs font-semibold text-slate-600 hover:text-amber-600">
                View All Reminders →
              </Link>
            </div>

            <div className="space-y-3">
              {reminders.length === 0 ? (
                <div className="py-8 text-center border border-dashed border-slate-200 rounded-xl space-y-1">
                  <p className="text-xs font-semibold text-slate-600">No pending reminders for today.</p>
                  <p className="text-[11px] text-slate-400">New lead submissions and consultation dates auto-generate reminders.</p>
                </div>
              ) : (
                reminders.map((rem) => (
                  <div
                    key={rem.id}
                    className="p-4 rounded-xl border border-slate-200 hover:border-amber-300 transition flex items-center justify-between gap-4 bg-slate-50/50"
                  >
                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-amber-100 text-amber-800 uppercase">
                          {rem.reminder_type.replace(/_/g, ' ')}
                        </span>
                        <span className="text-xs font-bold text-slate-900 truncate">{rem.lead_name}</span>
                      </div>
                      <p className="text-xs text-slate-600 line-clamp-1">{rem.message_template || rem.notes}</p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <a
                        href={`https://wa.me/${rem.lead_phone?.replace(/\D/g, '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg transition flex items-center gap-1"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        Send WhatsApp
                      </a>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Lead Sources Distribution Breakdown */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <h3 className="font-bold text-slate-900 text-base">Leads by Marketing Channel Source</h3>
            {sourceCounts.length === 0 ? (
              <p className="text-xs text-slate-400 py-4 italic">No marketing channel lead records captured yet.</p>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {sourceCounts.map((src) => (
                  <div key={src.key} className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                    <span className="text-xs font-semibold text-slate-600">{src.label}</span>
                    <div className="flex items-baseline justify-between">
                      <span className="text-lg font-bold text-slate-900">{src.count}</span>
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
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-base">Recent Team Activity</h3>
              <span className="text-[10px] uppercase font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full">
                Live Chatter Feed
              </span>
            </div>

            <div className="space-y-4 relative before:absolute before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-100">
              {activities.length === 0 ? (
                <p className="text-xs text-slate-400 text-center py-6">No team activities logged yet.</p>
              ) : (
                activities.map((act) => (
                  <div key={act.id} className="relative pl-7 space-y-1 text-xs">
                    <div className="absolute left-1.5 top-1.5 w-3 h-3 rounded-full bg-amber-500 ring-4 ring-white" />
                    <div className="flex items-center justify-between text-slate-400 text-[10px]">
                      <span className="font-semibold text-slate-700">{act.created_by_user?.full_name || 'System Auto'}</span>
                      <span>{formatDateTimeIN(act.created_at)}</span>
                    </div>
                    <p className="text-slate-800 leading-relaxed font-medium">{act.content}</p>
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
