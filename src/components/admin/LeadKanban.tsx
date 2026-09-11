'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Lead, PipelineStage } from '@/types';
import { PIPELINE_STAGES, LEAD_TEMPERATURES, SERVICE_OPTIONS } from '@/lib/constants';
import { formatPhoneIN, formatINR, formatDateIN } from '@/lib/formatters';
import { StageChecklistModal } from './StageChecklistModal';
import {
  MoreVertical,
  Phone,
  MessageSquare,
  Calendar,
  IndianRupee,
  Clock,
  ArrowRight,
  Sparkles,
  Trash2,
  Edit3,
} from 'lucide-react';

interface LeadKanbanProps {
  leads: Lead[];
  onStageChange: (leadId: string, newStage: PipelineStage) => void;
  onDeleteLead?: (leadId: string, leadName: string) => void;
}

export function LeadKanban({ leads, onStageChange, onDeleteLead }: LeadKanbanProps) {
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [targetStage, setTargetStage] = useState<PipelineStage | null>(null);

  const handleStageRequest = (lead: Lead, stage: PipelineStage) => {
    if (lead.stage === stage) return;
    setSelectedLead(lead);
    setTargetStage(stage);
  };

  const confirmStageMove = () => {
    if (selectedLead && targetStage) {
      onStageChange(selectedLead.id, targetStage);
      setSelectedLead(null);
      setTargetStage(null);
    }
  };

  return (
    <div className="overflow-x-auto pb-6">
      <div className="flex gap-4 min-w-[2800px] items-start">
        {PIPELINE_STAGES.map((col) => {
          const colLeads = leads.filter((l) => l.stage === col.key);

          return (
            <div
              key={col.key}
              className="w-72 bg-slate-100/80 rounded-2xl p-3 border border-slate-200 flex flex-col max-h-[calc(100vh-220px)] shadow-xs shrink-0"
            >
              {/* Stage Header */}
              <div className="flex items-center justify-between pb-3 px-1 border-b border-slate-200 mb-3">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                  <h4 className="font-bold text-xs text-slate-800 uppercase tracking-wider">{col.label}</h4>
                </div>
                <span className="px-2 py-0.5 text-xs font-bold bg-white text-slate-700 rounded-full border border-slate-200">
                  {colLeads.length}
                </span>
              </div>

              {/* Cards Container */}
              <div className="flex-1 overflow-y-auto space-y-3 pr-1">
                {colLeads.length === 0 ? (
                  <div className="py-8 text-center border-2 border-dashed border-slate-200 rounded-xl">
                    <p className="text-[11px] text-slate-400">No leads in this stage</p>
                  </div>
                ) : (
                  colLeads.map((lead) => {
                    const tempInfo = LEAD_TEMPERATURES.find((t) => t.key === lead.lead_temperature);
                    const serviceLabel = SERVICE_OPTIONS.find((s) => s.key === lead.service_interest)?.label || lead.service_interest;

                    // Days in stage calculation
                    const createdDate = new Date(lead.updated_at || lead.created_at);
                    const daysInStage = Math.max(0, Math.floor((Date.now() - createdDate.getTime()) / (1000 * 60 * 60 * 24)));

                    return (
                      <div
                        key={lead.id}
                        className="bg-white rounded-xl p-3.5 border border-slate-200 shadow-xs hover:shadow-md hover:border-amber-400 transition space-y-3 group"
                      >
                        {/* Top Badge Row */}
                        <div className="flex items-center justify-between gap-1">
                          <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full border ${tempInfo?.badgeClass}`}>
                            {tempInfo?.icon} {tempInfo?.label}
                          </span>

                          <div className="flex items-center gap-1">
                            {lead.is_converted ? (
                              <span className="px-1.5 py-0.5 text-[9px] font-bold bg-emerald-100 text-emerald-800 rounded-full border border-emerald-300">
                                Converted
                              </span>
                            ) : (
                              <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full ${
                                lead.payment_status === 'full_paid'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : lead.payment_status === 'token_paid'
                                  ? 'bg-amber-100 text-amber-800'
                                  : 'bg-slate-100 text-slate-600'
                              }`}>
                                {lead.payment_status.replace('_', ' ')}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Title & Phone */}
                        <div>
                          <Link
                            href={`/admin/leads/${lead.id}`}
                            className="font-bold text-sm text-slate-900 hover:text-amber-600 transition block truncate"
                          >
                            {lead.full_name}
                          </Link>
                          <p className="text-xs text-slate-500">{formatPhoneIN(lead.phone)} • {lead.city || 'India'}</p>
                          {lead.rashi && (
                            <span className="text-[10px] font-bold text-purple-700 bg-purple-50 px-1.5 py-0.5 rounded mt-1 inline-block">
                              🔮 {lead.rashi}
                            </span>
                          )}
                        </div>

                        {/* Service & Fee */}
                        <div className="bg-slate-50 p-2 rounded-lg text-xs space-y-0.5">
                          <p className="font-semibold text-slate-700 truncate">{serviceLabel}</p>
                          <div className="flex items-center justify-between text-[11px] text-slate-500">
                            <span>Fee: {formatINR(lead.full_amount)}</span>
                            {lead.amount_due > 0 && (
                              <span className="text-red-600 font-bold">Due: {formatINR(lead.amount_due)}</span>
                            )}
                          </div>
                        </div>

                        {/* Consultation Date if set */}
                        {lead.date_of_consultation && (
                          <div className="flex items-center gap-1.5 text-[11px] text-purple-700 font-medium bg-purple-50 p-1.5 rounded-md">
                            <Calendar className="w-3.5 h-3.5 text-purple-600" />
                            <span>{formatDateIN(lead.date_of_consultation)}</span>
                          </div>
                        )}

                        {/* Card Footer */}
                        <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-[11px] text-slate-400">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {daysInStage}d in stage
                          </span>

                          <div className="flex items-center gap-1">
                            <Link
                              href={`/admin/leads/${lead.id}?edit=true`}
                              className="p-1 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded transition"
                              title="Edit Lead Details"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </Link>

                            {onDeleteLead && (
                              <button
                                type="button"
                                onClick={() => onDeleteLead(lead.id, lead.full_name)}
                                className="p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition cursor-pointer"
                                title="Delete Lead & Reminders"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}

                            <a
                              href={`https://wa.me/${lead.phone.replace(/\D/g, '')}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-1 hover:text-emerald-600 hover:bg-emerald-50 rounded transition"
                              title="Send WhatsApp"
                            >
                              <MessageSquare className="w-3.5 h-3.5" />
                            </a>

                            <div className="relative group/select">
                              <select
                                value={lead.stage}
                                onChange={(e) => handleStageRequest(lead, e.target.value as PipelineStage)}
                                className="text-[10px] font-bold text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded px-1.5 py-0.5 cursor-pointer outline-none"
                              >
                                {PIPELINE_STAGES.map((s) => (
                                  <option key={s.key} value={s.key}>
                                    Move to: {s.label}
                                  </option>
                                ))}
                              </select>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Stage Checklist Modal */}
      {selectedLead && targetStage && (
        <StageChecklistModal
          lead={selectedLead}
          targetStage={targetStage}
          onConfirm={confirmStageMove}
          onCancel={() => {
            setSelectedLead(null);
            setTargetStage(null);
          }}
        />
      )}
    </div>
  );
}
