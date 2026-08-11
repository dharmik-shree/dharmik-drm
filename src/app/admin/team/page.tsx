'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  UserCog,
  UserPlus,
  Shield,
  Activity,
  CheckCircle2,
  Lock,
  Mail,
  Phone,
  Sparkles,
} from 'lucide-react';
import { formatPhoneIN, formatDateTimeIN } from '@/lib/formatters';
import { UserRole, UserProfile } from '@/types';

export default function TeamPage() {
  const router = useRouter();

  const [userRole, setUserRole] = useState<UserRole>('super_admin');
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [loading, setLoading] = useState(true);

  // Form State
  const [newMemberName, setNewMemberName] = useState('');
  const [newMemberEmail, setNewMemberEmail] = useState('');
  const [newMemberPhone, setNewMemberPhone] = useState('');
  const [newMemberRole, setNewMemberRole] = useState<UserRole>('team_member');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const match = document.cookie.match(/dharmik_demo_role=([^;]+)/);
    if (match) {
      const r = match[1] as UserRole;
      setUserRole(r);
      if (r !== 'super_admin') {
        router.push('/admin/dashboard');
      }
    }

    loadTeam();
  }, [router]);

  async function loadTeam() {
    try {
      setLoading(true);
      const res = await fetch('/api/team');
      const data = await res.json();
      if (data.team) setUsers(data.team);
    } catch (err) {
      console.error('Error fetching team from Supabase:', err);
    } finally {
      setLoading(false);
    }
  }

  const handleCreateTeamMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMemberName.trim()) return;

    setSubmitting(true);
    try {
      const res = await fetch('/api/team', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          full_name: newMemberName,
          email: newMemberEmail,
          phone: newMemberPhone,
          whatsapp: newMemberPhone,
          role: newMemberRole,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create team member');

      if (data.user) setUsers([...users, data.user]);
      setShowAddModal(false);
      setNewMemberName('');
      setNewMemberEmail('');
      setNewMemberPhone('');
    } catch (err: any) {
      alert(err.message || 'Error creating team member in Supabase');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-8 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-2xl font-bold font-serif-heading text-[#1A3C5E]">
            Team Management & Activity Monitor
          </h1>
          <p className="text-slate-500 text-xs">
            Manage team members, roles, lead assignments, and audit activity logs (Live Supabase Connected).
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded-xl shadow transition flex items-center gap-1.5"
        >
          <UserPlus className="w-4 h-4" /> Add Team Member
        </button>
      </div>

      {/* Team Members List Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-200 bg-slate-50">
          <h3 className="font-bold text-slate-900 text-sm">Active Staff Members ({users.length})</h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-100/80 text-slate-700 font-bold uppercase tracking-wider text-[11px] border-b border-slate-200">
              <tr>
                <th className="p-3.5">Staff Member</th>
                <th className="p-3.5">Assigned Role</th>
                <th className="p-3.5">Phone / WhatsApp</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5">Joined Date</th>
                <th className="p-3.5 text-center">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">Loading team members from live Supabase...</td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">No staff members in live database. Add a team member to get started.</td>
                </tr>
              ) : (
                users.map((u) => (
                  <tr key={u.id} className="hover:bg-amber-50/30 transition">
                    <td className="p-3.5 font-bold text-slate-900">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-[#1A3C5E] text-amber-300 font-bold flex items-center justify-center text-xs">
                          {u.full_name.charAt(0)}
                        </div>
                        <span>{u.full_name}</span>
                      </div>
                    </td>

                    <td className="p-3.5">
                      <span className="px-2.5 py-1 text-[10px] font-bold rounded-full uppercase bg-amber-100 text-amber-900 border border-amber-200">
                        {u.role.replace('_', ' ')}
                      </span>
                    </td>

                    <td className="p-3.5 font-medium text-slate-700">{formatPhoneIN(u.phone)}</td>

                    <td className="p-3.5">
                      <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-emerald-100 text-emerald-800">
                        Active
                      </span>
                    </td>

                    <td className="p-3.5 text-slate-500">{formatDateTimeIN(u.created_at)}</td>

                    <td className="p-3.5 text-center">
                      <button
                        onClick={() => alert(`Editing permissions for ${u.full_name}`)}
                        className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg transition text-xs"
                      >
                        Configure
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Permissions Matrix Card */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <h3 className="font-bold text-slate-900 text-base">Role Permissions Access Matrix</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border border-slate-200 rounded-xl overflow-hidden">
            <thead className="bg-slate-100 font-bold uppercase">
              <tr>
                <th className="p-3">Capability / Module</th>
                <th className="p-3 text-center">Super Admin (Owner)</th>
                <th className="p-3 text-center">Admin (K)</th>
                <th className="p-3 text-center">Team Member (N/D)</th>
                <th className="p-3 text-center">Customer Portal</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              <tr>
                <td className="p-3 font-semibold">View All Leads & Pipeline</td>
                <td className="p-3 text-center text-emerald-600 font-bold">✓ Full</td>
                <td className="p-3 text-center text-emerald-600 font-bold">✓ Full</td>
                <td className="p-3 text-center text-amber-600 font-bold">Assigned Only</td>
                <td className="p-3 text-center text-slate-400">✗ None</td>
              </tr>
              <tr>
                <td className="p-3 font-semibold">Financial Revenue & Dues</td>
                <td className="p-3 text-center text-emerald-600 font-bold">✓ Full</td>
                <td className="p-3 text-center text-emerald-600 font-bold">✓ Full</td>
                <td className="p-3 text-center text-slate-400 font-bold">Hidden</td>
                <td className="p-3 text-center text-slate-400">Own Receipts Only</td>
              </tr>
              <tr>
                <td className="p-3 font-semibold">Team Management & System Config</td>
                <td className="p-3 text-center text-emerald-600 font-bold">✓ Full</td>
                <td className="p-3 text-center text-slate-400 font-bold">Blocked</td>
                <td className="p-3 text-center text-slate-400 font-bold">Blocked</td>
                <td className="p-3 text-center text-slate-400">Blocked</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Team Member Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-6 border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-lg font-bold font-serif-heading text-[#1A3C5E]">Create Staff Account</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 text-sm">
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateTeamMember} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Neha Gupta"
                  value={newMemberName}
                  onChange={(e) => setNewMemberName(e.target.value)}
                  className="w-full p-2.5 border border-slate-200 rounded-xl outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  placeholder="neha@dharmikshree.com"
                  value={newMemberEmail}
                  onChange={(e) => setNewMemberEmail(e.target.value)}
                  className="w-full p-2.5 border border-slate-200 rounded-xl outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">WhatsApp Phone Number</label>
                <input
                  type="tel"
                  required
                  placeholder="+91 98765 43210"
                  value={newMemberPhone}
                  onChange={(e) => setNewMemberPhone(e.target.value)}
                  className="w-full p-2.5 border border-slate-200 rounded-xl outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Assign Role</label>
                <select
                  value={newMemberRole}
                  onChange={(e) => setNewMemberRole(e.target.value as UserRole)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none font-bold"
                >
                  <option value="admin">ADMIN (Senior Management - e.g. K)</option>
                  <option value="team_member">TEAM MEMBER (Consultation / Puja Staff - e.g. N/D)</option>
                </select>
              </div>

              <div className="pt-2 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-slate-600 font-semibold hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-xl shadow transition disabled:opacity-50"
                >
                  {submitting ? 'Creating in Supabase...' : 'Save & Add Staff'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
