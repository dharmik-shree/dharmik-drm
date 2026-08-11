import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';

// GET /api/activities?lead_id=... — Fetch chatter activities
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const leadId = searchParams.get('lead_id');
    const limit = parseInt(searchParams.get('limit') || '20');

    const supabase = createAdminClient();
    let query = supabase
      .from('lead_activities')
      .select('*, created_by_user:users!created_by(id, full_name, avatar_url, role)')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (leadId) {
      query = query.eq('lead_id', leadId);
    }

    const { data: activities, error } = await query;
    if (error) throw error;

    return NextResponse.json({ success: true, activities: activities || [] });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to fetch activities' }, { status: 500 });
  }
}

// POST /api/activities — Log a new chatter activity in live Supabase
export async function POST(request: Request) {
  try {
    const supabase = createAdminClient();
    const body = await request.json();
    const { lead_id, activity_type, content, old_value, new_value, is_internal, created_by } = body;

    if (!lead_id || !content) {
      return NextResponse.json({ error: 'lead_id and content are required' }, { status: 400 });
    }

    const { data: activity, error } = await supabase
      .from('lead_activities')
      .insert([
        {
          lead_id,
          activity_type: activity_type || 'note',
          content,
          old_value: old_value || null,
          new_value: new_value || null,
          is_internal: is_internal !== undefined ? is_internal : true,
          created_by: created_by || null,
        },
      ])
      .select('*, created_by_user:users!created_by(id, full_name, avatar_url, role)')
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, activity });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to insert activity' }, { status: 500 });
  }
}
