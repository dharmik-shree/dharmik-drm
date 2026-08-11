'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Phone,
  MessageSquare,
  Mail,
  MapPin,
  Calendar,
  Sparkles,
  IndianRupee,
  CheckCircle2,
  AlertCircle,
  FileText,
  Send,
  Plus,
  Edit3,
  Trash2,
  Upload,
  UserCheck,
  ShieldCheck,
  Package,
  Award,
} from 'lucide-react';
import { PIPELINE_STAGES, SERVICE_OPTIONS, LEAD_TEMPERATURES } from '@/lib/constants';
import { formatINR, formatPhoneIN, formatDateIN, formatDateTimeIN } from '@/lib/formatters';
import { generateWhatsAppLink } from '@/lib/whatsapp';
import { generatePreConsultReminders } from '@/lib/reminders';
import { generatePaymentReceiptPDF } from '@/lib/receipt-pdf';
import { Lead, LeadActivity, PipelineStage, UserRole, Reminder, PaymentRecord } from '@/types';

export default function LeadDetailPage() {
  const params = useParams();
  const router = useRouter();
  const leadId = params.id as string;

  const [userRole, setUserRole] = useState<UserRole>('super_admin');
  const [lead, setLead] = useState<Lead | null>(null);
  const [activities, setActivities] = useState<LeadActivity[]>([]);
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [loading, setLoading] = useState(true);

  // Quick Action Input State
  const [newNote, setNewNote] = useState('');
  const [actionType, setActionType] = useState<'note' | 'call_log' | 'whatsapp'>('note');
  const [activeTab, setActiveTab] = useState<'payments' | 'reminders' | 'files' | 'timeline'>('payments');

  // Interactive stage checklist
  const [checklist, setChecklist] = useState([
    { id: '1', text: 'Birth chart details & location confirmed', completed: true },
    { id: '2', text: 'Payment receipt issued to client', completed: false },
    { id: '3', text: 'Protocol message sent on WhatsApp', completed: false },
    { id: '4', text: 'Zoom link / Office address shared', completed: false },
  ]);

  useEffect(() => {
    const match = document.cookie.match(/dharmik_demo_role=([^;]+)/);
    if (match) setUserRole(match[1] as UserRole);

    loadLeadData();
  }, [leadId]);

  async function loadLeadData() {
    try {
      setLoading(true);
      const [resLead, resAct, resRem, resPay] = await Promise.all([
        fetch(`/api/leads/${leadId}`).then(r => r.json()),
        fetch(`/api/activities?lead_id=${leadId}`).then(r => r.json()),
        fetch(`/api/reminders?lead_id=${leadId}`).then(r => r.json()),
        fetch(`/api/payments?lead_id=${leadId}`).then(r => r.json()),
      ]);

      if (resLead.lead) {
        setLead(resLead.lead);
        setChecklist((prev) =>
          prev.map((c) => (c.id === '3' ? { ...c, completed: resLead.lead.protocol_message_sent } : c))
        );
      }
      if (resAct.activities) setActivities(resAct.activities);
      if (resRem.reminders) setReminders(resRem.reminders);
      if (resPay.payments) setPayments(resPay.payments);
    } catch (err) {
      console.error('Error fetching lead profile from Supabase:', err);
    } fontFinally: {
      setLoading(false);
    }
  }

  if (loading) {
    return <div className="p-12 text-center text-slate-400">Loading lead profile from live Supabase...</div>;
  }

  if (!lead) {
    return <div className="p-12 text-center text-slate-400">Lead record not found.</div>;
  }

  const currentStageInfo = PIPELINE_STAGES.find((s) => s.key === lead.stage);
  const serviceLabel = SERVICE_OPTIONS.find((s) => s.key === lead.service_interest)?.label || lead.service_interest;
  const tempInfo = LEAD_TEMPERATURES.find((t) => t.key === lead.lead_temperature);

  const handleAddActivity = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNote.trim()) return;

    try {
      const typeStr = actionType === 'call_log' ? 'call_log' : actionType === 'whatsapp' ? 'whatsapp_sent' : 'note';
      const res = await fetch('/api/activities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lead_id: lead.id,
          activity_type: typeStr,
          content: newNote,
          is_internal: true,
        }),
      });

      const data = await res.json();
      if (data.activity) {
        setActivities([data.activity, ...activities]);
      }
      setNewNote('');
    } catch (err) {
      console.error('Failed to log activity:', err);
    }
  };

  const handleStageUpdate = async (newStage: PipelineStage) => {
    setLead({ ...lead, stage: newStage, updated_at: new Date().toISOString() });

    try {
      await fetch(`/api/leads/${lead.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stage: newStage }),
      });

      const resAct = await fetch('/api/activities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lead_id: lead.id,
          activity_type: 'stage_change',
          content: `Updated pipeline stage to ${newStage.replace(/_/g, ' ').toUpperCase()}`,
        }),
      });
      const dataAct = await resAct.json();
      if (dataAct.activity) setActivities([dataAct.activity, ...activities]);
    } catch (err) {
      console.error('Error updating stage:', err);
    }
  };

  const handleConsultationDateSet = async (dateStr: string) => {
    const isoDate = new Date(dateStr).toISOString();
    setLead({ ...lead, date_of_consultation: isoDate, rescheduled: !!lead.date_of_consultation });

    try {
      await fetch(`/api/leads/${lead.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date_of_consultation: isoDate,
          rescheduled: !!lead.date_of_consultation,
          reschedule_count: lead.rescheduled ? lead.reschedule_count + 1 : lead.reschedule_count,
        }),
      });

      // Auto-generate 4 pre-consult reminders
      const autoRems = generatePreConsultReminders(lead, isoDate);
      await fetch('/api/reminders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reminders: autoRems }),
      });

      // Refresh reminders
      const resRem = await fetch(`/api/reminders?lead_id=${lead.id}`).then((r) => r.json());
      if (resRem.reminders) setReminders(resRem.reminders);

      const resAct = await fetch('/api/activities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lead_id: lead.id,
          activity_type: 'system',
          content: `Consultation date set to ${formatDateIN(isoDate)}. Auto-generated pre-consult reminders.`,
        }),
      });
      const dataAct = await resAct.json();
      if (dataAct.activity) setActivities([dataAct.activity, ...activities]);
    } catch (err) {
      console.error('Failed to set consultation date:', err);
    }
  };

  const handleAddPayment = async () => {
    const amountStr = prompt('Enter payment amount received (₹):', '9900');
    if (!amountStr) return;

    const num = parseFloat(amountStr);
    try {
      const res = await fetch('/api/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lead_id: lead.id,
          service: serviceLabel,
          payment_type: num >= lead.amount_due ? 'full' : 'token',
          amount: num,
          payment_mode: 'upi',
          reference_no: `UPI/${Math.floor(100000000 + Math.random() * 900000000)}`,
        }),
      });

      const data = await res.json();
      if (data.payment) {
        setPayments([data.payment, ...payments]);

        // Refresh lead data
        const resLead = await fetch(`/api/leads/${lead.id}`).then((r) => r.json());
        if (resLead.lead) setLead(resLead.lead);

        const resAct = await fetch(`/api/activities?lead_id=${lead.id}`).then((r) => r.json());
        if (resAct.activities) setActivities(resAct.activities);
      }
    } catch (err) {
      console.error('Error recording payment:', err);
    }
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Top Header Navigation */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push('/admin/leads')}
            className="p-2 text-slate-500 hover:text-slate-900 bg-white border border-slate-200 rounded-xl transition"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold font-serif-heading text-[#1A3C5E]">{lead.full_name}</h1>
              <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full border ${tempInfo?.badgeClass}`}>
                {tempInfo?.icon} {tempInfo?.label}
              </span>
            </div>
            <p className="text-xs text-slate-500">Lead ID: {lead.id} • Created {formatDateIN(lead.created_at)}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <a
            href={generateWhatsAppLink(lead.phone, `नमस्ते ${lead.full_name} 🙏 Dharmikshree team connecting with you.`)}
            target="_blank"
            rel="noopener noreferrer"
            className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition shadow flex items-center gap-1.5"
          >
            <MessageSquare className="w-4 h-4" /> WhatsApp Client
          </a>

          {userRole !== 'team_member' && (
            <button
              onClick={handleAddPayment}
              className="px-3.5 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-bold rounded-xl shadow transition flex items-center gap-1.5"
            >
              <IndianRupee className="w-4 h-4" /> Record Payment
            </button>
          )}
        </div>
      </div>

      {/* 3-Column Layout: Left (Info) | Center (Chatter) | Right (Stage & Checklist) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column (4 cols) — 360 Client Profile */}
        <div className="lg:col-span-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-6">
          {/* Avatar & Contact Header */}
          <div className="text-center space-y-2 border-b border-slate-100 pb-4">
            <div className="w-16 h-16 bg-[#1A3C5E] text-amber-300 text-2xl font-serif font-bold rounded-full flex items-center justify-center mx-auto border-2 border-amber-400/40 shadow-sm">
              {lead.full_name.charAt(0)}
            </div>
            <h2 className="text-lg font-bold font-serif-heading text-slate-900">{lead.full_name}</h2>
            <p className="text-xs text-slate-500">{formatPhoneIN(lead.phone)}</p>

            <div className="pt-1 flex items-center justify-center gap-1 text-xs text-slate-600">
              <MapPin className="w-3.5 h-3.5 text-slate-400" />
              <span>{lead.city || 'Location N/A'}, {lead.country || 'India'}</span>
            </div>
          </div>

          {/* Key Custom Business Fields */}
          <div className="space-y-3 text-xs">
            <h3 className="font-bold text-slate-900 uppercase tracking-wider text-[11px]">Consultation Metadata</h3>

            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-500">Service Interest:</span>
                <span className="font-semibold text-slate-900">{serviceLabel}</span>
              </div>

              <div className="flex justify-between">
                <span className="text-slate-500">Mode:</span>
                <span className="font-semibold text-amber-900 uppercase">{lead.consultation_mode}</span>
              </div>

              <div className="flex justify-between">
                <span className="text-slate-500">Lead Source:</span>
                <span className="font-semibold text-slate-800 capitalize">{lead.lead_source}</span>
              </div>

              <div className="flex justify-between">
                <span className="text-slate-500">Assigned To:</span>
                <span className="font-semibold text-slate-900">{lead.assigned_to_user?.full_name || 'Unassigned'}</span>
              </div>
            </div>

            {/* Consultation Date Setter */}
            <div className="p-3 bg-purple-50/60 border border-purple-200 rounded-xl space-y-2">
              <span className="font-bold text-purple-900 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-purple-600" /> Consultation Date
              </span>

              {lead.date_of_consultation ? (
                <div className="space-y-1">
                  <p className="text-xs font-bold text-purple-900">{formatDateTimeIN(lead.date_of_consultation)}</p>
                  {lead.rescheduled && <span className="text-[10px] text-red-600 font-bold">Rescheduled ({lead.reschedule_count}x)</span>}
                </div>
              ) : (
                <p className="text-slate-400 italic">No date scheduled yet</p>
              )}

              <input
                type="datetime-local"
                onChange={(e) => handleConsultationDateSet(e.target.value)}
                className="w-full mt-1 p-2 bg-white border border-purple-200 rounded-lg text-xs outline-none"
              />
            </div>

            {/* Financial Summary */}
            {userRole !== 'team_member' && (
              <div className="p-3 bg-emerald-50/60 border border-emerald-200 rounded-xl space-y-1.5">
                <span className="font-bold text-emerald-900 uppercase tracking-wider text-[11px]">Financial Dakshina</span>
                <div className="flex justify-between">
                  <span className="text-slate-600">Total Fee:</span>
                  <span className="font-bold text-slate-900">{formatINR(lead.full_amount)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Paid:</span>
                  <span className="font-bold text-emerald-700">{formatINR(lead.amount_paid)}</span>
                </div>
                <div className="flex justify-between border-t border-emerald-200 pt-1">
                  <span className="text-slate-600">Balance Due:</span>
                  <span className="font-bold text-red-600">{formatINR(lead.amount_due)}</span>
                </div>
              </div>
            )}

            {/* Process Flags & Status */}
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5">
              <span className="font-bold text-slate-800 uppercase text-[11px]">Process & Delivery Status</span>
              <div className="flex justify-between">
                <span className="text-slate-500">Remedy Status:</span>
                <span className="font-semibold text-slate-800 capitalize">{lead.remedy_status}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Puja Status:</span>
                <span className="font-semibold text-slate-800 capitalize">{lead.puja_status}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Gemstone Status:</span>
                <span className="font-semibold text-slate-800 capitalize">{lead.stone_status}</span>
              </div>
            </div>

            {lead.internal_notes && (
              <div className="p-3 bg-amber-50/50 border border-amber-200 rounded-xl">
                <span className="font-bold text-amber-900 text-[11px]">Internal Diary Notes:</span>
                <p className="text-slate-700 mt-1 italic">{lead.internal_notes}</p>
              </div>
            )}
          </div>
        </div>

        {/* Center Column (5 cols) — Activity Timeline / Chatter */}
        <div className="lg:col-span-5 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="font-bold text-slate-900 text-base">Client Activity Chatter</h3>
            <span className="text-xs text-slate-500">{activities.length} entries</span>
          </div>

          {/* Add Activity Form */}
          <form onSubmit={handleAddActivity} className="space-y-3 bg-slate-50 p-3.5 border border-slate-200 rounded-xl">
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setActionType('note')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                  actionType === 'note' ? 'bg-[#1A3C5E] text-amber-400' : 'bg-white text-slate-600 border'
                }`}
              >
                📝 Add Note
              </button>

              <button
                type="button"
                onClick={() => setActionType('call_log')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                  actionType === 'call_log' ? 'bg-[#1A3C5E] text-amber-400' : 'bg-white text-slate-600 border'
                }`}
              >
                📞 Log Call
              </button>

              <button
                type="button"
                onClick={() => setActionType('whatsapp')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                  actionType === 'whatsapp' ? 'bg-[#1A3C5E] text-amber-400' : 'bg-white text-slate-600 border'
                }`}
              >
                💬 WhatsApp
              </button>
            </div>

            <textarea
              rows={2}
              placeholder={
                actionType === 'call_log'
                  ? 'Log call discussion outcomes...'
                  : actionType === 'whatsapp'
                  ? 'Log WhatsApp message sent...'
                  : 'Add internal client note...'
              }
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs outline-none focus:border-amber-500 resize-none"
            />

            <div className="flex justify-end">
              <button
                type="submit"
                className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded-xl shadow transition"
              >
                Log Activity
              </button>
            </div>
          </form>

          {/* Timeline Chatter Feed */}
          <div className="space-y-4 relative before:absolute before:left-3.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
            {activities.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-6">No activities recorded yet in live Supabase.</p>
            ) : (
              activities.map((act) => (
                <div key={act.id} className="relative pl-8 space-y-1 text-xs">
                  <div className="absolute left-2 top-1 w-3.5 h-3.5 rounded-full bg-amber-500 ring-4 ring-white" />
                  <div className="flex items-center justify-between text-slate-400 text-[10px]">
                    <span className="font-semibold text-slate-700">{act.created_by_user?.full_name || 'Staff Member'}</span>
                    <span>{formatDateTimeIN(act.created_at)}</span>
                  </div>
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800">
                    <span className="text-[10px] font-bold uppercase text-amber-800 block mb-0.5">{act.activity_type}</span>
                    {act.content}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Column (3 cols) — Stage Progress & Interactive Checklist */}
        <div className="lg:col-span-3 space-y-6">
          {/* Current Stage Card */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <div className="space-y-1">
              <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">Current Pipeline Stage</span>
              <h3 className="text-lg font-bold font-serif-heading text-[#1A3C5E]">{currentStageInfo?.label}</h3>
              <p className="text-xs text-slate-500">Step {currentStageInfo?.step} of 14</p>
            </div>

            {/* Visual Step Progress Bar */}
            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
              <div
                className="bg-amber-500 h-full transition-all duration-300"
                style={{ width: `${((currentStageInfo?.step || 1) / 14) * 100}%` }}
              />
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-700 uppercase">Change Stage</label>
              <select
                value={lead.stage}
                onChange={(e) => handleStageUpdate(e.target.value as PipelineStage)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-amber-900 outline-none"
              >
                {PIPELINE_STAGES.map((s) => (
                  <option key={s.key} value={s.key}>
                    {s.step}. {s.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Interactive Stage Checklist */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h4 className="font-bold text-xs text-slate-900 uppercase tracking-wider">Stage Checklist</h4>
              <span className="text-[10px] font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-full">
                {checklist.filter((c) => c.completed).length} / {checklist.length} Done
              </span>
            </div>

            <div className="space-y-2">
              {checklist.map((item) => (
                <label
                  key={item.id}
                  onClick={() =>
                    setChecklist(
                      checklist.map((c) => (c.id === item.id ? { ...c, completed: !c.completed } : c))
                    )
                  }
                  className={`p-2.5 rounded-xl border flex items-center gap-2.5 cursor-pointer text-xs transition ${
                    item.completed ? 'bg-emerald-50/80 border-emerald-200 text-emerald-900' : 'bg-slate-50 border-slate-200 text-slate-700'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={item.completed}
                    onChange={() => {}}
                    className="rounded border-slate-300 text-amber-600 focus:ring-amber-500"
                  />
                  <span className="leading-tight">{item.text}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Tabs Section (Payments, Reminders, Files, Timeline Preview) */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex border-b border-slate-200 gap-6">
          <button
            onClick={() => setActiveTab('payments')}
            className={`pb-3 text-xs font-bold tracking-wider uppercase transition border-b-2 ${
              activeTab === 'payments' ? 'border-amber-500 text-amber-900' : 'border-transparent text-slate-400 hover:text-slate-600'
            }`}
          >
            Payments & Receipts ({payments.length})
          </button>
          <button
            onClick={() => setActiveTab('reminders')}
            className={`pb-3 text-xs font-bold tracking-wider uppercase transition border-b-2 ${
              activeTab === 'reminders' ? 'border-amber-500 text-amber-900' : 'border-transparent text-slate-400 hover:text-slate-600'
            }`}
          >
            Scheduled Reminders ({reminders.length})
          </button>
          <button
            onClick={() => setActiveTab('files')}
            className={`pb-3 text-xs font-bold tracking-wider uppercase transition border-b-2 ${
              activeTab === 'files' ? 'border-amber-500 text-amber-900' : 'border-transparent text-slate-400 hover:text-slate-600'
            }`}
          >
            Documents & Remedies (0)
          </button>
        </div>

        {activeTab === 'payments' && (
          <div className="space-y-3">
            {payments.length === 0 ? (
              <p className="text-xs text-slate-400 py-4">No payment entries recorded yet in live Supabase.</p>
            ) : (
              payments.map((p) => (
                <div key={p.id} className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between gap-4 text-xs">
                  <div>
                    <span className="font-bold text-slate-900 text-sm">{formatINR(p.amount)}</span>
                    <p className="text-slate-500">{p.payment_type.toUpperCase()} • Mode: {p.payment_mode.toUpperCase()} • Ref: {p.reference_no}</p>
                  </div>
                  <button
                    onClick={() => generatePaymentReceiptPDF(p, lead)}
                    className="px-3 py-1.5 bg-[#1A3C5E] text-white text-xs font-semibold rounded-lg hover:bg-[#15304b] transition"
                  >
                    Download Official PDF Receipt
                  </button>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'reminders' && (
          <div className="space-y-3">
            {reminders.length === 0 ? (
              <p className="text-xs text-slate-400 py-4">No reminders scheduled yet in live Supabase.</p>
            ) : (
              reminders.map((r) => (
                <div key={r.id} className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between text-xs">
                  <div>
                    <span className="font-bold text-amber-900 uppercase">{r.reminder_type.replace(/_/g, ' ')}</span>
                    <p className="text-slate-600">{r.message_template || r.notes}</p>
                  </div>
                  <span className="text-slate-400 font-mono">{formatDateIN(r.scheduled_for)}</span>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
