import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';

// GET /api/payments — Fetch payments from live Supabase
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const leadId = searchParams.get('lead_id');

    const supabase = createAdminClient();
    let query = supabase
      .from('payments')
      .select('*, recorded_by_user:users!recorded_by(id, full_name, avatar_url)')
      .order('created_at', { ascending: false });

    if (leadId) {
      query = query.eq('lead_id', leadId);
    }

    const { data: payments, error } = await query;
    if (error) throw error;

    return NextResponse.json({ success: true, payments: payments || [] });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to fetch payments' }, { status: 500 });
  }
}

// POST /api/payments — Record payment in live Supabase & update lead dues
export async function POST(request: Request) {
  try {
    const supabase = createAdminClient();
    const body = await request.json();
    const { lead_id, customer_id, service, payment_type, amount, payment_mode, payment_date, reference_no, notes, recorded_by } = body;

    if (!service || !amount || !payment_mode) {
      return NextResponse.json({ error: 'service, amount, and payment_mode are required' }, { status: 400 });
    }

    const numAmount = Number(amount);

    const { data: payment, error: payErr } = await supabase
      .from('payments')
      .insert([
        {
          lead_id: lead_id || null,
          customer_id: customer_id || null,
          service,
          payment_type: payment_type || 'full',
          amount: numAmount,
          payment_mode,
          payment_date: payment_date || new Date().toISOString().split('T')[0],
          reference_no: reference_no || null,
          notes: notes || null,
          recorded_by: recorded_by || null,
        },
      ])
      .select('*, recorded_by_user:users!recorded_by(id, full_name, avatar_url)')
      .single();

    if (payErr) throw payErr;

    // Update lead amounts if lead_id provided
    if (lead_id) {
      const { data: currentLead } = await supabase.from('leads').select('full_amount, amount_paid').eq('id', lead_id).single();
      if (currentLead) {
        const newPaid = (currentLead.amount_paid || 0) + numAmount;
        const newDue = Math.max(0, (currentLead.full_amount || 0) - newPaid);
        const newStatus = newDue === 0 ? 'full_paid' : 'token_paid';

        await supabase
          .from('leads')
          .update({
            amount_paid: newPaid,
            payment_status: newStatus,
            updated_at: new Date().toISOString(),
          })
          .eq('id', lead_id);

        // Activity log
        await supabase.from('lead_activities').insert({
          lead_id,
          activity_type: 'payment_update',
          content: `Recorded ${payment_type} payment of ₹${numAmount.toLocaleString('en-IN')} via ${payment_mode.toUpperCase()}`,
          is_internal: true,
          created_by: recorded_by || null,
        });
      }
    }

    return NextResponse.json({ success: true, payment });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to record payment' }, { status: 500 });
  }
}
