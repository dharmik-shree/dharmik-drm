import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';

// GET /api/leads/[id] — Fetch single lead details from live Supabase
export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: leadId } = await params;
    const supabase = createAdminClient();

    const { data: lead, error } = await supabase
      .from('leads')
      .select('*, assigned_to_user:users!assigned_to(id, full_name, role, avatar_url)')
      .eq('id', leadId)
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, lead });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Lead not found' }, { status: 404 });
  }
}

// PATCH /api/leads/[id] — Update lead fields in live Supabase
export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: leadId } = await params;
    const supabase = createAdminClient();
    const updates = await request.json();

    updates.updated_at = new Date().toISOString();

    if (updates.assigned_to === '') {
      updates.assigned_to = null;
    }

    if (updates.full_amount !== undefined || updates.amount_paid !== undefined) {
      const full = Number(updates.full_amount !== undefined ? updates.full_amount : 0);
      const paid = Number(updates.amount_paid !== undefined ? updates.amount_paid : 0);
      if (updates.payment_status === undefined) {
        updates.payment_status = paid >= full ? 'full_paid' : paid > 0 ? 'token_paid' : 'unpaid';
      }
    }

    const { data: updatedLead, error } = await supabase
      .from('leads')
      .update(updates)
      .eq('id', leadId)
      .select('*, assigned_to_user:users!assigned_to(id, full_name, role, avatar_url)')
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, lead: updatedLead });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to update lead' }, { status: 500 });
  }
}

// DELETE /api/leads/[id] — Soft delete lead in live Supabase and remove related reminders & checklist progress
export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: leadId } = await params;
    const supabase = createAdminClient();

    // 1. Delete associated reminders
    const { error: reminderErr } = await supabase
      .from('reminders')
      .delete()
      .eq('lead_id', leadId);

    if (reminderErr) {
      console.warn('Warning: Failed to delete associated reminders:', reminderErr.message);
    }

    // 2. Delete associated checklist progress
    await supabase
      .from('lead_checklist_progress')
      .delete()
      .eq('lead_id', leadId);

    // 3. Mark lead as soft-deleted
    const { error } = await supabase
      .from('leads')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', leadId);

    if (error) throw error;

    return NextResponse.json({ success: true, message: 'Lead and associated reminders deleted successfully' });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to delete lead' }, { status: 500 });
  }
}
