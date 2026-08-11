import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';

// GET /api/customers — Fetch converted clients from live Supabase
export async function GET() {
  try {
    const supabase = createAdminClient();
    const { data: customers, error } = await supabase
      .from('customers')
      .select('*, user:users!id(id, full_name, phone, whatsapp, avatar_url), lead:leads!lead_id(city)')
      .order('customer_since', { ascending: false });

    if (error) throw error;

    const formatted = (customers || []).map((c: any) => ({
      id: c.id,
      lead_id: c.lead_id,
      full_name: c.user?.full_name || 'Client',
      phone: c.user?.phone || c.user?.whatsapp || '',
      city: c.lead?.city || 'India',
      customer_since: c.customer_since,
      total_spent: c.total_spent,
      total_sessions: c.total_sessions,
      notes: c.notes,
      tags: c.tags || [],
    }));

    return NextResponse.json({ success: true, customers: formatted });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to fetch customers' }, { status: 500 });
  }
}
