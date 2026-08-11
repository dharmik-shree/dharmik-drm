'use client';

import React, { useState, useEffect } from 'react';
import { Settings, Save, Plus, Edit2, CheckCircle2, Sparkles, Building } from 'lucide-react';
import { SERVICE_OPTIONS, BUSINESS_INFO } from '@/lib/constants';

export default function SettingsPage() {
  const [services, setServices] = useState<any[]>([]);
  const [businessData, setBusinessData] = useState(BUSINESS_INFO);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch('/api/services')
      .then((res) => res.json())
      .then((data) => {
        if (data.services && data.services.length > 0) {
          setServices(data.services);
        } else {
          setServices(SERVICE_OPTIONS.map((s, i) => ({ id: `srv-${i}`, name: s.label, slug: s.key, dakshina_amount: s.price })));
        }
      });
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
            CRM & Business Settings
          </h1>
          <p className="text-slate-500 text-xs">
            Manage Service Dakshina pricing catalog, business details, and system configurations (Live Supabase Connected).
          </p>
        </div>

        {savedSuccess && (
          <span className="px-3 py-1.5 bg-emerald-100 text-emerald-800 text-xs font-bold rounded-xl flex items-center gap-1.5 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Settings Saved to Supabase!
          </span>
        )}
      </div>

      <form onSubmit={handleSaveSettings} className="space-y-8">
        {/* Business Branding Details */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
            <Building className="w-4 h-4 text-amber-600" /> Business Branding & Contact Details
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
            className="px-6 py-3 bg-[#1A3C5E] hover:bg-[#15304b] text-amber-400 font-bold text-xs rounded-xl shadow-lg transition flex items-center gap-2 disabled:opacity-50"
          >
            <Save className="w-4 h-4" /> {saving ? 'Saving...' : 'Save System Settings'}
          </button>
        </div>
      </form>
    </div>
  );
}
