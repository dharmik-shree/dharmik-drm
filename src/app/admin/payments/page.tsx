'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  IndianRupee,
  TrendingUp,
  CreditCard,
  AlertTriangle,
  Download,
  Plus,
  Search,
  CheckCircle2,
  MessageSquare,
  FileText,
  Filter,
  Edit3,
  Trash2,
  Loader2,
  X,
  Check,
} from 'lucide-react';
import { SERVICE_OPTIONS } from '@/lib/constants';
import { formatINR, formatDateIN, formatPhoneIN } from '@/lib/formatters';
import { generatePaymentReceiptPDF } from '@/lib/receipt-pdf';
import { sendWhatsAppMessage } from '@/lib/whatsapp';
import { UserRole, PaymentRecord, Lead } from '@/types';

export default function PaymentsPage() {
  const router = useRouter();

  const [userRole, setUserRole] = useState<UserRole>('super_admin');
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals & Filters
  const [showAddModal, setShowAddModal] = useState(false);
  const [filterMode, setFilterMode] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [search, setSearch] = useState('');

  // Form State
  const [newPayLeadId, setNewPayLeadId] = useState('');
  const [newPayAmount, setNewPayAmount] = useState('9900');
  const [newPayMode, setNewPayMode] = useState<'cash' | 'upi' | 'bank_transfer' | 'card'>('upi');
  const [newPayType, setNewPayType] = useState<'full' | 'token' | 'partial'>('full');
  const [newPayRef, setNewPayRef] = useState(`UPI/${Math.floor(100000000 + Math.random() * 900000000)}`);
  const [recording, setRecording] = useState(false);

  // Edit Payment State
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingPayment, setEditingPayment] = useState<PaymentRecord | null>(null);
  const [savingEdit, setSavingEdit] = useState(false);
  const [editForm, setEditForm] = useState({
    id: '',
    amount: 0,
    payment_mode: 'upi',
    payment_type: 'full',
    payment_date: '',
    reference_no: '',
    notes: '',
  });

  useEffect(() => {
    const match = document.cookie.match(/dharmik_demo_role=([^;]+)/);
    if (match) {
      const role = match[1] as UserRole;
      setUserRole(role);
      if (role === 'team_member') {
        router.push('/admin/dashboard');
      }
    }

    loadPaymentData();
  }, [router]);

  async function loadPaymentData() {
    try {
      setLoading(true);
      const [resPay, resLeads] = await Promise.all([
        fetch('/api/payments').then(r => r.json()),
        fetch('/api/leads').then(r => r.json()),
      ]);

      if (resPay.payments) setPayments(resPay.payments);
      if (resLeads.leads) {
        setLeads(resLeads.leads);
        if (resLeads.leads.length > 0) {
          setNewPayLeadId(resLeads.leads[0].id);
        }
      }
    } catch (err) {
      console.error('Error loading payments from Supabase:', err);
    } finally {
      setLoading(false);
    }
  }

  // Aggregates
  const totalRevenue = payments.reduce((sum, p) => sum + Number(p.amount), 0);
  const tokenPaymentsTotal = payments.filter((p) => p.payment_type === 'token').reduce((sum, p) => sum + Number(p.amount), 0);
  const fullPaymentsTotal = payments.filter((p) => p.payment_type === 'full').reduce((sum, p) => sum + Number(p.amount), 0);
  const onlinePaymentsTotal = payments.filter((p) => p.payment_mode !== 'cash').reduce((sum, p) => sum + Number(p.amount), 0);
  const cashPaymentsTotal = payments.filter((p) => p.payment_mode === 'cash').reduce((sum, p) => sum + Number(p.amount), 0);

  // Pending Dues Leads
  const duesLeads = leads.filter((l) => Number(l.amount_due) > 0);

  // Filtered Payments
  const filteredPayments = payments.filter((p) => {
    if (search && !p.lead_name?.toLowerCase().includes(search.toLowerCase()) && !p.service.toLowerCase().includes(search.toLowerCase())) return false;
    if (filterMode !== 'all' && p.payment_mode !== filterMode) return false;
    if (filterType !== 'all' && p.payment_type !== filterType) return false;
    return true;
  });

  const handleRecordNewPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    const targetLead = leads.find((l) => l.id === newPayLeadId);
    if (!targetLead) return;

    setRecording(true);
    const amountNum = parseFloat(newPayAmount);

    try {
      const res = await fetch('/api/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lead_id: targetLead.id,
          service: SERVICE_OPTIONS.find((s) => s.key === targetLead.service_interest)?.label || targetLead.service_interest,
          payment_type: newPayType,
          amount: amountNum,
          payment_mode: newPayMode,
          payment_date: new Date().toISOString().split('T')[0],
          reference_no: newPayRef,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to record payment');

      const newRecord = data.payment;
      setPayments([newRecord, ...payments]);
      setShowAddModal(false);

      // Refresh leads for dues
      const resLeads = await fetch('/api/leads').then((r) => r.json());
      if (resLeads.leads) setLeads(resLeads.leads);

      // PDF Receipt & WhatsApp alert
      generatePaymentReceiptPDF(newRecord, targetLead);
      const waText = `नमस्ते ${targetLead.full_name} 🙏 Payment of ${formatINR(amountNum)} received for ${newRecord.service}. Ref: ${newPayRef}. Thank you! — Team Dharmikshree`;
      sendWhatsAppMessage({ phone: targetLead.phone, message: waText });
    } catch (err: any) {
      alert(err.message || 'Error recording payment in Supabase');
    } finally {
      setRecording(false);
    }
  };

  const handleSendDueReminder = (leadItem: Lead) => {
    const msg = `नमस्ते ${leadItem.full_name} 🙏 Reminder: Outstanding Dakshina balance of ${formatINR(leadItem.amount_due)} for ${SERVICE_OPTIONS.find(s => s.key === leadItem.service_interest)?.label} is pending. Please complete at your earliest convenience. — Team Dharmikshree`;
    const cleanPhone = leadItem.phone.replace(/\D/g, '');
    window.open(`https://wa.me/${cleanPhone}?text=${encodeURIComponent(msg)}`, '_blank');
  };

  const handleOpenEdit = (p: PaymentRecord) => {
    setEditingPayment(p);
    setEditForm({
      id: p.id,
      amount: Number(p.amount),
      payment_mode: p.payment_mode || 'upi',
      payment_type: p.payment_type || 'full',
      payment_date: p.payment_date || new Date().toISOString().split('T')[0],
      reference_no: p.reference_no || '',
      notes: p.notes || '',
    });
    setShowEditModal(true);
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPayment) return;
    setSavingEdit(true);

    try {
      const res = await fetch('/api/payments', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update payment');

      await loadPaymentData();
      setShowEditModal(false);
      alert('✅ Payment updated and lead balance recalculated successfully!');
    } catch (err: any) {
      alert(err.message || 'Error updating payment');
    } finally {
      setSavingEdit(false);
    }
  };

  const handleDeletePayment = async (p: PaymentRecord) => {
    if (!confirm(`Are you sure you want to delete this payment of ₹${Number(p.amount).toLocaleString('en-IN')} for ${p.lead_name || 'the client'}?\n\nThis will adjust the client's remaining dues balance.`)) {
      return;
    }

    try {
      const res = await fetch(`/api/payments?id=${p.id}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to delete payment');

      await loadPaymentData();
      alert('✅ Payment removed and lead dues recalculated successfully.');
    } catch (err: any) {
      alert(err.message || 'Error deleting payment');
    }
  };

  return (
    <div className="space-y-8 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-2xl font-bold font-serif-heading text-[#1A3C5E]">
            Financial & Dakshina Payments Dashboard
          </h1>
          <p className="text-slate-500 text-xs">
            Track full revenue, token payments, online vs cash split, dues, and PDF receipts.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2.5 bg-[#1A3C5E] hover:bg-[#15304b] text-amber-400 font-bold text-xs rounded-xl shadow transition flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" /> Record New Payment
          </button>
        </div>
      </div>

      {/* Top 4 Financial Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Revenue */}
        <div className="bg-white p-5 rounded-2xl border border-emerald-200 bg-emerald-50/20 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-emerald-800">
            <span className="text-xs font-bold uppercase tracking-wider">Total Revenue</span>
            <TrendingUp className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-3xl font-extrabold text-slate-900">{formatINR(totalRevenue)}</p>
          <span className="text-xs text-slate-500 font-medium">Confirmed Revenue</span>
        </div>

        {/* Full vs Token Split */}
        <div className="bg-white p-5 rounded-2xl border border-blue-200 bg-blue-50/20 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-blue-800">
            <span className="text-xs font-bold uppercase tracking-wider">Full vs Token</span>
            <CreditCard className="w-4 h-4 text-blue-600" />
          </div>
          <div className="flex items-baseline gap-3">
            <p className="text-xl font-bold text-slate-900">{formatINR(fullPaymentsTotal)}</p>
            <span className="text-xs text-slate-400">/ Token: {formatINR(tokenPaymentsTotal)}</span>
          </div>
          <span className="text-xs text-slate-500 font-medium">Payment structure split</span>
        </div>

        {/* Online vs Cash Split */}
        <div className="bg-white p-5 rounded-2xl border border-purple-200 bg-purple-50/20 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-purple-800">
            <span className="text-xs font-bold uppercase tracking-wider">UPI / Online vs Cash</span>
            <IndianRupee className="w-4 h-4 text-purple-600" />
          </div>
          <div className="flex items-baseline gap-3">
            <p className="text-xl font-bold text-[#1A3C5E]">{formatINR(onlinePaymentsTotal)}</p>
            <span className="text-xs text-slate-400">/ Cash: {formatINR(cashPaymentsTotal)}</span>
          </div>
          <span className="text-xs text-slate-500 font-medium">Digital vs Offline Cash</span>
        </div>

        {/* Outstanding Dues */}
        <div className="bg-white p-5 rounded-2xl border border-red-200 bg-red-50/30 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-red-800">
            <span className="text-xs font-bold uppercase tracking-wider">Pending Dues</span>
            <AlertTriangle className="w-4 h-4 text-red-600" />
          </div>
          <p className="text-3xl font-extrabold text-red-900">
            {formatINR(duesLeads.reduce((s, l) => s + Number(l.amount_due), 0))}
          </p>
          <span className="text-xs text-red-700 font-medium">{duesLeads.length} clients with dues</span>
        </div>
      </div>

      {/* Dues Management Section */}
      {duesLeads.length > 0 && (
        <div className="bg-white p-6 rounded-2xl border border-red-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-red-100 pb-3">
            <div className="flex items-center gap-2 text-red-900">
              <AlertTriangle className="w-5 h-5 text-red-600" />
              <h3 className="font-bold text-base">Outstanding Dues Collection Queue</h3>
            </div>
            <span className="text-xs font-bold bg-red-100 text-red-800 px-2.5 py-0.5 rounded-full">
              {duesLeads.length} Accounts Pending
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {duesLeads.map((dl) => (
              <div key={dl.id} className="p-4 bg-red-50/50 border border-red-200 rounded-xl space-y-3">
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">{dl.full_name}</h4>
                  <p className="text-xs text-slate-500">{SERVICE_OPTIONS.find((s) => s.key === dl.service_interest)?.label}</p>
                </div>

                <div className="flex justify-between text-xs pt-1 border-t border-red-100">
                  <span className="text-slate-600">Full Fee: {formatINR(dl.full_amount)}</span>
                  <span className="font-bold text-red-600">Due: {formatINR(dl.amount_due)}</span>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <button
                    onClick={() => {
                      setNewPayLeadId(dl.id);
                      setNewPayAmount(String(dl.amount_due));
                      setShowAddModal(true);
                    }}
                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg transition"
                  >
                    Mark Paid
                  </button>

                  <button
                    onClick={() => handleSendDueReminder(dl)}
                    className="px-3 py-1.5 bg-emerald-100 text-emerald-800 hover:bg-emerald-200 text-xs font-semibold rounded-lg transition flex items-center gap-1"
                  >
                    <MessageSquare className="w-3.5 h-3.5" /> Remind WhatsApp
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Payment Records Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden space-y-4">
        {/* Table Filters */}
        <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-50">
          <div className="relative flex-1 w-full max-w-md">
            <input
              type="text"
              placeholder="Search payment by client name or service..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-xs outline-none focus:border-amber-500"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <select
              value={filterMode}
              onChange={(e) => setFilterMode(e.target.value)}
              className="px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-700"
            >
              <option value="all">All Modes</option>
              <option value="upi">UPI / GPay / PhonePe</option>
              <option value="bank_transfer">Bank Transfer / IMPS</option>
              <option value="cash">Cash</option>
            </select>

            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-700"
            >
              <option value="all">All Types</option>
              <option value="full">Full Payment</option>
              <option value="token">Token Payment</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-100/80 text-slate-700 font-bold uppercase tracking-wider text-[11px] border-b border-slate-200">
              <tr>
                <th className="p-3.5">Date</th>
                <th className="p-3.5">Client Name</th>
                <th className="p-3.5">Service Particulars</th>
                <th className="p-3.5">Type</th>
                <th className="p-3.5">Mode</th>
                <th className="p-3.5">Reference No.</th>
                <th className="p-3.5 text-right">Amount (₹)</th>
                <th className="p-3.5 text-center">Receipt</th>
                <th className="p-3.5 text-center">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {filteredPayments.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400">
                    No payment records logged yet. Record a payment to generate receipts.
                  </td>
                </tr>
              ) : (
                filteredPayments.map((p) => {
                  const associatedLead = leads.find((l) => l.id === p.lead_id);

                  return (
                    <tr key={p.id} className="hover:bg-amber-50/30 transition">
                      <td className="p-3.5 font-medium text-slate-600">{formatDateIN(p.payment_date)}</td>
                      <td className="p-3.5 font-bold text-slate-900">{p.lead_name || associatedLead?.full_name || 'Client'}</td>
                      <td className="p-3.5 font-semibold text-slate-800">{p.service}</td>
                      <td className="p-3.5">
                        <span
                          className={`px-2 py-0.5 text-[10px] font-bold rounded-full uppercase ${
                            p.payment_type === 'full' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {p.payment_type}
                        </span>
                      </td>
                      <td className="p-3.5 font-semibold uppercase text-slate-700">{p.payment_mode}</td>
                      <td className="p-3.5 font-mono text-slate-600">{p.reference_no || 'N/A'}</td>
                      <td className="p-3.5 text-right font-extrabold text-emerald-700 text-sm">{formatINR(p.amount)}</td>
                      <td className="p-3.5 text-center">
                        <button
                          onClick={() => generatePaymentReceiptPDF(p, associatedLead)}
                          className="p-2 text-[#1A3C5E] hover:bg-amber-100 rounded-lg transition cursor-pointer"
                          title="Download PDF Receipt"
                        >
                          <FileText className="w-4 h-4" />
                        </button>
                      </td>
                      <td className="p-3.5 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => handleOpenEdit(p)}
                            className="p-1.5 text-amber-600 hover:bg-amber-50 rounded-lg transition cursor-pointer"
                            title="Edit Payment Amount / Details"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeletePayment(p)}
                            className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition cursor-pointer"
                            title="Delete Payment Entry"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
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

      {/* Record Payment Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-6 border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-lg font-bold font-serif-heading text-[#1A3C5E]">Record Client Dakshina</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600 text-sm">
                ✕
              </button>
            </div>

            <form onSubmit={handleRecordNewPayment} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Select Client Lead</label>
                <select
                  value={newPayLeadId}
                  onChange={(e) => {
                    const l = leads.find((item) => item.id === e.target.value);
                    setNewPayLeadId(e.target.value);
                    if (l) setNewPayAmount(String(l.amount_due > 0 ? l.amount_due : l.full_amount));
                  }}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none font-bold"
                >
                  {leads.map((l) => (
                    <option key={l.id} value={l.id}>
                      {l.full_name} ({SERVICE_OPTIONS.find((s) => s.key === l.service_interest)?.label})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Payment Type</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setNewPayType('full')}
                    className={`py-2 rounded-xl font-bold border transition ${
                      newPayType === 'full' ? 'bg-[#1A3C5E] text-amber-400 border-[#1A3C5E]' : 'bg-slate-50 border-slate-200 text-slate-600'
                    }`}
                  >
                    Full Payment
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewPayType('token')}
                    className={`py-2 rounded-xl font-bold border transition ${
                      newPayType === 'token' ? 'bg-[#1A3C5E] text-amber-400 border-[#1A3C5E]' : 'bg-slate-50 border-slate-200 text-slate-600'
                    }`}
                  >
                    Token / Advance
                  </button>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Amount Received (₹)</label>
                <input
                  type="number"
                  required
                  value={newPayAmount}
                  onChange={(e) => setNewPayAmount(e.target.value)}
                  className="w-full p-2.5 border border-slate-200 rounded-xl font-bold text-emerald-700 text-sm outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Payment Mode</label>
                <select
                  value={newPayMode}
                  onChange={(e) => setNewPayMode(e.target.value as any)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none font-medium"
                >
                  <option value="upi">UPI / GPay / PhonePe / Paytm</option>
                  <option value="bank_transfer">Direct Bank Transfer / NEFT / IMPS</option>
                  <option value="cash">Cash Handover</option>
                  <option value="card">Credit / Debit Card</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Transaction Ref / Cheque No.</label>
                <input
                  type="text"
                  value={newPayRef}
                  onChange={(e) => setNewPayRef(e.target.value)}
                  className="w-full p-2.5 border border-slate-200 rounded-xl outline-none font-mono"
                />
              </div>

              <div className="pt-2 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-slate-600 font-semibold rounded-xl hover:bg-slate-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={recording}
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow transition disabled:opacity-50 cursor-pointer"
                >
                  {recording ? 'Recording Payment...' : 'Record & Generate PDF Receipt'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Payment Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-6 border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                  <Edit3 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Edit Payment Entry</h3>
                  <p className="text-[11px] text-slate-500">Correct amount or transaction details</p>
                </div>
              </div>
              <button onClick={() => setShowEditModal(false)} className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Amount Received (₹) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  required
                  min={1}
                  value={editForm.amount}
                  onChange={(e) => setEditForm({ ...editForm, amount: Number(e.target.value) })}
                  className="w-full p-2.5 border border-slate-200 rounded-xl font-bold text-emerald-700 text-sm outline-none focus:border-amber-500"
                />
                <span className="text-[10px] text-slate-500">The lead's total paid amount and remaining balance will be automatically recalculated.</span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Payment Mode</label>
                  <select
                    value={editForm.payment_mode}
                    onChange={(e) => setEditForm({ ...editForm, payment_mode: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none font-medium text-xs focus:border-amber-500"
                  >
                    <option value="upi">UPI / GPay / Paytm</option>
                    <option value="bank_transfer">Bank Transfer / IMPS</option>
                    <option value="cash">Cash Handover</option>
                    <option value="card">Credit / Debit Card</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Payment Type</label>
                  <select
                    value={editForm.payment_type}
                    onChange={(e) => setEditForm({ ...editForm, payment_type: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none font-medium text-xs focus:border-amber-500"
                  >
                    <option value="full">Full Payment</option>
                    <option value="token">Token / Advance</option>
                    <option value="partial">Partial Installment</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Payment Date</label>
                  <input
                    type="date"
                    value={editForm.payment_date}
                    onChange={(e) => setEditForm({ ...editForm, payment_date: e.target.value })}
                    className="w-full p-2.5 border border-slate-200 rounded-xl outline-none text-xs focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">UTR / Ref No.</label>
                  <input
                    type="text"
                    value={editForm.reference_no}
                    onChange={(e) => setEditForm({ ...editForm, reference_no: e.target.value })}
                    className="w-full p-2.5 border border-slate-200 rounded-xl outline-none font-mono text-xs focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Notes / Reason for Edit</label>
                <textarea
                  rows={2}
                  value={editForm.notes}
                  onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })}
                  placeholder="e.g. Corrected mistyped amount"
                  className="w-full p-2.5 border border-slate-200 rounded-xl outline-none text-xs focus:border-amber-500"
                />
              </div>

              <div className="pt-2 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 text-slate-600 font-semibold rounded-xl hover:bg-slate-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingEdit}
                  className="px-5 py-2.5 bg-[#1A3C5E] hover:bg-[#15304b] text-amber-400 font-bold rounded-xl shadow transition disabled:opacity-50 flex items-center gap-2 cursor-pointer"
                >
                  {savingEdit ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      <span>Save Changes</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
