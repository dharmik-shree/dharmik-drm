'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Users, Search, ExternalLink, ShieldCheck, Mail, Sparkles } from 'lucide-react';
import { formatINR, formatDateIN, formatPhoneIN } from '@/lib/formatters';
import { CustomerRecord } from '@/types';

export default function CustomersPage() {
  const [customers, setCustomers] = useState<CustomerRecord[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/customers')
      .then((res) => res.json())
      .then((data) => {
        if (data.customers) setCustomers(data.customers);
      })
      .catch((err) => console.error('Failed to fetch customers:', err))
      .finally(() => setLoading(false));
  }, []);

  const filtered = customers.filter(
    (c) =>
      c.full_name.toLowerCase().includes(search.toLowerCase()) ||
      c.phone.includes(search) ||
      (c.city || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-2xl font-bold font-serif-heading text-[#1A3C5E]">
            Converted Clients Directory
          </h1>
          <p className="text-slate-500 text-xs">
            Manage long-term spiritual relationships, multi-session clients, and portal access.
          </p>
        </div>

        <div className="flex items-center gap-2">
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
            placeholder="Search converted clients by name, phone, city..."
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
                <th className="p-3.5">Phone / City</th>
                <th className="p-3.5">Client Since</th>
                <th className="p-3.5 text-center">Sessions Completed</th>
                <th className="p-3.5 text-right">Total Lifetime Dakshina</th>
                <th className="p-3.5 text-center">Portal Invitation</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">Loading client directory...</td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">No converted clients recorded yet.</td>
                </tr>
              ) : (
                filtered.map((c) => (
                  <tr key={c.id} className="hover:bg-amber-50/30 transition">
                    <td className="p-3.5 font-bold text-slate-900">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-800 font-bold flex items-center justify-center text-xs">
                          {c.full_name.charAt(0)}
                        </div>
                        <div>
                          <span>{c.full_name}</span>
                          {c.tags.map((t) => (
                            <span key={t} className="ml-2 px-2 py-0.5 text-[9px] font-bold bg-amber-100 text-amber-800 rounded-full">
                              {t}
                            </span>
                          ))}
                        </div>
                      </div>
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
                        <Mail className="w-3.5 h-3.5" /> Send Portal Invite
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
