import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';

// POST /api/leads/[id]/convert — Promote lead to customer
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: leadId } = await params;
    const supabase = createAdminClient();

    // 1. Fetch Lead details
    const { data: lead, error: fetchErr } = await supabase
      .from('leads')
      .select('*')
      .eq('id', leadId)
      .single();

    if (fetchErr || !lead) {
      return NextResponse.json({ error: 'Lead not found' }, { status: 404 });
    }

    if (lead.is_converted && lead.converted_customer_id) {
      return NextResponse.json({
        success: true,
        message: 'Lead is already converted to customer',
        customer_id: lead.converted_customer_id,
        already_converted: true,
      });
    }

    // 2. Prepare user email & auth account safely
    const cleanPhone = lead.phone ? lead.phone.replace(/\D/g, '') : '';
    const emailToUse = lead.email || `client_${cleanPhone || Date.now()}@dharmikshree.com`;

    let customerUserId: string | null = null;

    // Check if auth user already exists by email or phone
    const { data: listData } = await supabase.auth.admin.listUsers();
    if (listData?.users) {
      const existing = listData.users.find(
        (u) =>
          (u.email && u.email.toLowerCase() === emailToUse.toLowerCase()) ||
          (lead.phone && u.user_metadata?.phone === lead.phone)
      );
      if (existing) {
        customerUserId = existing.id;
      }
    }

    // If not found in list, attempt creation
    if (!customerUserId) {
      try {
        const { data: authUser, error: authErr } = await supabase.auth.admin.createUser({
          email: emailToUse,
          password: `Client@${Math.floor(100000 + Math.random() * 900000)}`,
          email_confirm: true,
          user_metadata: { full_name: lead.full_name, phone: lead.phone },
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
      return NextResponse.json(
        { error: 'Could not create or find authenticating user for customer' },
        { status: 500 }
      );
    }

    // 3. Upsert user in public.users table (Core schema compatible)
    const userPayload = {
      id: customerUserId,
      full_name: lead.full_name,
      phone: lead.phone,
      whatsapp: lead.whatsapp || lead.phone,
      role: 'customer',
      is_active: true,
    };

    const { error: userErr } = await supabase.from('users').upsert([userPayload]);
    if (userErr) throw new Error(`Failed to create user record: ${userErr.message}`);

    // 4. Create customer record in public.customers (Core schema compatible)
    const customerPayload = {
      id: customerUserId,
      lead_id: lead.id,
      customer_since: new Date().toISOString().split('T')[0],
      total_spent: lead.amount_paid || 0,
      total_sessions: 1,
      notes: lead.internal_notes || null,
      tags: lead.tags || ['Converted Client'],
    };

    const { error: custErr } = await supabase.from('customers').upsert([customerPayload]);
    if (custErr) throw new Error(`Failed to create customer profile: ${custErr.message}`);

    // 5. Update Lead record as converted
    const { data: updatedLead, error: leadUpdateErr } = await supabase
      .from('leads')
      .update({
        is_converted: true,
        converted_customer_id: customerUserId,
        stage: lead.stage === 'lost_nurture' ? 'won_testimonial' : lead.stage,
        updated_at: new Date().toISOString(),
      })
      .eq('id', lead.id)
      .select('*, assigned_to_user:users!assigned_to(id, full_name, role, avatar_url)')
      .single();

    if (leadUpdateErr) throw leadUpdateErr;

    // Also mark matching duplicate leads (same phone or email) as converted
    if (lead.phone || lead.email) {
      const matchConds: string[] = [];
      if (lead.phone) matchConds.push(`phone.eq.${lead.phone}`);
      if (lead.email) matchConds.push(`email.eq.${lead.email}`);
      await supabase
        .from('leads')
        .update({
          is_converted: true,
          converted_customer_id: customerUserId,
          updated_at: new Date().toISOString(),
        })
        .or(matchConds.join(','))
        .eq('is_converted', false);
    }

    // 6. Log system activity
    await supabase.from('lead_activities').insert({
      lead_id: lead.id,
      activity_type: 'system',
      content: `🎉 Lead successfully promoted to Customer! Registered ID: ${customerUserId}`,
      is_internal: true,
    });

    return NextResponse.json({
      success: true,
      message: 'Lead successfully promoted to Customer',
      customer_id: customerUserId,
      lead: updatedLead,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to convert lead to customer' }, { status: 500 });
  }
}
