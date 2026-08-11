import React from 'react';
import { cookies } from 'next/headers';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { UserRole } from '@/types';

export const metadata = {
  title: 'Dharmikshree CRM Dashboard',
  description: 'Admin and Lead Management Panel',
};

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const userRole = (cookieStore.get('dharmik_demo_role')?.value || 'super_admin') as UserRole;
  
  const userNameMap: Record<UserRole, string> = {
    super_admin: 'Dharmikshree (Owner)',
    admin: 'K (Senior Admin)',
    team_member: 'N (Consultation Lead)',
    customer: 'Client',
  };

  const userName = userNameMap[userRole] || 'Dharmikshree';

  return (
    <div className="min-h-screen flex bg-slate-50 text-slate-900">
      <AdminSidebar userRole={userRole} userName={userName} />
      <div className="flex-1 flex flex-col min-w-0">
        <AdminHeader userRole={userRole} userName={userName} />
        <main className="flex-1 p-6 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
