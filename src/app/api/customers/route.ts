import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';

// GET /api/customers — Fetch converted clients from live Supabase
export async function GET() {
  try {
    const supabase = createAdminClient();
    const { data: customers, error } = await supabase
      .from('customers')
      .select('*, user:users!id(id, full_name, phone, whatsapp, role, avatar_url), lead:leads!lead_id(*)')
      .order('customer_since', { ascending: false });

    if (error) throw error;

    const formatted = (customers || []).map((c: any) => ({
      id: c.id,
      lead_id: c.lead_id,
      full_name: c.user?.full_name || c.lead?.full_name || 'Client',
      phone: c.user?.phone || c.user?.whatsapp || c.lead?.phone || '',
      email: c.lead?.email || null,
      city: c.lead?.city || 'India',
      state: c.lead?.state || null,
      country: c.lead?.country || 'India',
      date_of_birth: c.lead?.date_of_birth || null,
      time_of_birth: c.lead?.time_of_birth || null,
      birth_place: c.lead?.birth_place || null,
      gender: c.lead?.gender || null,
      relation: c.lead?.relation || 'self',
      address: c.lead?.address || null,
      pincode: c.lead?.pincode || null,
      marital_status: c.lead?.marital_status || null,
      gotra: c.lead?.gotra || null,
      rashi: c.lead?.rashi || null,
      occupation: c.lead?.occupation || null,
      kundali_notes: c.lead?.kundali_notes || null,
      lead_source: c.lead?.lead_source || 'direct',
      customer_since: c.customer_since,
      total_spent: c.total_spent || 0,
      total_sessions: c.total_sessions || 1,
      notes: c.notes || c.lead?.internal_notes || null,
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

    const { data: listData } = await supabase.auth.admin.listUsers();
    if (listData?.users) {
      const existing = listData.users.find(
        (u) =>
          (u.email && u.email.toLowerCase() === emailToUse.toLowerCase()) ||
          (phone && u.user_metadata?.phone === phone)
      );
      if (existing) customerUserId = existing.id;
    }

    if (!customerUserId) {
      try {
        const { data: authUser, error: authErr } = await supabase.auth.admin.createUser({
          email: emailToUse,
          password: `Client@${Math.floor(100000 + Math.random() * 900000)}`,
          email_confirm: true,
          user_metadata: { full_name, phone },
        });
        if (authUser?.user) {
          customerUserId = authUser.user.id;
        } else if (authErr && authErr.message.includes('already been registered')) {
          const { data: listData2 } = await supabase.auth.admin.listUsers();
          const existing = listData2?.users?.find(
            (u) => u.email && u.email.toLowerCase() === emailToUse.toLowerCase()
          );
          if (existing) customerUserId = existing.id;
        }
      } catch {
        // Fallback
      }
    }

    if (!customerUserId) {
      return NextResponse.json({ error: 'Failed to find or create customer authentication account' }, { status: 500 });
    }

    // 1. Create a lead record first to store Kundali profiling details
    const { data: newLead } = await supabase.from('leads').insert([{
      full_name,
      phone,
      whatsapp: whatsapp || phone,
      email: email || null,
      city: city || null,
      state: state || null,
      country: country || 'India',
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
      lead_source: 'direct',
      stage: 'won_testimonial',
      is_converted: true,
      converted_customer_id: customerUserId,
    }]).select().single();

    // 2. User profile (Core schema compatible)
    await supabase.from('users').upsert([{
      id: customerUserId,
      full_name,
      phone,
      whatsapp: whatsapp || phone,
      role: 'customer',
      is_active: true,
    }]);

    // 3. Customer record (Core schema compatible)
    const { data: customer, error: custErr } = await supabase.from('customers').upsert([{
      id: customerUserId,
      lead_id: newLead?.id || null,
      customer_since: new Date().toISOString().split('T')[0],
      total_spent: 0,
      total_sessions: 1,
      notes: notes || null,
      tags: Array.isArray(tags) ? tags : ['Direct Customer'],
    }]).select('*').single();

    if (custErr) throw custErr;

    return NextResponse.json({ success: true, customer: { ...customer, full_name, phone, email, city } });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to create customer' }, { status: 500 });
  }
}
