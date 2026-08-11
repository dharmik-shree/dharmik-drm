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

// POST /api/team — Create new team user profile in live Supabase Auth & public.users
export async function POST(request: Request) {
  try {
    const supabase = createAdminClient();
    const body = await request.json();
    const { full_name, phone, whatsapp, role, email, password } = body;

    if (!full_name || !role || !email) {
      return NextResponse.json({ error: 'full_name, email, and role are required' }, { status: 400 });
    }

    const userPassword = password || 'Dharmikshree@2026';

    // 1. Create account in Supabase Auth
    const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
      email,
      password: userPassword,
      email_confirm: true,
      user_metadata: { full_name, role },
    });

    if (authError && !authError.message.includes('already registered')) {
      throw authError;
    }

    const userId = authUser?.user?.id || crypto.randomUUID();

    // 2. Insert or update in public.users table
    const { data: newUser, error } = await supabase
      .from('users')
      .upsert([
        {
          id: userId,
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

    return NextResponse.json({
      success: true,
      user: newUser,
      tempPassword: userPassword,
      message: `Account created successfully for ${email}. Default password: ${userPassword}`,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to create team member' }, { status: 500 });
  }
}
