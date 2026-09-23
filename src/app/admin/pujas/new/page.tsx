import React from 'react';
import PujaForm from '@/components/admin/PujaForm';

export const metadata = {
  title: 'Create New Puja Event | Dharmikshree CRM',
};

export default function NewPujaPage() {
  return <PujaForm isEdit={false} />;
}
