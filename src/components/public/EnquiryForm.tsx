'use client';

import React, { useState } from 'react';
import { SERVICE_OPTIONS, LEAD_SOURCES, BUSINESS_INFO } from '@/lib/constants';
import { formatPhoneIN, getCleanPhoneForWhatsApp } from '@/lib/formatters';
import { generateWhatsAppLink } from '@/lib/whatsapp';
import { Sparkles, CheckCircle2, Send, PhoneCall, ShieldCheck, HelpCircle } from 'lucide-react';

interface EnquiryFormProps {
  isEmbedded?: boolean;
}

export function EnquiryForm({ isEmbedded = false }: EnquiryFormProps) {
  const [formData, setFormData] = useState({
    full_name: '',
    phone: '',
    email: '',
    city: '',
    service_interest: 'divine_consultation',
    consultation_mode: 'online',
    message: '',
    lead_source: 'website',
    honeypot: '', // Spam protection
  });

  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [whatsAppLink, setWhatsAppLink] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    // Honeypot bot check
    if (formData.honeypot) {
      setSubmitted(true);
      return;
    }

    if (!formData.full_name.trim()) {
      setErrorMsg('Please enter your full name');
      return;
    }

    const cleanPhone = formData.phone.replace(/\D/g, '');
    if (cleanPhone.length < 10) {
      setErrorMsg('Please enter a valid 10-digit WhatsApp number');
      return;
    }

    if (!formData.city.trim()) {
      setErrorMsg('Please enter your city');
      return;
    }

    setLoading(true);

    try {
      // Post to API route
      const res = await fetch('/api/leads/public-enquiry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          phone: cleanPhone.length === 10 ? `+91${cleanPhone}` : `+${cleanPhone}`,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to submit enquiry');
      }

      // Generate instant WhatsApp confirmation message
      const ackMessage = `नमस्ते ${formData.full_name} 🙏 Thank you for reaching out to Dharmikshree for ${SERVICE_OPTIONS.find(s => s.key === formData.service_interest)?.label}. Our team will contact you within 24 hours.`;
      const waUrl = generateWhatsAppLink(formData.phone, ackMessage);
      setWhatsAppLink(waUrl);

      setSubmitted(true);
    } catch (err: any) {
      setErrorMsg(err.message || 'Something went wrong. Please try again or WhatsApp us directly.');
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="bg-white rounded-2xl p-8 sm:p-12 shadow-xl border border-amber-200 text-center max-w-xl mx-auto space-y-6">
        <div className="w-16 h-16 bg-amber-100 text-amber-800 rounded-full flex items-center justify-center mx-auto shadow-inner">
          <Sparkles className="w-8 h-8 text-amber-600 animate-pulse" />
        </div>

        <div className="space-y-2">
          <h2 className="text-2xl sm:text-3xl font-bold font-serif-heading text-[#1A3C5E]">
            नमस्ते {formData.full_name} 🙏
          </h2>
          <p className="text-slate-600 text-base leading-relaxed">
            We have received your enquiry for <strong className="text-amber-800">{SERVICE_OPTIONS.find(s => s.key === formData.service_interest)?.label}</strong>.
          </p>
        </div>

        <div className="bg-amber-50/80 border border-amber-200 rounded-xl p-4 text-amber-900 text-sm text-left font-serif space-y-1">
          <p className="font-semibold text-center text-amber-950">॥ शुभम करोतु कल्याणम ॥</p>
          <p className="text-center text-xs text-amber-800">Our consultation team will review your details and reach out within 24 hours.</p>
        </div>

        {whatsAppLink && (
          <div className="pt-2">
            <a
              href={whatsAppLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 w-full py-3.5 px-6 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-xl shadow-md transition-all hover:scale-[1.01]"
            >
              <CheckCircle2 className="w-5 h-5" />
              Open Confirmation on WhatsApp
            </a>
          </div>
        )}

        <button
          onClick={() => {
            setSubmitted(false);
            setFormData({
              full_name: '',
              phone: '',
              email: '',
              city: '',
              service_interest: 'divine_consultation',
              consultation_mode: 'online',
              message: '',
              lead_source: 'website',
              honeypot: '',
            });
          }}
          className="text-xs text-slate-400 hover:text-slate-600 underline"
        >
          Submit another enquiry
        </button>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-2xl ${isEmbedded ? 'p-4 sm:p-6 shadow-md' : 'p-6 sm:p-10 shadow-xl'} border border-slate-200 max-w-2xl mx-auto`}>
      {/* Header */}
      {!isEmbedded && (
        <div className="text-center space-y-3 mb-8 border-b border-amber-100 pb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-50 text-amber-800 border border-amber-200 rounded-full text-xs font-semibold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            13th Generation Vedic Wisdom
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold font-serif-heading text-[#1A3C5E]">
            Book Your Divine Guidance
          </h1>
          <p className="text-slate-600 text-sm max-w-md mx-auto">
            Fill in your details below for personalized Kundali, Vastu, or Life Mentorship with Dharmikshree.
          </p>
        </div>
      )}

      {errorMsg && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl flex items-center gap-2">
          <HelpCircle className="w-4 h-4 shrink-0 text-red-500" />
          <span>{errorMsg}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Honeypot field hidden from users */}
        <input
          type="text"
          name="honeypot"
          value={formData.honeypot}
          onChange={(e) => setFormData({ ...formData, honeypot: e.target.value })}
          className="hidden"
          tabIndex={-1}
          autoComplete="off"
        />

        {/* Full Name */}
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
            Full Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            required
            placeholder="e.g. Rajesh Sharma"
            value={formData.full_name}
            onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 text-slate-900 placeholder:text-slate-400 outline-none transition"
          />
        </div>

        {/* Phone & City Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* WhatsApp Number */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              WhatsApp Number <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-3.5 text-sm font-semibold text-slate-500">+91</span>
              <input
                type="tel"
                required
                placeholder="98765 43210"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 text-slate-900 placeholder:text-slate-400 outline-none transition"
              />
            </div>
            <p className="text-[11px] text-slate-400 mt-1">We will send slot details to this WhatsApp number.</p>
          </div>

          {/* City */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              City / Location <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Mumbai, London, Dubai"
              value={formData.city}
              onChange={(e) => setFormData({ ...formData, city: e.target.value })}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 text-slate-900 placeholder:text-slate-400 outline-none transition"
            />
          </div>
        </div>

        {/* Email */}
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
            Email Address <span className="text-slate-400 font-normal">(Optional)</span>
          </label>
          <input
            type="email"
            placeholder="e.g. rajesh@example.com"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 text-slate-900 placeholder:text-slate-400 outline-none transition"
          />
        </div>

        {/* Service of Interest */}
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
            Service Required <span className="text-red-500">*</span>
          </label>
          <select
            value={formData.service_interest}
            onChange={(e) => setFormData({ ...formData, service_interest: e.target.value as any })}
            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 text-slate-900 bg-white outline-none transition"
          >
            {SERVICE_OPTIONS.map((srv) => (
              <option key={srv.key} value={srv.key}>
                {srv.label} {srv.price > 0 ? `(Dakshina: ₹${srv.price.toLocaleString('en-IN')})` : ''}
              </option>
            ))}
          </select>
        </div>

        {/* Preferred Consultation Mode */}
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
            Preferred Consultation Mode
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setFormData({ ...formData, consultation_mode: 'online' })}
              className={`py-2.5 px-4 rounded-xl border text-sm font-medium transition ${
                formData.consultation_mode === 'online'
                  ? 'border-amber-500 bg-amber-50 text-amber-900 shadow-sm'
                  : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100'
              }`}
            >
              💻 Online (Zoom / Google Meet)
            </button>

            <button
              type="button"
              onClick={() => setFormData({ ...formData, consultation_mode: 'offline' })}
              className={`py-2.5 px-4 rounded-xl border text-sm font-medium transition ${
                formData.consultation_mode === 'offline'
                  ? 'border-amber-500 bg-amber-50 text-amber-900 shadow-sm'
                  : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100'
              }`}
            >
              🏛️ Offline (In-Person Office)
            </button>
          </div>
        </div>

        {/* Lead Source */}
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
            How did you find Dharmikshree?
          </label>
          <select
            value={formData.lead_source}
            onChange={(e) => setFormData({ ...formData, lead_source: e.target.value as any })}
            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 text-slate-900 bg-white outline-none transition"
          >
            {LEAD_SOURCES.map((src) => (
              <option key={src.key} value={src.key}>
                {src.label}
              </option>
            ))}
          </select>
        </div>

        {/* Message */}
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
            Short Note / Concern <span className="text-slate-400 font-normal">(Max 300 chars)</span>
          </label>
          <textarea
            rows={3}
            maxLength={300}
            placeholder="Briefly state your concern or birth chart questions..."
            value={formData.message}
            onChange={(e) => setFormData({ ...formData, message: e.target.value })}
            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 text-slate-900 placeholder:text-slate-400 outline-none transition resize-none"
          />
        </div>

        {/* Privacy Note & Submit Button */}
        <div className="pt-2 space-y-4">
          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 px-6 bg-[#1A3C5E] hover:bg-[#15304b] text-white font-bold text-base rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 group disabled:opacity-70"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <Send className="w-4 h-4 text-amber-400 group-hover:translate-x-1 transition-transform" />
                Submit Enquiry to Dharmikshree
              </>
            )}
          </button>

          <p className="text-[11px] text-center text-slate-500 flex items-center justify-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-amber-600" />
            Strictly Confidential. Your data is protected by Dharmikshree privacy guidelines.
          </p>
        </div>
      </form>
    </div>
  );
}
