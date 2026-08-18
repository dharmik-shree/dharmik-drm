'use client';

import React, { useState, useEffect } from 'react';
import { Settings, Save, Plus, Edit2, CheckCircle2, Sparkles, Building, Globe, Image, FileText } from 'lucide-react';
import { SERVICE_OPTIONS, BUSINESS_INFO } from '@/lib/constants';
import { DEFAULT_ASTROLOGY_CONFIG, PDF_REPORT_TYPES } from '@/constants/astrologyConfig';

export default function SettingsPage() {
  const [services, setServices] = useState<any[]>([]);
  const [businessData, setBusinessData] = useState(BUSINESS_INFO);
  const [astrologyConfig, setAstrologyConfig] = useState(DEFAULT_ASTROLOGY_CONFIG);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    // Fetch live service prices
    fetch('/api/services')
      .then((res) => res.json())
      .then((data) => {
        if (data.services && data.services.length > 0) {
          setServices(data.services);
        } else {
          setServices(SERVICE_OPTIONS.map((s, i) => ({ id: `srv-${i}`, name: s.label, slug: s.key, dakshina_amount: s.price })));
        }
      })
      .catch(() => {});

    // Fetch live astrology branding config
    fetch('/api/settings/astrology')
      .then((res) => res.json())
      .then((data) => {
        if (data.config) {
          setAstrologyConfig({ ...DEFAULT_ASTROLOGY_CONFIG, ...data.config });
        }
      })
      .catch(() => {});
  }, []);

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      // Save service dakshina updates to live Supabase
      for (const srv of services) {
        if (srv.id && !srv.id.startsWith('srv-')) {
          await fetch('/api/services', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              id: srv.id,
              dakshina_amount: srv.dakshina_amount || srv.price,
            }),
          });
        }
      }

      // Save astrology branding settings to live Supabase
      await fetch('/api/settings/astrology', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(astrologyConfig),
      });

      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (err) {
      console.error('Error saving settings to Supabase:', err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8 pb-16 max-w-5xl mx-auto">
      <div className="border-b border-slate-200 pb-4 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold font-serif-heading text-[#1A3C5E]">
            CRM & System Settings
          </h1>
          <p className="text-slate-500 text-xs">
            Manage Service Dakshina pricing catalog, Astrology PDF white-label branding, and business details.
          </p>
        </div>

        {savedSuccess && (
          <span className="px-3 py-1.5 bg-emerald-100 text-emerald-800 text-xs font-bold rounded-xl flex items-center gap-1.5 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Settings Saved Successfully!
          </span>
        )}
      </div>

      <form onSubmit={handleSaveSettings} className="space-y-8">
        {/* ASTROLOGY PDF WHITE-LABEL BRANDING SETTINGS */}
        <div className="bg-white p-6 rounded-2xl border-2 border-amber-500/40 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-amber-100 pb-3">
            <div>
              <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-600" /> Astrology PDF White-Label Branding Settings
              </h3>
              <p className="text-xs text-slate-500">
                Configure default payload details sent to AstrologyAPI for Horoscope & PDF generation.
              </p>
            </div>
            <span className="px-2.5 py-1 bg-amber-500/10 text-amber-800 font-bold text-[11px] rounded-lg border border-amber-500/20">
              PDF Engine Config
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Company Name (PDF Header)</label>
              <input
                type="text"
                value={astrologyConfig.company_name}
                onChange={(e) => setAstrologyConfig({ ...astrologyConfig, company_name: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none font-bold text-slate-900"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Company Email</label>
              <input
                type="email"
                value={astrologyConfig.company_email}
                onChange={(e) => setAstrologyConfig({ ...astrologyConfig, company_email: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none text-slate-900"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block font-semibold text-slate-700 mb-1">Company Info / Bio (PDF Cover)</label>
              <input
                type="text"
                value={astrologyConfig.company_info}
                onChange={(e) => setAstrologyConfig({ ...astrologyConfig, company_info: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none text-slate-900"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Domain URL</label>
              <input
                type="url"
                value={astrologyConfig.domain_url}
                onChange={(e) => setAstrologyConfig({ ...astrologyConfig, domain_url: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none text-slate-900"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Footer Link URL</label>
              <input
                type="url"
                value={astrologyConfig.footer_link}
                onChange={(e) => setAstrologyConfig({ ...astrologyConfig, footer_link: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none text-slate-900"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block font-semibold text-slate-700 mb-1">Company Logo Image URL</label>
              <input
                type="url"
                value={astrologyConfig.logo_url}
                onChange={(e) => setAstrologyConfig({ ...astrologyConfig, logo_url: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none text-slate-900 font-mono text-[11px]"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Default Chart Style</label>
              <select
                value={astrologyConfig.chart_style}
                onChange={(e) => setAstrologyConfig({ ...astrologyConfig, chart_style: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none font-semibold text-slate-900"
              >
                <option value="NORTH_INDIAN">North Indian (उत्तर भारतीय) - Default</option>
                <option value="SOUTH_INDIAN">South Indian (दक्षिण भारतीय)</option>
                <option value="EAST_INDIAN">East Indian (पूर्वी भारतीय)</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Default Report Type</label>
              <select
                value={astrologyConfig.default_report_type || 'basic_horoscope_pdf'}
                onChange={(e) => setAstrologyConfig({ ...astrologyConfig, default_report_type: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none font-semibold text-slate-900"
              >
                {PDF_REPORT_TYPES.map((t) => (
                  <option key={t.key} value={t.key}>
                    {t.name} ({t.nameHi})
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Business Branding Details */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
            <Building className="w-4 h-4 text-amber-600" /> Business Contact & Identity Details
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Business Name</label>
              <input
                type="text"
                value={businessData.name}
                onChange={(e) => setBusinessData({ ...businessData, name: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none font-bold"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Professional Title</label>
              <input
                type="text"
                value={businessData.title}
                onChange={(e) => setBusinessData({ ...businessData, title: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Primary WhatsApp Phone</label>
              <input
                type="text"
                value={businessData.whatsapp}
                onChange={(e) => setBusinessData({ ...businessData, whatsapp: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Official Email</label>
              <input
                type="email"
                value={businessData.email}
                onChange={(e) => setBusinessData({ ...businessData, email: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none"
              />
            </div>
          </div>
        </div>

        {/* Service Catalog & Dakshina Pricing */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="font-bold text-slate-900 text-base">Master Services & Dakshina Pricing Catalog</h3>
              <p className="text-xs text-slate-500">Configure default fees for Kundali, Vastu, Pujas, and Mentorship</p>
            </div>
          </div>

          <div className="space-y-3 text-xs">
            {services.map((srv, idx) => (
              <div key={srv.slug || idx} className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between gap-4">
                <div className="space-y-0.5 min-w-0">
                  <span className="font-bold text-slate-900 text-sm">{srv.name || srv.label}</span>
                  <p className="text-slate-400 text-[11px]">System Slug: {srv.slug || srv.key}</p>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <div className="flex items-center gap-1 font-bold text-slate-900">
                    <span>₹</span>
                    <input
                      type="number"
                      value={srv.dakshina_amount !== undefined ? srv.dakshina_amount : srv.price}
                      onChange={(e) => {
                        const val = parseFloat(e.target.value) || 0;
                        setServices(services.map((s, i) => (i === idx ? { ...s, dakshina_amount: val, price: val } : s)));
                      }}
                      className="w-28 p-1.5 bg-white border border-slate-300 rounded-lg text-right font-extrabold text-amber-900 outline-none"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end pt-4">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-3 bg-[#1A3C5E] hover:bg-[#15304b] text-amber-400 font-bold text-xs rounded-xl shadow-lg transition flex items-center gap-2 disabled:opacity-50 cursor-pointer"
          >
            <Save className="w-4 h-4" /> {saving ? 'Saving...' : 'Save All Settings'}
          </button>
        </div>
      </form>
    </div>
  );
}
