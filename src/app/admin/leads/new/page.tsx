'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save, Sparkles, Phone, User, Calendar, MapPin, Tag } from 'lucide-react';
import { SERVICE_OPTIONS, LEAD_SOURCES, LEAD_TEMPERATURES, PIPELINE_STAGES } from '@/lib/constants';
import { generatePreConsultReminders } from '@/lib/reminders';

export default function CreateLeadPage() {
  const router = useRouter();

  const [formData, setFormData] = useState({
    full_name: '',
    phone: '',
    whatsapp: '',
    email: '',
    city: '',
    state: '',
    country: 'India',
    lead_source: 'website',
    lead_temperature: 'warm',
    service_interest: 'divine_consultation',
    consultation_mode: 'online',
    stage: 'new_lead',
    assigned_to: '',
    date_of_consultation: '',
    full_amount: 9900,
    amount_paid: 0,
    internal_notes: '',
    tags: 'VIP',
  });

  const [teamMembers, setTeamMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [autoSavedTime, setAutoSavedTime] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/team')
      .then((res) => res.json())
      .then((data) => {
        if (data.team) setTeamMembers(data.team);
      });
  }, []);

  // Auto-save draft every 30 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      if (formData.full_name) {
        localStorage.setItem('dharmik_lead_draft', JSON.stringify(formData));
        setAutoSavedTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
      }
    }, 30000);
    return () => clearInterval(timer);
  }, [formData]);

  const handleServiceChange = (serviceKey: string) => {
    const srv = SERVICE_OPTIONS.find((s) => s.key === serviceKey);
    setFormData((prev) => ({
      ...prev,
      service_interest: serviceKey as any,
      full_amount: srv ? srv.price : prev.full_amount,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const cleanPhone = formData.phone.startsWith('+91') ? formData.phone : `+91 ${formData.phone.replace(/\D/g, '')}`;

    try {
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          phone: cleanPhone,
          whatsapp: formData.whatsapp ? (formData.whatsapp.startsWith('+91') ? formData.whatsapp : `+91 ${formData.whatsapp.replace(/\D/g, '')}`) : cleanPhone,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create lead');

      const createdLead = data.lead;

      // If consultation date set, generate auto reminders
      if (formData.date_of_consultation && createdLead) {
        const autoRems = generatePreConsultReminders(createdLead, new Date(formData.date_of_consultation).toISOString());
        await fetch('/api/reminders', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ reminders: autoRems }),
        });
      }

      localStorage.removeItem('dharmik_lead_draft');
      router.push(`/admin/leads/${createdLead.id}`);
    } catch (err: any) {
      alert(err.message || 'Error creating lead in Supabase');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 transition"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Leads
        </button>

        {autoSavedTime && (
          <span className="text-[11px] text-slate-400 font-medium">
            Draft auto-saved at {autoSavedTime}
          </span>
        )}
      </div>

      <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200 shadow-xl space-y-8">
        <div className="border-b border-amber-100 pb-4">
          <h1 className="text-2xl font-bold font-serif-heading text-[#1A3C5E]">
            Create New Client Lead Record
          </h1>
          <p className="text-xs text-slate-500">
            Enter all details for Vedic Kundali consultation, Vastu visit, or mentorship inquiry.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Section 1: Basic Info */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-amber-800 flex items-center gap-1.5">
              <User className="w-4 h-4 text-amber-600" /> Basic Contact Information
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ananya Roy"
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:border-amber-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  WhatsApp / Phone Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  required
                  placeholder="+91 98765 43210"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:border-amber-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address</label>
                <input
                  type="email"
                  placeholder="ananya@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:border-amber-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  City / State <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Kolkata, West Bengal"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:border-amber-500 outline-none"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Service & Pipeline */}
          <div className="space-y-4 pt-4 border-t border-slate-100">
            <h3 className="text-xs font-bold uppercase tracking-wider text-amber-800 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-amber-600" /> Service & Pipeline Stage
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Service Interest</label>
                <select
                  value={formData.service_interest}
                  onChange={(e) => handleServiceChange(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:border-amber-500 outline-none bg-white"
                >
                  {SERVICE_OPTIONS.map((s) => (
                    <option key={s.key} value={s.key}>
                      {s.label} (₹{s.price.toLocaleString('en-IN')})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Lead Temperature</label>
                <select
                  value={formData.lead_temperature}
                  onChange={(e) => setFormData({ ...formData, lead_temperature: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:border-amber-500 outline-none bg-white"
                >
                  {LEAD_TEMPERATURES.map((t) => (
                    <option key={t.key} value={t.key}>
                      {t.icon} {t.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Pipeline Stage</label>
                <select
                  value={formData.stage}
                  onChange={(e) => setFormData({ ...formData, stage: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:border-amber-500 outline-none bg-white"
                >
                  {PIPELINE_STAGES.map((s) => (
                    <option key={s.key} value={s.key}>
                      {s.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Consultation Date & Time</label>
                <input
                  type="datetime-local"
                  value={formData.date_of_consultation}
                  onChange={(e) => setFormData({ ...formData, date_of_consultation: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:border-amber-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Assigned Team Member</label>
                <select
                  value={formData.assigned_to}
                  onChange={(e) => setFormData({ ...formData, assigned_to: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:border-amber-500 outline-none bg-white"
                >
                  <option value="">Unassigned</option>
                  {teamMembers.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.full_name} ({u.role.replace('_', ' ')})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Lead Source</label>
                <select
                  value={formData.lead_source}
                  onChange={(e) => setFormData({ ...formData, lead_source: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:border-amber-500 outline-none bg-white"
                >
                  {LEAD_SOURCES.map((src) => (
                    <option key={src.key} value={src.key}>
                      {src.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Section 3: Financial Details */}
          <div className="space-y-4 pt-4 border-t border-slate-100">
            <h3 className="text-xs font-bold uppercase tracking-wider text-amber-800 flex items-center gap-1.5">
              Financial Dakshina Amount
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Total Full Fee (₹)</label>
                <input
                  type="number"
                  value={formData.full_amount}
                  onChange={(e) => setFormData({ ...formData, full_amount: Number(e.target.value) })}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:border-amber-500 outline-none font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Amount Paid So Far (₹)</label>
                <input
                  type="number"
                  value={formData.amount_paid}
                  onChange={(e) => setFormData({ ...formData, amount_paid: Number(e.target.value) })}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:border-amber-500 outline-none font-bold text-emerald-700"
                />
              </div>
            </div>
          </div>

          {/* Notes & Tags */}
          <div className="space-y-4 pt-4 border-t border-slate-100">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Internal Notes</label>
              <textarea
                rows={3}
                placeholder="Add chart details, birth time notes, or specific concerns..."
                value={formData.internal_notes}
                onChange={(e) => setFormData({ ...formData, internal_notes: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:border-amber-500 outline-none"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-4 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-5 py-3 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 bg-[#1A3C5E] hover:bg-[#15304b] text-amber-400 font-bold text-xs rounded-xl shadow-lg transition flex items-center gap-2 disabled:opacity-50"
            >
              <Save className="w-4 h-4" /> {loading ? 'Saving Lead Profile...' : 'Save Lead Profile'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
