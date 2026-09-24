'use client';

import React, { useState, useEffect, useCallback } from 'react';
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
  DollarSign,
  TrendingDown,
  History,
  Zap,
  Eye,
  ShieldCheck,
} from 'lucide-react';
import { PDF_REPORT_TYPES, PdfReportTypeOption } from '@/constants/astrologyConfig';

interface ReportHistoryItem {
  id: string;
  created_at: string;
  report_type: string;
  report_name: string;
  name: string;
  gender: string;
  day: number;
  month: number;
  year: number;
  place: string;
  language: string;
  pdf_url?: string;
  status: string;
  cost: number;
  generation_time_ms: number;
  is_cached: boolean;
}

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
    reportType: 'pro_numerology_report', // Default to Pro Numerology or Basic
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);
  const [useGoogleDocsViewer, setUseGoogleDocsViewer] = useState(false);

  // Result state
  const [pdfResult, setPdfResult] = useState<{
    pdfUrl: string;
    dbRecordId?: string;
    name: string;
    reportTypeName: string;
    pages?: number;
    cost?: number;
    costSaved?: number;
    isCached?: boolean;
    generationTimeMs?: number;
  } | null>(null);

  // History & Stats state
  const [historyList, setHistoryList] = useState<ReportHistoryItem[]>([]);
  const [stats, setStats] = useState({
    totalGenerated: 0,
    newlyGeneratedCount: 0,
    cachedCount: 0,
    totalCost: 0,
    totalSaved: 0,
    avgTimeMs: 0,
  });
  const [loadingHistory, setLoadingHistory] = useState(false);

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

  // Fetch reports history & stats
  const fetchHistory = useCallback(() => {
    setLoadingHistory(true);
    fetch('/api/kundali/history')
      .then((res) => res.json())
      .then((data) => {
        if (data.status === 'success') {
          if (Array.isArray(data.reports)) setHistoryList(data.reports);
          if (data.stats) setStats(data.stats);
        }
      })
      .catch((err) => console.error('Error loading history:', err))
      .finally(() => setLoadingHistory(false));
  }, []);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

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
    if (!formData.fullName.trim() || formData.fullName.trim().length < 2) {
      setErrorMessage('Please enter the client full name (at least 2 letters).');
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
    if (isSubmitting) return; // Prevent multiple calls

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
          pages: json.payload?.pages || selType?.pages || 15,
          cost: json.cost,
          costSaved: json.costSaved,
          isCached: json.isCached,
          generationTimeMs: json.generationTimeMs,
        });

        // Refresh history to reflect newly generated or cached report
        fetchHistory();
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

  const selectedReportInfo = PDF_REPORT_TYPES.find((r) => r.key === formData.reportType) || PDF_REPORT_TYPES[0];

  return (
    <div className="space-y-6 sm:space-y-8 pb-16 max-w-6xl mx-auto w-full">
      {/* Header */}
      <div className="border-b border-slate-200 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-amber-600 font-bold text-xs uppercase tracking-widest mb-1">
            <Sparkles className="w-4 h-4 shrink-0" /> DharmikShree Client PDF Engine
          </div>
          <h1 className="text-xl sm:text-2xl font-bold font-serif-heading text-[#1A3C5E]">
            Horoscope & Pro Numerology Report Generator
          </h1>
          <p className="text-slate-500 text-xs mt-0.5">
            Generate white-label client PDF reports with smart deduplication cache to save real API money.
          </p>
        </div>

        {pdfResult && (
          <button
            onClick={handleReset}
            className="w-full sm:w-auto px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl flex items-center justify-center gap-2 border border-slate-300 transition cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" /> Generate Another Report
          </button>
        )}
      </div>

      {/* STATS ANALYTICS BAR: SAVINGS & TIME TRACKING */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white p-3.5 sm:p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs mb-1">
            <span>Reports Generated</span>
            <FileText className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-xl sm:text-2xl font-extrabold text-slate-900">
            {stats.totalGenerated}
          </div>
          <p className="text-[11px] text-slate-400 mt-0.5">All-time client reports</p>
        </div>

        <div className="bg-white p-3.5 sm:p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs mb-1">
            <span>API Cost Spent</span>
            <DollarSign className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-xl sm:text-2xl font-extrabold text-amber-700">
            ₹{stats.totalCost.toFixed(2)}
          </div>
          <p className="text-[11px] text-slate-400 mt-0.5">{stats.newlyGeneratedCount} fresh API hits</p>
        </div>

        <div className="bg-emerald-50/70 p-3.5 sm:p-4 rounded-xl border border-emerald-200 shadow-xs">
          <div className="flex items-center justify-between text-emerald-700 text-xs font-semibold mb-1">
            <span>Cost Saved by Cache</span>
            <TrendingDown className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-xl sm:text-2xl font-extrabold text-emerald-700">
            ₹{stats.totalSaved.toFixed(2)}
          </div>
          <p className="text-[11px] text-emerald-600 mt-0.5">
            {stats.cachedCount} duplicate requests prevented
          </p>
        </div>

        <div className="bg-white p-3.5 sm:p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs mb-1">
            <span>Avg Response Time</span>
            <Clock className="w-4 h-4 text-purple-500" />
          </div>
          <div className="text-xl sm:text-2xl font-extrabold text-slate-900">
            {stats.avgTimeMs > 0 ? `${(stats.avgTimeMs / 1000).toFixed(1)}s` : 'Instant'}
          </div>
          <p className="text-[11px] text-slate-400 mt-0.5">Includes 98-page reports</p>
        </div>
      </div>

      {/* ERROR ALERT */}
      {errorMessage && (
        <div className="bg-red-50 border border-red-200 p-3.5 sm:p-4 rounded-xl flex items-start gap-3 text-red-800 text-xs sm:text-sm shadow-xs">
          <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
          <div className="flex-1 font-medium">{errorMessage}</div>
        </div>
      )}

      {!pdfResult ? (
        <form onSubmit={handleSubmit} className="space-y-6 sm:space-y-8">
          {/* Quick Lead Auto-Fill Dropdown */}
          {leads.length > 0 && (
            <div className="bg-amber-500/10 border border-amber-500/30 p-4 sm:p-5 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="space-y-0.5">
                <span className="font-bold text-amber-900 text-xs sm:text-sm flex items-center gap-1.5">
                  <Search className="w-4 h-4 text-amber-600 shrink-0" /> Select CRM Client / Lead (Auto-fill)
                </span>
                <p className="text-slate-600 text-[11px] sm:text-xs">
                  Pick a lead from your pipeline to pre-fill client name & city details.
                </p>
              </div>

              <select
                value={selectedLeadId}
                onChange={handleLeadSelect}
                className="w-full sm:w-72 p-2.5 bg-white border border-amber-500/40 rounded-xl text-xs font-semibold text-slate-800 outline-none shadow-xs cursor-pointer"
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
          <div className="bg-white p-4 sm:p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-900 text-sm sm:text-base flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-amber-600 shrink-0" /> 1. Select Report Type (PDF Format) *
                </h3>
                <p className="text-xs text-slate-500">
                  Select between Kundali, Match Making, or the comprehensive 98-Page Pro Numerology report.
                </p>
              </div>
              <div className="hidden sm:flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                <ShieldCheck className="w-3.5 h-3.5" /> Smart Deduplication Active
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              {PDF_REPORT_TYPES.map((type: PdfReportTypeOption) => {
                const isSelected = formData.reportType === type.key;
                return (
                  <div
                    key={type.key}
                    onClick={() => setFormData((prev) => ({ ...prev, reportType: type.key }))}
                    className={`p-3.5 sm:p-4 rounded-xl border-2 transition-all cursor-pointer flex flex-col justify-between space-y-2.5 ${
                      isSelected
                        ? 'bg-amber-50/70 border-amber-500 shadow-md ring-2 ring-amber-500/20'
                        : 'bg-slate-50/50 border-slate-200 hover:border-slate-300 hover:bg-slate-100/50'
                    }`}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-bold text-slate-900 text-xs sm:text-sm">{type.name}</span>
                        {isSelected && (
                          <span className="px-2 py-0.5 text-[9px] sm:text-[10px] uppercase font-extrabold bg-amber-500 text-slate-950 rounded-md shrink-0">
                            Selected
                          </span>
                        )}
                      </div>
                      <p className="text-xs font-semibold text-amber-700">{type.nameHi}</p>
                      <p className="text-[11px] text-slate-500 leading-snug">{type.description}</p>
                    </div>

                    <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between text-[11px]">
                      <span className="text-slate-600 font-semibold">{type.pages} Pages</span>
                      <span className="text-amber-800 font-bold bg-amber-100/80 px-2 py-0.5 rounded">
                        Est: ₹{type.cost}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* CLIENT BIRTH DETAILS INPUT FORM */}
          <div className="bg-white p-4 sm:p-6 rounded-2xl border border-slate-200 shadow-xs space-y-5 sm:space-y-6">
            <div className="border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-sm sm:text-base flex items-center gap-2">
                <User className="w-4 h-4 text-amber-600 shrink-0" /> 2. Client Particulars & Birth Information
              </h3>
              <p className="text-xs text-slate-500">
                Data used for Numerology / Astrological calculations. If already generated, existing PDF will be returned to save costs.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 text-xs">
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
                  className="w-full p-2.5 sm:p-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 outline-none focus:border-amber-500 text-xs sm:text-sm"
                />
              </div>

              {/* Gender */}
              <div className="space-y-1.5">
                <label className="block font-semibold text-slate-700">Gender (लिंग) *</label>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  className="w-full p-2.5 sm:p-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 outline-none focus:border-amber-500 text-xs sm:text-sm cursor-pointer"
                >
                  <option value="male">Male (पुरुष) - Default</option>
                  <option value="female">Female (स्त्री)</option>
                </select>
              </div>

              {/* Date of Birth */}
              <div className="space-y-1.5">
                <label className="block font-semibold text-slate-700 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-amber-600 shrink-0" /> Date of Birth (जन्म तिथि) *
                </label>
                <div className="grid grid-cols-3 gap-1.5 sm:gap-2">
                  <select
                    name="day"
                    value={formData.day}
                    onChange={handleChange}
                    className="p-2.5 sm:p-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 outline-none text-xs sm:text-sm cursor-pointer"
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
                    className="p-2.5 sm:p-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 outline-none text-xs sm:text-sm cursor-pointer"
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
                    className="p-2.5 sm:p-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 outline-none text-xs sm:text-sm"
                  />
                </div>
              </div>

              {/* Time of Birth */}
              <div className="space-y-1.5">
                <label className="block font-semibold text-slate-700 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-amber-600 shrink-0" /> Time of Birth (जन्म समय) *
                </label>
                <div className="grid grid-cols-3 gap-1.5 sm:gap-2">
                  <select
                    name="hour"
                    value={formData.hour}
                    onChange={handleChange}
                    className="p-2.5 sm:p-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 outline-none text-xs sm:text-sm cursor-pointer"
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
                    className="p-2.5 sm:p-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 outline-none text-xs sm:text-sm cursor-pointer"
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
                    className="p-2.5 sm:p-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 outline-none text-xs sm:text-sm cursor-pointer"
                  >
                    <option value="AM">AM</option>
                    <option value="PM">PM</option>
                  </select>
                </div>
              </div>

              {/* Birth Place and Country */}
              <div className="space-y-1.5">
                <label className="block font-semibold text-slate-700 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-amber-600 shrink-0" /> Birth Place & Country (जन्म स्थान) *
                </label>
                <input
                  type="text"
                  name="birthPlace"
                  required
                  value={formData.birthPlace}
                  onChange={handleChange}
                  className="w-full p-2.5 sm:p-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 outline-none focus:border-amber-500 text-xs sm:text-sm"
                />
              </div>

              {/* Report Language */}
              <div className="space-y-1.5">
                <label className="block font-semibold text-slate-700 flex items-center gap-1">
                  <Globe className="w-3.5 h-3.5 text-amber-600 shrink-0" /> Report Language (रिपोर्ट भाषा) *
                </label>
                <select
                  name="language"
                  value={formData.language}
                  onChange={handleChange}
                  className="w-full p-2.5 sm:p-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 outline-none focus:border-amber-500 text-xs sm:text-sm cursor-pointer"
                >
                  <option value="hi">Hindi (हिन्दी) - Default</option>
                  <option value="en">English</option>
                </select>
              </div>
            </div>

            {/* Action Submit */}
            <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="text-xs text-slate-500 flex items-center gap-1.5">
                <Zap className="w-4 h-4 text-amber-500 shrink-0" />
                <span>
                  Estimated API Cost: <strong>₹{selectedReportInfo.cost}</strong> ({selectedReportInfo.pages} Pages)
                </span>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full sm:w-auto px-8 py-3.5 bg-[#1A3C5E] hover:bg-[#15304b] text-amber-400 font-bold text-xs sm:text-sm rounded-xl shadow-lg transition flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
                    <span>
                      {formData.reportType === 'pro_numerology_report'
                        ? 'Generating 98-Page Numerology Report (please wait ~20-30s)...'
                        : 'Generating PDF Report...'}
                    </span>
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
          {/* CACHE HIT SAVINGS NOTIFICATION */}
          {pdfResult.isCached && (
            <div className="bg-emerald-50 border border-emerald-300 p-4 rounded-2xl flex items-center justify-between gap-3 text-emerald-900 shadow-sm">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-emerald-500 text-white rounded-xl">
                  <Zap className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-extrabold text-sm sm:text-base">
                    Instant Cache Hit - Zero Additional Cost!
                  </h4>
                  <p className="text-xs text-emerald-700">
                    This exact report was already generated previously. Delivered instantly from storage to save you{' '}
                    <strong>₹{pdfResult.costSaved || 50}</strong> in API costs!
                  </p>
                </div>
              </div>
              <span className="hidden sm:inline-block px-3 py-1 bg-emerald-200 text-emerald-800 rounded-full font-bold text-xs">
                Saved ₹{pdfResult.costSaved || 50}
              </span>
            </div>
          )}

          <div className="bg-white p-4 sm:p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-emerald-100 text-emerald-700 rounded-2xl shrink-0">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-base sm:text-lg">
                  {pdfResult.name}&apos;s {pdfResult.reportTypeName} Ready!
                </h3>
                <p className="text-xs text-slate-500">
                  {pdfResult.pages ? `${pdfResult.pages} pages • ` : ''}
                  {pdfResult.generationTimeMs && pdfResult.generationTimeMs > 0
                    ? `Generated in ${(pdfResult.generationTimeMs / 1000).toFixed(1)}s`
                    : 'Delivered from cache'}
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row sm:flex-wrap items-stretch sm:items-center gap-2 sm:gap-3 w-full sm:w-auto">
              <button
                onClick={handleCopyLink}
                className="w-full sm:w-auto px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl border border-slate-300 transition flex items-center justify-center gap-2 cursor-pointer"
              >
                {copiedLink ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                {copiedLink ? 'Copied!' : 'Copy PDF URL'}
              </button>

              <button
                onClick={() => setUseGoogleDocsViewer((prev) => !prev)}
                className="w-full sm:w-auto px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl border border-slate-300 transition flex items-center justify-center gap-2 cursor-pointer"
                title="Toggle Google Docs viewer if native PDF viewer is blocked by browser"
              >
                <Eye className="w-4 h-4" />
                {useGoogleDocsViewer ? 'Native Viewer' : 'Alternative Viewer'}
              </button>

              <a
                href={pdfResult.pdfUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl border border-slate-300 transition flex items-center justify-center gap-2"
              >
                <ExternalLink className="w-4 h-4" /> Open in New Tab
              </a>

              <a
                href={pdfResult.pdfUrl}
                download={`${pdfResult.name.replace(/\s+/g, '_')}_Report.pdf`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto px-6 py-2.5 bg-[#1A3C5E] hover:bg-[#15304b] text-amber-400 font-bold text-xs rounded-xl shadow-md transition flex items-center justify-center gap-2"
              >
                <Download className="w-4 h-4" /> Download PDF Report
              </a>
            </div>
          </div>

          {/* Embedded Viewer (Supports Native Object Embed and Google Docs Viewer fallback) */}
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden h-[600px] sm:h-[750px] lg:h-[900px] shadow-lg relative">
            {useGoogleDocsViewer ? (
              <iframe
                src={`https://docs.google.com/viewer?url=${encodeURIComponent(pdfResult.pdfUrl)}&embedded=true`}
                className="w-full h-full border-none"
                title={`${pdfResult.name} PDF Preview (Google Docs)`}
              />
            ) : (
              <object
                data={pdfResult.pdfUrl}
                type="application/pdf"
                className="w-full h-full border-none"
              >
                {/* Fallback iframe inside object tag */}
                <iframe
                  src={pdfResult.pdfUrl}
                  className="w-full h-full border-none"
                  title={`${pdfResult.name} PDF Preview`}
                >
                  <div className="p-6 text-center text-sm text-slate-600">
                    <p>Your browser could not preview this PDF directly.</p>
                    <a
                      href={pdfResult.pdfUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-3 inline-block px-4 py-2 bg-[#1A3C5E] text-amber-400 font-bold rounded-lg"
                    >
                      Open PDF in New Window
                    </a>
                  </div>
                </iframe>
              </object>
            )}
          </div>
        </div>
      )}

      {/* PAST REPORTS & GENERATION HISTORY TABLE */}
      <div className="bg-white p-4 sm:p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <History className="w-5 h-5 text-amber-600" />
            <div>
              <h3 className="font-bold text-slate-900 text-sm sm:text-base">
                Report Generation History & Cost Log
              </h3>
              <p className="text-xs text-slate-500">
                Track all generated PDFs, generation timestamps, and view past client reports for free.
              </p>
            </div>
          </div>
          <button
            onClick={fetchHistory}
            disabled={loadingHistory}
            className="p-2 hover:bg-slate-100 rounded-lg text-slate-500 transition cursor-pointer"
            title="Refresh history"
          >
            <RefreshCw className={`w-4 h-4 ${loadingHistory ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {historyList.length === 0 ? (
          <div className="p-8 text-center text-slate-400 text-xs">
            No reports generated yet. Generate your first Kundali or Pro Numerology PDF report above.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200">
                <tr>
                  <th className="p-3">Client Name</th>
                  <th className="p-3">Report Format</th>
                  <th className="p-3">Date & Time</th>
                  <th className="p-3">API Cost</th>
                  <th className="p-3">Source</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {historyList.map((item) => {
                  const dateStr = item.created_at
                    ? new Date(item.created_at).toLocaleString('en-IN', {
                        dateStyle: 'medium',
                        timeStyle: 'short',
                      })
                    : 'N/A';

                  return (
                    <tr key={item.id} className="hover:bg-slate-50/70 transition">
                      <td className="p-3 font-bold text-slate-900">
                        {item.name}
                        <div className="text-[11px] font-normal text-slate-400">{item.place}</div>
                      </td>

                      <td className="p-3">
                        <span className="font-semibold text-slate-700">
                          {item.report_name || item.report_type}
                        </span>
                        <div className="text-[10px] text-slate-400 uppercase">
                          Lang: {item.language}
                        </div>
                      </td>

                      <td className="p-3 text-slate-500">{dateStr}</td>

                      <td className="p-3 font-semibold text-slate-900">
                        {item.is_cached ? (
                          <span className="text-emerald-600 flex items-center gap-1 font-bold">
                            ₹0.00 <span className="text-[10px] text-slate-400 font-normal">(Saved)</span>
                          </span>
                        ) : (
                          <span>₹{(item.cost || 0).toFixed(2)}</span>
                        )}
                        {item.generation_time_ms > 0 && (
                          <div className="text-[10px] text-slate-400">
                            {(item.generation_time_ms / 1000).toFixed(1)}s
                          </div>
                        )}
                      </td>

                      <td className="p-3">
                        {item.is_cached ? (
                          <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-md text-[10px] font-bold">
                            Cache Hit
                          </span>
                        ) : item.status === 'completed' ? (
                          <span className="px-2 py-0.5 bg-blue-100 text-blue-800 rounded-md text-[10px] font-bold">
                            Live API
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 bg-red-100 text-red-800 rounded-md text-[10px] font-bold">
                            Failed
                          </span>
                        )}
                      </td>

                      <td className="p-3 text-right">
                        {item.pdf_url ? (
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => {
                                setPdfResult({
                                  pdfUrl: item.pdf_url!,
                                  name: item.name,
                                  reportTypeName: item.report_name || 'Report PDF',
                                  isCached: true,
                                });
                                window.scrollTo({ top: 0, behavior: 'smooth' });
                              }}
                              className="px-2.5 py-1.5 bg-[#1A3C5E] hover:bg-[#15304b] text-amber-400 font-bold rounded-lg text-[11px] transition cursor-pointer"
                            >
                              View PDF
                            </button>
                            <a
                              href={item.pdf_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition"
                              title="Open in new tab"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                            </a>
                          </div>
                        ) : (
                          <span className="text-slate-400 text-[11px]">No PDF</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
