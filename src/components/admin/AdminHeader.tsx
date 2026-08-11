'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Search, Plus, Bell, Shield, UserCircle, LogOut } from 'lucide-react';
import { UserRole } from '@/types';

interface AdminHeaderProps {
  userRole: UserRole;
  userName: string;
}

export function AdminHeader({ userRole, userName }: AdminHeaderProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');

  const handleRoleSwitch = (newRole: UserRole) => {
    document.cookie = `dharmik_demo_role=${newRole}; path=/; max-age=86400`;
    window.location.reload();
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/admin/leads?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between gap-4 sticky top-0 z-30 shadow-xs">
      {/* Search Input */}
      <form onSubmit={handleSearchSubmit} className="flex-1 max-w-md relative">
        <input
          type="text"
          placeholder="Search leads by name, phone (+91), city, or service..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2 bg-slate-100/80 focus:bg-white border border-slate-200 focus:border-amber-500 rounded-xl text-xs outline-none transition"
        />
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-2.5" />
      </form>

      {/* Right Controls */}
      <div className="flex items-center gap-3">
        {/* Quick Role Switcher for Demo */}
        <div className="flex items-center gap-1 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-xl text-xs">
          <Shield className="w-3.5 h-3.5 text-amber-600" />
          <span className="text-[11px] font-semibold text-amber-900">Switch Role:</span>
          <select
            value={userRole}
            onChange={(e) => handleRoleSwitch(e.target.value as UserRole)}
            className="bg-transparent text-xs font-bold text-amber-900 outline-none cursor-pointer"
          >
            <option value="super_admin">Super Admin (Owner)</option>
            <option value="admin">Admin (K)</option>
            <option value="team_member">Team Member (N/D)</option>
          </select>
        </div>

        {/* Create Lead Button */}
        <Link
          href="/admin/leads/new"
          className="flex items-center gap-1.5 px-3.5 py-2 bg-[#1A3C5E] hover:bg-[#15304b] text-white text-xs font-bold rounded-xl shadow-xs transition"
        >
          <Plus className="w-4 h-4 text-amber-400" />
          New Lead
        </Link>

        {/* Reminders Bell */}
        <Link
          href="/admin/reminders"
          className="p-2 text-slate-600 hover:text-amber-600 bg-slate-100 hover:bg-amber-50 rounded-xl transition relative"
          title="Today's Reminders"
        >
          <Bell className="w-4 h-4" />
          <span className="w-2 h-2 bg-red-500 rounded-full absolute top-1.5 right-1.5 animate-ping" />
          <span className="w-2 h-2 bg-red-500 rounded-full absolute top-1.5 right-1.5" />
        </Link>

        {/* User Profile */}
        <div className="flex items-center gap-2 border-l border-slate-200 pl-3">
          <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-800 font-bold flex items-center justify-center text-xs border border-amber-300">
            {userName.charAt(0)}
          </div>
          <button
            onClick={() => {
              document.cookie = 'dharmik_demo_role=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
              router.push('/login');
            }}
            className="p-2 text-slate-400 hover:text-red-600 transition"
            title="Sign Out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
}
