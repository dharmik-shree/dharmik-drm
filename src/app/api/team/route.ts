import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';

// GET /api/team — Fetch staff user profiles from live Supabase
export async function GET() {
  try {
    const supabase = createAdminClient();
    const { data: team, error } = await supabase
      .from('users')
      .select('*')
      .neq('role', 'customer')
      .order('created_at', { ascending: true });

    if (error) throw error;

    return NextResponse.json({ success: true, team: team || [] });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to fetch team members' }, { status: 500 });
  }
}

// POST /api/team — Create new team user profile in live Supabase
export async function POST(request: Request) {
  try {
    const supabase = createAdminClient();
    const body = await request.json();
    const { full_name, phone, whatsapp, role, email } = body;

    if (!full_name || !role) {
      return NextResponse.json({ error: 'full_name and role required' }, { status: 400 });
    }

    const newId = crypto.randomUUID();

    const { data: newUser, error } = await supabase
      .from('users')
      .insert([
        {
          id: newId,
          full_name,
          phone: phone || null,
          whatsapp: whatsapp || phone || null,
          role,
          is_active: true,
        },
      ])
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, user: newUser });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to create team member' }, { status: 500 });
  }
}
