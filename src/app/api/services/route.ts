import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';

// GET /api/services — Fetch service catalog from live Supabase
export async function GET() {
  try {
    const supabase = createAdminClient();
    const { data: services, error } = await supabase
      .from('services')
      .select('*')
      .order('display_order', { ascending: true });

    if (error) throw error;

    return NextResponse.json({ success: true, services: services || [] });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to fetch services' }, { status: 500 });
  }
}

// PATCH /api/services — Update service pricing or details
export async function PATCH(request: Request) {
  try {
    const supabase = createAdminClient();
    const body = await request.json();
    const { id, dakshina_amount, is_active } = body;

    if (!id) {
      return NextResponse.json({ error: 'Service ID required' }, { status: 400 });
    }

    const updates: Record<string, any> = {};
    if (dakshina_amount !== undefined) updates.dakshina_amount = Number(dakshina_amount);
    if (is_active !== undefined) updates.is_active = Boolean(is_active);

    const { data: updated, error } = await supabase
      .from('services')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, service: updated });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to update service' }, { status: 500 });
  }
}
