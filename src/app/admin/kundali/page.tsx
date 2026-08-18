'use client';

import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  User,
  Calendar,
  Clock,
  MapPin,
  Globe,
  FileText,
  Download,
  ExternalLink,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  Copy,
  Check,
  Search,
  BookOpen,
} from 'lucide-react';
import { PDF_REPORT_TYPES, PdfReportTypeOption } from '@/constants/astrologyConfig';

export default function AdminKundaliPage() {
  const [leads, setLeads] = useState<any[]>([]);
  const [selectedLeadId, setSelectedLeadId] = useState<string>('');

  const [formData, setFormData] = useState({
    fullName: '',
    gender: 'male',
    day: '20',
    month: '10',
    year: '1995',
    hour: '02',
    minute: '30',
    amPm: 'PM',
    birthPlace: 'Sanosara, Gujarat, India',
    language: 'hi',
    reportType: 'basic_horoscope_pdf', // Basic Selected by default
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);

  const [pdfResult, setPdfResult] = useState<{
    pdfUrl: string;
    dbRecordId?: string;
    name: string;
    reportTypeName: string;
  } | null>(null);

  // Fetch leads for quick selection
  useEffect(() => {
    fetch('/api/leads')
      .then((res) => res.json())
      .then((data) => {
        if (data.leads && Array.isArray(data.leads)) {
          setLeads(data.leads);
        }
      })
      .catch(() => {});
  }, []);

  const handleLeadSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const leadId = e.target.value;
    setSelectedLeadId(leadId);

    if (!leadId) return;

    const lead = leads.find((l) => l.id === leadId);
    if (lead) {
      setFormData((prev) => ({
        ...prev,
        fullName: lead.full_name || prev.fullName,
        birthPlace: lead.city ? `${lead.city}, ${lead.state || 'India'}` : prev.birthPlace,
      }));
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errorMessage) setErrorMessage(null);
  };

  const validateForm = (): boolean => {
    if (!formData.fullName.trim()) {
      setErrorMessage('Please enter the client full name.');
      return false;
    }
    if (!formData.birthPlace.trim()) {
      setErrorMessage('Please enter the birth place & country.');
      return false;
    }
    const d = parseInt(formData.day, 10);
    const m = parseInt(formData.month, 10);
    const y = parseInt(formData.year, 10);
    if (isNaN(d) || d < 1 || d > 31 || isNaN(m) || m < 1 || m > 12 || isNaN(y) || y < 1900 || y > 2100) {
      setErrorMessage('Please select a valid date of birth.');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      let hr = parseInt(formData.hour || '12', 10);
      if (formData.amPm === 'PM' && hr < 12) hr += 12;
      if (formData.amPm === 'AM' && hr === 12) hr = 0;

      const res = await fetch('/api/kundali/generate-pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.fullName.trim(),
          gender: formData.gender,
          day: parseInt(formData.day, 10),
          month: parseInt(formData.month, 10),
          year: parseInt(formData.year, 10),
          hour: hr,
          minute: parseInt(formData.minute, 10),
          place: formData.birthPlace.trim(),
          language: formData.language,
          report_type: formData.reportType,
        }),
      });

      const json = await res.json();

      if (res.ok && json.status === 'success' && json.pdfUrl) {
        const selType = PDF_REPORT_TYPES.find((r) => r.key === formData.reportType);
        setPdfResult({
          pdfUrl: json.pdfUrl,
          dbRecordId: json.dbRecordId,
          name: formData.fullName.trim(),
          reportTypeName: selType ? selType.name : 'Horoscope PDF',
        });
      } else {
        setErrorMessage(json.message || json.error || 'Failed to generate PDF report from Astrology API.');
      }
    } catch (err: any) {
      console.error('CRM PDF Generation error:', err);
      setErrorMessage(err.message || 'Network error while calling Astrology API.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCopyLink = () => {
    if (!pdfResult?.pdfUrl) return;
    navigator.clipboard.writeText(pdfResult.pdfUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleReset = () => {
    setPdfResult(null);
    setErrorMessage(null);
  };

  return (
    <div className="space-y-8 pb-16 max-w-6xl mx-auto">
      {/* Header */}
      <div className="border-b border-slate-200 pb-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-amber-600 font-bold text-xs uppercase tracking-widest mb-1">
            <Sparkles className="w-4 h-4" /> CRM Client PDF Service
          </div>
          <h1 className="text-2xl font-bold font-serif-heading text-[#1A3C5E]">
            Kundali & Horoscope Report Generator
          </h1>
          <p className="text-slate-500 text-xs mt-0.5">
            Generate white-label client PDF reports via AstrologyAPI and track usage in Supabase.
          </p>
        </div>

        {pdfResult && (
          <button
            onClick={handleReset}
            className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl flex items-center gap-2 border border-slate-300 transition"
          >
            <RefreshCw className="w-4 h-4" /> Generate New Report
          </button>
        )}
      </div>

      {/* ERROR ALERT */}
      {errorMessage && (
        <div className="bg-red-50 border border-red-200 p-4 rounded-xl flex items-start gap-3 text-red-800 text-sm shadow-xs">
          <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
          <div className="flex-1 font-medium">{errorMessage}</div>
        </div>
      )}

      {!pdfResult ? (
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Quick Lead Auto-Fill Dropdown */}
          {leads.length > 0 && (
            <div className="bg-amber-500/10 border border-amber-500/30 p-5 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="space-y-0.5">
                <span className="font-bold text-amber-900 text-sm flex items-center gap-1.5">
                  <Search className="w-4 h-4 text-amber-600" /> Select CRM Client / Lead (Optional Auto-fill)
                </span>
                <p className="text-slate-600 text-xs">
                  Pick a lead from your pipeline to pre-fill client name & city details.
                </p>
              </div>

              <select
                value={selectedLeadId}
                onChange={handleLeadSelect}
                className="w-full sm:w-72 p-2.5 bg-white border border-amber-500/40 rounded-xl text-xs font-semibold text-slate-800 outline-none shadow-xs"
              >
                <option value="">-- Choose Existing Client --</option>
                {leads.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.full_name} ({l.city || 'No City'})
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* REPORT TYPE SELECTION CARDS */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <div className="border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-amber-600" /> 1. Select Report Type (PDF Format) *
              </h3>
              <p className="text-xs text-slate-500">
                Basic Horoscope is selected by default. You can choose from 5 AstrologyAPI PDF report formats.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {PDF_REPORT_TYPES.map((type: PdfReportTypeOption) => {
                const isSelected = formData.reportType === type.key;
                return (
                  <div
                    key={type.key}
                    onClick={() => setFormData((prev) => ({ ...prev, reportType: type.key }))}
                    className={`p-4 rounded-xl border-2 transition-all cursor-pointer flex flex-col justify-between space-y-3 ${
                      isSelected
                        ? 'bg-amber-50/70 border-amber-500 shadow-md ring-2 ring-amber-500/20'
                        : 'bg-slate-50/50 border-slate-200 hover:border-slate-300 hover:bg-slate-100/50'
                    }`}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-900 text-sm">{type.name}</span>
                        {isSelected && (
                          <span className="px-2 py-0.5 text-[10px] uppercase font-extrabold bg-amber-500 text-slate-950 rounded-md">
                            Selected
                          </span>
                        )}
                      </div>
                      <p className="text-xs font-semibold text-amber-700">{type.nameHi}</p>
                      <p className="text-[11px] text-slate-500 leading-snug">{type.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* CLIENT BIRTH DETAILS INPUT FORM */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-6">
            <div className="border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                <User className="w-4 h-4 text-amber-600" /> 2. Client Birth Particulars
              </h3>
              <p className="text-xs text-slate-500">
                Enter client birth information for planetary calculations.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
              {/* Full Name */}
              <div className="space-y-1.5">
                <label className="block font-semibold text-slate-700">
                  Client Full Name (पूरा नाम) *
                </label>
                <input
                  type="text"
                  name="fullName"
                  required
                  value={formData.fullName}
                  onChange={handleChange}
                  placeholder="e.g. Binju Jani"
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 outline-none focus:border-amber-500"
                />
              </div>

              {/* Gender */}
              <div className="space-y-1.5">
                <label className="block font-semibold text-slate-700">Gender (लिंग) *</label>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 outline-none focus:border-amber-500"
                >
                  <option value="male">Male (पुरुष) - Default</option>
                  <option value="female">Female (स्त्री)</option>
                </select>
              </div>

              {/* Date of Birth */}
              <div className="space-y-1.5">
                <label className="block font-semibold text-slate-700 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-amber-600" /> Date of Birth (जन्म तिथि) *
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <select
                    name="day"
                    value={formData.day}
                    onChange={handleChange}
                    className="p-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 outline-none"
                  >
                    {Array.from({ length: 31 }, (_, i) => (
                      <option key={i + 1} value={(i + 1).toString()}>
                        {i + 1}
                      </option>
                    ))}
                  </select>
                  <select
                    name="month"
                    value={formData.month}
                    onChange={handleChange}
                    className="p-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 outline-none"
                  >
                    {[
                      '1 (Jan)',
                      '2 (Feb)',
                      '3 (Mar)',
                      '4 (Apr)',
                      '5 (May)',
                      '6 (Jun)',
                      '7 (Jul)',
                      '8 (Aug)',
                      '9 (Sep)',
                      '10 (Oct)',
                      '11 (Nov)',
                      '12 (Dec)',
                    ].map((m, idx) => (
                      <option key={idx + 1} value={(idx + 1).toString()}>
                        {m}
                      </option>
                    ))}
                  </select>
                  <input
                    type="number"
                    name="year"
                    required
                    value={formData.year}
                    onChange={handleChange}
                    placeholder="YYYY"
                    className="p-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 outline-none"
                  />
                </div>
              </div>

              {/* Time of Birth */}
              <div className="space-y-1.5">
                <label className="block font-semibold text-slate-700 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-amber-600" /> Time of Birth (जन्म समय) *
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <select
                    name="hour"
                    value={formData.hour}
                    onChange={handleChange}
                    className="p-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 outline-none"
                  >
                    {Array.from({ length: 12 }, (_, i) => {
                      const h = (i + 1).toString().padStart(2, '0');
                      return (
                        <option key={h} value={h}>
                          {h}
                        </option>
                      );
                    })}
                  </select>
                  <select
                    name="minute"
                    value={formData.minute}
                    onChange={handleChange}
                    className="p-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 outline-none"
                  >
                    {Array.from({ length: 60 }, (_, i) => {
                      const m = i.toString().padStart(2, '0');
                      return (
                        <option key={m} value={m}>
                          {m}
                        </option>
                      );
                    })}
                  </select>
                  <select
                    name="amPm"
                    value={formData.amPm}
                    onChange={handleChange}
                    className="p-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 outline-none"
                  >
                    <option value="AM">AM</option>
                    <option value="PM">PM</option>
                  </select>
                </div>
              </div>

              {/* Birth Place and Country */}
              <div className="space-y-1.5">
                <label className="block font-semibold text-slate-700 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-amber-600" /> Birth Place & Country (जन्म स्थान) *
                </label>
                <input
                  type="text"
                  name="birthPlace"
                  required
                  value={formData.birthPlace}
                  onChange={handleChange}
                  placeholder="e.g. Sanosara, Gujarat, India"
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 outline-none focus:border-amber-500"
                />
              </div>

              {/* Report Language */}
              <div className="space-y-1.5">
                <label className="block font-semibold text-slate-700 flex items-center gap-1">
                  <Globe className="w-3.5 h-3.5 text-amber-600" /> Report Language (रिपोर्ट भाषा) *
                </label>
                <select
                  name="language"
                  value={formData.language}
                  onChange={handleChange}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 outline-none focus:border-amber-500"
                >
                  <option value="hi">Hindi (हिन्दी) - Default</option>
                  <option value="en">English</option>
                </select>
              </div>
            </div>

            {/* Action Submit */}
            <div className="pt-4 border-t border-slate-100 flex justify-end">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full sm:w-auto px-8 py-3.5 bg-[#1A3C5E] hover:bg-[#15304b] text-amber-400 font-bold text-xs rounded-xl shadow-lg transition flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
                    <span>Generating PDF Report...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-amber-400" />
                    <span>Generate Client PDF Report</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      ) : (
        /* RESULT VIEW & EMBEDDED PDF VIEWER */
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-emerald-100 text-emerald-700 rounded-2xl shrink-0">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-lg">
                  {pdfResult.name}&apos;s {pdfResult.reportTypeName} Ready!
                </h3>
                <p className="text-xs text-slate-500">
                  Generated via AstrologyAPI and logged in Supabase.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={handleCopyLink}
                className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl border border-slate-300 transition flex items-center gap-2"
              >
                {copiedLink ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                {copiedLink ? 'Copied!' : 'Copy PDF URL'}
              </button>

              <a
                href={pdfResult.pdfUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl border border-slate-300 transition flex items-center gap-2"
              >
                <ExternalLink className="w-4 h-4" /> Open in New Tab
              </a>

              <a
                href={pdfResult.pdfUrl}
                download={`${pdfResult.name.replace(/\s+/g, '_')}_Kundali.pdf`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 py-2.5 bg-[#1A3C5E] hover:bg-[#15304b] text-amber-400 font-bold text-xs rounded-xl shadow-md transition flex items-center gap-2"
              >
                <Download className="w-4 h-4" /> Download PDF Report
              </a>
            </div>
          </div>

          {/* Embedded Viewer */}
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden h-[850px] shadow-lg">
            <iframe
              src={pdfResult.pdfUrl}
              className="w-full h-full border-none"
              title={`${pdfResult.name} Kundali PDF`}
            />
          </div>
        </div>
      )}
    </div>
  );
}
