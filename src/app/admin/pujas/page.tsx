'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Flame,
  Plus,
  Calendar,
  MapPin,
  Users,
  IndianRupee,
  Clock,
  Sparkles,
  Edit,
  Trash2,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  Video,
  Eye,
  Filter,
} from 'lucide-react';
import { PujaRecord, PujaEnrollmentRecord } from '@/types';
import { formatINR, formatDateIN } from '@/lib/formatters';

export default function AdminPujasPage() {
  const [pujas, setPujas] = useState<PujaRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  useEffect(() => {
    loadPujas();
  }, []);

  async function loadPujas() {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/pujas');
      const data = await res.json();
      if (data.pujas) {
        setPujas(data.pujas);
      }
    } catch (err) {
      console.error('Error loading admin pujas:', err);
    } finally {
      setLoading(false);
    }
  }

  async function handleDeletePuja(id: string) {
    try {
      const res = await fetch(`/api/admin/pujas/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setPujas((prev) => prev.filter((p) => p.id !== id));
        setDeleteConfirmId(null);
      }
    } catch (err) {
      console.error('Error deleting puja:', err);
    }
  }

  // Calculate Metrics
  const totalActivePujas = pujas.filter((p) => p.is_active).length;
  const totalEnrollments = pujas.reduce((sum, p) => sum + (p.enrollments_count || 0), 0);
  const totalRevenue = pujas.reduce((sum, p) => sum + (p.revenue_collected || 0), 0);

  return (
    <div className="space-y-6">
      {/* Top Banner / Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-orange-100 text-orange-700 flex items-center justify-center">
              <Flame className="w-5 h-5" />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold font-serif-heading text-slate-900">
              Puja Seva & Event Operations
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500">
            Publish upcoming temple pujas, manage packages, monitor devotee enrollments, and broadcast live event links.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Link
            href="/admin/pujas/enrollments"
            className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5"
          >
            <Users className="w-4 h-4 text-slate-600" />
            <span>Devotee Enrollments</span>
          </Link>
          <Link
            href="/admin/pujas/new"
            className="px-4 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Create New Puja</span>
          </Link>
        </div>
      </div>

      {/* KPI Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium">Active Pujas</span>
            <Flame className="w-4 h-4 text-orange-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900">{totalActivePujas}</div>
          <div className="text-[11px] text-slate-500 mt-1">Listed on Client Website</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium">Total Enrollments</span>
            <Users className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900">{totalEnrollments}</div>
          <div className="text-[11px] text-slate-500 mt-1">Devotees registered</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium">Verified Dakshina</span>
            <IndianRupee className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold text-emerald-700">{formatINR(totalRevenue)}</div>
          <div className="text-[11px] text-emerald-600 mt-1">Payment collected</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium">Live Broadcasts</span>
            <Video className="w-4 h-4 text-purple-600" />
          </div>
          <div className="text-2xl font-bold text-purple-700">Google Meet / Live</div>
          <div className="text-[11px] text-slate-500 mt-1">1-click WhatsApp broadcast</div>
        </div>
      </div>

      {/* Pujas List Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <span>Puja Catalog & Status</span>
            <span className="text-xs font-normal text-slate-500">({pujas.length} total)</span>
          </h2>
          <button
            type="button"
            onClick={loadPujas}
            className="text-xs text-blue-600 hover:text-blue-800 font-medium"
          >
            Refresh
          </button>
        </div>

        {loading ? (
          <div className="p-12 text-center text-slate-400">Loading live pujas from Supabase...</div>
        ) : pujas.length === 0 ? (
          <div className="p-12 text-center text-slate-500">
            No pujas found. Click &quot;Create New Puja&quot; to publish your first spiritual event.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-slate-50 text-slate-600 text-[11px] uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Puja Title & Temple</th>
                  <th className="py-3 px-4">Event Date</th>
                  <th className="py-3 px-4">Starting Price</th>
                  <th className="py-3 px-4">Packages</th>
                  <th className="py-3 px-4">Enrollments</th>
                  <th className="py-3 px-4">Status & Flags</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {pujas.map((puja) => {
                  const eventDate = new Date(puja.event_date);
                  const formattedDate = eventDate.toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  });

                  return (
                    <tr key={puja.id} className="hover:bg-slate-50/60 transition-colors">
                      {/* Image & Title */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="relative w-12 h-12 rounded-lg overflow-hidden shrink-0 border border-slate-200 bg-slate-100">
                            <Image
                              src={puja.banner_image_url}
                              alt={puja.title}
                              fill
                              sizes="48px"
                              className="object-cover"
                            />
                          </div>
                          <div>
                            <div className="font-semibold text-slate-900 max-w-xs truncate">
                              {puja.title}
                            </div>
                            <div className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                              <MapPin className="w-3 h-3 text-slate-400" />
                              <span className="truncate max-w-[200px]">{puja.location_name}</span>
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Event Date */}
                      <td className="py-3.5 px-4 text-slate-700 whitespace-nowrap">
                        <div className="font-medium">{formattedDate}</div>
                        {puja.tithi_details && (
                          <div className="text-[10px] text-slate-500 truncate max-w-[140px]">
                            {puja.tithi_details}
                          </div>
                        )}
                      </td>

                      {/* Starting Price */}
                      <td className="py-3.5 px-4 font-semibold text-slate-900">
                        ₹{puja.starting_price}
                      </td>

                      {/* Packages count */}
                      <td className="py-3.5 px-4 text-slate-600">
                        <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-medium text-xs">
                          {puja.packages?.length || 0} packages
                        </span>
                      </td>

                      {/* Enrollments */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1.5 font-bold text-slate-800">
                          <Users className="w-3.5 h-3.5 text-blue-600" />
                          <span>{puja.enrollments_count || 0}</span>
                        </div>
                        {puja.revenue_collected ? (
                          <div className="text-[10px] text-emerald-600 font-medium">
                            ₹{puja.revenue_collected} paid
                          </div>
                        ) : null}
                      </td>

                      {/* Status & Flags */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="flex flex-col gap-1 items-start">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                              puja.puja_status === 'upcoming'
                                ? 'bg-blue-100 text-blue-800'
                                : puja.puja_status === 'ongoing'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-slate-100 text-slate-800'
                            }`}
                          >
                            {puja.puja_status}
                          </span>
                          {puja.is_featured && (
                            <span className="text-[10px] text-orange-700 font-medium flex items-center gap-0.5">
                              <Sparkles className="w-2.5 h-2.5" /> Homepage Slider
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Link
                            href={`/admin/pujas/enrollments?puja_id=${puja.id}`}
                            className="p-1.5 rounded hover:bg-slate-100 text-slate-600 hover:text-blue-600 transition-colors"
                            title="View Enrollments"
                          >
                            <Users className="w-4 h-4" />
                          </Link>
                          <Link
                            href={`/admin/pujas/${puja.id}/edit`}
                            className="p-1.5 rounded hover:bg-slate-100 text-slate-600 hover:text-emerald-700 transition-colors"
                            title="Edit Puja"
                          >
                            <Edit className="w-4 h-4" />
                          </Link>
                          <button
                            type="button"
                            onClick={() => setDeleteConfirmId(puja.id)}
                            className="p-1.5 rounded hover:bg-red-50 text-slate-400 hover:text-red-600 transition-colors"
                            title="Delete Puja"
                          >
                            <Trash2 className="w-4 h-4" />
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

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="bg-white rounded-xl max-w-sm w-full p-5 space-y-4 shadow-xl border border-slate-200">
            <div className="flex items-center gap-3 text-red-600">
              <AlertCircle className="w-6 h-6 shrink-0" />
              <h3 className="text-base font-bold text-slate-900">Delete Puja Event?</h3>
            </div>
            <p className="text-xs text-slate-600">
              Are you sure you want to delete this Puja? Associated packages will also be removed.
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeleteConfirmId(null)}
                className="px-4 py-2 border border-slate-300 text-slate-700 text-xs font-semibold rounded-lg hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleDeletePuja(deleteConfirmId)}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold rounded-lg"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
