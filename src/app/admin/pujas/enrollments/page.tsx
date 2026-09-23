'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Users,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  IndianRupee,
  Phone,
  Mail,
  Video,
  Send,
  Download,
  AlertCircle,
  ExternalLink,
  MessageCircle,
  Sparkles,
  ArrowLeft,
  X,
  RefreshCw,
} from 'lucide-react';
import { PujaEnrollmentRecord, PujaRecord, PujaEnrollmentPaymentStatus } from '@/types';
import { formatINR, formatDateIN, formatDateTimeIN } from '@/lib/formatters';

export default function AdminEnrollmentsPage() {
  const [enrollments, setEnrollments] = useState<PujaEnrollmentRecord[]>([]);
  const [pujas, setPujas] = useState<PujaRecord[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [selectedPujaId, setSelectedPujaId] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Payment Update Modal
  const [editingEnrollment, setEditingEnrollment] = useState<PujaEnrollmentRecord | null>(null);
  const [newStatus, setNewStatus] = useState<PujaEnrollmentPaymentStatus>('paid');
  const [amountCollected, setAmountCollected] = useState<number>(0);
  const [paymentMode, setPaymentMode] = useState<string>('upi');
  const [paymentNotes, setPaymentNotes] = useState<string>('');
  const [isUpdatingPayment, setIsUpdatingPayment] = useState(false);

  // Meeting Link Broadcast Status
  const [sendingLinkId, setSendingLinkId] = useState<string | null>(null);
  const [linkSentSuccessMsg, setLinkSentSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      setLoading(true);
      const [resEnr, resPujas] = await Promise.all([
        fetch('/api/admin/pujas/enrollments').then((r) => r.json()),
        fetch('/api/admin/pujas').then((r) => r.json()),
      ]);

      if (resEnr.enrollments) setEnrollments(resEnr.enrollments);
      if (resPujas.pujas) setPujas(resPujas.pujas);
    } catch (err) {
      console.error('Error loading enrollments data:', err);
    } finally {
      setLoading(false);
    }
  }

  // Filtered List
  const filteredEnrollments = enrollments.filter((e) => {
    if (selectedPujaId !== 'all' && e.puja_id !== selectedPujaId) return false;
    if (selectedStatus !== 'all' && e.payment_status !== selectedStatus) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = e.devotee_name.toLowerCase().includes(q);
      const matchPhone = e.phone.includes(q);
      const matchBooking = e.booking_number.toLowerCase().includes(q);
      const matchGotra = (e.gotra || '').toLowerCase().includes(q);
      if (!matchName && !matchPhone && !matchBooking && !matchGotra) return false;
    }
    return true;
  });

  // KPI Calculations
  const totalCount = filteredEnrollments.length;
  const pendingCount = filteredEnrollments.filter((e) => e.payment_status === 'pending').length;
  const verifiedCount = filteredEnrollments.filter(
    (e) => e.payment_status === 'paid' || e.payment_status === 'verified'
  ).length;
  const totalCollected = filteredEnrollments
    .filter((e) => e.payment_status === 'paid' || e.payment_status === 'verified')
    .reduce((sum, e) => sum + (Number(e.payment_amount_collected) || Number(e.package_price) || 0), 0);

  // Open Payment Update Modal
  const openPaymentModal = (enr: PujaEnrollmentRecord) => {
    setEditingEnrollment(enr);
    setNewStatus(enr.payment_status === 'pending' ? 'paid' : enr.payment_status);
    setAmountCollected(enr.payment_amount_collected || enr.package_price || 0);
    setPaymentMode(enr.payment_mode || 'upi');
    setPaymentNotes(enr.payment_notes || '');
  };

  // Submit Payment Status Update
  const handleSavePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingEnrollment) return;

    setIsUpdatingPayment(true);
    try {
      const res = await fetch('/api/admin/pujas/enrollments', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: editingEnrollment.id,
          payment_status: newStatus,
          payment_amount_collected: Number(amountCollected),
          payment_mode: paymentMode,
          payment_notes: paymentNotes,
        }),
      });

      if (res.ok) {
        setEnrollments((prev) =>
          prev.map((item) =>
            item.id === editingEnrollment.id
              ? {
                  ...item,
                  payment_status: newStatus,
                  payment_amount_collected: Number(amountCollected),
                  payment_mode: paymentMode,
                  payment_notes: paymentNotes,
                }
              : item
          )
        );
        setEditingEnrollment(null);
      }
    } catch (err) {
      console.error('Failed to update payment:', err);
    } finally {
      setIsUpdatingPayment(false);
    }
  };

  // 1-Click Send Meeting Link via WhatsApp
  const handleSendMeetingLink = async (enr: PujaEnrollmentRecord) => {
    setSendingLinkId(enr.id);
    setLinkSentSuccessMsg(null);

    try {
      const res = await fetch('/api/admin/pujas/send-link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          enrollment_id: enr.id,
          phone: enr.phone,
          devotee_name: enr.devotee_name,
          gotra: enr.gotra,
          puja_title: enr.puja?.title || 'Vedic Mahapuja',
          meeting_link: enr.puja?.meeting_link || 'https://meet.google.com/dharmik-live',
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setEnrollments((prev) =>
          prev.map((item) =>
            item.id === enr.id
              ? { ...item, meeting_link_sent: true, meeting_link_sent_at: new Date().toISOString() }
              : item
          )
        );

        if (data.channel === 'manual_link' && data.link) {
          window.open(data.link, '_blank');
        }

        setLinkSentSuccessMsg(`Meeting link prepared for ${enr.devotee_name}!`);
        setTimeout(() => setLinkSentSuccessMsg(null), 4000);
      }
    } catch (err) {
      console.error('Error sending meeting link:', err);
    } finally {
      setSendingLinkId(null);
    }
  };

  // 1-Click Send WhatsApp Payment Reminder
  const handleSendPaymentReminder = (enr: PujaEnrollmentRecord) => {
    const text = encodeURIComponent(
      `नमस्ते ${enr.devotee_name} जी 🙏\n\nDharmikshree Vedic Seva से आपका '${enr.puja?.title || 'Mahapuja'}' (Package: ${enr.package_name} - ₹${enr.package_price}) हेतु संकल्प दर्ज कर लिया गया है।\n\nकृपया अपनी दक्षिणा राशि ₹${enr.package_price} हमारे UPI: dharmikshree@upi पर प्रेषित कर स्क्रीनशॉट साझा करें ताकि पंडितजी की सूची में आपका संकल्प सुनिश्चित हो सके।\n\nजय श्री महाकाल 🙏`
    );
    window.open(`https://wa.me/91${enr.phone.replace(/\D/g, '')}?text=${text}`, '_blank');
  };

  // Export Sankalp List for Purohit (CSV)
  const handleExportCSV = () => {
    const headers = [
      'Booking Number',
      'Puja Title',
      'Devotee Name',
      'Gotra',
      'Family Members (For Sankalp)',
      'Sankalp Wish',
      'Phone / WhatsApp',
      'Package',
      'Amount',
      'Payment Status',
      'Prasad Address',
    ];

    const rows = filteredEnrollments.map((e) => [
      `"${e.booking_number}"`,
      `"${e.puja?.title || ''}"`,
      `"${e.devotee_name}"`,
      `"${e.gotra || 'Kashyap'}"`,
      `"${(e.family_members || []).map((m) => m.name).join(', ')}"`,
      `"${e.sankalp_wish || ''}"`,
      `"${e.phone}"`,
      `"${e.package_name}"`,
      e.package_price,
      e.payment_status,
      `"${e.prasad_address ? `${e.prasad_address.house_street || ''} ${e.prasad_address.city || ''} ${e.prasad_address.pincode || ''}` : ''}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Sankalp_List_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/pujas"
            className="p-2 rounded-lg hover:bg-slate-100 text-slate-600 transition-colors"
            title="Back to Pujas"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-bold font-serif-heading text-slate-900">
                Devotee Puja Enrollments
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-800">
                {totalCount} Total
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Manage devotee registrations, update payment statuses, and send live event links via WhatsApp.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={loadData}
            className="p-2 rounded-lg border border-slate-300 hover:bg-slate-100 text-slate-700 transition-colors"
            title="Refresh Data"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={handleExportCSV}
            className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg shadow-xs flex items-center gap-1.5 transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>Export Sankalp Sheet (Panditji)</span>
          </button>
        </div>
      </div>

      {linkSentSuccessMsg && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
          <span>{linkSentSuccessMsg}</span>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="text-xs font-medium text-slate-500 mb-1">Total Registered</div>
          <div className="text-2xl font-bold text-slate-900">{totalCount}</div>
          <div className="text-[11px] text-slate-500 mt-1">Devotees</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="text-xs font-medium text-amber-600 mb-1">Pending Payment</div>
          <div className="text-2xl font-bold text-amber-700">{pendingCount}</div>
          <div className="text-[11px] text-amber-600 mt-1">Call/WhatsApp to confirm</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="text-xs font-medium text-emerald-600 mb-1">Paid & Verified</div>
          <div className="text-2xl font-bold text-emerald-700">{verifiedCount}</div>
          <div className="text-[11px] text-emerald-600 mt-1">Sankalp confirmed</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="text-xs font-medium text-slate-500 mb-1">Total Collected</div>
          <div className="text-2xl font-bold text-slate-900">{formatINR(totalCollected)}</div>
          <div className="text-[11px] text-slate-500 mt-1">Dakshina received</div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Search */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search Name, Phone, Gotra, Ref..."
            className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:border-blue-600"
          />
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          {/* Filter by Puja */}
          <select
            value={selectedPujaId}
            onChange={(e) => setSelectedPujaId(e.target.value)}
            className="px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none bg-white text-slate-700"
          >
            <option value="all">All Puja Events</option>
            {pujas.map((p) => (
              <option key={p.id} value={p.id}>
                {p.title}
              </option>
            ))}
          </select>

          {/* Filter by Payment Status */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none bg-white text-slate-700"
          >
            <option value="all">All Payment Statuses</option>
            <option value="pending">Pending (Unpaid)</option>
            <option value="paid">Paid</option>
            <option value="verified">Verified</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Enrollments Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-400">Loading devotee enrollments...</div>
        ) : filteredEnrollments.length === 0 ? (
          <div className="p-12 text-center text-slate-500">
            No enrollments found matching current filters.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-slate-50 text-slate-600 text-[11px] uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Booking Ref</th>
                  <th className="py-3 px-4">Devotee Details</th>
                  <th className="py-3 px-4">Gotra & Family</th>
                  <th className="py-3 px-4">Puja & Package</th>
                  <th className="py-3 px-4">Dakshina & Status</th>
                  <th className="py-3 px-4">Meeting Stream Link</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredEnrollments.map((enr) => {
                  const cleanPhone = enr.phone.replace(/\D/g, '');

                  return (
                    <tr key={enr.id} className="hover:bg-slate-50/60 transition-colors">
                      {/* Booking Number & Date */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="font-mono font-bold text-slate-900">{enr.booking_number}</div>
                        <div className="text-[10px] text-slate-400">
                          {new Date(enr.created_at).toLocaleDateString('en-IN')}
                        </div>
                      </td>

                      {/* Devotee Info */}
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-900">{enr.devotee_name}</div>
                        <div className="flex items-center gap-2 text-xs text-slate-600 mt-0.5">
                          <a
                            href={`https://wa.me/91${cleanPhone}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-emerald-700 hover:underline flex items-center gap-0.5 font-medium"
                          >
                            <MessageCircle className="w-3 h-3 text-emerald-600" />
                            <span>+91 {cleanPhone}</span>
                          </a>
                        </div>
                        {enr.email && <div className="text-[11px] text-slate-400">{enr.email}</div>}
                      </td>

                      {/* Gotra & Family Members */}
                      <td className="py-3.5 px-4">
                        <div className="font-medium text-slate-800">
                          Gotra: <strong className="text-orange-700 font-semibold">{enr.gotra || 'Kashyap'}</strong>
                        </div>
                        {enr.family_members && enr.family_members.length > 0 ? (
                          <div className="text-[11px] text-slate-500 mt-0.5 max-w-xs truncate">
                            +{enr.family_members.map((m) => m.name).join(', ')}
                          </div>
                        ) : null}
                        {enr.sankalp_wish && (
                          <div className="text-[10px] text-slate-400 italic line-clamp-1 mt-0.5">
                            &quot;{enr.sankalp_wish}&quot;
                          </div>
                        )}
                      </td>

                      {/* Puja & Package */}
                      <td className="py-3.5 px-4">
                        <div className="font-medium text-slate-900 truncate max-w-[180px]">
                          {enr.puja?.title || 'Puja Event'}
                        </div>
                        <div className="text-[11px] text-slate-500 font-light truncate max-w-[180px]">
                          {enr.package_name}
                        </div>
                      </td>

                      {/* Dakshina & Payment Status */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="font-serif font-bold text-slate-900 text-sm">
                          ₹{enr.package_price}
                        </div>
                        <button
                          type="button"
                          onClick={() => openPaymentModal(enr)}
                          className={`mt-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase transition-colors cursor-pointer ${
                            enr.payment_status === 'pending'
                              ? 'bg-amber-100 text-amber-800 hover:bg-amber-200'
                              : enr.payment_status === 'verified' || enr.payment_status === 'paid'
                              ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                              : 'bg-slate-100 text-slate-800'
                          }`}
                          title="Click to change payment status"
                        >
                          {enr.payment_status}
                        </button>
                      </td>

                      {/* Meeting Stream Link */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {enr.meeting_link_sent ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Link Sent
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleSendMeetingLink(enr)}
                            disabled={sendingLinkId === enr.id}
                            className="inline-flex items-center gap-1 text-[11px] font-semibold text-purple-700 bg-purple-50 hover:bg-purple-100 px-2.5 py-1 rounded transition-colors"
                          >
                            <Send className="w-3 h-3" />
                            <span>{sendingLinkId === enr.id ? 'Sending...' : 'Send WhatsApp Link'}</span>
                          </button>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          {enr.payment_status === 'pending' && (
                            <button
                              type="button"
                              onClick={() => handleSendPaymentReminder(enr)}
                              className="px-2.5 py-1 bg-amber-50 hover:bg-amber-100 text-amber-800 text-[11px] font-semibold rounded flex items-center gap-1 transition-colors"
                              title="Send UPI payment reminder on WhatsApp"
                            >
                              <IndianRupee className="w-3 h-3 text-amber-700" />
                              <span>Remind UPI</span>
                            </button>
                          )}

                          <button
                            type="button"
                            onClick={() => openPaymentModal(enr)}
                            className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-semibold rounded transition-colors"
                          >
                            Update
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Payment Update Modal */}
      {editingEnrollment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="bg-white rounded-xl max-w-md w-full p-5 space-y-4 shadow-xl border border-slate-200 text-left">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">Update Payment Status</h3>
                <p className="text-xs text-slate-500">
                  {editingEnrollment.devotee_name} ({editingEnrollment.booking_number})
                </p>
              </div>
              <button
                type="button"
                onClick={() => setEditingEnrollment(null)}
                className="text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSavePayment} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Payment Status</label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs bg-white font-medium"
                >
                  <option value="pending">Pending (Unpaid)</option>
                  <option value="paid">Paid (Received via UPI/Cash)</option>
                  <option value="verified">Verified & Bank Checked</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Dakshina Amount Collected (₹)
                </label>
                <input
                  type="number"
                  value={amountCollected}
                  onChange={(e) => setAmountCollected(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs font-bold text-emerald-700"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Payment Method</label>
                <select
                  value={paymentMode}
                  onChange={(e) => setPaymentMode(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs bg-white"
                >
                  <option value="upi">UPI (GPay / PhonePe / Paytm)</option>
                  <option value="bank_transfer">Bank NEFT / IMPS</option>
                  <option value="cash">Cash Contribution</option>
                  <option value="pending">Pending</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Payment Reference / Notes</label>
                <textarea
                  value={paymentNotes}
                  onChange={(e) => setPaymentNotes(e.target.value)}
                  rows={2}
                  placeholder="e.g. UPI Ref: 9841029312 or received by Admin"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingEnrollment(null)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 text-xs font-semibold rounded-lg hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUpdatingPayment}
                  className="px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold rounded-lg shadow-xs disabled:opacity-50"
                >
                  {isUpdatingPayment ? 'Saving...' : 'Update Status'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
