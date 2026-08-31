'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Search, Plus, Bell, Shield, UserCircle, LogOut, AlertTriangle, Menu, X } from 'lucide-react';
import { UserRole } from '@/types';
import { createClient } from '@/lib/supabase/client';

interface AdminHeaderProps {
  userRole: UserRole;
  userName: string;
  onToggleSidebar?: () => void;
}

export function AdminHeader({ userRole, userName, onToggleSidebar }: AdminHeaderProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isNotificationsChecked, setIsNotificationsChecked] = useState(false);
  const [showMobileSearch, setShowMobileSearch] = useState(false);

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
      setShowMobileSearch(false);
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
      <header className="h-16 bg-white border-b border-slate-200 px-3 sm:px-6 flex items-center justify-between gap-2 sm:gap-4 sticky top-0 z-30 shadow-xs">
        {/* Left Side: Mobile Menu Button & Brand / Search */}
        <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
          {/* Hamburger Menu Toggle (Mobile / Tablet) */}
          <button
            type="button"
            onClick={onToggleSidebar}
            aria-label="Open navigation menu"
            className="lg:hidden p-2 text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition cursor-pointer shrink-0"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Desktop & Tablet Search Input */}
          <form onSubmit={handleSearchSubmit} className="hidden sm:block flex-1 max-w-xs md:max-w-md relative">
            <input
              type="text"
              placeholder="Search leads (name, phone, city)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-100/80 focus:bg-white border border-slate-200 focus:border-amber-500 rounded-xl text-xs outline-none transition"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          </form>

          {/* Mobile Search Toggle Icon */}
          <button
            type="button"
            onClick={() => setShowMobileSearch(!showMobileSearch)}
            aria-label="Toggle search input"
            className="sm:hidden p-2 text-slate-600 hover:text-slate-900 bg-slate-100 rounded-xl transition"
          >
            <Search className="w-4 h-4" />
          </button>
        </div>

        {/* Right Controls */}
        <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
          {/* Quick Role Switcher */}
          <div className="flex items-center gap-1 bg-amber-50 border border-amber-200 px-2 py-1 rounded-xl text-xs">
            <Shield className="w-3.5 h-3.5 text-amber-600 shrink-0" />
            <span className="hidden md:inline text-[11px] font-semibold text-amber-900">Role:</span>
            <select
              value={userRole}
              onChange={(e) => handleRoleSwitch(e.target.value as UserRole)}
              className="bg-transparent text-[11px] sm:text-xs font-bold text-amber-900 outline-none cursor-pointer max-w-[85px] sm:max-w-none"
            >
              <option value="super_admin">Super Admin</option>
              <option value="admin">Admin (K)</option>
              <option value="team_member">Team Member</option>
            </select>
          </div>

          {/* Create Lead Button */}
          <Link
            href="/admin/leads/new"
            className="flex items-center gap-1 px-2.5 sm:px-3.5 py-1.5 sm:py-2 bg-[#1A3C5E] hover:bg-[#15304b] text-white text-xs font-bold rounded-xl shadow-xs transition"
          >
            <Plus className="w-4 h-4 text-amber-400" />
            <span className="hidden sm:inline">New Lead</span>
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

          {/* User Profile & Sign Out */}
          <div className="flex items-center gap-1 sm:gap-2 border-l border-slate-200 pl-1.5 sm:pl-3">
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-amber-100 text-amber-800 font-bold flex items-center justify-center text-xs border border-amber-300">
              {userName.charAt(0)}
            </div>
            <button
              onClick={() => setShowLogoutModal(true)}
              className="p-1.5 sm:p-2 text-slate-400 hover:text-red-600 transition cursor-pointer"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Floating Search Bar (When toggled on mobile) */}
      {showMobileSearch && (
        <div className="sm:hidden bg-white border-b border-slate-200 px-3 py-2 z-20 shadow-sm animate-in slide-in-from-top duration-150">
          <form onSubmit={handleSearchSubmit} className="relative flex items-center">
            <input
              type="text"
              autoFocus
              placeholder="Search leads by name, phone (+91), city..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-8 py-2 bg-slate-100 focus:bg-white border border-amber-400 rounded-xl text-xs outline-none"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3" />
            <button
              type="button"
              onClick={() => setShowMobileSearch(false)}
              className="absolute right-2.5 text-slate-400 hover:text-slate-600"
            >
              <X className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}

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
                className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmLogout}
                className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl shadow-md transition cursor-pointer"
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
