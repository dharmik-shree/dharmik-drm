import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';

// GET /api/portal/me — Fetch dynamic customer portal data from live Supabase
export async function GET(request: Request) {
  try {
    const supabase = createAdminClient();
    const { searchParams } = new URL(request.url);
    const requestedEmail = searchParams.get('email');
    const requestedCustomerId = searchParams.get('customer_id');

    let customerRecord: any = null;
    let customerUser: any = null;
    let customerLead: any = null;

    // 1. Find customer record
    if (requestedCustomerId) {
      const { data: c } = await supabase
        .from('customers')
        .select('*, user:users!id(*), lead:leads!lead_id(*)')
        .eq('id', requestedCustomerId)
        .maybeSingle();
      if (c) customerRecord = c;
    } else if (requestedEmail) {
      // Find auth user by email
      const { data: listData } = await supabase.auth.admin.listUsers();
      const authUser = listData?.users?.find(u => u.email?.toLowerCase() === requestedEmail.toLowerCase());
      if (authUser) {
        const { data: c } = await supabase
          .from('customers')
          .select('*, user:users!id(*), lead:leads!lead_id(*)')
          .eq('id', authUser.id)
          .maybeSingle();
        if (c) customerRecord = c;
      }
    }

    // Fallback: fetch most recent customer if no specific customer requested (Demo/Preview mode)
    if (!customerRecord) {
      const { data: latestCustomers } = await supabase
        .from('customers')
        .select('*, user:users!id(*), lead:leads!lead_id(*)')
        .order('customer_since', { ascending: false })
        .limit(1);

      if (latestCustomers && latestCustomers.length > 0) {
        customerRecord = latestCustomers[0];
      }
    }

    if (customerRecord) {
      customerUser = customerRecord.user || {};
      customerLead = customerRecord.lead || {};
    } else {
      // Fallback: find converted lead if no customers table row yet
      const { data: convertedLeads } = await supabase
        .from('leads')
        .select('*')
        .eq('is_converted', true)
        .order('updated_at', { ascending: false })
        .limit(1);

      if (convertedLeads && convertedLeads.length > 0) {
        customerLead = convertedLeads[0];
        customerUser = {
          id: customerLead.converted_customer_id || customerLead.id,
          full_name: customerLead.full_name,
          phone: customerLead.phone,
          whatsapp: customerLead.whatsapp || customerLead.phone,
        };
        customerRecord = {
          id: customerUser.id,
          lead_id: customerLead.id,
          customer_since: customerLead.created_at ? customerLead.created_at.split('T')[0] : new Date().toISOString().split('T')[0],
          total_spent: customerLead.amount_paid || 0,
          total_sessions: 1,
        };
      }
    }

    if (!customerRecord && !customerLead) {
      return NextResponse.json({
        success: true,
        hasCustomer: false,
        message: 'No converted customer records found yet',
      });
    }

    const leadId = customerLead?.id || customerRecord?.lead_id;
    const customerId = customerRecord?.id || customerUser?.id;

    // 2. Fetch Payments
    let payments: any[] = [];
    if (customerId || leadId) {
      let query = supabase.from('payments').select('*');
      if (customerId && leadId) {
        query = query.or(`customer_id.eq.${customerId},lead_id.eq.${leadId}`);
      } else if (customerId) {
        query = query.eq('customer_id', customerId);
      } else if (leadId) {
        query = query.eq('lead_id', leadId);
      }

      const { data: payData } = await query.order('payment_date', { ascending: false });
      if (payData) payments = payData;
    }

    // 3. Fetch Timeline & Activities
    let timeline: any[] = [];
    if (customerId) {
      const { data: ctData } = await supabase
        .from('consultation_timeline')
        .select('*')
        .eq('customer_id', customerId)
        .order('consultation_date', { ascending: false });
      if (ctData && ctData.length > 0) timeline = ctData;
    }

    let activities: any[] = [];
    if (leadId) {
      const { data: actData } = await supabase
        .from('lead_activities')
        .select('*')
        .eq('lead_id', leadId)
        .order('created_at', { ascending: false });
      if (actData) activities = actData;
    }

    // Construct customer profile response object
    const profile = {
      id: customerId,
      full_name: customerUser?.full_name || customerLead?.full_name || 'Valued Client',
      phone: customerUser?.phone || customerLead?.phone || '',
      email: customerLead?.email || null,
      city: customerLead?.city || 'India',
      state: customerLead?.state || null,
      country: customerLead?.country || 'India',
      customer_since: customerRecord?.customer_since || customerLead?.created_at?.split('T')[0] || new Date().toISOString().split('T')[0],
      total_spent: customerRecord?.total_spent || customerLead?.amount_paid || 0,
      total_sessions: customerRecord?.total_sessions || 1,
      date_of_birth: customerLead?.date_of_birth || null,
      time_of_birth: customerLead?.time_of_birth || null,
      birth_place: customerLead?.birth_place || null,
      gender: customerLead?.gender || null,
      relation: customerLead?.relation || 'self',
      address: customerLead?.address || null,
      pincode: customerLead?.pincode || null,
      marital_status: customerLead?.marital_status || null,
      gotra: customerLead?.gotra || null,
      rashi: customerLead?.rashi || null,
      occupation: customerLead?.occupation || null,
      kundali_notes: customerLead?.kundali_notes || null,
      service_interest: customerLead?.service_interest || 'divine_consultation',
      consultation_mode: customerLead?.consultation_mode || 'online',
      date_of_consultation: customerLead?.date_of_consultation || null,
      remedy_status: customerLead?.remedy_status || 'not_sent',
      puja_status: customerLead?.puja_status || 'not_booked',
      stone_status: customerLead?.stone_status || 'not_decided',
      stone_certificate_no: customerLead?.stone_certificate_no || null,
      conclusion_notes: customerLead?.conclusion_notes || null,
    };

    return NextResponse.json({
      success: true,
      hasCustomer: true,
      profile,
      lead: customerLead,
      payments,
      timeline,
      activities,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to fetch portal data' }, { status: 500 });
  }
}
