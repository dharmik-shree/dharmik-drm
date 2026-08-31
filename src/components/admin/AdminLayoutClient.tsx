'use client';

import React, { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { AdminSidebar } from './AdminSidebar';
import { AdminHeader } from './AdminHeader';
import { UserRole } from '@/types';

interface AdminLayoutClientProps {
  userRole: UserRole;
  userName: string;
  children: React.ReactNode;
}

export function AdminLayoutClient({ userRole, userName, children }: AdminLayoutClientProps) {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const pathname = usePathname();

  // Close mobile sidebar on route change
  useEffect(() => {
    setMobileSidebarOpen(false);
  }, [pathname]);

  // Prevent background scroll when mobile sidebar is open
  useEffect(() => {
    if (mobileSidebarOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [mobileSidebarOpen]);

  return (
    <div className="min-h-screen flex bg-slate-50 text-slate-900 overflow-x-hidden w-full">
      {/* Desktop Sidebar (visible on lg screens and up) */}
      <div className="hidden lg:flex lg:w-64 lg:shrink-0 sticky top-0 h-screen">
        <AdminSidebar userRole={userRole} userName={userName} />
      </div>

      {/* Mobile Drawer Sidebar with Backdrop (visible only when opened on mobile/tablet) */}
      {mobileSidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          {/* Backdrop */}
          <div
            onClick={() => setMobileSidebarOpen(false)}
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs transition-opacity duration-200"
            aria-hidden="true"
          />

          {/* Drawer Slide-in */}
          <div className="relative z-10 w-72 max-w-[85vw] h-full shadow-2xl animate-in slide-in-from-left duration-200">
            <AdminSidebar
              userRole={userRole}
              userName={userName}
              isMobile={true}
              onClose={() => setMobileSidebarOpen(false)}
            />
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 w-full overflow-x-hidden">
        <AdminHeader
          userRole={userRole}
          userName={userName}
          onToggleSidebar={() => setMobileSidebarOpen(!mobileSidebarOpen)}
        />
        <main className="flex-1 p-3 sm:p-5 md:p-6 overflow-y-auto overflow-x-hidden min-w-0 w-full">
          {children}
        </main>
      </div>
    </div>
  );
}
