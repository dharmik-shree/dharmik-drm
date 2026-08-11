'use client';

import React from 'react';
import { CreditCard, FileText, Download, CheckCircle2 } from 'lucide-react';
import { INITIAL_PAYMENTS, INITIAL_LEADS } from '@/lib/mock-data';
import { formatINR, formatDateIN } from '@/lib/formatters';
import { generatePaymentReceiptPDF } from '@/lib/receipt-pdf';

export default function CustomerPaymentsPage() {
  const myPayments = INITIAL_PAYMENTS.filter((p) => p.lead_name === 'Rajesh Sharma' || p.id === 'pay-1');
  const myLead = INITIAL_LEADS[0];

  return (
    <div className="space-y-6 pb-12 max-w-4xl mx-auto">
      <div className="border-b border-amber-200 pb-4">
        <h1 className="text-2xl font-bold font-serif-heading text-[#1A3C5E]">
          My Payments & Official Receipts
        </h1>
        <p className="text-xs text-slate-600 font-serif">
          View your paid Dakshina transactions and download official PDF receipts.
        </p>
      </div>

      <div className="bg-white rounded-3xl p-6 border border-amber-200 shadow-md space-y-4">
        <div className="space-y-3">
          {myPayments.map((p) => (
            <div key={p.id} className="p-4 bg-amber-50/50 border border-amber-200 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-900 text-sm">{formatINR(p.amount)}</span>
                  <span className="px-2 py-0.5 text-[10px] font-bold bg-emerald-100 text-emerald-800 rounded-full uppercase">
                    {p.payment_type}
                  </span>
                </div>
                <p className="text-slate-600 font-medium">{p.service} • Date: {formatDateIN(p.payment_date)}</p>
                <p className="text-slate-400 font-mono text-[11px]">Txn Ref: {p.reference_no}</p>
              </div>

              <button
                onClick={() => generatePaymentReceiptPDF(p, myLead)}
                className="px-4 py-2.5 bg-[#1A3C5E] hover:bg-[#15304b] text-amber-300 font-bold text-xs rounded-xl shadow transition flex items-center justify-center gap-1.5 self-start sm:self-auto"
              >
                <FileText className="w-4 h-4 text-amber-400" /> Download PDF Receipt
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
