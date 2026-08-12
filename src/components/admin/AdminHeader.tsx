'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Search, Plus, Bell, Shield, UserCircle, LogOut, AlertTriangle } from 'lucide-react';
import { UserRole } from '@/types';
import { createClient } from '@/lib/supabase/client';

interface AdminHeaderProps {
  userRole: UserRole;
  userName: string;
}

export function AdminHeader({ userRole, userName }: AdminHeaderProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isNotificationsChecked, setIsNotificationsChecked] = useState(false);

  useEffect(() => {
    // Check if user already dismissed notifications in this session
    const checked = sessionStorage.getItem('dharmik_reminders_checked');
    if (checked === 'true') {
      setIsNotificationsChecked(true);
    }

    // Fetch live today's due reminders count
    fetch('/api/reminders?status=pending')
      .then((res) => res.json())
      .then((data) => {
        if (data.reminders) {
          const todayStr = new Date().toDateString();
          const dueToday = data.reminders.filter(
            (r: any) => new Date(r.scheduled_for).toDateString() === todayStr
          ).length;
          setUnreadCount(dueToday);
        }
      })
      .catch(() => {});
  }, []);

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

  const handleBellClick = () => {
    sessionStorage.setItem('dharmik_reminders_checked', 'true');
    setIsNotificationsChecked(true);
    router.push('/admin/reminders');
  };

  const handleConfirmLogout = async () => {
    try {
      const supabase = createClient();
      await supabase.auth.signOut();
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      document.cookie = 'dharmik_demo_role=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
      window.location.href = '/login';
    }
  };

  const showDot = unreadCount > 0 && !isNotificationsChecked;

  return (
    <>
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
          <button
            type="button"
            onClick={handleBellClick}
            className="p-2 text-slate-600 hover:text-amber-600 bg-slate-100 hover:bg-amber-50 rounded-xl transition relative cursor-pointer"
            title="Today's Action Agenda & Notifications"
          >
            <Bell className="w-4 h-4" />
            {showDot && (
              <>
                <span className="w-2.5 h-2.5 bg-red-500 rounded-full absolute top-1 right-1 animate-ping" />
                <span className="w-2.5 h-2.5 bg-red-500 rounded-full absolute top-1 right-1 flex items-center justify-center text-[8px] font-bold text-white">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              </>
            )}
          </button>

          {/* User Profile */}
          <div className="flex items-center gap-2 border-l border-slate-200 pl-3">
            <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-800 font-bold flex items-center justify-center text-xs border border-amber-300">
              {userName.charAt(0)}
            </div>
            <button
              onClick={() => setShowLogoutModal(true)}
              className="p-2 text-slate-400 hover:text-red-600 transition"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Logout Confirmation Dialog */}
      {showLogoutModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full border border-slate-200 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-150">
            <div className="w-12 h-12 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1">
              <h3 className="text-lg font-bold font-serif-heading text-slate-900">
                Confirm Sign Out
              </h3>
              <p className="text-xs text-slate-500">
                Are you sure you want to log out of DharmikShree CRM? You will need to sign in again to access client records.
              </p>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowLogoutModal(false)}
                className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmLogout}
                className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl shadow-md transition"
              >
                Log Out
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
