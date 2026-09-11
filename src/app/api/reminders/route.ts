import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';

// GET /api/reminders — Fetch reminders with rich lead details from live Supabase
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const leadId = searchParams.get('lead_id');
    const status = searchParams.get('status');

    const supabase = createAdminClient();
    let query = supabase
      .from('reminders')
      .select('*, leads(full_name, phone, whatsapp, service_interest, date_of_consultation, consultation_mode, amount_due, stage, deleted_at), assigned_to_user:users!assigned_to(id, full_name, avatar_url)')
      .order('scheduled_for', { ascending: true });

    if (leadId) {
      query = query.eq('lead_id', leadId);
    }

    if (status) {
      query = query.eq('status', status);
    }

    const { data: reminders, error } = await query;
    if (error) throw error;

    // Transform for UI compatibility, filtering out soft-deleted leads
    const formatted = (reminders || [])
      .filter((r: any) => !r.leads?.deleted_at)
      .map((r: any) => ({
        ...r,
        lead_name: r.leads?.full_name || 'Client',
        lead_phone: r.leads?.whatsapp || r.leads?.phone || '',
        service_name: r.leads?.service_interest || '',
        date_of_consultation: r.leads?.date_of_consultation || null,
        consultation_mode: r.leads?.consultation_mode || 'online',
        amount_due: r.leads?.amount_due || 0,
        lead_stage: r.leads?.stage || '',
      }));

    return NextResponse.json({ success: true, reminders: formatted });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to fetch reminders' }, { status: 500 });
  }
}

// POST /api/reminders — Smartly upsert / reschedule pre-consult reminders without duplicate creation
export async function POST(request: Request) {
  try {
    const supabase = createAdminClient();
    const body = await request.json();
    const { reminders } = body;

    if (!Array.isArray(reminders) || reminders.length === 0) {
      return NextResponse.json({ error: 'Array of reminders required' }, { status: 400 });
    }

    const sampleLeadId = reminders[0]?.lead_id;

    if (sampleLeadId) {
      // Fetch existing pending reminders for this lead
      const { data: existingPending } = await supabase
        .from('reminders')
        .select('id, reminder_type')
        .eq('lead_id', sampleLeadId)
        .eq('status', 'pending');

      const existingMap = new Map<string, string>();
      (existingPending || []).forEach((r: any) => existingMap.set(r.reminder_type, r.id));

      const toInsert: any[] = [];
      const updatePromises: Promise<any>[] = [];

      for (const rem of reminders) {
        const existingId = existingMap.get(rem.reminder_type);
        if (existingId) {
          // Update existing pending reminder in-place with new scheduled date & template
          updatePromises.push(
            (async () => {
              await supabase
                .from('reminders')
                .update({
                  scheduled_for: rem.scheduled_for,
                  message_template: rem.message_template,
                  notes: rem.notes,
                  assigned_to: rem.assigned_to,
                })
                .eq('id', existingId);
            })()
          );
        } else {
          toInsert.push(rem);
        }
      }

      await Promise.all(updatePromises);

      if (toInsert.length > 0) {
        const { error: insertErr } = await supabase.from('reminders').insert(toInsert);
        if (insertErr) throw insertErr;
      }
    } else {
      const { error: insertErr } = await supabase.from('reminders').insert(reminders);
      if (insertErr) throw insertErr;
    }

    return NextResponse.json({ success: true, message: 'Reminders synchronized and rescheduled successfully' });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to sync reminders' }, { status: 500 });
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
