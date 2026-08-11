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

// DELETE /api/leads/[id] — Soft delete lead in live Supabase
export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: leadId } = await params;
    const supabase = createAdminClient();

    const { error } = await supabase
      .from('leads')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', leadId);

    if (error) throw error;

    return NextResponse.json({ success: true, message: 'Lead soft-deleted' });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to delete lead' }, { status: 500 });
  }
}
