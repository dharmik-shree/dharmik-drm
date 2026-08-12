import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';

// GET /api/customers — Fetch converted clients from live Supabase
export async function GET() {
  try {
    const supabase = createAdminClient();
    const { data: customers, error } = await supabase
      .from('customers')
      .select('*, user:users!id(id, full_name, phone, whatsapp, email, avatar_url), lead:leads!lead_id(city, state, country, lead_source)')
      .order('customer_since', { ascending: false });

    if (error) throw error;

    const formatted = (customers || []).map((c: any) => ({
      id: c.id,
      lead_id: c.lead_id,
      full_name: c.user?.full_name || 'Client',
      phone: c.user?.phone || c.user?.whatsapp || '',
      email: c.user?.email || null,
      city: c.lead?.city || c.address || 'India',
      state: c.lead?.state || null,
      country: c.lead?.country || 'India',
      date_of_birth: c.date_of_birth,
      time_of_birth: c.time_of_birth,
      birth_place: c.birth_place,
      gender: c.gender,
      relation: c.relation || 'self',
      address: c.address,
      pincode: c.pincode,
      marital_status: c.marital_status,
      gotra: c.gotra,
      rashi: c.rashi,
      occupation: c.occupation,
      kundali_notes: c.kundali_notes,
      lead_source: c.lead?.lead_source || 'direct',
      customer_since: c.customer_since,
      total_spent: c.total_spent || 0,
      total_sessions: c.total_sessions || 1,
      notes: c.notes,
      tags: c.tags || [],
    }));

    return NextResponse.json({ success: true, customers: formatted });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to fetch customers' }, { status: 500 });
  }
}

// POST /api/customers — Create new customer directly with Kundali details
export async function POST(request: Request) {
  try {
    const supabase = createAdminClient();
    const body = await request.json();

    const {
      full_name,
      phone,
      email,
      whatsapp,
      city,
      state,
      country,
      date_of_birth,
      time_of_birth,
      birth_place,
      gender,
      relation,
      address,
      pincode,
      marital_status,
      gotra,
      rashi,
      occupation,
      kundali_notes,
      notes,
      tags,
    } = body;

    if (!full_name || !phone) {
      return NextResponse.json({ error: 'Full name and phone are required' }, { status: 400 });
    }

    const cleanPhone = phone.replace(/\D/g, '');
    const emailToUse = email || `client_${cleanPhone || Date.now()}@dharmikshree.com`;

    let customerUserId: string | null = null;

    try {
      const { data: authUser } = await supabase.auth.admin.createUser({
        email: emailToUse,
        password: `Client@${Math.floor(100000 + Math.random() * 900000)}`,
        email_confirm: true,
        user_metadata: { full_name, phone },
      });
      if (authUser?.user) customerUserId = authUser.user.id;
    } catch {
      // Fallback
    }

    if (!customerUserId) customerUserId = crypto.randomUUID();

    // 1. User profile
    await supabase.from('users').upsert([{
      id: customerUserId,
      full_name,
      phone,
      whatsapp: whatsapp || phone,
      role: 'customer',
      is_active: true,
      date_of_birth: date_of_birth || null,
      time_of_birth: time_of_birth || null,
      birth_place: birth_place || null,
      gender: gender || null,
      relation: relation || 'self',
      address: address || null,
      pincode: pincode || null,
      marital_status: marital_status || null,
      gotra: gotra || null,
      rashi: rashi || null,
      occupation: occupation || null,
      kundali_notes: kundali_notes || null,
    }]);

    // 2. Customer record
    const { data: customer, error: custErr } = await supabase.from('customers').upsert([{
      id: customerUserId,
      customer_since: new Date().toISOString().split('T')[0],
      total_spent: 0,
      total_sessions: 1,
      notes: notes || null,
      tags: Array.isArray(tags) ? tags : ['Direct Customer'],
      date_of_birth: date_of_birth || null,
      time_of_birth: time_of_birth || null,
      birth_place: birth_place || null,
      gender: gender || null,
      relation: relation || 'self',
      address: address || null,
      pincode: pincode || null,
      marital_status: marital_status || null,
      gotra: gotra || null,
      rashi: rashi || null,
      occupation: occupation || null,
      kundali_notes: kundali_notes || null,
    }]).select('*').single();

    if (custErr) throw custErr;

    return NextResponse.json({ success: true, customer: { ...customer, full_name, phone, email, city } });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to create customer' }, { status: 500 });
  }
}
