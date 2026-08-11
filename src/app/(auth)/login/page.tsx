'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Sparkles, Shield, UserCheck, Lock, ArrowRight, CheckCircle2 } from 'lucide-react';
import { MOCK_USERS } from '@/lib/mock-data';
import { UserRole } from '@/types';

export default function StaffLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('superadmin@dharmikshree.com');
  const [password, setPassword] = useState('password123');
  const [selectedRole, setSelectedRole] = useState<UserRole>('super_admin');
  const [loading, setLoading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Set demo role cookie
    document.cookie = `dharmik_demo_role=${selectedRole}; path=/; max-age=86400`;

    setTimeout(() => {
      router.push('/admin/dashboard');
    }, 600);
  };

  const handleQuickRoleSelect = (role: UserRole) => {
    setSelectedRole(role);
    document.cookie = `dharmik_demo_role=${role}; path=/; max-age=86400`;
    router.push('/admin/dashboard');
  };

  return (
    <main className="min-h-screen bg-slate-950 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Gold Gradient Glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-amber-500/10 blur-[120px] rounded-full pointer-events-none" />

      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl relative z-10 space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 bg-amber-500/10 border border-amber-500/30 rounded-2xl flex items-center justify-center mx-auto text-amber-400">
            <Sparkles className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold font-serif-heading text-white">Dharmikshree CRM</h1>
          <p className="text-slate-400 text-xs uppercase tracking-widest font-semibold">Staff & Admin Access Portal</p>
        </div>

        {/* Demo Role Switcher Quick Bar */}
        <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-3.5 space-y-2">
          <p className="text-[11px] font-bold text-amber-400 uppercase tracking-wider text-center">
            🚀 Direct Demo Access (Select Role)
          </p>
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => handleQuickRoleSelect('super_admin')}
              className="py-2 px-2 text-[11px] font-semibold bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 rounded-xl transition text-center"
            >
              👑 Owner (Super Admin)
            </button>
            <button
              onClick={() => handleQuickRoleSelect('admin')}
              className="py-2 px-2 text-[11px] font-semibold bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/40 text-blue-300 rounded-xl transition text-center"
            >
              💼 Admin (K)
            </button>
            <button
              onClick={() => handleQuickRoleSelect('team_member')}
              className="py-2 px-2 text-[11px] font-semibold bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-emerald-300 rounded-xl transition text-center"
            >
              👥 Team (N / D)
            </button>
          </div>
        </div>

        {/* Standard Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
              Email Address
            </label>
            <div className="relative">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl text-white text-sm outline-none transition"
              />
              <UserCheck className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
              Password
            </label>
            <div className="relative">
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl text-white text-sm outline-none transition"
              />
              <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
              Role Permission Mode
            </label>
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value as UserRole)}
              className="w-full px-4 py-3 bg-slate-950 border border-slate-800 text-white rounded-xl text-sm outline-none"
            >
              <option value="super_admin">SUPER ADMIN (Full Owner Access)</option>
              <option value="admin">ADMIN (K - Senior Management)</option>
              <option value="team_member">TEAM MEMBER (N / D - Assigned Leads Only)</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-xl shadow-lg transition flex items-center justify-center gap-2"
          >
            {loading ? 'Authenticating...' : 'Sign In to Admin Panel'}
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="text-center">
          <a href="/portal-login" className="text-xs text-slate-400 hover:text-amber-400 transition">
            Looking for Customer Client Portal Login? Click here →
          </a>
        </div>
      </div>
    </main>
  );
}
