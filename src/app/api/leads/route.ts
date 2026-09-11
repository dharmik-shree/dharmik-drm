import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';
import { SERVICE_OPTIONS } from '@/lib/constants';

// GET /api/leads — Fetch all active leads from live Supabase
export async function GET() {
  try {
    const supabase = createAdminClient();
    const { data: leads, error } = await supabase
      .from('leads')
      .select('*, assigned_to_user:users!assigned_to(id, full_name, role, avatar_url)')
      .is('deleted_at', null)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return NextResponse.json({ success: true, leads: leads || [] });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to fetch leads' }, { status: 500 });
  }
}

// POST /api/leads — Create a new lead in live Supabase
export async function POST(request: Request) {
  try {
    const supabase = createAdminClient();
    const body = await request.json();

    const {
      full_name,
      phone,
      whatsapp,
      email,
      city,
      state,
      country,
      date_of_birth,
      time_of_birth,
      birth_place,
      gender,
      relation,
      address,
      pincode,
      marital_status,
      gotra,
      rashi,
      occupation,
      kundali_notes,
      lead_source,
      lead_temperature,
      service_interest,
      consultation_mode,
      stage,
      assigned_to,
      date_of_consultation,
      full_amount,
      amount_paid,
      internal_notes,
      tags,
    } = body;

    if (!full_name || !phone) {
      return NextResponse.json({ error: 'Full name and phone are required' }, { status: 400 });
    }

    // Deduplication check: normalize phone number (last 10 digits)
    const cleanPhoneDigits = phone.replace(/\D/g, '').slice(-10);

    if (cleanPhoneDigits.length >= 10) {
      const { data: existingLeads } = await supabase
        .from('leads')
        .select('*, assigned_to_user:users!assigned_to(id, full_name, role, avatar_url)')
        .is('deleted_at', null)
        .eq('is_converted', false);

      const duplicateLead = existingLeads?.find((l) => {
        const existingDigits = (l.phone || '').replace(/\D/g, '').slice(-10);
        return existingDigits.length >= 10 && existingDigits === cleanPhoneDigits;
      });

      if (duplicateLead) {
        const createdAtTime = new Date(duplicateLead.created_at).getTime();
        const isRecentDuplicate = Date.now() - createdAtTime < 60000; // Within 60 seconds (rapid double-tap)

        if (isRecentDuplicate) {
          return NextResponse.json({
            success: true,
            lead: duplicateLead,
            is_duplicate: true,
            message: 'Lead record was already created',
          });
        }

        return NextResponse.json(
          {
            error: `A lead with phone ${phone} already exists: "${duplicateLead.full_name}" (Stage: ${duplicateLead.stage?.replace(/_/g, ' ').toUpperCase() || 'NEW LEAD'}).`,
            duplicateLeadId: duplicateLead.id,
          },
          { status: 409 }
        );
      }
    }

    const calculatedFullAmount = full_amount !== undefined ? Number(full_amount) : (SERVICE_OPTIONS.find(s => s.key === service_interest)?.price || 9900);
    const calculatedPaid = amount_paid !== undefined ? Number(amount_paid) : 0;
    const paymentStatus = calculatedPaid >= calculatedFullAmount ? 'full_paid' : calculatedPaid > 0 ? 'token_paid' : 'unpaid';

    const insertPayload = {
      full_name,
      phone,
      whatsapp: whatsapp || phone,
      email: email || null,
      city: city || null,
      state: state || null,
      country: country || 'India',
      date_of_birth: date_of_birth || null,
      time_of_birth: time_of_birth || null,
      birth_place: birth_place || null,
      gender: gender || null,
      relation: relation || 'self',
      address: address || null,
      pincode: pincode || null,
      marital_status: marital_status || null,
      gotra: gotra || null,
      rashi: rashi || null,
      occupation: occupation || null,
      kundali_notes: kundali_notes || null,
      lead_source: lead_source || 'website',
      lead_temperature: lead_temperature || 'warm',
      service_interest: service_interest || 'divine_consultation',
      consultation_mode: consultation_mode || 'online',
      stage: stage || 'new_lead',
      assigned_to: assigned_to || null,
      date_of_consultation: date_of_consultation || null,
      payment_status: paymentStatus,
      token_amount: paymentStatus === 'token_paid' ? calculatedPaid : 0,
      full_amount: calculatedFullAmount,
      amount_paid: calculatedPaid,
      internal_notes: internal_notes || null,
      tags: Array.isArray(tags) ? tags : tags ? [tags] : [],
      updated_at: new Date().toISOString(),
    };

    const { data: newLead, error } = await supabase
      .from('leads')
      .insert([insertPayload])
      .select('*, assigned_to_user:users!assigned_to(id, full_name, role, avatar_url)')
      .single();

    if (error) throw error;

    // Log activity
    await supabase.from('lead_activities').insert({
      lead_id: newLead.id,
      activity_type: 'system',
      content: `Lead created manually (${service_interest || 'divine_consultation'})`,
      is_internal: true,
    });

    return NextResponse.json({ success: true, lead: newLead });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to create lead' }, { status: 500 });
  }
}
