import React from 'react';
import { cookies } from 'next/headers';
import { AdminLayoutClient } from '@/components/admin/AdminLayoutClient';
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
    <AdminLayoutClient userRole={userRole} userName={userName}>
      {children}
    </AdminLayoutClient>
  );
}
