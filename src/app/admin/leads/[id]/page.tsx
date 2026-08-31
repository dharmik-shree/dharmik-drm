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
  Compass,
  Star,
  UserPlus,
} from 'lucide-react';
import { PIPELINE_STAGES, SERVICE_OPTIONS, LEAD_TEMPERATURES, GENDER_OPTIONS, RELATION_OPTIONS, MARITAL_STATUS_OPTIONS, RASHI_OPTIONS } from '@/lib/constants';
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
  const [converting, setConverting] = useState(false);
  const [showKundaliModal, setShowKundaliModal] = useState(false);
  const [kundaliForm, setKundaliForm] = useState({
    date_of_birth: '',
    time_of_birth: '',
    birth_place: '',
    gender: 'male',
    relation: 'self',
    address: '',
    pincode: '',
    marital_status: 'single',
    gotra: '',
    rashi: '',
    occupation: '',
    kundali_notes: '',
  });

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
        const l = resLead.lead;
        setLead(l);
        setKundaliForm({
          date_of_birth: l.date_of_birth || '',
          time_of_birth: l.time_of_birth || '',
          birth_place: l.birth_place || '',
          gender: l.gender || 'male',
          relation: l.relation || 'self',
          address: l.address || '',
          pincode: l.pincode || '',
          marital_status: l.marital_status || 'single',
          gotra: l.gotra || '',
          rashi: l.rashi || '',
          occupation: l.occupation || '',
          kundali_notes: l.kundali_notes || '',
        });
        setChecklist((prev) =>
          prev.map((c) => (c.id === '3' ? { ...c, completed: l.protocol_message_sent } : c))
        );
      }
      if (resAct.activities) setActivities(resAct.activities);
      if (resRem.reminders) setReminders(resRem.reminders);
      if (resPay.payments) setPayments(resPay.payments);
    } catch (err) {
      console.error('Error fetching lead profile from Supabase:', err);
    } finally {
      setLoading(false);
    }
  }

  const handlePromoteToCustomer = async () => {
    if (!lead) return;
    if (!confirm(`Are you sure you want to promote ${lead.full_name} to Customer status? This will create a permanent client profile.`)) return;

    setConverting(true);
    try {
      const res = await fetch(`/api/leads/${lead.id}/convert`, {
        method: 'POST',
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to promote lead');

      if (data.lead) setLead(data.lead);

      const resAct = await fetch(`/api/activities?lead_id=${lead.id}`).then((r) => r.json());
      if (resAct.activities) setActivities(resAct.activities);

      alert(`🎉 ${lead.full_name} has been promoted to Customer! Registered Customer ID: ${data.customer_id}`);
    } catch (err: any) {
      alert(err.message || 'Promotion to customer failed');
    } finally {
      setConverting(false);
    }
  };

  const handleSaveKundali = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!lead) return;

    try {
      const res = await fetch(`/api/leads/${lead.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(kundaliForm),
      });

      const data = await res.json();
      if (data.lead) {
        setLead(data.lead);
        setShowKundaliModal(false);
      }
    } catch (err) {
      console.error('Failed to update Kundali profile:', err);
    }
  };

  if (loading) {
    return <div className="p-12 text-center text-slate-400">Loading client profile...</div>;
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

      // Synchronize pre-consult reminders (updates existing pending reminders in-place)
      const autoRems = generatePreConsultReminders(lead, isoDate);
      await fetch('/api/reminders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reminders: autoRems }),
      });

      // Refresh reminders
      const resRem = await fetch(`/api/reminders?lead_id=${lead.id}`).then((r) => r.json());
      if (resRem.reminders) setReminders(resRem.reminders);

      const isRescheduled = !!lead.date_of_consultation;
      const resAct = await fetch('/api/activities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lead_id: lead.id,
          activity_type: 'system',
          content: isRescheduled
            ? `Consultation date rescheduled to ${formatDateIN(isoDate)}. 15-day, 5-day, and 1-day reminders updated.`
            : `Consultation date set to ${formatDateIN(isoDate)}. 15-day, 5-day, and 1-day reminders scheduled.`,
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-200 pb-4 gap-3 sm:gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push('/admin/leads')}
            className="p-2 text-slate-500 hover:text-slate-900 bg-white border border-slate-200 rounded-xl transition cursor-pointer shrink-0"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>

          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-lg sm:text-xl font-bold font-serif-heading text-[#1A3C5E]">{lead.full_name}</h1>
              <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full border ${tempInfo?.badgeClass}`}>
                {tempInfo?.icon} {tempInfo?.label}
              </span>
            </div>
            <p className="text-xs text-slate-500">Lead ID: {lead.id} • Created {formatDateIN(lead.created_at)}</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          {lead.is_converted ? (
            <span className="flex-1 sm:flex-none justify-center px-3.5 py-2 bg-emerald-100 text-emerald-800 text-xs font-bold rounded-xl border border-emerald-300 flex items-center gap-1.5">
              <UserCheck className="w-4 h-4 text-emerald-600" /> Converted Customer
            </span>
          ) : (
            <button
              onClick={handlePromoteToCustomer}
              disabled={converting}
              className="flex-1 sm:flex-none justify-center px-3.5 py-2 bg-purple-700 hover:bg-purple-800 text-white text-xs font-bold rounded-xl shadow transition flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-amber-300" /> {converting ? 'Promoting...' : 'Promote'}
            </button>
          )}

          <a
            href={generateWhatsAppLink(lead.phone, `नमस्ते ${lead.full_name} 🙏 Dharmikshree team connecting with you.`)}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 sm:flex-none justify-center px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition shadow flex items-center gap-1.5"
          >
            <MessageSquare className="w-4 h-4" /> WhatsApp
          </a>

          {userRole !== 'team_member' && (
            <button
              onClick={handleAddPayment}
              className="flex-1 sm:flex-none justify-center px-3.5 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-bold rounded-xl shadow transition flex items-center gap-1.5 cursor-pointer"
            >
              <IndianRupee className="w-4 h-4" /> Payment
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

            {/* Vedic Kundali & Profiling Card */}
            <div className="p-3.5 bg-amber-50/80 border border-amber-300 rounded-xl space-y-2 relative">
              <div className="flex items-center justify-between">
                <span className="font-bold text-amber-900 uppercase tracking-wider text-[11px] flex items-center gap-1">
                  <Compass className="w-3.5 h-3.5 text-amber-600" /> Vedic Kundali & Profile
                </span>
                <button
                  type="button"
                  onClick={() => setShowKundaliModal(true)}
                  className="px-2 py-0.5 text-[10px] font-bold bg-amber-200 text-amber-900 rounded-lg hover:bg-amber-300 transition"
                >
                  Edit Profile
                </button>
              </div>

              <div className="space-y-1.5 pt-1 text-slate-800 text-[11px]">
                <div className="flex justify-between border-b border-amber-200/60 pb-1">
                  <span className="text-slate-600">DOB & Time:</span>
                  <span className="font-bold text-slate-900">
                    {lead.date_of_birth ? formatDateIN(lead.date_of_birth) : 'Not set'} {lead.time_of_birth ? `(${lead.time_of_birth})` : ''}
                  </span>
                </div>

                <div className="flex justify-between border-b border-amber-200/60 pb-1">
                  <span className="text-slate-600">Birth Place:</span>
                  <span className="font-semibold text-slate-900">{lead.birth_place || 'Not set'}</span>
                </div>

                <div className="flex justify-between border-b border-amber-200/60 pb-1">
                  <span className="text-slate-600">Relation & Gender:</span>
                  <span className="font-semibold text-slate-900 capitalize">{lead.relation || 'self'} • {lead.gender || 'N/A'}</span>
                </div>

                <div className="flex justify-between border-b border-amber-200/60 pb-1">
                  <span className="text-slate-600">Moon Rashi:</span>
                  <span className="font-bold text-purple-900">{lead.rashi || 'Not specified'}</span>
                </div>

                <div className="flex justify-between border-b border-amber-200/60 pb-1">
                  <span className="text-slate-600">Gotra & Profession:</span>
                  <span className="font-semibold text-slate-900">{lead.gotra || 'N/A'} {lead.occupation ? `(${lead.occupation})` : ''}</span>
                </div>

                {lead.address && (
                  <div className="border-b border-amber-200/60 pb-1">
                    <span className="text-slate-600 block">Address:</span>
                    <span className="font-medium text-slate-900">{lead.address} {lead.pincode ? `- ${lead.pincode}` : ''}</span>
                  </div>
                )}

                {lead.kundali_notes && (
                  <div className="pt-1">
                    <span className="text-amber-900 font-bold block text-[10px]">Kundali Notes:</span>
                    <p className="text-slate-700 italic">{lead.kundali_notes}</p>
                  </div>
                )}
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
              <p className="text-xs text-slate-400 text-center py-6">No chatter activities recorded yet.</p>
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
              <p className="text-xs text-slate-400 py-4">No payment entries recorded yet.</p>
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
              <p className="text-xs text-slate-400 py-4">No reminders scheduled yet.</p>
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

      {/* Kundali & Profiling Edit Modal */}
      {showKundaliModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-2xl w-full border border-amber-200 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-lg font-bold font-serif-heading text-[#1A3C5E] flex items-center gap-2">
                <Compass className="w-5 h-5 text-amber-600" /> Edit Vedic Kundali & Profiling Details
              </h3>
              <button
                type="button"
                onClick={() => setShowKundaliModal(false)}
                className="text-slate-400 hover:text-slate-700 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveKundali} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Date of Birth</label>
                  <input
                    type="date"
                    value={kundaliForm.date_of_birth}
                    onChange={(e) => setKundaliForm({ ...kundaliForm, date_of_birth: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Time of Birth</label>
                  <input
                    type="text"
                    placeholder="e.g. 07:45 AM"
                    value={kundaliForm.time_of_birth}
                    onChange={(e) => setKundaliForm({ ...kundaliForm, time_of_birth: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Place of Birth</label>
                  <input
                    type="text"
                    placeholder="City, State"
                    value={kundaliForm.birth_place}
                    onChange={(e) => setKundaliForm({ ...kundaliForm, birth_place: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Gender</label>
                  <select
                    value={kundaliForm.gender}
                    onChange={(e) => setKundaliForm({ ...kundaliForm, gender: e.target.value as any })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-amber-500"
                  >
                    {GENDER_OPTIONS.map((g) => (
                      <option key={g.key} value={g.key}>{g.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Relation</label>
                  <select
                    value={kundaliForm.relation}
                    onChange={(e) => setKundaliForm({ ...kundaliForm, relation: e.target.value as any })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-amber-500"
                  >
                    {RELATION_OPTIONS.map((r) => (
                      <option key={r.key} value={r.key}>{r.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Marital Status</label>
                  <select
                    value={kundaliForm.marital_status}
                    onChange={(e) => setKundaliForm({ ...kundaliForm, marital_status: e.target.value as any })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-amber-500"
                  >
                    {MARITAL_STATUS_OPTIONS.map((m) => (
                      <option key={m.key} value={m.key}>{m.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Moon Rashi</label>
                  <select
                    value={kundaliForm.rashi}
                    onChange={(e) => setKundaliForm({ ...kundaliForm, rashi: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-amber-500"
                  >
                    <option value="">Select Rashi</option>
                    {RASHI_OPTIONS.map((r) => (
                      <option key={r} value={r}>{r}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Gotra</label>
                  <input
                    type="text"
                    placeholder="Kashyap, Bharadwaj"
                    value={kundaliForm.gotra}
                    onChange={(e) => setKundaliForm({ ...kundaliForm, gotra: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Occupation</label>
                  <input
                    type="text"
                    placeholder="Profession"
                    value={kundaliForm.occupation}
                    onChange={(e) => setKundaliForm({ ...kundaliForm, occupation: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Street Address</label>
                  <input
                    type="text"
                    placeholder="Address"
                    value={kundaliForm.address}
                    onChange={(e) => setKundaliForm({ ...kundaliForm, address: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Pincode</label>
                  <input
                    type="text"
                    placeholder="380001"
                    value={kundaliForm.pincode}
                    onChange={(e) => setKundaliForm({ ...kundaliForm, pincode: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Kundali & Session Notes</label>
                <textarea
                  rows={3}
                  placeholder="Notes on Ascendant (Lagna), planetary positions, planetary periods..."
                  value={kundaliForm.kundali_notes}
                  onChange={(e) => setKundaliForm({ ...kundaliForm, kundali_notes: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-amber-500"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowKundaliModal(false)}
                  className="px-4 py-2 text-slate-600 font-semibold hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-xl shadow transition"
                >
                  Save Kundali Profile
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
