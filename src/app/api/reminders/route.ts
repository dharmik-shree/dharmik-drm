import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';

// GET /api/reminders — Fetch reminders from live Supabase
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const leadId = searchParams.get('lead_id');
    const status = searchParams.get('status');

    const supabase = createAdminClient();
    let query = supabase
      .from('reminders')
      .select('*, leads(full_name, phone, whatsapp, service_interest), assigned_to_user:users!assigned_to(id, full_name, avatar_url)')
      .order('scheduled_for', { ascending: true });

    if (leadId) {
      query = query.eq('lead_id', leadId);
    }

    if (status) {
      query = query.eq('status', status);
    }

    const { data: reminders, error } = await query;
    if (error) throw error;

    // Transform for UI compatibility
    const formatted = (reminders || []).map((r: any) => ({
      ...r,
      lead_name: r.leads?.full_name || 'Client',
      lead_phone: r.leads?.whatsapp || r.leads?.phone || '',
      service_name: r.leads?.service_interest || '',
    }));

    return NextResponse.json({ success: true, reminders: formatted });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to fetch reminders' }, { status: 500 });
  }
}

// POST /api/reminders — Batch insert auto-reminders into live Supabase
export async function POST(request: Request) {
  try {
    const supabase = createAdminClient();
    const body = await request.json();
    const { reminders } = body;

    if (!Array.isArray(reminders) || reminders.length === 0) {
      return NextResponse.json({ error: 'Array of reminders required' }, { status: 400 });
    }

    const { data: inserted, error } = await supabase
      .from('reminders')
      .insert(reminders)
      .select();

    if (error) throw error;

    return NextResponse.json({ success: true, count: inserted?.length || 0 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to create reminders' }, { status: 500 });
  }
}

// PATCH /api/reminders — Update reminder status (done, snooze, sent)
export async function PATCH(request: Request) {
  try {
    const supabase = createAdminClient();
    const body = await request.json();
    const { id, status, scheduled_for } = body;

    if (!id) {
      return NextResponse.json({ error: 'Reminder ID required' }, { status: 400 });
    }

    const updates: Record<string, any> = {};
    if (status) updates.status = status;
    if (status === 'sent' || status === 'done') updates.sent_at = new Date().toISOString();
    if (scheduled_for) updates.scheduled_for = scheduled_for;

    const { data: updated, error } = await supabase
      .from('reminders')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, reminder: updated });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to update reminder' }, { status: 500 });
  }
}
