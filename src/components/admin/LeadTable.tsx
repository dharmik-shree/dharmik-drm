'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Lead, PipelineStage, UserRole } from '@/types';
import { PIPELINE_STAGES, LEAD_TEMPERATURES, SERVICE_OPTIONS } from '@/lib/constants';
import { formatPhoneIN, formatINR, formatDateIN } from '@/lib/formatters';
import {
  Download,
  Filter,
  ArrowUpDown,
  Search,
  ExternalLink,
  MessageSquare,
  Phone,
  CheckSquare,
} from 'lucide-react';

interface LeadTableProps {
  leads: Lead[];
  onStageChange: (leadId: string, newStage: PipelineStage) => void;
  userRole: UserRole;
}

export function LeadTable({ leads, onStageChange, userRole }: LeadTableProps) {
  const [selectedLeadIds, setSelectedLeadIds] = useState<string[]>([]);
  const [sortField, setSortField] = useState<keyof Lead>('created_at');
  const [sortAsc, setSortAsc] = useState(false);

  const toggleSelectAll = () => {
    if (selectedLeadIds.length === leads.length) {
      setSelectedLeadIds([]);
    } else {
      setSelectedLeadIds(leads.map((l) => l.id));
    }
  };

  const toggleSelectLead = (id: string) => {
    setSelectedLeadIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleSort = (field: keyof Lead) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(true);
    }
  };

  const sortedLeads = [...leads].sort((a, b) => {
    const valA = a[sortField] ?? '';
    const valB = b[sortField] ?? '';
    if (valA < valB) return sortAsc ? -1 : 1;
    if (valA > valB) return sortAsc ? 1 : -1;
    return 0;
  });

  const exportToCSV = () => {
    const headers = ['ID', 'Full Name', 'Phone', 'City', 'Service', 'Stage', 'Temperature', 'Payment Status', 'Full Amount', 'Amount Paid', 'Amount Due', 'Consultation Date'];
    const rows = sortedLeads.map((l) => [
      l.id,
      `"${l.full_name}"`,
      `"${l.phone}"`,
      `"${l.city || ''}"`,
      `"${l.service_interest}"`,
      `"${l.stage}"`,
      `"${l.lead_temperature}"`,
      `"${l.payment_status}"`,
      l.full_amount,
      l.amount_paid,
      l.amount_due,
      l.date_of_consultation ? formatDateIN(l.date_of_consultation) : '',
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Dharmikshree_Leads_Export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden space-y-4">
      {/* Table Actions Bar */}
      <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/50">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-700">
            {selectedLeadIds.length} of {leads.length} selected
          </span>

          {selectedLeadIds.length > 0 && (
            <div className="flex items-center gap-2">
              <button
                onClick={() => alert(`Bulk reassigning ${selectedLeadIds.length} leads`)}
                className="px-3 py-1.5 bg-white border border-slate-300 text-xs font-semibold text-slate-700 rounded-lg hover:bg-slate-50 transition"
              >
                Reassign Team
              </button>
            </div>
          )}
        </div>

        <button
          onClick={exportToCSV}
          className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition shadow flex items-center gap-1.5 self-start sm:self-auto"
        >
          <Download className="w-4 h-4" />
          Export to CSV
        </button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs text-slate-700">
          <thead className="bg-slate-100/80 text-slate-700 font-bold uppercase tracking-wider text-[11px] border-b border-slate-200">
            <tr>
              <th className="p-3 w-10 text-center">
                <input
                  type="checkbox"
                  checked={selectedLeadIds.length === leads.length && leads.length > 0}
                  onChange={toggleSelectAll}
                  className="rounded border-slate-300 text-amber-600 focus:ring-amber-500"
                />
              </th>
              <th className="p-3 cursor-pointer" onClick={() => handleSort('full_name')}>
                <div className="flex items-center gap-1">
                  Client Name <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>
              <th className="p-3">Service Interest</th>
              <th className="p-3 cursor-pointer" onClick={() => handleSort('stage')}>
                <div className="flex items-center gap-1">
                  Pipeline Stage <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>
              <th className="p-3">Temp</th>
              <th className="p-3">Assigned To</th>
              <th className="p-3 cursor-pointer" onClick={() => handleSort('date_of_consultation')}>
                <div className="flex items-center gap-1">
                  Consultation Date <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>
              {userRole !== 'team_member' && <th className="p-3 text-right">Fee / Due</th>}
              <th className="p-3 text-center">Actions</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100">
            {sortedLeads.length === 0 ? (
              <tr>
                <td colSpan={9} className="py-12 text-center text-slate-400">
                  No leads found matching filters.
                </td>
              </tr>
            ) : (
              sortedLeads.map((lead, idx) => {
                const tempInfo = LEAD_TEMPERATURES.find((t) => t.key === lead.lead_temperature);
                const stageInfo = PIPELINE_STAGES.find((s) => s.key === lead.stage);
                const isSelected = selectedLeadIds.includes(lead.id);

                return (
                  <tr
                    key={lead.id}
                    className={`hover:bg-amber-50/40 transition ${
                      idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/30'
                    } ${isSelected ? 'bg-amber-50/70' : ''}`}
                  >
                    <td className="p-3 text-center">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleSelectLead(lead.id)}
                        className="rounded border-slate-300 text-amber-600 focus:ring-amber-500"
                      />
                    </td>

                    <td className="p-3 font-semibold text-slate-900">
                      <Link href={`/admin/leads/${lead.id}`} className="hover:text-amber-600 transition block">
                        {lead.full_name}
                      </Link>
                      <span className="text-[11px] font-normal text-slate-500">{formatPhoneIN(lead.phone)} • {lead.city || 'India'}</span>
                    </td>

                    <td className="p-3">
                      <span className="font-medium text-slate-800">
                        {SERVICE_OPTIONS.find((s) => s.key === lead.service_interest)?.label || lead.service_interest}
                      </span>
                    </td>

                    <td className="p-3">
                      <select
                        value={lead.stage}
                        onChange={(e) => onStageChange(lead.id, e.target.value as PipelineStage)}
                        className={`text-[11px] font-bold rounded-lg px-2.5 py-1 border cursor-pointer ${stageInfo?.color}`}
                      >
                        {PIPELINE_STAGES.map((s) => (
                          <option key={s.key} value={s.key}>
                            {s.label}
                          </option>
                        ))}
                      </select>
                    </td>

                    <td className="p-3">
                      <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full border ${tempInfo?.badgeClass}`}>
                        {tempInfo?.icon} {tempInfo?.label}
                      </span>
                    </td>

                    <td className="p-3 text-slate-600 font-medium">
                      {lead.assigned_to_user?.full_name || 'Unassigned'}
                    </td>

                    <td className="p-3 font-medium text-purple-800">
                      {lead.date_of_consultation ? formatDateIN(lead.date_of_consultation) : 'Not set'}
                    </td>

                    {userRole !== 'team_member' && (
                      <td className="p-3 text-right">
                        <div className="font-bold text-slate-900">{formatINR(lead.full_amount)}</div>
                        {lead.amount_due > 0 && (
                          <span className="text-[10px] text-red-600 font-bold block">Due: {formatINR(lead.amount_due)}</span>
                        )}
                      </td>
                    )}

                    <td className="p-3 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <a
                          href={`https://wa.me/${lead.phone.replace(/\D/g, '')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg transition"
                          title="WhatsApp Client"
                        >
                          <MessageSquare className="w-4 h-4" />
                        </a>
                        <Link
                          href={`/admin/leads/${lead.id}`}
                          className="p-1.5 text-[#1A3C5E] hover:bg-slate-100 rounded-lg transition"
                          title="View Profile"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </Link>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
