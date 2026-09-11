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

    return NextResponse.json({ payment });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to record payment' }, { status: 500 });
  }
}

// PATCH /api/payments — Update payment and recalculate lead dues
export async function PATCH(request: Request) {
  try {
    const supabase = createAdminClient();
    const body = await request.json();
    const { id, amount, payment_mode, payment_type, payment_date, reference_no, notes } = body;

    if (!id) {
      return NextResponse.json({ error: 'Payment ID is required' }, { status: 400 });
    }

    // Get current payment to find associated lead_id
    const { data: existingPayment, error: fetchErr } = await supabase
      .from('payments')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchErr || !existingPayment) {
      return NextResponse.json({ error: 'Payment record not found' }, { status: 404 });
    }

    const updates: Record<string, any> = {};
    if (amount !== undefined) updates.amount = Number(amount);
    if (payment_mode !== undefined) updates.payment_mode = payment_mode;
    if (payment_type !== undefined) updates.payment_type = payment_type;
    if (payment_date !== undefined) updates.payment_date = payment_date;
    if (reference_no !== undefined) updates.reference_no = reference_no;
    if (notes !== undefined) updates.notes = notes;

    const { data: updatedPayment, error: updateErr } = await supabase
      .from('payments')
      .update(updates)
      .eq('id', id)
      .select('*, recorded_by_user:users!recorded_by(id, full_name, avatar_url)')
      .single();

    if (updateErr) throw updateErr;

    const leadId = existingPayment.lead_id;
    if (leadId) {
      // Recalculate total payments for this lead
      const { data: allPayments } = await supabase
        .from('payments')
        .select('amount')
        .eq('lead_id', leadId);

      const totalPaid = (allPayments || []).reduce((sum: number, p: any) => sum + Number(p.amount || 0), 0);
      const { data: currentLead } = await supabase
        .from('leads')
        .select('full_amount')
        .eq('id', leadId)
        .single();

      const fullAmount = currentLead?.full_amount || 0;
      const paymentStatus = totalPaid >= fullAmount ? 'full_paid' : totalPaid > 0 ? 'token_paid' : 'unpaid';

      await supabase
        .from('leads')
        .update({
          amount_paid: totalPaid,
          payment_status: paymentStatus,
          updated_at: new Date().toISOString(),
        })
        .eq('id', leadId);

      // Activity log
      await supabase.from('lead_activities').insert({
        lead_id: leadId,
        activity_type: 'payment_update',
        content: `Corrected payment record #${id.slice(0, 8)} to ₹${Number(updates.amount !== undefined ? updates.amount : existingPayment.amount).toLocaleString('en-IN')} via ${(updates.payment_mode || existingPayment.payment_mode).toUpperCase()}`,
        is_internal: true,
      });
    }

    return NextResponse.json({ success: true, payment: updatedPayment });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to update payment' }, { status: 500 });
  }
}

// DELETE /api/payments — Delete payment and recalculate lead dues
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    let paymentId = searchParams.get('id');

    if (!paymentId) {
      try {
        const body = await request.json();
        paymentId = body.id;
      } catch {
        // ignore body parse error
      }
    }

    if (!paymentId) {
      return NextResponse.json({ error: 'Payment ID is required' }, { status: 400 });
    }

    const supabase = createAdminClient();

    // Fetch payment to get lead_id before deletion
    const { data: existingPayment, error: fetchErr } = await supabase
      .from('payments')
      .select('*')
      .eq('id', paymentId)
      .single();

    if (fetchErr || !existingPayment) {
      return NextResponse.json({ error: 'Payment record not found' }, { status: 404 });
    }

    const { error: deleteErr } = await supabase
      .from('payments')
      .delete()
      .eq('id', paymentId);

    if (deleteErr) throw deleteErr;

    const leadId = existingPayment.lead_id;
    if (leadId) {
      // Recalculate total payments for this lead
      const { data: allPayments } = await supabase
        .from('payments')
        .select('amount')
        .eq('lead_id', leadId);

      const totalPaid = (allPayments || []).reduce((sum: number, p: any) => sum + Number(p.amount || 0), 0);
      const { data: currentLead } = await supabase
        .from('leads')
        .select('full_amount')
        .eq('id', leadId)
        .single();

      const fullAmount = currentLead?.full_amount || 0;
      const paymentStatus = totalPaid >= fullAmount ? 'full_paid' : totalPaid > 0 ? 'token_paid' : 'unpaid';

      await supabase
        .from('leads')
        .update({
          amount_paid: totalPaid,
          payment_status: paymentStatus,
          updated_at: new Date().toISOString(),
        })
        .eq('id', leadId);

      // Activity log
      await supabase.from('lead_activities').insert({
        lead_id: leadId,
        activity_type: 'payment_update',
        content: `Removed incorrect payment record of ₹${Number(existingPayment.amount).toLocaleString('en-IN')}`,
        is_internal: true,
      });
    }

    return NextResponse.json({ success: true, message: 'Payment deleted and lead dues recalculated successfully' });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to delete payment' }, { status: 500 });
  }
}
