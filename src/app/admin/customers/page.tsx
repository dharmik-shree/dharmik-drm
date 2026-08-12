'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Users, Search, ExternalLink, ShieldCheck, Mail, Sparkles, Plus, Compass, UserCheck } from 'lucide-react';
import { formatINR, formatDateIN, formatPhoneIN } from '@/lib/formatters';
import { CustomerRecord } from '@/types';
import { GENDER_OPTIONS, RELATION_OPTIONS, MARITAL_STATUS_OPTIONS, RASHI_OPTIONS } from '@/lib/constants';

export default function CustomersPage() {
  const [customers, setCustomers] = useState<CustomerRecord[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    full_name: '',
    phone: '',
    email: '',
    city: '',
    address: '',
    pincode: '',
    date_of_birth: '',
    time_of_birth: '',
    birth_place: '',
    gender: 'male',
    relation: 'self',
    marital_status: 'single',
    gotra: '',
    rashi: '',
    occupation: '',
    kundali_notes: '',
    notes: '',
  });

  useEffect(() => {
    fetchCustomers();
  }, []);

  function fetchCustomers() {
    setLoading(true);
    fetch('/api/customers')
      .then((res) => res.json())
      .then((data) => {
        if (data.customers) setCustomers(data.customers);
      })
      .catch((err) => console.error('Failed to fetch customers:', err))
      .finally(() => setLoading(false));
  }

  const handleCreateCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch('/api/customers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create customer');

      alert(`🎉 Customer ${formData.full_name} created successfully!`);
      setShowAddModal(false);
      setFormData({
        full_name: '',
        phone: '',
        email: '',
        city: '',
        address: '',
        pincode: '',
        date_of_birth: '',
        time_of_birth: '',
        birth_place: '',
        gender: 'male',
        relation: 'self',
        marital_status: 'single',
        gotra: '',
        rashi: '',
        occupation: '',
        kundali_notes: '',
        notes: '',
      });
      fetchCustomers();
    } catch (err: any) {
      alert(err.message || 'Error creating customer');
    } finally {
      setSaving(false);
    }
  };

  const filtered = customers.filter(
    (c) =>
      c.full_name.toLowerCase().includes(search.toLowerCase()) ||
      c.phone.includes(search) ||
      (c.city || '').toLowerCase().includes(search.toLowerCase()) ||
      (c.rashi || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-2xl font-bold font-serif-heading text-[#1A3C5E]">
            Customers Directory
          </h1>
          <p className="text-slate-500 text-xs">
            Manage long-term spiritual relationships, multi-session clients, Kundali profiles, and portal access.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded-xl shadow transition flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" /> Add New Customer
          </button>
          <Link
            href="/portal/dashboard"
            target="_blank"
            className="px-4 py-2 bg-[#1A3C5E] text-amber-400 hover:bg-[#15304b] font-bold text-xs rounded-xl shadow transition flex items-center gap-1.5"
          >
            <Sparkles className="w-4 h-4" /> Preview Customer Portal
          </Link>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
        <div className="relative max-w-md">
          <input
            type="text"
            placeholder="Search converted clients by name, phone, city, rashi..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:border-amber-500"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-100/80 text-slate-700 font-bold uppercase tracking-wider text-[11px] border-b border-slate-200">
              <tr>
                <th className="p-3.5">Client Name</th>
                <th className="p-3.5">Vedic Kundali Details</th>
                <th className="p-3.5">Phone / City</th>
                <th className="p-3.5">Client Since</th>
                <th className="p-3.5 text-center">Sessions</th>
                <th className="p-3.5 text-right">Lifetime Dakshina</th>
                <th className="p-3.5 text-center">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">Loading client directory...</td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">No converted clients recorded yet.</td>
                </tr>
              ) : (
                filtered.map((c) => (
                  <tr key={c.id} className="hover:bg-amber-50/30 transition">
                    <td className="p-3.5 font-bold text-slate-900">
                      <div className="flex items-center gap-2">
                        <div className="w-9 h-9 rounded-full bg-amber-100 text-amber-800 font-bold flex items-center justify-center text-xs border border-amber-300">
                          {c.full_name.charAt(0)}
                        </div>
                        <div>
                          <span className="font-bold text-slate-900 block">{c.full_name}</span>
                          <span className="text-[10px] text-slate-500 font-normal">
                            Relation: {c.relation || 'self'} • {c.gender || 'N/A'}
                          </span>
                        </div>
                      </div>
                    </td>

                    <td className="p-3.5">
                      {c.date_of_birth || c.rashi || c.birth_place ? (
                        <div className="space-y-0.5">
                          {c.rashi && <span className="font-bold text-purple-900 block">🔮 {c.rashi}</span>}
                          <span className="text-slate-600 block">
                            DOB: {c.date_of_birth ? formatDateIN(c.date_of_birth) : 'N/A'} {c.time_of_birth ? `(${c.time_of_birth})` : ''}
                          </span>
                          {c.birth_place && <span className="text-slate-500 block">Place: {c.birth_place}</span>}
                        </div>
                      ) : (
                        <span className="text-slate-400 italic">No Kundali profile</span>
                      )}
                    </td>

                    <td className="p-3.5">
                      <p className="font-semibold text-slate-800">{formatPhoneIN(c.phone)}</p>
                      <span className="text-slate-500">{c.city || 'India'}</span>
                    </td>

                    <td className="p-3.5 font-medium text-slate-600">
                      {formatDateIN(c.customer_since)}
                    </td>

                    <td className="p-3.5 text-center font-bold text-slate-900">
                      {c.total_sessions}
                    </td>

                    <td className="p-3.5 text-right font-bold text-emerald-700">
                      {formatINR(c.total_spent)}
                    </td>

                    <td className="p-3.5 text-center">
                      <button
                        onClick={() => alert(`Magic link portal invitation sent to ${c.full_name} via WhatsApp`)}
                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg shadow transition inline-flex items-center gap-1"
                      >
                        <Mail className="w-3.5 h-3.5" /> Portal Invite
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add New Customer Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-2xl w-full border border-amber-200 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-lg font-bold font-serif-heading text-[#1A3C5E] flex items-center gap-2">
                <UserCheck className="w-5 h-5 text-amber-600" /> Direct Customer Registration & Kundali Profile
              </h3>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-700 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateCustomer} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Ramesh Patel"
                    value={formData.full_name}
                    onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Phone / WhatsApp Number *</label>
                  <input
                    type="tel"
                    required
                    placeholder="+91 98765 43210"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Email Address</label>
                  <input
                    type="email"
                    placeholder="ramesh@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">City / Location</label>
                  <input
                    type="text"
                    placeholder="e.g. Ahmedabad, Gujarat"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              {/* Kundali Section */}
              <div className="p-4 bg-amber-50/60 border border-amber-200 rounded-2xl space-y-3">
                <span className="font-bold text-amber-900 uppercase text-[11px] flex items-center gap-1">
                  <Compass className="w-4 h-4 text-amber-600" /> Vedic Kundali & Profiling
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Date of Birth</label>
                    <input
                      type="date"
                      value={formData.date_of_birth}
                      onChange={(e) => setFormData({ ...formData, date_of_birth: e.target.value })}
                      className="w-full p-2 bg-white border border-slate-200 rounded-lg outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Birth Time</label>
                    <input
                      type="text"
                      placeholder="08:30 AM"
                      value={formData.time_of_birth}
                      onChange={(e) => setFormData({ ...formData, time_of_birth: e.target.value })}
                      className="w-full p-2 bg-white border border-slate-200 rounded-lg outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Birth Place</label>
                    <input
                      type="text"
                      placeholder="Surat"
                      value={formData.birth_place}
                      onChange={(e) => setFormData({ ...formData, birth_place: e.target.value })}
                      className="w-full p-2 bg-white border border-slate-200 rounded-lg outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Gender</label>
                    <select
                      value={formData.gender}
                      onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                      className="w-full p-2 bg-white border border-slate-200 rounded-lg outline-none"
                    >
                      {GENDER_OPTIONS.map((g) => (
                        <option key={g.key} value={g.key}>{g.label}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Relation</label>
                    <select
                      value={formData.relation}
                      onChange={(e) => setFormData({ ...formData, relation: e.target.value })}
                      className="w-full p-2 bg-white border border-slate-200 rounded-lg outline-none"
                    >
                      {RELATION_OPTIONS.map((r) => (
                        <option key={r.key} value={r.key}>{r.label}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Marital Status</label>
                    <select
                      value={formData.marital_status}
                      onChange={(e) => setFormData({ ...formData, marital_status: e.target.value })}
                      className="w-full p-2 bg-white border border-slate-200 rounded-lg outline-none"
                    >
                      {MARITAL_STATUS_OPTIONS.map((m) => (
                        <option key={m.key} value={m.key}>{m.label}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Moon Rashi</label>
                    <select
                      value={formData.rashi}
                      onChange={(e) => setFormData({ ...formData, rashi: e.target.value })}
                      className="w-full p-2 bg-white border border-slate-200 rounded-lg outline-none"
                    >
                      <option value="">Select Rashi</option>
                      {RASHI_OPTIONS.map((r) => (
                        <option key={r} value={r}>{r}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Gotra</label>
                    <input
                      type="text"
                      placeholder="e.g. Kashyap"
                      value={formData.gotra}
                      onChange={(e) => setFormData({ ...formData, gotra: e.target.value })}
                      className="w-full p-2 bg-white border border-slate-200 rounded-lg outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Occupation</label>
                    <input
                      type="text"
                      placeholder="e.g. Businessman"
                      value={formData.occupation}
                      onChange={(e) => setFormData({ ...formData, occupation: e.target.value })}
                      className="w-full p-2 bg-white border border-slate-200 rounded-lg outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Kundali Chart Notes</label>
                  <textarea
                    rows={2}
                    placeholder="Specific astrological chart observations, Lagna notes, remedies..."
                    value={formData.kundali_notes}
                    onChange={(e) => setFormData({ ...formData, kundali_notes: e.target.value })}
                    className="w-full p-2 bg-white border border-slate-200 rounded-lg outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-slate-600 font-semibold hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-xl shadow transition disabled:opacity-50"
                >
                  {saving ? 'Creating...' : 'Create Customer Record'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
