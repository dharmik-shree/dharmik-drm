'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { KanbanSquare, Table, Plus, Search, Filter, RefreshCw } from 'lucide-react';
import { LeadKanban } from '@/components/admin/LeadKanban';
import { LeadTable } from '@/components/admin/LeadTable';
import { Lead, PipelineStage, LeadTemperature, ServiceInterest, UserRole } from '@/types';
import { PIPELINE_STAGES, LEAD_TEMPERATURES, SERVICE_OPTIONS } from '@/lib/constants';

export default function LeadsPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [userRole, setUserRole] = useState<UserRole>('super_admin');
  const [viewMode, setViewMode] = useState<'kanban' | 'table'>('kanban');
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [stageFilter, setStageFilter] = useState<string>(searchParams.get('stage') || 'all');
  const [tempFilter, setTempFilter] = useState<string>('all');
  const [serviceFilter, setServiceFilter] = useState<string>('all');

  useEffect(() => {
    const match = document.cookie.match(/dharmik_demo_role=([^;]+)/);
    if (match) setUserRole(match[1] as UserRole);

    fetchLeads();
  }, []);

  async function fetchLeads() {
    try {
      setLoading(true);
      const res = await fetch('/api/leads');
      const data = await res.json();
      if (data.leads) setLeads(data.leads);
    } catch (err) {
      console.error('Failed to fetch live Supabase leads:', err);
    } finally {
      setLoading(false);
    }
  }

  const handleStageChange = async (leadId: string, newStage: PipelineStage) => {
    // Optimistic UI update
    setLeads((prev) =>
      prev.map((l) =>
        l.id === leadId
          ? {
              ...l,
              stage: newStage,
              updated_at: new Date().toISOString(),
            }
          : l
      )
    );

    try {
      await fetch(`/api/leads/${leadId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stage: newStage }),
      });

      // Log chatter activity
      await fetch('/api/activities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lead_id: leadId,
          activity_type: 'stage_change',
          content: `Moved lead stage to ${newStage.replace(/_/g, ' ').toUpperCase()}`,
        }),
      });
    } catch (err) {
      console.error('Error updating stage in Supabase:', err);
    }
  };

  // Filter application
  const filteredLeads = leads.filter((lead) => {
    if (search.trim()) {
      const q = search.toLowerCase();
      const nameMatch = lead.full_name.toLowerCase().includes(q);
      const phoneMatch = lead.phone.includes(q);
      const cityMatch = (lead.city || '').toLowerCase().includes(q);
      if (!nameMatch && !phoneMatch && !cityMatch) return false;
    }

    if (stageFilter !== 'all' && lead.stage !== stageFilter) return false;
    if (tempFilter !== 'all' && lead.lead_temperature !== tempFilter) return false;
    if (serviceFilter !== 'all' && lead.service_interest !== serviceFilter) return false;

    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-2xl font-bold font-serif-heading text-[#1A3C5E]">
            Lead Management Pipeline
          </h1>
          <p className="text-slate-500 text-xs">
            Manage client inquiries across all 14 Vedic guidance pipeline stages
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* View Toggle */}
          <div className="flex bg-slate-200/80 p-1 rounded-xl">
            <button
              onClick={() => setViewMode('kanban')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                viewMode === 'kanban' ? 'bg-white text-[#1A3C5E] shadow-xs' : 'text-slate-600'
              }`}
            >
              <KanbanSquare className="w-4 h-4" />
              Kanban View
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                viewMode === 'table' ? 'bg-white text-[#1A3C5E] shadow-xs' : 'text-slate-600'
              }`}
            >
              <Table className="w-4 h-4" />
              Table View
            </button>
          </div>

          <button
            onClick={() => router.push('/admin/leads/new')}
            className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded-xl shadow transition flex items-center gap-1"
          >
            <Plus className="w-4 h-4" />
            Add Lead
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center gap-3">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px]">
          <input
            type="text"
            placeholder="Search lead name, phone, city..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:border-amber-500"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
        </div>

        {/* Stage Filter */}
        <select
          value={stageFilter}
          onChange={(e) => setStageFilter(e.target.value)}
          className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none font-medium text-slate-700"
        >
          <option value="all">All Stages (14)</option>
          {PIPELINE_STAGES.map((s) => (
            <option key={s.key} value={s.key}>
              {s.label}
            </option>
          ))}
        </select>

        {/* Temperature Filter */}
        <select
          value={tempFilter}
          onChange={(e) => setTempFilter(e.target.value)}
          className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none font-medium text-slate-700"
        >
          <option value="all">All Temperatures</option>
          {LEAD_TEMPERATURES.map((t) => (
            <option key={t.key} value={t.key}>
              {t.icon} {t.label}
            </option>
          ))}
        </select>

        {/* Service Filter */}
        <select
          value={serviceFilter}
          onChange={(e) => setServiceFilter(e.target.value)}
          className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none font-medium text-slate-700"
        >
          <option value="all">All Services (8)</option>
          {SERVICE_OPTIONS.map((s) => (
            <option key={s.key} value={s.key}>
              {s.label}
            </option>
          ))}
        </select>

        {/* Reset */}
        {(search || stageFilter !== 'all' || tempFilter !== 'all' || serviceFilter !== 'all') && (
          <button
            onClick={() => {
              setSearch('');
              setStageFilter('all');
              setTempFilter('all');
              setServiceFilter('all');
            }}
            className="p-2 text-slate-400 hover:text-slate-700 transition"
            title="Reset Filters"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Main Content View */}
      {loading ? (
        <div className="py-16 text-center text-slate-400">Loading pipeline leads...</div>
      ) : viewMode === 'kanban' ? (
        <LeadKanban leads={filteredLeads} onStageChange={handleStageChange} />
      ) : (
        <LeadTable leads={filteredLeads} onStageChange={handleStageChange} userRole={userRole} />
      )}
    </div>
  );
}
