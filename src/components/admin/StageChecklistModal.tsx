'use client';

import React, { useState } from 'react';
import { CheckCircle2, AlertTriangle, X, ShieldCheck } from 'lucide-react';
import { Lead, PipelineStage } from '@/types';
import { PIPELINE_STAGES } from '@/lib/constants';

interface StageChecklistModalProps {
  lead: Lead;
  targetStage: PipelineStage;
  onConfirm: () => void;
  onCancel: () => void;
}

export function StageChecklistModal({ lead, targetStage, onConfirm, onCancel }: StageChecklistModalProps) {
  const targetStageInfo = PIPELINE_STAGES.find(s => s.key === targetStage);
  
  // Example checklist items for stage
  const [items, setItems] = useState([
    { id: '1', text: 'Birth chart data & city verified', completed: true },
    { id: '2', text: 'Payment status & receipt confirmed', completed: lead.payment_status !== 'unpaid' },
    { id: '3', text: 'Protocol message / instructions sent', completed: lead.protocol_message_sent },
  ]);

  const allCompleted = items.every(i => i.completed);

  const toggleItem = (id: string) => {
    setItems(items.map(i => i.id === id ? { ...i, completed: !i.completed } : i));
  };

  return (
    <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-6 border border-slate-200">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800 bg-amber-50 px-2 py-0.5 rounded-full">
              Stage Transition Check
            </span>
            <h3 className="text-xl font-bold font-serif-heading text-[#1A3C5E]">
              Move to {targetStageInfo?.label}
            </h3>
            <p className="text-xs text-slate-500">Client: <strong className="text-slate-900">{lead.full_name}</strong></p>
          </div>

          <button onClick={onCancel} className="p-1 text-slate-400 hover:text-slate-600 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Warning if items unchecked */}
        {!allCompleted && (
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-2 text-xs text-amber-900">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <span>Some stage requirements are incomplete. You can still proceed (Soft Enforcement).</span>
          </div>
        )}

        {/* Checklist */}
        <div className="space-y-2">
          {items.map((item) => (
            <label
              key={item.id}
              onClick={() => toggleItem(item.id)}
              className={`p-3 rounded-xl border flex items-center gap-3 cursor-pointer transition text-xs font-medium ${
                item.completed ? 'bg-emerald-50/60 border-emerald-200 text-emerald-900' : 'bg-slate-50 border-slate-200 text-slate-700'
              }`}
            >
              <input
                type="checkbox"
                checked={item.completed}
                onChange={() => {}}
                className="w-4 h-4 text-amber-600 rounded border-slate-300 focus:ring-amber-500"
              />
              <span>{item.text}</span>
            </label>
          ))}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-100">
          <button
            onClick={onCancel}
            className="px-4 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition"
          >
            Cancel
          </button>

          <button
            onClick={onConfirm}
            className="px-5 py-2.5 text-xs font-bold bg-[#1A3C5E] hover:bg-[#15304b] text-amber-400 rounded-xl shadow transition flex items-center gap-1.5"
          >
            <ShieldCheck className="w-4 h-4" />
            Confirm Move to Stage
          </button>
        </div>
      </div>
    </div>
  );
}
