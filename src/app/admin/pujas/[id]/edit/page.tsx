import React from 'react';
import { notFound } from 'next/navigation';
import PujaForm from '@/components/admin/PujaForm';
import { fetchAdminPujaById } from '@/lib/pujaData';

interface PageProps {
  params: Promise<{ id: string }>;
}

export const metadata = {
  title: 'Edit Puja Event | Dharmikshree CRM',
};

export default async function EditPujaPage({ params }: PageProps) {
  const { id } = await params;
  const puja = await fetchAdminPujaById(id);

  if (!puja) {
    notFound();
  }

  return <PujaForm initialPuja={puja} isEdit={true} />;
}
