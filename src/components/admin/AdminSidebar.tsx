'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  KanbanSquare,
  Users,
  IndianRupee,
  BellRing,
  UserCog,
  Settings,
  Sparkles,
  ExternalLink,
  ChevronRight,
} from 'lucide-react';
import { UserRole } from '@/types';
import { BUSINESS_INFO } from '@/lib/constants';

interface AdminSidebarProps {
  userRole: UserRole;
  userName: string;
}

export function AdminSidebar({ userRole, userName }: AdminSidebarProps) {
  const pathname = usePathname();

  const navItems = [
    {
      label: 'Dashboard',
      href: '/admin/dashboard',
      icon: LayoutDashboard,
      roles: ['super_admin', 'admin', 'team_member'],
    },
    {
      label: 'Lead Pipeline',
      href: '/admin/leads',
      icon: KanbanSquare,
      roles: ['super_admin', 'admin', 'team_member'],
    },
    {
      label: 'Reminders & Agenda',
      href: '/admin/reminders',
      icon: BellRing,
      roles: ['super_admin', 'admin', 'team_member'],
      badge: 'Today',
    },
    {
      label: 'Payments & Revenue',
      href: '/admin/payments',
      icon: IndianRupee,
      roles: ['super_admin', 'admin'],
    },
    {
      label: 'Converted Clients',
      href: '/admin/customers',
      icon: Users,
      roles: ['super_admin', 'admin', 'team_member'],
    },
    {
      label: 'Team Management',
      href: '/admin/team',
      icon: UserCog,
      roles: ['super_admin'],
    },
    {
      label: 'System Settings',
      href: '/admin/settings',
      icon: Settings,
      roles: ['super_admin'],
    },
  ];

  const filteredNav = navItems.filter((item) => item.roles.includes(userRole));

  return (
    <aside className="w-64 bg-[#1A3C5E] text-white flex flex-col border-r border-slate-800 shrink-0 min-h-screen">
      {/* Brand Header */}
      <div className="p-5 border-b border-white/10 space-y-1">
        <div className="flex items-center gap-2 text-amber-400">
          <Sparkles className="w-5 h-5" />
          <h1 className="text-xl font-bold font-serif-heading tracking-wide">
            {BUSINESS_INFO.name}
          </h1>
        </div>
        <p className="text-[11px] text-slate-300 font-medium uppercase tracking-widest pl-7">
          CRM & Lead Engine
        </p>
      </div>

      {/* Role Badge */}
      <div className="px-5 py-3 bg-white/5 border-b border-white/10 flex items-center justify-between">
        <div className="space-y-0.5">
          <p className="text-xs font-semibold text-amber-200">{userName}</p>
          <span className="inline-block text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
            {userRole.replace('_', ' ')}
          </span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {filteredNav.map((item) => {
          const isActive = pathname.startsWith(item.href);
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center justify-between px-3.5 py-3 rounded-xl text-sm font-medium transition ${
                isActive
                  ? 'bg-amber-500 text-slate-950 font-bold shadow-md'
                  : 'text-slate-200 hover:bg-white/10 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-4 h-4 ${isActive ? 'text-slate-950' : 'text-amber-400'}`} />
                <span>{item.label}</span>
              </div>

              {item.badge && !isActive && (
                <span className="px-2 py-0.5 text-[10px] font-bold bg-red-500 text-white rounded-full">
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Quick External Links */}
      <div className="p-4 border-t border-white/10 space-y-2 text-xs">
        <a
          href="/enquiry"
          target="_blank"
          className="flex items-center justify-between p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 transition"
        >
          <span>Public Enquiry Form</span>
          <ExternalLink className="w-3.5 h-3.5 text-amber-400" />
        </a>
        <a
          href="/portal/dashboard"
          target="_blank"
          className="flex items-center justify-between p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 transition"
        >
          <span>Customer Portal Preview</span>
          <ExternalLink className="w-3.5 h-3.5 text-amber-400" />
        </a>
      </div>
    </aside>
  );
}
