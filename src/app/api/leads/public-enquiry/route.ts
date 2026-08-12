import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';
import { sendWhatsAppMessage } from '@/lib/whatsapp';
import { SERVICE_OPTIONS } from '@/lib/constants';

// Rate limiting in-memory map (max 5 per IP per hour)
const rateLimitMap = new Map<string, { count: number; expires: number }>();

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export async function OPTIONS() {
  return new NextResponse('OK', { headers: corsHeaders });
}

export async function POST(request: Request) {
  try {
    const ip = request.headers.get('x-forwarded-for') || '127.0.0.1';
    const now = Date.now();
    const limit = rateLimitMap.get(ip);

    if (limit && limit.expires > now) {
      if (limit.count >= 5) {
        return NextResponse.json(
          { error: 'Too many enquiry submissions. Please try again later.' },
          { status: 429, headers: corsHeaders }
        );
      }
      limit.count += 1;
    } else {
      rateLimitMap.set(ip, { count: 1, expires: now + 3600 * 1000 });
    }

    const body = await request.json();
    const {
      full_name,
      phone,
      email,
      city,
      service_interest,
      consultation_mode,
      message,
      lead_source,
    } = body;

    if (!full_name || !phone || !city) {
      return NextResponse.json({ error: 'Missing required fields: full_name, phone, city' }, { status: 400, headers: corsHeaders });
    }

    const supabase = createAdminClient();

    const coreLeadRecord: Record<string, any> = {
      full_name,
      phone,
      whatsapp: phone,
      city,
      country: 'India',
      lead_source: lead_source || 'website',
      lead_temperature: 'warm' as const,
      service_interest: service_interest || 'divine_consultation',
      consultation_mode: consultation_mode || 'online',
      stage: 'new_lead' as const,
      payment_status: 'unpaid' as const,
      token_amount: 0,
      full_amount: SERVICE_OPTIONS.find(s => s.key === service_interest)?.price || 9900,
      amount_paid: 0,
      rescheduled: false,
      reschedule_count: 0,
      protocol_message_sent: false,
      pre_consult_5day_done: false,
      remedy_status: 'not_sent' as const,
      puja_status: 'not_booked' as const,
      stone_status: 'not_decided' as const,
      testimonial_status: 'not_collected' as const,
      tags: ['Website Lead'],
      is_converted: false,
      updated_at: new Date().toISOString(),
    };

    if (email) coreLeadRecord.email = email;
    if (message) coreLeadRecord.internal_notes = `Website Note: ${message}`;

    const extendedRecord = { ...coreLeadRecord };
    if (body.date_of_birth) extendedRecord.date_of_birth = body.date_of_birth;
    if (body.time_of_birth) extendedRecord.time_of_birth = body.time_of_birth;
    if (body.birth_place) extendedRecord.birth_place = body.birth_place;
    if (body.gender) extendedRecord.gender = body.gender;
    if (body.relation) extendedRecord.relation = body.relation;
    if (body.address) extendedRecord.address = body.address;
    if (body.pincode) extendedRecord.pincode = body.pincode;
    if (body.marital_status) extendedRecord.marital_status = body.marital_status;
    if (body.gotra) extendedRecord.gotra = body.gotra;
    if (body.rashi) extendedRecord.rashi = body.rashi;
    if (body.occupation) extendedRecord.occupation = body.occupation;
    if (body.kundali_notes) extendedRecord.kundali_notes = body.kundali_notes;

    let { data, error } = await supabase.from('leads').insert([extendedRecord]).select().single();

    if (error) {
      // Fallback to core fields if extended columns are not yet in schema cache
      const retry = await supabase.from('leads').insert([coreLeadRecord]).select().single();
      if (retry.error) throw retry.error;
      data = retry.data;
    }

    // Activity log
    await supabase.from('lead_activities').insert([{
      lead_id: data.id,
      activity_type: 'system',
      content: `Public enquiry submitted via website form (${service_interest})`,
      is_internal: true,
    }]);

    // Try sending auto WhatsApp notification to client
    const serviceLabel = SERVICE_OPTIONS.find(s => s.key === service_interest)?.label || 'Divine Guidance';
    const waText = `नमस्ते ${full_name} 🙏 Dharmikshree received your enquiry for ${serviceLabel}. Our team will reach out within 24 hours.`;
    await sendWhatsAppMessage({ phone, message: waText });

    return NextResponse.json(
      {
        success: true,
        leadId: data.id,
        message: 'Enquiry received successfully',
      },
      { headers: corsHeaders }
    );
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500, headers: corsHeaders });
  }
}
